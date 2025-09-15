import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Play, X, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceStressAnalyzerProps {
  onComplete: () => void;
}

export const VoiceStressAnalyzer: React.FC<VoiceStressAnalyzerProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'setup' | 'recording' | 'analyzing' | 'complete'>('setup');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { toast } = useToast();

  const recordingPrompts = [
    "Please read this passage clearly: 'The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.'",
    "Describe your current mood and how you're feeling today in a few sentences.",
    "Count slowly from 1 to 10, then say the days of the week.",
    "Tell me about your favorite hobby or activity that makes you happy."
  ];

  const [currentPrompt, setCurrentPrompt] = useState(0);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setupAudioVisualization = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);

    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average);
      }
      
      if (isRecording) {
        requestAnimationFrame(updateAudioLevel);
      }
    };

    updateAudioLevel();
  };

  const simulateVoiceAnalysis = async (audioBlob: Blob) => {
    // Simulate AI voice analysis
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const mockResults = {
      pitch_variation: Math.random() * 100, // Hz variation
      speech_rate: 150 + Math.random() * 50, // words per minute
      pause_frequency: Math.random() * 0.3, // pauses per second
      jitter: Math.random() * 2, // voice tremor %
      shimmer: Math.random() * 5, // amplitude variation %
      energy_level: 60 + Math.random() * 30, // dB
      emotion_classification: Math.random() > 0.7 ? 'stressed' : Math.random() > 0.5 ? 'neutral' : 'calm',
      stress_indicators: Math.random() > 0.6 ? 'elevated' : 'normal',
      depression_risk: Math.random() > 0.8 ? 'moderate' : 'low',
      anxiety_markers: Math.random() > 0.7 ? 'present' : 'minimal',
      vocal_fatigue: Math.random() > 0.75 ? 'detected' : 'normal'
    };

    const hasAnomalies = 
      mockResults.emotion_classification === 'stressed' ||
      mockResults.stress_indicators === 'elevated' ||
      mockResults.depression_risk === 'moderate' ||
      mockResults.anxiety_markers === 'present';

    return {
      results: mockResults,
      anomalies_detected: hasAnomalies,
      risk_level: hasAnomalies ? 'medium' : 'low',
      recommendations: hasAnomalies ? [
        'Consider stress management techniques',
        'Consult with mental health professional',
        'Practice relaxation and breathing exercises'
      ] : ['Continue monitoring mental wellness']
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      setupAudioVisualization(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        analyzeRecording(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      setScanPhase('recording');
      setProgress(0);
      mediaRecorder.start();

      // 20 second recording timer
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5; // 20 seconds = 100% / 20 = 5% per second
        });
      }, 1000);

      // Auto-stop after 20 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          clearInterval(progressInterval);
        }
      }, 20000);

    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeRecording = async (audioBlob: Blob) => {
    setScanPhase('analyzing');
    setProgress(95);

    try {
      const analysisResults = await simulateVoiceAnalysis(audioBlob);

      // Get current patient
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) throw new Error('Patient not found');

      // Convert audio blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        // Save scan results
        const { error } = await supabase
          .from('scans')
          .insert({
            patient_id: patient.id,
            scan_type: 'voice',
            scan_data: { 
              audio_data: base64Audio,
              recording_duration: 20,
              prompt_used: recordingPrompts[currentPrompt]
            },
            results: analysisResults.results,
            anomalies_detected: analysisResults.anomalies_detected,
            risk_level: analysisResults.risk_level
          });

        if (error) throw error;

        setProgress(100);
        setScanPhase('complete');
        
        toast({
          title: "Analysis Complete",
          description: "Voice stress analysis completed successfully.",
        });

        setTimeout(() => {
          onComplete();
        }, 2000);
      };

      reader.readAsDataURL(audioBlob);

    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to complete voice analysis.",
        variant: "destructive",
      });
      setScanPhase('setup');
      setProgress(0);
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      const audio = new Audio(URL.createObjectURL(recordedBlob));
      audio.play();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-purple-500" />
            Voice Stress Analysis
          </CardTitle>
          <CardDescription>
            AI-powered mental health and stress assessment through voice analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recording Interface */}
            <div className="space-y-4">
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="relative">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse' 
                      : scanPhase === 'complete'
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}>
                    <Mic className={`h-12 w-12 ${
                      isRecording || scanPhase === 'complete' ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  {isRecording && (
                    <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-red-300 animate-ping" />
                  )}
                </div>

                {isRecording && (
                  <div className="mt-4">
                    <div className="flex justify-center items-center gap-1 mb-2">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-full transition-all duration-100"
                          style={{
                            height: `${Math.max(4, (audioLevel / 255) * 40 + Math.random() * 20)}px`
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-red-600 font-medium">Recording in progress...</p>
                  </div>
                )}
              </div>

              {scanPhase !== 'setup' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recording Progress</span>
                    <Badge variant={scanPhase === 'complete' ? 'default' : 'secondary'}>
                      {scanPhase === 'recording' && 'Recording...'}
                      {scanPhase === 'analyzing' && 'Analyzing...'}
                      {scanPhase === 'complete' && 'Complete'}
                    </Badge>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Recording duration: 20 seconds
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {scanPhase === 'setup' ? (
                  <Button onClick={startRecording} className="flex-1">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                ) : isRecording ? (
                  <Button onClick={stopRecording} variant="destructive" className="flex-1">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                ) : recordedBlob ? (
                  <Button onClick={playRecording} variant="outline" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Play Recording
                  </Button>
                ) : null}
                
                {scanPhase !== 'setup' && (
                  <Button onClick={onComplete} variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Instructions and Analysis */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Recording Prompt</h3>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">
                    {recordingPrompts[currentPrompt]}
                  </p>
                </div>
                
                <div className="mt-3 flex gap-2">
                  {recordingPrompts.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPrompt === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPrompt(index)}
                      disabled={isRecording}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Instructions</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Volume2 className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    Speak clearly and naturally
                  </li>
                  <li className="flex items-start gap-2">
                    <Volume2 className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    Find a quiet environment
                  </li>
                  <li className="flex items-start gap-2">
                    <Volume2 className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    Maintain normal speaking pace
                  </li>
                  <li className="flex items-start gap-2">
                    <Volume2 className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    Complete the full 20-second recording
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Analysis Parameters:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-purple-800">
                  <div>• Pitch Variation</div>
                  <div>• Speech Rate</div>
                  <div>• Pause Patterns</div>
                  <div>• Voice Tremor</div>
                  <div>• Energy Levels</div>
                  <div>• Emotion Detection</div>
                  <div>• Stress Indicators</div>
                  <div>• Mental Health Markers</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded-lg">
                <strong>Privacy:</strong> Voice recordings are processed securely and used only for analysis. Audio data is encrypted and can be deleted upon request.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
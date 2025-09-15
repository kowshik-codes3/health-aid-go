import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Eye, Camera, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RetinalScanProps {
  onComplete: () => void;
}

export const RetinalScan: React.FC<RetinalScanProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'setup' | 'scanning' | 'analyzing' | 'complete'>('setup');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const scanInstructions = [
    'Position your eye 6-8 inches from the camera',
    'Ensure good lighting on your face',
    'Keep your eye wide open and steady',
    'Look directly at the camera lens',
    'Avoid blinking during the scan'
  ];

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user'
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const simulateRetinalAnalysis = async (eyeImageData: string) => {
    // Simulate AI analysis with realistic results
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockResults = {
      diabetic_retinopathy: Math.random() > 0.8 ? 'detected' : 'normal',
      glaucoma: Math.random() > 0.9 ? 'risk_detected' : 'normal',
      hypertensive_retinopathy: Math.random() > 0.85 ? 'mild_changes' : 'normal',
      amd: Math.random() > 0.95 ? 'early_signs' : 'normal',
      cataract: Math.random() > 0.7 ? 'mild_opacity' : 'clear',
      blood_vessel_health: Math.random() > 0.8 ? 'irregular' : 'normal',
      retinal_thickness: `${(0.25 + Math.random() * 0.1).toFixed(3)}mm`,
      cardiovascular_risk: Math.random() > 0.85 ? 'elevated' : 'normal'
    };

    const hasAnomalies = Object.entries(mockResults).some(([key, value]) => 
      value !== 'normal' && value !== 'clear' && !key.includes('thickness')
    );

    return {
      results: mockResults,
      anomalies_detected: hasAnomalies,
      risk_level: hasAnomalies ? 'medium' : 'low',
      recommendations: hasAnomalies ? [
        'Consult with an ophthalmologist',
        'Regular eye examinations recommended',
        'Monitor blood pressure and diabetes if applicable'
      ] : ['Continue regular eye health monitoring']
    };
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context?.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setScanPhase('analyzing');
    setProgress(50);

    try {
      const analysisResults = await simulateRetinalAnalysis(imageData);
      
      // Get current patient
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) throw new Error('Patient not found');

      // Save scan results
      const { error } = await supabase
        .from('scans')
        .insert({
          patient_id: patient.id,
          scan_type: 'retinal',
          scan_data: { image_data: imageData },
          results: analysisResults.results,
          anomalies_detected: analysisResults.anomalies_detected,
          risk_level: analysisResults.risk_level
        });

      if (error) throw error;

      setProgress(100);
      setScanPhase('complete');
      
      toast({
        title: "Scan Complete",
        description: "Retinal scan analysis completed successfully.",
      });

      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Failed to complete retinal analysis.",
        variant: "destructive",
      });
      setScanPhase('setup');
      setProgress(0);
    }
  };

  const startScan = async () => {
    if (!stream) {
      await startCamera();
      return;
    }

    setIsScanning(true);
    setScanPhase('scanning');
    setProgress(0);

    // Simulate scan progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 45) {
          clearInterval(progressInterval);
          return 45;
        }
        return prev + 5;
      });
    }, 200);

    // Capture after 3 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      captureAndAnalyze();
    }, 3000);
  };

  const stopScan = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setScanPhase('setup');
    setProgress(0);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Retinal Scan Analysis
          </CardTitle>
          <CardDescription>
            AI-powered comprehensive eye health assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Feed */}
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {scanPhase === 'scanning' && (
                  <div className="absolute inset-0 border-4 border-primary animate-pulse rounded-lg" />
                )}
                
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              {scanPhase !== 'setup' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Scan Progress</span>
                    <Badge variant={scanPhase === 'complete' ? 'default' : 'secondary'}>
                      {scanPhase === 'scanning' && 'Capturing...'}
                      {scanPhase === 'analyzing' && 'Analyzing...'}
                      {scanPhase === 'complete' && 'Complete'}
                    </Badge>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>

            {/* Instructions and Controls */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Scan Instructions</h3>
                <ul className="space-y-2">
                  {scanInstructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tests Performed:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>• Diabetic Retinopathy</div>
                  <div>• Glaucoma</div>
                  <div>• Hypertensive Retinopathy</div>
                  <div>• AMD Detection</div>
                  <div>• Cataract Assessment</div>
                  <div>• Blood Vessel Health</div>
                </div>
              </div>

              <div className="flex gap-3">
                {!stream ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={startScan} 
                      disabled={isScanning}
                      className="flex-1"
                    >
                      {isScanning ? 'Scanning...' : 'Begin Scan'}
                    </Button>
                    <Button onClick={stopScan} variant="outline">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <p className="text-xs text-orange-800">
                  This is a screening tool and not a replacement for professional medical examination.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
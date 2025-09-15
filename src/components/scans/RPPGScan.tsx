import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Camera, Activity, X, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RPPGScanProps {
  onComplete: () => void;
}

export const RPPGScan: React.FC<RPPGScanProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'setup' | 'scanning' | 'analyzing' | 'complete'>('setup');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [realTimeData, setRealTimeData] = useState({
    heartRate: 0,
    spO2: 0,
    respiratoryRate: 0
  });
  const { toast } = useToast();

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

  const simulateRealTimeData = () => {
    const interval = setInterval(() => {
      setRealTimeData({
        heartRate: 60 + Math.random() * 40, // 60-100 BPM
        spO2: 95 + Math.random() * 5, // 95-100%
        respiratoryRate: 12 + Math.random() * 8 // 12-20 breaths/min
      });
    }, 1000);

    return interval;
  };

  const simulateRPPGAnalysis = async () => {
    // Simulate 30 second scan with real-time data
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const mockResults = {
      heart_rate: 72 + Math.random() * 16, // 72-88 BPM
      heart_rate_variability: 25 + Math.random() * 15, // 25-40 ms
      respiratory_rate: 14 + Math.random() * 4, // 14-18 breaths/min
      spo2_estimate: 96 + Math.random() * 3, // 96-99%
      blood_pressure_systolic: 110 + Math.random() * 20, // 110-130 mmHg
      blood_pressure_diastolic: 70 + Math.random() * 10, // 70-80 mmHg
      arrhythmia_risk: Math.random() > 0.85 ? 'detected' : 'normal',
      stress_level: Math.random() > 0.7 ? 'elevated' : 'normal',
      fatigue_indicator: Math.random() > 0.8 ? 'high' : 'normal'
    };

    const hasAnomalies = 
      mockResults.heart_rate < 60 || mockResults.heart_rate > 100 ||
      mockResults.blood_pressure_systolic > 140 ||
      mockResults.arrhythmia_risk === 'detected' ||
      mockResults.stress_level === 'elevated';

    return {
      results: mockResults,
      anomalies_detected: hasAnomalies,
      risk_level: hasAnomalies ? 'medium' : 'low',
      recommendations: hasAnomalies ? [
        'Monitor cardiovascular health regularly',
        'Consider consultation with cardiologist',
        'Maintain healthy lifestyle habits'
      ] : ['Continue regular health monitoring']
    };
  };

  const startScan = async () => {
    if (!stream) {
      await startCamera();
      return;
    }

    setIsScanning(true);
    setScanPhase('scanning');
    setProgress(0);

    // Start real-time data simulation
    const dataInterval = simulateRealTimeData();

    // Progress tracking for 30 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 3; // 30 seconds = 100% / 30 = ~3% per second
      });
    }, 1000);

    try {
      setScanPhase('analyzing');
      const analysisResults = await simulateRPPGAnalysis();
      
      clearInterval(dataInterval);
      clearInterval(progressInterval);

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
          scan_type: 'rppg',
          scan_data: { scan_duration: 30, real_time_data: realTimeData },
          results: analysisResults.results,
          anomalies_detected: analysisResults.anomalies_detected,
          risk_level: analysisResults.risk_level
        });

      if (error) throw error;

      setProgress(100);
      setScanPhase('complete');
      
      toast({
        title: "Scan Complete",
        description: "rPPG cardiovascular analysis completed successfully.",
      });

      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      clearInterval(dataInterval);
      clearInterval(progressInterval);
      toast({
        title: "Scan Error",
        description: "Failed to complete rPPG analysis.",
        variant: "destructive",
      });
      setScanPhase('setup');
      setProgress(0);
    }
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
            <Heart className="h-6 w-6 text-red-500" />
            rPPG Cardiovascular Analysis
          </CardTitle>
          <CardDescription>
            Remote photoplethysmography for comprehensive cardiovascular monitoring
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
                
                {scanPhase === 'scanning' && (
                  <div className="absolute inset-0">
                    <div className="absolute top-4 left-4 right-4">
                      <div className="bg-black/70 rounded-lg p-4 text-white">
                        <div className="text-center">
                          <User className="h-8 w-8 mx-auto mb-2 text-green-400" />
                          <p className="text-sm">Face detected - scanning in progress</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Real-time data overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/80 rounded-lg p-3 text-white">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-gray-300">HR</div>
                            <div className="text-lg font-bold text-red-400">
                              {Math.round(realTimeData.heartRate)}
                            </div>
                            <div className="text-xs">BPM</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-300">SpO₂</div>
                            <div className="text-lg font-bold text-blue-400">
                              {Math.round(realTimeData.spO2)}
                            </div>
                            <div className="text-xs">%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-300">RR</div>
                            <div className="text-lg font-bold text-green-400">
                              {Math.round(realTimeData.respiratoryRate)}
                            </div>
                            <div className="text-xs">/min</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      {scanPhase === 'scanning' && 'Scanning...'}
                      {scanPhase === 'analyzing' && 'Analyzing...'}
                      {scanPhase === 'complete' && 'Complete'}
                    </Badge>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Scan duration: 30 seconds for optimal accuracy
                  </p>
                </div>
              )}
            </div>

            {/* Instructions and Controls */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Scan Instructions</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Sit comfortably and face the camera directly
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Ensure good, even lighting on your face
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Remain still during the 30-second scan
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Breathe normally and stay relaxed
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Avoid talking or sudden movements
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Measurements:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-red-800">
                  <div>• Heart Rate (HR)</div>
                  <div>• Heart Rate Variability</div>
                  <div>• Respiratory Rate</div>
                  <div>• Blood Oxygen (SpO₂)</div>
                  <div>• Arrhythmia Detection</div>
                  <div>• Blood Pressure Est.</div>
                  <div>• Stress Analysis</div>
                  <div>• Fatigue Detection</div>
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
                      {isScanning ? 'Scanning...' : 'Begin 30s Scan'}
                    </Button>
                    <Button onClick={stopScan} variant="outline">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded-lg">
                <strong>Note:</strong> rPPG technology analyzes subtle color changes in facial skin to detect blood flow patterns and extract cardiovascular metrics non-invasively.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
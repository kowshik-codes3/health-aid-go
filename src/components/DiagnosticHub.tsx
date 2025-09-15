import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Heart, Mic, Camera, Activity, AlertTriangle } from 'lucide-react';
import { RetinalScan } from './scans/RetinalScan';
import { RPPGScan } from './scans/RPPGScan';
import { VoiceStressAnalyzer } from './scans/VoiceStressAnalyzer';
import { ScanResults } from './scans/ScanResults';
import { NotificationCenter } from './NotificationCenter';

export const DiagnosticHub = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentScan, setCurrentScan] = useState<string | null>(null);

  const diagnosticOptions = [
    {
      id: 'retinal',
      title: 'Retinal Scan',
      description: 'Comprehensive eye health assessment',
      icon: Eye,
      tests: [
        'Diabetic Retinopathy check',
        'Glaucoma screening', 
        'Hypertensive Retinopathy detection',
        'Age-related Macular Degeneration (AMD)',
        'Cataract indication',
        'General eye health assessment'
      ]
    },
    {
      id: 'rppg',
      title: 'rPPG Analysis',
      description: 'Remote cardiovascular monitoring',
      icon: Heart,
      tests: [
        'Heart Rate (HR)',
        'Heart Rate Variability (HRV)',
        'Respiratory Rate',
        'Blood Oxygen Level (SpO₂)',
        'Arrhythmia detection',
        'Blood Pressure estimation',
        'Stress/Fatigue detection'
      ]
    },
    {
      id: 'voice',
      title: 'Voice Stress Analysis',
      description: 'Mental health and stress assessment',
      icon: Mic,
      tests: [
        'Pitch and tone variation',
        'Speech rate and pauses',
        'Formant shifts analysis',
        'Jitter and shimmer detection',
        'Energy/amplitude levels',
        'Emotion classification',
        'Depression/Anxiety risk analysis'
      ]
    }
  ];

  const handleScanComplete = () => {
    setCurrentScan(null);
    setActiveTab('results');
  };

  if (currentScan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
        <div className="max-w-4xl mx-auto">
          {currentScan === 'retinal' && <RetinalScan onComplete={handleScanComplete} />}
          {currentScan === 'rppg' && <RPPGScan onComplete={handleScanComplete} />}
          {currentScan === 'voice' && <VoiceStressAnalyzer onComplete={handleScanComplete} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Diagnostic Hub</h1>
          <p className="text-xl text-muted-foreground">
            Advanced AI-powered health diagnostics at your fingertips
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Diagnostics</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {diagnosticOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Card key={option.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        {option.title}
                      </CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <strong>Tests performed:</strong>
                        </div>
                        <ul className="text-sm space-y-1">
                          {option.tests.map((test, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Activity className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                              {test}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          onClick={() => setCurrentScan(option.id)}
                          className="w-full mt-4"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Start {option.title}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <strong>Important:</strong> These diagnostic tools are for informational purposes only and should not replace professional medical advice. Always consult with healthcare professionals for proper diagnosis and treatment.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <ScanResults />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
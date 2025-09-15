import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Heart, Mic, Calendar, AlertTriangle, CheckCircle, TrendingUp, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Scan {
  id: string;
  scan_type: string;
  results: any;
  anomalies_detected: boolean;
  risk_level: string;
  created_at: string;
}

export const ScanResults = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) return;

      const { data: scansData, error } = await supabase
        .from('scans')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(scansData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scan results.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'retinal': return Eye;
      case 'rppg': return Heart;
      case 'voice': return Mic;
      default: return CheckCircle;
    }
  };

  const getScanTitle = (type: string) => {
    switch (type) {
      case 'retinal': return 'Retinal Scan';
      case 'rppg': return 'rPPG Analysis';
      case 'voice': return 'Voice Analysis';
      default: return 'Unknown';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderScanDetails = (scan: Scan) => {
    const { results } = scan;

    if (scan.scan_type === 'retinal') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className={`font-semibold ${
                  value === 'normal' || value === 'clear' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (scan.scan_type === 'rppg') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-red-600">Heart Rate</div>
              <div className="font-semibold text-red-800">{Math.round(results.heart_rate)} BPM</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-600">SpO₂</div>
              <div className="font-semibold text-blue-800">{Math.round(results.spo2_estimate)}%</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-600">Respiratory Rate</div>
              <div className="font-semibold text-green-800">{Math.round(results.respiratory_rate)}/min</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-600">Blood Pressure</div>
              <div className="font-semibold text-purple-800">
                {Math.round(results.blood_pressure_systolic)}/{Math.round(results.blood_pressure_diastolic)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {Object.entries(results).filter(([key]) => 
              ['arrhythmia_risk', 'stress_level', 'fatigue_indicator'].includes(key)
            ).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                <Badge variant={value === 'normal' ? 'default' : 'destructive'}>
                  {String(value)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (scan.scan_type === 'voice') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-600">Speech Rate</div>
              <div className="font-semibold text-purple-800">{Math.round(results.speech_rate)} WPM</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="text-sm font-medium text-indigo-600">Energy Level</div>
              <div className="font-semibold text-indigo-800">{Math.round(results.energy_level)} dB</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {Object.entries(results).filter(([key]) => 
              ['emotion_classification', 'stress_indicators', 'depression_risk', 'anxiety_markers'].includes(key)
            ).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                <Badge variant={
                  value === 'normal' || value === 'calm' || value === 'low' || value === 'minimal' 
                    ? 'default' : 'destructive'
                }>
                  {String(value)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Scan Results Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete a diagnostic scan to view your results here.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Results
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scan Results</h2>
          <p className="text-muted-foreground">View your diagnostic scan history and results</p>
        </div>
        <Button onClick={fetchScans} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold">Recent Scans</h3>
          {scans.map((scan) => {
            const IconComponent = getScanIcon(scan.scan_type);
            return (
              <Card 
                key={scan.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedScan?.id === scan.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedScan(scan)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{getScanTitle(scan.scan_type)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getRiskColor(scan.risk_level)}>
                        {scan.risk_level}
                      </Badge>
                      {scan.anomalies_detected && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Scan Details */}
        <div className="lg:col-span-2">
          {selectedScan ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(getScanIcon(selectedScan.scan_type), {
                    className: "h-6 w-6 text-primary"
                  })}
                  {getScanTitle(selectedScan.scan_type)} Results
                </CardTitle>
                <CardDescription>
                  Completed on {new Date(selectedScan.created_at).toLocaleDateString()} at{' '}
                  {new Date(selectedScan.created_at).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Badge className={getRiskColor(selectedScan.risk_level)}>
                    Risk Level: {selectedScan.risk_level}
                  </Badge>
                  <Badge variant={selectedScan.anomalies_detected ? 'destructive' : 'default'}>
                    {selectedScan.anomalies_detected ? 'Anomalies Detected' : 'Normal Results'}
                  </Badge>
                </div>

                {selectedScan.anomalies_detected && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">Attention Required</h4>
                        <p className="text-sm text-orange-700">
                          This scan has detected potential health concerns. We recommend consulting 
                          with a healthcare professional for further evaluation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {renderScanDetails(selectedScan)}

                <div className="pt-4 border-t">
                  <Button className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Book Consultation with Specialist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Scan</h3>
                <p className="text-muted-foreground">
                  Choose a scan from the list to view detailed results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
-- Create scans table for storing diagnostic results
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('retinal', 'rppg', 'voice')),
  scan_data JSONB NOT NULL,
  results JSONB NOT NULL,
  anomalies_detected BOOLEAN DEFAULT false,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('patient', 'doctor')),
  scan_id UUID REFERENCES public.scans(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('anomaly_detected', 'appointment_suggestion', 'scan_complete')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor_specializations table for matching
CREATE TABLE public.doctor_specializations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  condition_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_specializations ENABLE ROW LEVEL SECURITY;

-- Scans policies
CREATE POLICY "Patients can view their own scans" 
ON public.scans 
FOR SELECT 
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Patients can insert their own scans" 
ON public.scans 
FOR INSERT 
WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can view scans for their specializations" 
ON public.scans 
FOR SELECT 
USING (
  anomalies_detected = true AND 
  EXISTS (
    SELECT 1 FROM public.doctors d 
    JOIN public.doctor_specializations ds ON d.id = ds.doctor_id 
    WHERE d.user_id = auth.uid() AND 
    (
      (scan_type = 'retinal' AND ds.condition_type IN ('diabetic_retinopathy', 'glaucoma', 'hypertensive_retinopathy', 'amd', 'cataract', 'ophthalmology')) OR
      (scan_type = 'rppg' AND ds.condition_type IN ('cardiology', 'hypertension', 'arrhythmia', 'respiratory')) OR
      (scan_type = 'voice' AND ds.condition_type IN ('psychiatry', 'psychology', 'neurology'))
    )
  )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (
  (recipient_type = 'patient' AND recipient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())) OR
  (recipient_type = 'doctor' AND recipient_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (
  (recipient_type = 'patient' AND recipient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())) OR
  (recipient_type = 'doctor' AND recipient_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
);

-- Doctor specializations policies
CREATE POLICY "Doctors can manage their own specializations" 
ON public.doctor_specializations 
FOR ALL 
USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view doctor specializations" 
ON public.doctor_specializations 
FOR SELECT 
USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_scans_updated_at
BEFORE UPDATE ON public.scans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default doctor specializations
INSERT INTO public.doctor_specializations (doctor_id, condition_type)
SELECT id, 'ophthalmology' FROM public.doctors WHERE specialization LIKE '%Eye%' OR specialization LIKE '%Ophthalmology%';

INSERT INTO public.doctor_specializations (doctor_id, condition_type)
SELECT id, 'cardiology' FROM public.doctors WHERE specialization LIKE '%Cardiology%' OR specialization LIKE '%Heart%';

INSERT INTO public.doctor_specializations (doctor_id, condition_type)
SELECT id, 'psychiatry' FROM public.doctors WHERE specialization LIKE '%Psychiatry%' OR specialization LIKE '%Mental%';

-- Function to create notifications when anomalies are detected
CREATE OR REPLACE FUNCTION public.notify_doctors_on_anomaly()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notifications if anomalies are detected
  IF NEW.anomalies_detected = true THEN
    -- Insert notifications for relevant doctors based on scan type
    INSERT INTO public.notifications (recipient_id, recipient_type, scan_id, title, message, notification_type)
    SELECT 
      d.id,
      'doctor',
      NEW.id,
      CASE NEW.scan_type
        WHEN 'retinal' THEN 'Retinal Scan Anomaly Detected'
        WHEN 'rppg' THEN 'Cardiovascular Anomaly Detected'
        WHEN 'voice' THEN 'Voice Stress Analysis Alert'
      END,
      'A patient scan has detected potential health concerns that require your attention.',
      'anomaly_detected'
    FROM public.doctors d
    JOIN public.doctor_specializations ds ON d.id = ds.doctor_id
    WHERE 
      (NEW.scan_type = 'retinal' AND ds.condition_type IN ('diabetic_retinopathy', 'glaucoma', 'hypertensive_retinopathy', 'amd', 'cataract', 'ophthalmology')) OR
      (NEW.scan_type = 'rppg' AND ds.condition_type IN ('cardiology', 'hypertension', 'arrhythmia', 'respiratory')) OR
      (NEW.scan_type = 'voice' AND ds.condition_type IN ('psychiatry', 'psychology', 'neurology'));
      
    -- Notify the patient
    INSERT INTO public.notifications (recipient_id, recipient_type, scan_id, title, message, notification_type)
    VALUES (
      NEW.patient_id,
      'patient',
      NEW.id,
      'Scan Results Available',
      'Your recent diagnostic scan has been completed. Please review the results and consider booking an appointment if recommended.',
      'scan_complete'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifications
CREATE TRIGGER notify_on_scan_anomaly
AFTER INSERT OR UPDATE ON public.scans
FOR EACH ROW
EXECUTE FUNCTION public.notify_doctors_on_anomaly();
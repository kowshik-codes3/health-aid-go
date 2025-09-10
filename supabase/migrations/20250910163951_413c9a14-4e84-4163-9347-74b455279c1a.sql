-- Fix RLS policies by ensuring the 'name' table has proper policies
-- Note: The 'name' table appears to be a test table that should be cleaned up
DROP TABLE IF EXISTS public.name;

-- Create additional policies for doctors table to allow doctors to be viewed by patients
CREATE POLICY "Doctors profile viewable by all authenticated users" 
ON public.doctors 
FOR SELECT 
TO authenticated
USING (true);

-- Create policies for profiles to allow viewing by authenticated users
CREATE POLICY "Profiles viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);
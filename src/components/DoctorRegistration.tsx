import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    availability: "",
    consultationFee: "",
    visitFee: "",
    about: "",
    address: "",
    mbbsCertificate: ""
  });

  const specializations = [
    "General Physician",
    "Cardiologist", 
    "Dermatologist",
    "Pediatrician",
    "Orthopedic",
    "Neurologist",
    "Gynecologist",
    "Psychiatrist",
    "General Nurse",
    "ICU Specialist"
  ];

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      setSession(session);
      setUser(session.user);
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please sign in first",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('doctors')
        .insert({
          user_id: user.id,
          name: formData.name,
          specialization: formData.specialization,
          experience: parseInt(formData.experience.split('-')[0]) || 1,
          consultation_fee: parseFloat(formData.consultationFee),
          visit_fee: parseFloat(formData.visitFee),
          availability: formData.availability,
          address: formData.address,
          about_text: formData.about,
          mbbs_certificate_url: formData.mbbsCertificate,
          is_online: false
        });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Registration Successful!",
        description: "Welcome to HealthConnect. Your profile is now active.",
      });
      
      navigate("/doctor/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <Stethoscope className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-foreground">Doctor Registration</h1>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select 
                    value={formData.specialization} 
                    onValueChange={(value) => handleInputChange("specialization", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select 
                    value={formData.experience} 
                    onValueChange={(value) => handleInputChange("experience", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 years">1-2 years</SelectItem>
                      <SelectItem value="3-5 years">3-5 years</SelectItem>
                      <SelectItem value="6-10 years">6-10 years</SelectItem>
                      <SelectItem value="10+ years">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="availability">Availability *</Label>
                  <Select 
                    value={formData.availability} 
                    onValueChange={(value) => handleInputChange("availability", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9 AM - 5 PM">9 AM - 5 PM</SelectItem>
                      <SelectItem value="10 AM - 6 PM">10 AM - 6 PM</SelectItem>
                      <SelectItem value="2 PM - 10 PM">2 PM - 10 PM</SelectItem>
                      <SelectItem value="24/7 Emergency">24/7 Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consultationFee">Online Consultation Fee (₹) *</Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      value={formData.consultationFee}
                      onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                      placeholder="500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="visitFee">Home Visit Fee (₹) *</Label>
                    <Input
                      id="visitFee"
                      type="number"
                      value={formData.visitFee}
                      onChange={(e) => handleInputChange("visitFee", e.target.value)}
                      placeholder="1000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Clinic/Hospital Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Complete address for verification and patient visits..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mbbsCertificate">MBBS Certificate *</Label>
                  <Input
                    id="mbbsCertificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleInputChange("mbbsCertificate", file.name);
                      }
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload your MBBS certificate for verification
                  </p>
                </div>

                <div>
                  <Label htmlFor="about">About You</Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    placeholder="Tell patients about your expertise and approach to healthcare..."
                    rows={4}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="medical" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Registering..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorRegistration;
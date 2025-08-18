import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Edit3, Camera, FileText, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    availability: "",
    consultationFee: "",
    visitFee: "",
    about: "",
    address: "",
    mbbsCertificate: "",
    email: "",
    phone: "",
    qualifications: "",
    languages: "",
    services: ""
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
    const doctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    if (doctors.length > 0) {
      const latestDoctor = doctors[doctors.length - 1];
      setFormData({
        name: latestDoctor.name || "",
        specialization: latestDoctor.specialization || "",
        experience: latestDoctor.experience || "",
        availability: latestDoctor.availability || "",
        consultationFee: latestDoctor.consultationFee || "",
        visitFee: latestDoctor.visitFee || "",
        about: latestDoctor.about || "",
        address: latestDoctor.address || "",
        mbbsCertificate: latestDoctor.mbbsCertificate || "",
        email: latestDoctor.email || "",
        phone: latestDoctor.phone || "",
        qualifications: latestDoctor.qualifications || "",
        languages: latestDoctor.languages || "",
        services: latestDoctor.services || ""
      });
    }
  }, []);

  const handleSave = () => {
    const doctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    const updatedDoctors = doctors.map((doctor: any, index: number) => {
      if (index === doctors.length - 1) {
        return { ...doctor, ...formData };
      }
      return doctor;
    });
    
    localStorage.setItem("doctors", JSON.stringify(updatedDoctors));
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/doctor/dashboard")}
              className="mr-3 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white hover:bg-white/20"
          >
            <Edit3 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Picture & Basic Info */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {formData.name?.split(' ').map(n => n[0]).join('') || 'DR'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute -bottom-2 -right-2 h-8 w-8"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Dr. Full Name"
                    />
                    <Select 
                      value={formData.specialization} 
                      onValueChange={(value) => handleInputChange("specialization", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
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
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{formData.name}</h2>
                    <p className="text-muted-foreground">{formData.specialization}</p>
                    <Badge variant="secondary" className="mt-1">{formData.experience}</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Experience</Label>
                {isEditing ? (
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
                ) : (
                  <p className="text-foreground font-medium">{formData.experience}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="availability">Availability</Label>
                {isEditing ? (
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
                ) : (
                  <p className="text-foreground font-medium">{formData.availability}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="consultationFee">Online Consultation Fee (₹)</Label>
                {isEditing ? (
                  <Input
                    id="consultationFee"
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                    placeholder="500"
                  />
                ) : (
                  <p className="text-foreground font-medium">₹{formData.consultationFee}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="visitFee">Home Visit Fee (₹)</Label>
                {isEditing ? (
                  <Input
                    id="visitFee"
                    type="number"
                    value={formData.visitFee}
                    onChange={(e) => handleInputChange("visitFee", e.target.value)}
                    placeholder="1000"
                  />
                ) : (
                  <p className="text-foreground font-medium">₹{formData.visitFee}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Address */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Contact & Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="doctor@example.com"
                  />
                ) : (
                  <p className="text-foreground font-medium">{formData.email || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 9876543210"
                  />
                ) : (
                  <p className="text-foreground font-medium">{formData.phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Clinic/Hospital Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Complete address for verification and patient visits..."
                  rows={3}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.address || 'Not provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Documents */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mbbsCertificate">MBBS Certificate</Label>
              {isEditing ? (
                <div className="space-y-2">
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
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your MBBS certificate for verification
                  </p>
                </div>
              ) : (
                <p className="text-foreground font-medium">
                  {formData.mbbsCertificate ? (
                    <span className="text-green-600">✓ {formData.mbbsCertificate}</span>
                  ) : (
                    <span className="text-orange-600">⚠ Certificate not uploaded</span>
                  )}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="qualifications">Additional Qualifications</Label>
              {isEditing ? (
                <Textarea
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => handleInputChange("qualifications", e.target.value)}
                  placeholder="MD, Fellowship, Certifications..."
                  rows={2}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.qualifications || 'Not provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* About & Services */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>About & Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="about">About You</Label>
              {isEditing ? (
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => handleInputChange("about", e.target.value)}
                  placeholder="Tell patients about your expertise and approach to healthcare..."
                  rows={4}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.about || 'No description provided'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="languages">Languages Spoken</Label>
              {isEditing ? (
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => handleInputChange("languages", e.target.value)}
                  placeholder="English, Hindi, Regional languages..."
                />
              ) : (
                <p className="text-foreground font-medium">{formData.languages || 'Not specified'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="services">Services Offered</Label>
              {isEditing ? (
                <Textarea
                  id="services"
                  value={formData.services}
                  onChange={(e) => handleInputChange("services", e.target.value)}
                  placeholder="Consultation, Home visits, Emergency care..."
                  rows={2}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.services || 'Not specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex space-x-3">
            <Button 
              onClick={handleSave}
              variant="medical" 
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button 
              onClick={() => setIsEditing(false)}
              variant="outline" 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
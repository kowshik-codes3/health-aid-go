import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Edit3, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PatientProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    gender: "",
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
    emergencyContact: "",
    emergencyPhone: ""
  });

  useEffect(() => {
    const currentPatient = localStorage.getItem("currentPatient");
    if (currentPatient) {
      const patientData = JSON.parse(currentPatient);
      setFormData({
        name: patientData.name || "",
        email: patientData.email || "",
        phone: patientData.phone || "",
        address: patientData.address || "",
        age: patientData.age || "",
        gender: patientData.gender || "",
        bloodGroup: patientData.bloodGroup || "",
        allergies: patientData.allergies || "",
        medicalHistory: patientData.medicalHistory || "",
        emergencyContact: patientData.emergencyContact || "",
        emergencyPhone: patientData.emergencyPhone || ""
      });
    }
  }, []);

  const handleSave = () => {
    const updatedPatient = {
      id: Date.now().toString(),
      ...formData
    };
    
    localStorage.setItem("currentPatient", JSON.stringify(updatedPatient));
    
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
              onClick={() => navigate("/patient/home")}
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
                    {formData.name?.charAt(0) || 'P'}
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
                      placeholder="Full Name"
                    />
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Email"
                      type="email"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{formData.name}</h2>
                    <p className="text-muted-foreground">{formData.email}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
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
            
            <div>
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Complete address"
                  rows={3}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.address || 'Not provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                {isEditing ? (
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="25"
                    type="number"
                  />
                ) : (
                  <p className="text-foreground font-medium">{formData.age || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                {isEditing ? (
                  <Input
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    placeholder="Male/Female/Other"
                  />
                ) : (
                  <p className="text-foreground font-medium">{formData.gender || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              {isEditing ? (
                <Input
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                  placeholder="A+, B+, O+, etc."
                />
              ) : (
                <p className="text-foreground font-medium">{formData.bloodGroup || 'Not provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              {isEditing ? (
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  placeholder="List any known allergies..."
                  rows={2}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.allergies || 'None reported'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="medicalHistory">Medical History</Label>
              {isEditing ? (
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                  placeholder="Previous surgeries, chronic conditions, medications..."
                  rows={3}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.medicalHistory || 'No history provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emergencyContact">Contact Name</Label>
              {isEditing ? (
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Emergency contact name"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.emergencyContact || 'Not provided'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyPhone">Contact Phone</Label>
              {isEditing ? (
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="Emergency contact phone"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.emergencyPhone || 'Not provided'}</p>
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

export default PatientProfile;
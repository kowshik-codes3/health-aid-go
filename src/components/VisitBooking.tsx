import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Clock, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VisitBooking = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    visitType: "",
    preferredDate: "",
    preferredTime: "",
    symptoms: "",
    urgency: "",
    address: "",
    phone: "",
    paymentMethod: "",
    specialInstructions: ""
  });

  useEffect(() => {
    // Get patient data
    const currentPatient = localStorage.getItem("currentPatient");
    if (currentPatient) {
      const patientData = JSON.parse(currentPatient);
      setPatient(patientData);
      setFormData(prev => ({
        ...prev,
        address: patientData.address || "",
        phone: patientData.phone || ""
      }));
    }

    // Get doctor info
    const doctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    const defaultDoctors = [
      { 
        id: "1", 
        name: "Dr. Sarah Johnson", 
        specialization: "General Physician",
        visitFee: "1200"
      },
      { 
        id: "2", 
        name: "Dr. Michael Chen", 
        specialization: "Cardiologist",
        visitFee: "1500"
      },
      { 
        id: "3", 
        name: "Nurse Emily Davis", 
        specialization: "General Nurse",
        visitFee: "600"
      }
    ];
    
    const allDoctors = [...defaultDoctors, ...doctors];
    const selectedDoctor = allDoctors.find(d => d.id === doctorId);
    setDoctor(selectedDoctor);
  }, [doctorId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save booking data
    const bookingData = {
      id: Date.now().toString(),
      doctorId,
      doctorName: doctor?.name,
      patientName: patient?.name,
      ...formData,
      status: "Pending",
      bookingDate: new Date().toISOString()
    };

    const existingBookings = JSON.parse(localStorage.getItem("visitBookings") || "[]");
    localStorage.setItem("visitBookings", JSON.stringify([...existingBookings, bookingData]));

    toast({
      title: "Visit Booked Successfully!",
      description: `${doctor?.name} will visit you on ${formData.preferredDate} at ${formData.preferredTime}`,
    });

    navigate("/patient/home");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const visitTypes = [
    "General Checkup",
    "Follow-up Visit", 
    "Emergency Visit",
    "Prescription Renewal",
    "Health Assessment",
    "Vaccination",
    "Wound Care",
    "Blood Pressure Check"
  ];

  const urgencyLevels = [
    { value: "low", label: "Non-urgent (2-3 days)" },
    { value: "medium", label: "Moderate (Within 24 hours)" },
    { value: "high", label: "Urgent (Within 6 hours)" },
    { value: "emergency", label: "Emergency (Immediate)" }
  ];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/patient/home")}
            className="mr-3 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-white text-primary">
                {doctor?.name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">Book Home Visit</h1>
              <p className="text-sm text-primary-foreground/80">{doctor?.name} • ₹{doctor?.visitFee}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visit Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="visitType">Type of Visit *</Label>
                <Select 
                  value={formData.visitType} 
                  onValueChange={(value) => handleInputChange("visitType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredDate">Preferred Date *</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preferredTime">Preferred Time *</Label>
                  <Select 
                    value={formData.preferredTime} 
                    onValueChange={(value) => handleInputChange("preferredTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency Level *</Label>
                <RadioGroup 
                  value={formData.urgency} 
                  onValueChange={(value) => handleInputChange("urgency", value)}
                  className="mt-2"
                >
                  {urgencyLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.value} id={level.value} />
                      <Label htmlFor={level.value} className="text-sm">{level.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="symptoms">Symptoms/Reason for Visit *</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange("symptoms", e.target.value)}
                  placeholder="Please describe your symptoms or reason for the visit..."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Visit Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Building name, street, area, landmark..."
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Contact Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                  placeholder="Any special instructions for the healthcare provider..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={(value) => handleInputChange("paymentMethod", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30">
                  <RadioGroupItem value="online" id="online" />
                  <CreditCard className="h-4 w-4 text-primary" />
                  <Label htmlFor="online" className="flex-1">
                    Pay Online (₹{doctor?.visitFee})
                    <span className="block text-xs text-muted-foreground">Secure payment via UPI/Card</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30">
                  <RadioGroupItem value="cash" id="cash" />
                  <Banknote className="h-4 w-4 text-primary" />
                  <Label htmlFor="cash" className="flex-1">
                    Cash on Visit (₹{doctor?.visitFee})
                    <span className="block text-xs text-muted-foreground">Pay when doctor arrives</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            variant="medical" 
            size="lg" 
            className="w-full"
            disabled={!formData.visitType || !formData.preferredDate || !formData.preferredTime || !formData.urgency || !formData.symptoms || !formData.paymentMethod}
          >
            Book Home Visit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VisitBooking;
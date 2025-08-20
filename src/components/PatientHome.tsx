import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button-enhanced";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  Star, 
  Users, 
  Video, 
  Home, 
  Filter,
  MapPin,
  Clock,
  LogOut,
  Settings,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import doctorMale1 from "@/assets/doctor-male-1.jpg";
import doctorFemale1 from "@/assets/doctor-female-1.jpg";
import nurseFemale1 from "@/assets/nurse-female-1.jpg";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: string;
  patients: number;
  consultationFee: string;
  visitFee: string;
  availability: string;
  profileImage: string;
  isOnline?: boolean;
}

const PatientHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    // Get current patient
    const currentPatient = localStorage.getItem("currentPatient");
    if (!currentPatient) {
      navigate("/patient/auth");
      return;
    }
    setPatient(JSON.parse(currentPatient));

    // Load doctors from localStorage and add some default ones
    const storedDoctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    const defaultDoctors: Doctor[] = [
      {
        id: "1",
        name: "Dr. Sarah Johnson",
        specialization: "General Physician",
        experience: "8 years",
        rating: "4.8",
        patients: 342,
        consultationFee: "600",
        visitFee: "1200",
        availability: "9 AM - 6 PM",
        profileImage: doctorFemale1,
        isOnline: true
      },
      {
        id: "2", 
        name: "Dr. Michael Chen",
        specialization: "Cardiologist",
        experience: "12 years",
        rating: "4.9",
        patients: 189,
        consultationFee: "800",
        visitFee: "1500",
        availability: "10 AM - 5 PM",
        profileImage: doctorMale1,
        isOnline: false
      },
      {
        id: "3",
        name: "Nurse Emily Davis",
        specialization: "General Nurse",
        experience: "5 years",
        rating: "4.7",
        patients: 256,
        consultationFee: "300",
        visitFee: "600",
        availability: "24/7 Emergency",
        profileImage: nurseFemale1,
        isOnline: true
      }
    ];
    
    setDoctors([...defaultDoctors, ...storedDoctors]);
  }, [navigate]);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConsultation = (doctor: Doctor, type: 'online' | 'visit' | 'chat') => {
    if (type === 'online') {
      navigate(`/patient/chat/${doctor.id}`);
    } else if (type === 'chat') {
      navigate(`/patient/chat/${doctor.id}`);
    } else {
      navigate(`/patient/visit-booking/${doctor.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Hi, {patient?.name || 'Patient'}!</h1>
            <p className="text-primary-foreground/80 text-sm">
              <MapPin className="inline h-4 w-4 mr-1" />
              {patient?.address || 'Location not set'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/patient/profile")}
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                localStorage.removeItem("currentPatient");
                navigate("/");
              }}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-white text-primary">
                {patient?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors, specializations..."
            className="pl-10 bg-white text-black placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Doctors List */}
      <div className="p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Available Healthcare Providers</h2>
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="shadow-card hover:shadow-medical transition-shadow">
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                      <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div 
                      className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                        doctor.isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        <div className="flex items-center mt-1 space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            {doctor.rating}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {doctor.patients} patients
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {doctor.availability}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {doctor.experience}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex space-x-2 text-xs">
                        <span className="text-muted-foreground">Online: ₹{doctor.consultationFee}</span>
                        <span className="text-muted-foreground">Visit: ₹{doctor.visitFee}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="medical-outline"
                          onClick={() => handleConsultation(doctor, 'chat')}
                          className="text-xs px-2 py-1"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                        <Button 
                          size="sm" 
                          variant="medical-outline"
                          onClick={() => handleConsultation(doctor, 'online')}
                          className="text-xs px-2 py-1"
                        >
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Button>
                        <Button 
                          size="sm" 
                          variant="medical"
                          onClick={() => handleConsultation(doctor, 'visit')}
                          className="text-xs px-2 py-1"
                        >
                          <Home className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          variant="floating" 
          size="floating"
          onClick={() => toast({
            title: "Quick Actions",
            description: "Emergency booking, book appointment, or chat with support.",
          })}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default PatientHome;
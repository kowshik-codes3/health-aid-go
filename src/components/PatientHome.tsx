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
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import doctorMale1 from "@/assets/doctor-male-1.jpg";
import doctorFemale1 from "@/assets/doctor-female-1.jpg";
import nurseFemale1 from "@/assets/nurse-female-1.jpg";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  consultation_fee: number;
  visit_fee: number;
  availability: string;
  is_online: boolean;
  address: string;
  about_text?: string;
  user_id: string;
}

const PatientHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and get patient data
    const initializePatient = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/patient/auth');
          return;
        }

        setSession(session);
        setUser(session.user);

        // Get patient profile
        const { data: patientData, error } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching patient:', error);
        } else {
          setPatient(patientData);
        }
      } catch (error) {
        console.error('Error initializing patient:', error);
        navigate('/patient/auth');
      } finally {
        setLoading(false);
      }
    };

    // Load doctors from Supabase
    const loadDoctors = async () => {
      try {
        const { data: doctorsData, error } = await supabase
          .from('doctors')
          .select('*');

        if (error) {
          console.error('Error fetching doctors:', error);
        } else {
          setDoctors(doctorsData || []);
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };

    loadDoctors();
    initializePatient();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const handleConsultation = (doctor: Doctor, type: 'chat' | 'online' | 'visit') => {
    if (type === 'chat') {
      navigate(`/patient/chat/${doctor.id}`);
    } else if (type === 'visit') {
      navigate(`/patient/visit-booking/${doctor.id}`);
    } else {
      // Handle online consultation
      toast({
        title: "Starting Consultation",
        description: `Connecting you with ${doctor.name}...`,
      });
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary-light text-primary">
                  {patient?.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Welcome, {patient?.name || 'Patient'}
                </h1>
                <p className="text-sm text-muted-foreground">Find your healthcare provider</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate("/patient/profile")}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Search Section */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors or specializations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-foreground bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card hover:shadow-medical transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Video className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Video Call</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-medical transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Chat</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-medical transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Home className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Home Visit</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-medical transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Nearby</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Doctors */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Available Doctors</h2>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No doctors found. Try adjusting your search.</p>
                </CardContent>
              </Card>
            ) : (
              filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="shadow-card hover:shadow-medical transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={doctorMale1} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div 
                          className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                            doctor.is_online ? 'bg-green-500' : 'bg-red-500'
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
                                4.8
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                100+ patients
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {doctor.availability}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {doctor.experience} years
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex space-x-2 text-xs">
                            <span className="text-muted-foreground">Online: ₹{doctor.consultation_fee}</span>
                            <span className="text-muted-foreground">Visit: ₹{doctor.visit_fee}</span>
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
                              Consult
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
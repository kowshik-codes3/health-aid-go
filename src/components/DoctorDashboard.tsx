import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  IndianRupee,
  Edit,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    // Get doctor data (in real app, this would come from authentication)
    const doctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    if (doctors.length > 0) {
      setDoctor(doctors[doctors.length - 1]); // Get the latest registered doctor
    } else {
      // Redirect to registration if no doctor found
      navigate("/doctor/register");
    }
  }, [navigate]);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up your dashboard</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Today's Appointments",
      value: "8",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Total Patients",
      value: doctor.patients || "156",
      icon: Users,
      color: "text-secondary"
    },
    {
      title: "Monthly Earnings",
      value: "₹45,200",
      icon: IndianRupee,
      color: "text-green-600"
    },
    {
      title: "Rating",
      value: doctor.rating || "4.8",
      icon: TrendingUp,
      color: "text-yellow-600"
    }
  ];

  const todayAppointments = [
    { id: 1, patient: "John Doe", time: "10:00 AM", type: "Online Consultation" },
    { id: 2, patient: "Jane Smith", time: "11:30 AM", type: "Home Visit" },
    { id: 3, patient: "Mike Johnson", time: "2:00 PM", type: "Online Consultation" },
    { id: 4, patient: "Sarah Wilson", time: "4:30 PM", type: "Home Visit" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage src={doctor.profileImage} alt={doctor.name} />
              <AvatarFallback className="bg-white text-primary text-lg">
                {doctor.name?.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{doctor.name}</h1>
              <p className="text-primary-foreground/80">{doctor.specialization}</p>
              <div className="flex items-center mt-1">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {doctor.experience} Experience
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Schedule */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Management */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Profile Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Consultation Fee</p>
                <p className="font-semibold text-foreground">₹{doctor.consultationFee}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Visit Fee</p>
                <p className="font-semibold text-foreground">₹{doctor.visitFee}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Availability</p>
                <p className="font-semibold text-foreground">{doctor.availability}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className="bg-secondary text-secondary-foreground">Active</Badge>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="medical-outline" 
                className="flex-1"
                onClick={() => navigate("/doctor/profile")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
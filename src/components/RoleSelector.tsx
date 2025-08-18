import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button-enhanced";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Stethoscope } from "lucide-react";
import heroImage from "@/assets/healthcare-hero.jpg";

const RoleSelector = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setTimeout(() => {
      if (role === "doctor") {
        navigate("/doctor/register");
      } else {
        navigate("/patient/auth");
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Hero Section */}
      <div className="relative h-1/3 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Healthcare professionals" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">HealthConnect</h1>
            <p className="text-lg opacity-90">Connecting Care, Anywhere</p>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Role
            </h2>
            <p className="text-muted-foreground">
              Are you here as a patient or healthcare provider?
            </p>
          </div>

          <div className="space-y-4">
            <Card 
              className={`transition-all duration-300 cursor-pointer ${
                selectedRole === "patient" ? "ring-2 ring-primary shadow-medical" : "hover:shadow-card"
              }`}
              onClick={() => handleRoleSelect("patient")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-light p-3 rounded-full">
                    <UserCheck className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">Patient</h3>
                    <p className="text-muted-foreground">
                      Find and connect with healthcare providers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`transition-all duration-300 cursor-pointer ${
                selectedRole === "doctor" ? "ring-2 ring-primary shadow-medical" : "hover:shadow-card"
              }`}
              onClick={() => handleRoleSelect("doctor")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-secondary-light p-3 rounded-full">
                    <Stethoscope className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">Healthcare Provider</h3>
                    <p className="text-muted-foreground">
                      Register as a doctor or nurse
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
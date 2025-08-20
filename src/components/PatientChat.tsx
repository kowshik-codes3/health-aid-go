import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Phone, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'doctor';
  timestamp: Date;
}

const PatientChat = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [doctor, setDoctor] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    // Get current patient
    const currentPatient = localStorage.getItem("currentPatient");
    if (!currentPatient) {
      navigate("/patient/auth");
      return;
    }
    setPatient(JSON.parse(currentPatient));

    // Get doctor details
    const doctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    const foundDoctor = doctors.find((d: any) => d.id === doctorId);
    if (foundDoctor) {
      setDoctor(foundDoctor);
    }

    // Load existing messages for this conversation
    const messagesKey = `chat_${JSON.parse(currentPatient).id}_${doctorId}`;
    const existingMessages = JSON.parse(localStorage.getItem(messagesKey) || "[]");
    setMessages(existingMessages);

    // Add welcome message if no messages exist
    if (existingMessages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Hello! I'm Dr. ${foundDoctor?.name}. How can I help you today?`,
        sender: 'doctor',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      localStorage.setItem(messagesKey, JSON.stringify([welcomeMessage]));
    }
  }, [doctorId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !patient || !doctor) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'patient',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    // Save to localStorage
    const messagesKey = `chat_${patient.id}_${doctorId}`;
    localStorage.setItem(messagesKey, JSON.stringify(updatedMessages));

    // Simulate doctor response after 2 seconds
    setTimeout(() => {
      const doctorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message. I'll review your concern and provide guidance shortly.",
        sender: 'doctor',
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, doctorResponse];
      setMessages(finalMessages);
      localStorage.setItem(messagesKey, JSON.stringify(finalMessages));
    }, 2000);

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!doctor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 shadow-medical">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/patient/home")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={doctor.profileImage} alt={doctor.name} />
              <AvatarFallback>{doctor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">{doctor.name}</h1>
              <p className="text-sm text-primary-foreground/80">{doctor.specialization}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => toast({ title: "Voice call feature coming soon!" })}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => toast({ title: "Video call feature coming soon!" })}
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'patient' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon" variant="default">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientChat;
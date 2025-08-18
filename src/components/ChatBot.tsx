import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Video, Phone, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'doctor' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [doctor, setDoctor] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get doctor info
    const doctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    const defaultDoctors = [
      { id: "1", name: "Dr. Sarah Johnson", specialization: "General Physician" },
      { id: "2", name: "Dr. Michael Chen", specialization: "Cardiologist" },
      { id: "3", name: "Nurse Emily Davis", specialization: "General Nurse" }
    ];
    
    const allDoctors = [...defaultDoctors, ...doctors];
    const selectedDoctor = allDoctors.find(d => d.id === doctorId);
    setDoctor(selectedDoctor);

    // Initial bot message
    const initialMessages: Message[] = [
      {
        id: "1",
        text: `Hello! I'm the AI assistant for ${selectedDoctor?.name || 'the doctor'}. Please describe your symptoms or health concerns, and I'll help assess your situation before connecting you with the doctor.`,
        sender: 'bot',
        timestamp: new Date()
      },
      {
        id: "2", 
        text: "You can also request a video call or phone consultation anytime during our chat.",
        sender: 'bot',
        timestamp: new Date()
      }
    ];
    
    setMessages(initialMessages);
  }, [doctorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'patient',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simple bot response simulation
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(newMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('fever') || message.includes('temperature')) {
      return "I understand you're experiencing fever. This could indicate an infection. How long have you had the fever? Any other symptoms like headache, body aches, or chills? The doctor will want to know your exact temperature if you've measured it.";
    }
    
    if (message.includes('headache') || message.includes('head pain')) {
      return "Headaches can have various causes. Is this a sudden severe headache, or gradual? Any visual changes, nausea, or sensitivity to light? The doctor will help determine if this needs immediate attention.";
    }
    
    if (message.includes('chest pain') || message.includes('heart')) {
      return "Chest pain requires careful evaluation. Is the pain sharp, dull, or pressure-like? Does it worsen with breathing or movement? Given the importance of this symptom, I recommend requesting an immediate video consultation with the doctor.";
    }
    
    if (message.includes('stomach') || message.includes('nausea') || message.includes('vomit')) {
      return "Digestive issues can be concerning. How long have you been experiencing this? Any fever, severe pain, or blood? The doctor can provide guidance on whether this needs urgent care or can be managed at home.";
    }
    
    return "Thank you for sharing that information. I've noted your symptoms. The doctor will review this and provide appropriate guidance. Would you like to start a video consultation now, or do you have any other symptoms to mention?";
  };

  const startVideoCall = () => {
    toast({
      title: "Video Call Initiated",
      description: `Connecting you with ${doctor?.name}. Please wait...`,
    });
  };

  const startPhoneCall = () => {
    toast({
      title: "Phone Call Requested",
      description: `${doctor?.name} will call you shortly.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-white text-primary">
                {doctor?.name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">{doctor?.name || 'Doctor'}</h1>
              <p className="text-sm text-primary-foreground/80">{doctor?.specialization}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={startPhoneCall}
              className="text-white hover:bg-white/20"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={startVideoCall}
              className="text-white hover:bg-white/20"
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'patient' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t bg-background">
        <div className="flex space-x-2 mb-3">
          <Button 
            variant="medical-outline" 
            size="sm"
            onClick={startVideoCall}
            className="flex-1"
          >
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </Button>
          <Button 
            variant="medical-outline" 
            size="sm"
            onClick={startPhoneCall}
            className="flex-1"
          >
            <Phone className="h-4 w-4 mr-2" />
            Phone Call
          </Button>
          <Button 
            variant="medical-outline" 
            size="sm"
            onClick={() => navigate(`/patient/visit-booking/${doctorId}`)}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Book Visit
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Describe your symptoms..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon" variant="medical">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
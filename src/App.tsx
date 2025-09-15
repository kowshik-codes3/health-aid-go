import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RoleSelector from "./components/RoleSelector";
import DoctorRegistration from "./components/DoctorRegistration";
import PatientAuth from "./components/PatientAuth";
import PatientHome from "./components/PatientHome";
import DoctorDashboard from "./components/DoctorDashboard";
import ChatBot from "./components/ChatBot";
import PatientChat from "./components/PatientChat";
import VisitBooking from "./components/VisitBooking";
import PatientProfile from "./components/PatientProfile";
import DoctorProfile from "./components/DoctorProfile";
import { DiagnosticHub } from "./components/DiagnosticHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelector />} />
          <Route path="/doctor/register" element={<DoctorRegistration />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/patient/auth" element={<PatientAuth />} />
        <Route path="/patient/home" element={<PatientHome />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/diagnostics" element={<DiagnosticHub />} />
        <Route path="/patient/chat/:doctorId" element={<PatientChat />} />
        <Route path="/patient/visit-booking/:doctorId" element={<VisitBooking />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

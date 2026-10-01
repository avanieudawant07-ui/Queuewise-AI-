import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DemoProvider } from "./context/DemoContext";
import { Navbar } from "./components/layout/Navbar";
import { PortalGateway } from "./pages/PortalGateway";
import { Dashboard } from "./pages/Dashboard";
import { PatientPortal } from "./pages/PatientPortal";
import { DoctorCalendar } from "./pages/DoctorCalendar";
import { AIChatbot } from "./components/assistant/AIChatbot";
import { BookAppointmentModal } from "./components/booking/BookAppointmentModal";

export function App() {
  const [globalBookingOpen, setGlobalBookingOpen] = useState(false);

  return (
    <AuthProvider>
      <DemoProvider>
        <Router>
          <div className="min-h-screen bg-[#FAF6EF] text-black flex flex-col font-sans selection:bg-emerald-300 selection:text-black relative">
            <Navbar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<PortalGateway />} />
                <Route path="/login" element={<PortalGateway />} />
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/doctor" element={<DoctorCalendar />} />
                <Route path="/patient" element={<PatientPortal />} />
              </Routes>
            </main>

            {/* Global Communicative AI Assistant Chatbot (Accessible on every page) */}
            <AIChatbot onOpenBookingModal={() => setGlobalBookingOpen(true)} />

            {/* Global Book Appointment Modal (When invoked via AI Assistant) */}
            <BookAppointmentModal
              isOpen={globalBookingOpen}
              onClose={() => setGlobalBookingOpen(false)}
            />

            <footer className="border-t border-[#E2D8C7] py-4 text-center text-xs text-black font-medium bg-[#FFFDF9]">
              QueueWise AI — Enterprise Multi-Agent Clinic Operations Engine • Built with Node.js, React, Tailwind CSS, MongoDB, and Gemini 2.0 AI
            </footer>
          </div>
        </Router>
      </DemoProvider>
    </AuthProvider>
  );
}

export default App;

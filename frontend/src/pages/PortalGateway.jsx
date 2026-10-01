import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Stethoscope, User, ArrowRight, Bot, Sparkles, CheckCircle2, Phone } from "lucide-react";

export function PortalGateway() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickEnter = async (phone, path) => {
    try {
      await login(phone);
      navigate(path);
    } catch (e) {
      navigate(path);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-200 border border-emerald-400 text-black text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>QueueWise AI â€” Autonomous Medical Scheduling Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black">
          Welcome to QueueWise AI
        </h1>
        <p className="text-sm sm:text-base text-black font-medium leading-relaxed">
          Create an account with your phone number to receive instant SMS priority slot refills, manage appointments, and access clinical operations.
        </p>
      </div>

      {/* 3 Dedicated Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Admin Operator Dashboard */}
        <div className="glass-panel p-6 border-[#DCD1BF] hover:border-black transition-all flex flex-col justify-between group shadow-sm bg-white">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-900 mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-black">Admin Operator</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-black font-mono font-black border border-purple-400">
                  OPS
                </span>
              </div>
            </div>

            {/* Official Phone Number */}
            <div className="flex items-center space-x-1.5 text-xs text-black font-mono font-bold mb-3 bg-[#FAF6EF] px-2.5 py-1.5 rounded-lg border border-[#DCD1BF]">
              <Phone className="w-3.5 h-3.5 text-black" />
              <span>Clinic Phone: 9821001999</span>
            </div>

            <p className="text-xs text-black font-medium mb-4 leading-relaxed">
              Autonomous multi-agent orchestration, Human-in-the-Loop approvals, real-time telemetry, audit logs, and demo scenario triggers.
            </p>

            <div className="space-y-1.5 text-[11px] text-black font-bold mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Live agent telemetry timeline</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Human-In-The-Loop approval gate</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Instant demo reset & slot recovery</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleQuickEnter("9821001999", "/admin")}
              className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center justify-center space-x-2"
            >
              <span>Access as Admin (9821001999)</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            <Link
              to="/admin"
              className="w-full py-2 rounded-xl text-center block text-xs text-black font-bold bg-[#FAF6EF] hover:bg-[#F2ECE0] border border-[#DCD1BF] transition-all"
            >
              Create Account / Custom Sign In â†’
            </Link>
          </div>
        </div>

        {/* 2. Doctor Calendar Portal */}
        <div className="glass-panel p-6 border-[#DCD1BF] hover:border-black transition-all flex flex-col justify-between group shadow-sm bg-white">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-900 mb-4 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6 text-black" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-black">Doctor Calendar</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 text-black font-mono font-black border border-blue-400">
                  PROVIDER
                </span>
              </div>
            </div>

            {/* Official Phone Number */}
            <div className="flex items-center space-x-1.5 text-xs text-black font-mono font-bold mb-3 bg-[#FAF6EF] px-2.5 py-1.5 rounded-lg border border-[#DCD1BF]">
              <Phone className="w-3.5 h-3.5 text-black" />
              <span>Dr. Jenkins Phone: 9821001201</span>
            </div>

            <p className="text-xs text-black font-medium mb-4 leading-relaxed">
              Provider daily schedules, patient contact details, slot reservation, rescheduling tools, and clinical approval requests.
            </p>

            <div className="space-y-1.5 text-[11px] text-black font-bold mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Today's appointment roster</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Auto-refilled waitlist badge</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Reschedule & slot management</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleQuickEnter("9821001201", "/doctor")}
              className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center justify-center space-x-2"
            >
              <span>Access as Dr. Jenkins (9821001201)</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            <Link
              to="/doctor"
              className="w-full py-2 rounded-xl text-center block text-xs text-black font-bold bg-[#FAF6EF] hover:bg-[#F2ECE0] border border-[#DCD1BF] transition-all"
            >
              Create Account / Custom Sign In â†’
            </Link>
          </div>
        </div>

        {/* 3. Patient Self-Service Portal */}
        <div className="glass-panel p-6 border-[#DCD1BF] hover:border-black transition-all flex flex-col justify-between group shadow-sm bg-white">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 mb-4 group-hover:scale-105 transition-transform">
              <User className="w-6 h-6 text-black" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-black">Patient Portal</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-black font-mono font-black border border-emerald-400">
                  PATIENT
                </span>
              </div>
            </div>

            {/* Official Phone Number */}
            <div className="flex items-center space-x-1.5 text-xs text-black font-mono font-bold mb-3 bg-[#FAF6EF] px-2.5 py-1.5 rounded-lg border border-[#DCD1BF]">
              <Phone className="w-3.5 h-3.5 text-black" />
              <span>Alex Rivera Phone: 9876543210</span>
            </div>

            <p className="text-xs text-black font-medium mb-4 leading-relaxed">
              Book new appointments, reschedule appointments, cancel appointments, join the priority waitlist, and respond to SMS slot offers.
            </p>

            <div className="space-y-1.5 text-[11px] text-black font-bold mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Book, reschedule & cancel slots</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Real-time SMS refill offer banner</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Priority waitlist enrollment</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleQuickEnter("9876543210", "/patient")}
              className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center justify-center space-x-2"
            >
              <span>Access as Alex Rivera (9876543210)</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            <Link
              to="/patient"
              className="w-full py-2 rounded-xl text-center block text-xs text-black font-bold bg-[#FAF6EF] hover:bg-[#F2ECE0] border border-[#DCD1BF] transition-all"
            >
              Create Account / Custom Sign In â†’
            </Link>
          </div>
        </div>

      </div>

      {/* Communicative Features & AI Assistant Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#DCD1BF] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-200 border border-emerald-400 flex items-center justify-center text-black shrink-0">
            <Bot className="w-6 h-6 text-black" />
          </div>
          <div>
            <h4 className="text-base font-black text-black flex items-center space-x-2">
              <span>Interactive AI Assistant with SMS Notification Engine</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-black font-black border border-emerald-400">Active</span>
            </h4>
            <p className="text-xs text-black font-medium mt-0.5">
              Every account registered with a phone number receives SMS confirmations, conversational slot rescheduling, and prioritized waitlist notifications!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

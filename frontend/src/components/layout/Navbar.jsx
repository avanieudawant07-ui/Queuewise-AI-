import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDemo } from "../../context/DemoContext";
import { AuthModal } from "../auth/AuthModal";
import { Bot, ShieldCheck, Stethoscope, User, LogOut, LayoutGrid } from "lucide-react";

export function Navbar() {
  const { user, login, logout } = useAuth();
  const { runs } = useDemo();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const activeRun = runs.find(r => ["running", "waiting_for_approval", "waiting_for_patient"].includes(r.status));

  const handleRoleSwitch = async (rolePhone) => {
    await login(rolePhone);
  };

  const isActive = (path) => {
    if (path === "/" && (location.pathname === "/" || location.pathname === "/login")) return true;
    return location.pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E2D8C7] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link to="/" className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-green-500 flex items-center justify-center shadow-md shadow-emerald-400/30">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <span className="text-lg font-black text-black">
                    QueueWise <span className="text-black text-[10px] px-2 py-0.5 rounded-full bg-emerald-300 border border-emerald-500 ml-1 font-mono font-bold">AI 2.0</span>
                  </span>
                  <p className="text-[10px] text-black font-semibold -mt-0.5 hidden sm:block">Autonomous Multi-Agent Clinic Platform</p>
                </div>
              </Link>
            </div>

            {/* Main Navigation Links to 3 Separate Portals */}
            <nav className="hidden md:flex items-center space-x-1 bg-[#F5EFE6] p-1 rounded-xl border border-[#DCD1BF] text-xs">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                  isActive("/") ? "bg-white text-black shadow-sm border border-[#C8BCA6]" : "text-black hover:bg-white/60"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-black" />
                <span>Portal Hub</span>
              </Link>

              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                  isActive("/admin") ? "bg-white text-black shadow-sm border border-[#C8BCA6]" : "text-black hover:bg-white/60"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Admin Operator</span>
              </Link>

              <Link
                to="/doctor"
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                  isActive("/doctor") ? "bg-white text-black shadow-sm border border-[#C8BCA6]" : "text-black hover:bg-white/60"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
                <span>Doctor Calendar</span>
              </Link>

              <Link
                to="/patient"
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                  isActive("/patient") ? "bg-white text-black shadow-sm border border-[#C8BCA6]" : "text-black hover:bg-white/60"
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-800" />
                <span>Patient Portal</span>
              </Link>
            </nav>

            {/* Right Side: Agent Indicator & Authentication */}
            <div className="flex items-center space-x-2.5">
              
              {/* Agent Active Pill */}
              {activeRun ? (
                <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-400 text-black text-[11px] font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                  <span>Agent Working</span>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-black text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Ready</span>
                </div>
              )}

              {/* User Identity / Role Quick Switcher */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#DCD1BF] shadow-sm text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="font-black text-black max-w-[90px] truncate">{user.name}</span>
                    {user.phone && (
                      <span className="text-[10px] text-black font-mono font-bold hidden sm:inline">{user.phone}</span>
                    )}
                    <span className="text-[10px] bg-emerald-200 text-black px-1.5 py-0.5 rounded font-mono font-black border border-emerald-400">
                      {user.role}
                    </span>
                  </div>

                  {/* 1-Click Role Switch */}
                  <div className="hidden xl:flex items-center space-x-1 bg-[#F5EFE6] p-1 rounded-xl border border-[#DCD1BF] text-[11px]">
                    <button
                      onClick={() => handleRoleSwitch("9821001999")}
                      className={`px-2 py-0.5 rounded transition-all font-bold ${user?.role === "ADMIN" ? "bg-emerald-400 text-black shadow-sm" : "text-black hover:bg-white"}`}
                      title="Admin â€¢ 9821001999"
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => handleRoleSwitch("9821001201")}
                      className={`px-2 py-0.5 rounded transition-all font-bold ${user?.role === "DOCTOR" ? "bg-emerald-400 text-black shadow-sm" : "text-black hover:bg-white"}`}
                      title="Dr. Jenkins â€¢ 9821001201"
                    >
                      Doctor
                    </button>
                    <button
                      onClick={() => handleRoleSwitch("9876543210")}
                      className={`px-2 py-0.5 rounded transition-all font-bold ${user?.role === "PATIENT" ? "bg-emerald-400 text-black shadow-sm" : "text-black hover:bg-white"}`}
                      title="Alex Rivera â€¢ 9876543210"
                    >
                      Patient
                    </button>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    title="Switch Account / Sign Out"
                    className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-black hover:text-rose-700 border border-[#DCD1BF] hover:border-rose-400 transition-all shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-400 hover:bg-emerald-500 text-black shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center space-x-1.5"
                >
                  <User className="w-4 h-4 text-black" />
                  <span>Create an Account</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-[#E2D8C7] bg-[#FFFDF9] px-4 py-2 flex items-center justify-around text-xs">
          <Link to="/" className={`px-2 py-1 rounded font-bold ${isActive("/") ? "text-black bg-emerald-200" : "text-black"}`}>
            Hub
          </Link>
          <Link to="/admin" className={`px-2 py-1 rounded font-bold ${isActive("/admin") ? "text-black bg-emerald-200" : "text-black"}`}>
            Admin
          </Link>
          <Link to="/doctor" className={`px-2 py-1 rounded font-bold ${isActive("/doctor") ? "text-black bg-emerald-200" : "text-black"}`}>
            Doctor
          </Link>
          <Link to="/patient" className={`px-2 py-1 rounded font-bold ${isActive("/patient") ? "text-black bg-emerald-200" : "text-black"}`}>
            Patient
          </Link>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

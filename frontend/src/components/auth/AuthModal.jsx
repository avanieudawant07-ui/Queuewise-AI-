import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bot, User, Stethoscope, ShieldCheck, Phone, X, UserPlus, KeyRound } from "lucide-react";

export function AuthModal({ isOpen, onClose }) {
  const { login, createAccount } = useAuth();
  
  const [isCreate, setIsCreate] = useState(true);
  
  // Form fields (Phone only, no email, no password)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [specialty, setSpecialty] = useState("");

  // Existing account (Phone number only)
  const [existingPhone, setExistingPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (!isOpen) return null;

  const handleQuickAccess = async (demoPhone) => {
    setLoading(true);
    setErr("");
    try {
      await login(demoPhone);
      onClose();
    } catch (e) {
      setErr("Access failed. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await createAccount({
        name,
        phone,
        role,
        specialty
      });
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || "Account creation failed. Please check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleExistingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await login(existingPhone);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || "No account found with this phone number. Please create an account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel max-w-md w-full p-6 border-[#DCD1BF] relative shadow-2xl animate-pulse-subtle max-h-[90vh] overflow-y-auto custom-scrollbar bg-white">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-black hover:bg-[#FAF6EF] transition-all"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-200 border border-emerald-400 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
            <Bot className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-xl font-black text-black">
            {isCreate ? "Create an Account" : "Access Your Account"}
          </h2>
          <p className="text-xs text-black font-medium mt-0.5">
            Registered phone number enables instant SMS slot offers and refill alerts
          </p>
        </div>

        {/* Quick Access Profiles with PHONE NUMBERS */}
        <div className="mb-5 p-3 rounded-xl bg-[#FAF6EF] border border-[#DCD1BF]">
          <p className="text-[11px] font-black text-black uppercase tracking-wider text-center mb-2 flex items-center justify-center space-x-1">
            <Phone className="w-3 h-3 text-black" />
            <span>1-Click Verified Clinic Phone Numbers</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickAccess("9876543210")}
              className="p-2 rounded-lg bg-white hover:bg-emerald-50 border border-[#DCD1BF] hover:border-black text-xs font-semibold text-black flex flex-col items-center space-y-1 transition-all text-center shadow-sm"
            >
              <User className="w-4 h-4 text-black" />
              <span className="font-black text-black">Patient</span>
              <span className="text-[9px] text-black font-mono font-bold">9876543210</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAccess("9821001201")}
              className="p-2 rounded-lg bg-white hover:bg-emerald-50 border border-[#DCD1BF] hover:border-black text-xs font-semibold text-black flex flex-col items-center space-y-1 transition-all text-center shadow-sm"
            >
              <Stethoscope className="w-4 h-4 text-black" />
              <span className="font-black text-black">Doctor</span>
              <span className="text-[9px] text-black font-mono font-bold">9821001201</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAccess("9821001999")}
              className="p-2 rounded-lg bg-white hover:bg-emerald-50 border border-[#DCD1BF] hover:border-black text-xs font-semibold text-black flex flex-col items-center space-y-1 transition-all text-center shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span className="font-black text-black">Admin</span>
              <span className="text-[9px] text-black font-mono font-bold">9821001999</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Create an Account vs Access Existing */}
        <div className="flex rounded-xl bg-[#F5EFE6] p-1 border border-[#DCD1BF] mb-4 text-xs">
          <button
            type="button"
            onClick={() => setIsCreate(true)}
            className={`flex-1 py-1.5 font-black rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              isCreate
                ? "bg-emerald-400 text-black shadow-sm border border-emerald-500"
                : "text-black hover:bg-white/60"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-black" />
            <span>Create an Account</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreate(false)}
            className={`flex-1 py-1.5 font-black rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              !isCreate
                ? "bg-white text-black shadow-sm font-black border border-[#DCD1BF]"
                : "text-black hover:bg-white/60"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-black" />
            <span>Existing Account</span>
          </button>
        </div>

        {err && (
          <div className="mb-4 text-xs text-rose-900 bg-rose-100 p-2.5 rounded-lg border border-rose-400 font-mono font-bold">
            {err}
          </div>
        )}

        {isCreate ? (
          /* CREATE AN ACCOUNT FORM (Phone only, No email) */
          <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-black font-black mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-medium focus:border-black outline-none placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-black font-black mb-1 flex items-center justify-between">
                <span>Phone Number (Primary Identifier)</span>
                <span className="text-[10px] text-black font-mono font-bold">Required</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-black absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl pl-9 pr-3 py-2.5 text-black font-medium focus:border-black outline-none font-mono placeholder:text-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-black font-black mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-bold focus:border-black outline-none"
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin Operator</option>
              </select>
            </div>

            {role === "DOCTOR" && (
              <div>
                <label className="block text-black font-black mb-1">Specialty</label>
                <input
                  type="text"
                  required
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. ENT Specialist, Cardiology, General Physician"
                  className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-medium focus:border-black outline-none placeholder:text-neutral-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>Create Account</span>
            </button>
          </form>
        ) : (
          /* ACCESS EXISTING ACCOUNT (Phone only) */
          <form onSubmit={handleExistingSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-black font-black mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-black absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={existingPhone}
                  onChange={(e) => setExistingPhone(e.target.value)}
                  placeholder="9876543210 or 9821001201"
                  className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl pl-9 pr-3 py-2.5 text-black font-medium focus:border-black outline-none font-mono placeholder:text-neutral-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4 text-black" />
              <span>Access Account</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

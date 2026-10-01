import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck, Stethoscope, User, Phone, ArrowRight, UserPlus, KeyRound } from "lucide-react";

export function RoleLoginGate({ requiredRole, title, subtitle, demoUsers, children }) {
  const { user, login, createAccount } = useAuth();
  
  // Default to "Create an Account" tab
  const [mode, setMode] = useState("create"); // "create" | "existing"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState(requiredRole === "DOCTOR" ? "General Medicine" : "");
  
  // Existing account identifier (Phone number)
  const [identifier, setIdentifier] = useState(demoUsers?.[0]?.phone || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user && (user.role === requiredRole || (requiredRole === "ADMIN" && user.role === "ADMIN"))) {
    return <>{children}</>;
  }

  const handleQuickAccess = async (demo) => {
    setLoading(true);
    setError("");
    try {
      await login(demo.phone);
    } catch (err) {
      setError("Quick access failed. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createAccount({
        name,
        phone,
        role: requiredRole,
        specialty
      });
    } catch (err) {
      setError(err.response?.data?.error || "Account creation failed. Please check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleExistingAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loggedUser = await login(identifier);
      if (loggedUser.role !== requiredRole && requiredRole !== "ADMIN") {
        setError(`Note: Logged in as ${loggedUser.role}. This portal is configured for ${requiredRole}.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "No account found with this phone number. Please create an account.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (requiredRole) {
      case "DOCTOR":
        return <Stethoscope className="w-8 h-8 text-black" />;
      case "PATIENT":
        return <User className="w-8 h-8 text-black" />;
      case "ADMIN":
      default:
        return <ShieldCheck className="w-8 h-8 text-black" />;
    }
  };

  const getIconBg = () => {
    switch (requiredRole) {
      case "DOCTOR":
        return "bg-blue-100 border-blue-300";
      case "PATIENT":
        return "bg-emerald-100 border-emerald-300";
      case "ADMIN":
      default:
        return "bg-purple-100 border-purple-300";
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8 px-4">
      <div className="glass-panel max-w-md w-full p-8 border-[#DCD1BF] shadow-lg relative bg-white">
        
        {/* Header Badge & Title */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl ${getIconBg()} border flex items-center justify-center mx-auto mb-3.5 shadow-sm`}>
            {getRoleIcon()}
          </div>
          <h2 className="text-2xl font-black text-black">{title}</h2>
          <p className="text-xs text-black font-medium mt-1 max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Current status banner if logged in with different role */}
        {user && user.role !== requiredRole && (
          <div className="mb-4 p-3 rounded-xl bg-amber-100 border border-amber-400 text-black text-xs font-semibold">
            Logged in as <span className="font-black">{user.name}</span> ({user.role} â€¢ {user.phone || "No phone"}). Create or select a {requiredRole} account below.
          </div>
        )}

        {/* 1-Click Demo Profiles with PHONE NUMBERS */}
        <div className="mb-6 p-4 rounded-xl bg-[#FAF6EF] border border-[#DCD1BF]">
          <div className="text-[11px] font-black text-black uppercase tracking-wider mb-2.5 text-center flex items-center justify-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-black" />
            <span>Verified Clinic Profiles & Phone Numbers</span>
          </div>
          <div className="space-y-2">
            {demoUsers?.map((u) => (
              <button
                key={u.phone}
                type="button"
                onClick={() => handleQuickAccess(u)}
                disabled={loading}
                className="w-full p-2.5 rounded-lg bg-white hover:bg-emerald-50 border border-[#DCD1BF] hover:border-black text-xs font-semibold text-black flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="text-left">
                  <div className="font-black text-black flex items-center space-x-1.5">
                    <span>{u.name}</span>
                    <span className="text-[10px] text-black font-mono font-bold">({u.phone})</span>
                  </div>
                  <div className="text-[10px] text-black font-medium">{u.desc}</div>
                </div>
                <div className="flex items-center space-x-1 text-black font-bold text-[11px] font-mono shrink-0 ml-2">
                  <span>Access</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs: Create an Account vs Access Existing Account */}
        <div className="flex rounded-xl bg-[#F5EFE6] p-1 border border-[#DCD1BF] mb-5">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              mode === "create"
                ? "bg-emerald-400 text-black shadow-sm border border-emerald-500"
                : "text-black hover:bg-white/60"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-black" />
            <span>Create an Account</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              mode === "existing"
                ? "bg-white text-black shadow-sm border border-[#DCD1BF]"
                : "text-black hover:bg-white/60"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-black" />
            <span>Existing Account</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs text-rose-900 bg-rose-100 p-2.5 rounded-lg border border-rose-400 font-mono font-bold">
            {error}
          </div>
        )}

        {mode === "create" ? (
          /* Mode 1: CREATE AN ACCOUNT Form (Phone only, No email) */
          <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
            <div>
              <label className="block text-black font-black mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={requiredRole === "DOCTOR" ? "Dr. Jonathan Smith" : "Sarah Connor"}
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-medium focus:border-black outline-none placeholder:text-neutral-500"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-black font-black mb-1 flex items-center justify-between">
                <span>Phone Number (for SMS Alerts & Offers)</span>
                <span className="text-[10px] text-black font-mono font-bold">Required</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-black absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9821001999"
                  className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl pl-9 pr-3 py-2.5 text-black font-medium focus:border-black outline-none font-mono placeholder:text-neutral-500"
                />
              </div>
            </div>

            {requiredRole === "DOCTOR" && (
              <div>
                <label className="block text-black font-black mb-1">Medical Specialty</label>
                <input
                  type="text"
                  required
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Pediatrics, Cardiology, Family Medicine"
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
              <span>Create {requiredRole} Account</span>
            </button>
          </form>
        ) : (
          /* Mode 2: ACCESS EXISTING ACCOUNT (via Phone Number) */
          <form onSubmit={handleExistingAccess} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-black font-black mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-black absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210"
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
              <span>Access {requiredRole} Portal</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

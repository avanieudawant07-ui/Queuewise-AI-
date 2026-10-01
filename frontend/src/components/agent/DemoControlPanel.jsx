import React, { useState } from "react";
import { useDemo } from "../../context/DemoContext";
import { Play, Check, RotateCcw, Zap, Sparkles } from "lucide-react";

export function DemoControlPanel() {
  const {
    pendingOffers,
    forceLLMFailure,
    triggerDemoCancellation,
    simulatePatientResponse,
    toggleLLMFailureMode,
    resetDemo
  } = useDemo();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleTriggerCancel = async () => {
    setLoading(true);
    setMsg("Triggering appointment cancellation (Act 3)...");
    try {
      await triggerDemoCancellation();
      setMsg("Cancellation triggered! Watch the Agent Telemetry Feed below.");
    } catch (err) {
      setMsg("Error triggering cancellation.");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientResponse = async (response) => {
    setLoading(true);
    try {
      await simulatePatientResponse(response);
      setMsg(`Simulated patient ${response} response!`);
    } catch (err) {
      setMsg("Error handling response.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLLMFailure = async () => {
    const res = await toggleLLMFailureMode();
    setMsg(res.message);
  };

  const handleReset = async () => {
    setLoading(true);
    await resetDemo();
    setMsg("Demo environment reset to initial clean state.");
    setLoading(false);
  };

  return (
    <div className="glass-panel p-5 border-[#E6DFD3] mb-6 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D5]">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Live Demo Control Center (Act 3 & Fallback Testing)</h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Test autonomous recovery, simulated patient SMS offers, and deterministic safety fallbacks with 1 click.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF6EF] hover:bg-[#F2ECE0] text-slate-700 border border-[#E2DAD0] flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={handleToggleLLMFailure}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
              forceLLMFailure
                ? "bg-rose-100 text-rose-800 border-rose-300"
                : "bg-[#FAF6EF] text-slate-700 border-[#E2DAD0] hover:bg-[#F2ECE0]"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${forceLLMFailure ? "text-rose-600 fill-rose-600" : "text-amber-600"}`} />
            <span>Force LLM Failure: {forceLLMFailure ? "ON (Deterministic)" : "OFF (Gemini)"}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons Grid in Light Green */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        
        {/* Step 1: Trigger Cancellation */}
        <button
          onClick={handleTriggerCancel}
          disabled={loading}
          className="p-3 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-emerald-950 text-xs font-bold shadow-md shadow-emerald-400/20 border border-emerald-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-2">
            <Play className="w-4 h-4 text-emerald-950 fill-emerald-950 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div>1. Trigger Cancellation</div>
              <div className="text-[10px] text-emerald-900 font-normal">Fires APPOINTMENT_CANCELLED</div>
            </div>
          </div>
        </button>

        {/* Step 2: Patient Accept Offer */}
        <button
          onClick={() => handlePatientResponse("ACCEPT")}
          disabled={loading || pendingOffers.length === 0}
          className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
            pendingOffers.length > 0
              ? "bg-emerald-400 hover:bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-400/20 border border-emerald-300 animate-pulse"
              : "bg-[#F5EFE6] text-slate-400 border border-[#E4DCCE] cursor-not-allowed"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <div className="text-left">
              <div>2. Patient Accepts Offer</div>
              <div className="text-[10px] font-normal">Books slot & runs verification</div>
            </div>
          </div>
          {pendingOffers.length > 0 && (
            <span className="text-[10px] bg-white text-emerald-950 px-2 py-0.5 rounded-full font-bold shadow-xs">
              Offer Ready ({pendingOffers.length})
            </span>
          )}
        </button>

        {/* Step 3: Patient Decline Offer */}
        <button
          onClick={() => handlePatientResponse("DECLINE")}
          disabled={loading || pendingOffers.length === 0}
          className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
            pendingOffers.length > 0
              ? "bg-[#FAF6EF] hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-[#E2DAD0] hover:border-rose-300"
              : "bg-[#F5EFE6] text-slate-400 border border-[#E4DCCE] cursor-not-allowed"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="text-left">
              <div>3. Patient Declines Offer</div>
              <div className="text-[10px] font-normal">Agent cascades to next candidate</div>
            </div>
          </div>
        </button>

      </div>

      {msg && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono">
          {msg}
        </div>
      )}
    </div>
  );
}

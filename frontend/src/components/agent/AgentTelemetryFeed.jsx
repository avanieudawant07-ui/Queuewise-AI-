import React from "react";
import { useDemo } from "../../context/DemoContext";
import { Bot, CheckCircle2, Clock, Cpu, ShieldCheck, UserCheck, Wrench, AlertCircle } from "lucide-react";

export function AgentTelemetryFeed() {
  const { activeRun, activeRunSteps } = useDemo();

  if (!activeRun) {
    return (
      <div className="glass-panel p-8 text-center border-dashed border-[#E2DAD0] bg-white shadow-sm">
        <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900">No Active Agent Workflow</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Trigger an appointment cancellation in the Patient Portal or Demo Control Panel to launch the autonomous multi-agent recovery workflow!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 border-[#E6DFD3] shadow-md relative overflow-hidden bg-white">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D5]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
            <Cpu className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Live Multi-Agent Telemetry</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                {activeRun.runId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trigger: <span className="font-semibold text-slate-800">{activeRun.triggerEvent}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            activeRun.status === "completed" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
            activeRun.status === "waiting_for_approval" ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse" :
            activeRun.status === "waiting_for_patient" ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse" :
            "bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse"
          }`}>
            {activeRun.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Execution Plan Progress Stepper */}
      {activeRun.planSteps && activeRun.planSteps.length > 0 && (
        <div className="my-5 p-4 rounded-xl bg-[#FAF6EF] border border-[#E6DFD3]">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Supervisor Orchestration Plan</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {activeRun.planSteps.map(step => (
              <div
                key={step.stepNumber}
                className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2 transition-all ${
                  step.status === "completed" ? "bg-emerald-100/60 border-emerald-300 text-emerald-950 font-medium" :
                  step.status === "in_progress" ? "bg-white border-emerald-400 text-emerald-950 shadow-sm animate-pulse-subtle" :
                  "bg-white/60 border-[#E2DAD0] text-slate-400"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                  step.status === "completed" ? "bg-emerald-400 text-emerald-950" :
                  step.status === "in_progress" ? "bg-emerald-400 text-emerald-950" :
                  "bg-slate-200 text-slate-600"
                }`}>
                  {step.stepNumber}
                </div>
                <div>
                  <p className="font-semibold">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Granular Step Timeline */}
      <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {activeRunSteps.map((step, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-[#FFFDF9] border border-[#E8E0D2] shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                {step.agentName === "SupervisorAgent" && <Bot className="w-4 h-4 text-emerald-700" />}
                {step.agentName === "SchedulingAgent" && <Clock className="w-4 h-4 text-blue-700" />}
                {step.agentName === "WaitlistAgent" && <UserCheck className="w-4 h-4 text-purple-700" />}
                {step.agentName === "VerificationAgent" && <ShieldCheck className="w-4 h-4 text-emerald-700" />}
                
                <span className="text-xs font-bold text-slate-900">{step.agentName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF6EF] text-slate-600 uppercase font-mono font-semibold border border-[#E2DAD0]">
                  {step.stepType}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {step.executionTimeMs}ms • {new Date(step.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {/* Reasoning / Thought */}
            {step.reasoning && (
              <p className="text-xs text-slate-800 leading-relaxed bg-[#FAF6EF] p-2.5 rounded-lg border border-[#E6DFD3] my-1 font-mono">
                {step.reasoning}
              </p>
            )}

            {/* Tool Execution Details */}
            {step.toolName && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#FAF6EF] border border-[#E6DFD3] text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-emerald-800 mb-1 font-bold">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Tool: {step.toolName}</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div><span className="text-slate-500 font-semibold">Input:</span> {JSON.stringify(step.inputParams)}</div>
                  {step.outputResult && (
                    <div className="text-emerald-900 font-semibold"><span className="text-slate-500">Output:</span> {JSON.stringify(step.outputResult)}</div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Invariant Checks Table */}
            {step.stepType === "VERIFICATION" && step.outputResult?.checks && (
              <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Deterministic Invariant Suite (100% Mathematical Proof)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-bold border border-emerald-400">
                    {step.outputResult.allPassed ? "ALL PASSED" : "FAILED"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {step.outputResult.checks.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-700">{c.name}</span>
                      <span className={`flex items-center space-x-1 font-bold ${c.passed ? "text-emerald-700" : "text-rose-600"}`}>
                        {c.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{c.passed ? "PASSED" : "FAILED"}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}

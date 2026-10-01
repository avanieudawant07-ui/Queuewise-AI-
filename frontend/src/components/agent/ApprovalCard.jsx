import React from "react";
import { useDemo } from "../../context/DemoContext";
import { CheckCircle, XCircle, ShieldAlert } from "lucide-react";

export function ApprovalCard() {
  const { pendingApprovals, decideApproval } = useDemo();

  if (!pendingApprovals || pendingApprovals.length === 0) return null;

  return (
    <div className="space-y-3 my-4">
      {pendingApprovals.map((approval) => (
        <div
          key={approval._id}
          className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-md shadow-amber-400/10 animate-pulse-subtle"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                    Human-in-the-Loop Required
                  </span>
                  <span className="text-xs text-amber-800 font-mono font-semibold">{approval.runId}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{approval.actionRequired.replace(/_/g, " ")}</h3>
                <p className="text-xs text-slate-700 mt-1 max-w-xl leading-relaxed">{approval.reason}</p>
                
                {approval.candidateDetails && (
                  <div className="mt-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-amber-200 inline-block font-mono shadow-xs">
                    Candidate: <span className="text-emerald-800 font-bold">{approval.candidateDetails.patientName}</span>
                    {approval.slotDetails && (
                      <span className="ml-3 text-slate-600">
                        Slot: {approval.slotDetails.date} at {approval.slotDetails.startTime}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 ml-4">
              <button
                onClick={() => decideApproval(approval._id, "REJECT")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-[#E2DAD0] hover:border-rose-300 transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => decideApproval(approval._id, "APPROVE")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-400/20 border border-emerald-300 transition-all flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Slot Refill</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

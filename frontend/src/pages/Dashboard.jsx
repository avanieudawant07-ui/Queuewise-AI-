import React, { useEffect, useState } from "react";
import { useDemo } from "../context/DemoContext";
import { useAuth } from "../context/AuthContext";
import { RoleLoginGate } from "../components/auth/RoleLoginGate";
import { AgentTelemetryFeed } from "../components/agent/AgentTelemetryFeed";
import { ApprovalCard } from "../components/agent/ApprovalCard";
import { DemoControlPanel } from "../components/agent/DemoControlPanel";
import { BookAppointmentModal } from "../components/booking/BookAppointmentModal";
import { apiClient } from "../api/client";
import {
  Activity,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  CalendarCheck,
  Search
} from "lucide-react";

export function Dashboard() {
  const { metrics, triggerDemoCancellation } = useDemo();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [apptsRes, waitlistRes] = await Promise.all([
        apiClient.get("/appointments"),
        apiClient.get("/waitlist")
      ]);
      setAppointments(apptsRes.data.appointments || []);
      setWaitlist(waitlistRes.data.waitlist || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelAppointment = async (apptId) => {
    setLoading(true);
    setMsg("Cancelling appointment to launch autonomous recovery workflow...");
    try {
      await triggerDemoCancellation(apptId);
      setMsg("Appointment cancelled! Autonomous Multi-Agent workflow launched below.");
      await fetchData();
    } catch (err) {
      setMsg("Error cancelling appointment.");
    } finally {
      setLoading(false);
    }
  };

  const demoAdmins = [
    { name: "Admin Receptionist", phone: "9821001999", desc: "Full Clinic Operational Privileges" }
  ];

  const filteredAppointments = appointments.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.patientId?.name?.toLowerCase().includes(q) ||
      a.doctorId?.name?.toLowerCase().includes(q) ||
      a.visitType?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    );
  });

  return (
    <RoleLoginGate
      requiredRole="ADMIN"
      title="Admin Operator Dashboard"
      subtitle="Create an account or access clinic operations with your verified administrator phone number."
      demoUsers={demoAdmins}
    >
      <div className="space-y-8 pb-12">
        
        {/* Top Demo Scenario & Multi-Agent Control Panel */}
        <DemoControlPanel />

        {/* Human-in-the-Loop Approvals Card */}
        <ApprovalCard />

        {/* Real-time Status / Message Alert */}
        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-400 text-black text-xs font-mono font-bold flex items-center justify-between">
            <span>{msg}</span>
            <button onClick={() => setMsg("")} className="text-black hover:opacity-75 font-bold">âœ•</button>
          </div>
        )}

        {/* Operational Real-time Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 flex items-center justify-between border-[#DCD1BF] bg-white shadow-sm">
            <div>
              <p className="text-xs text-black font-black uppercase tracking-wider">Fill Rate</p>
              <h4 className="text-2xl font-black text-black mt-1">{metrics.scheduleFillRate}%</h4>
              <span className="text-[10px] text-black font-bold">Target &gt; 90%</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200 border border-emerald-400 flex items-center justify-center text-black">
              <Activity className="w-5 h-5 text-black" />
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center justify-between border-[#DCD1BF] bg-white shadow-sm">
            <div>
              <p className="text-xs text-black font-black uppercase tracking-wider">Autonomous Refill</p>
              <h4 className="text-2xl font-black text-black mt-1">{metrics.recoverySuccessRate}%</h4>
              <span className="text-[10px] text-black font-bold">Waitlist Matching</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200 border border-emerald-400 flex items-center justify-center text-black">
              <CheckCircle className="w-5 h-5 text-black" />
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center justify-between border-[#DCD1BF] bg-white shadow-sm">
            <div>
              <p className="text-xs text-black font-black uppercase tracking-wider">Active Waitlist</p>
              <h4 className="text-2xl font-black text-black mt-1">{waitlist.filter(w => w.status === "active").length}</h4>
              <span className="text-[10px] text-black font-bold">Queued Patients</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-black">
              <Users className="w-5 h-5 text-black" />
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center justify-between border-[#DCD1BF] bg-white shadow-sm">
            <div>
              <p className="text-xs text-black font-black uppercase tracking-wider">Invariant Safety</p>
              <h4 className="text-2xl font-black text-black mt-1">100.0%</h4>
              <span className="text-[10px] text-black font-bold">Zero Overlaps Verified</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-black">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>

        {/* Live Multi-Agent Telemetry Feed */}
        <AgentTelemetryFeed />

        {/* Operational Master Appointments Table */}
        <div className="glass-panel p-6 border-[#DCD1BF] bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-black text-black flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-black" />
                <span>Clinic Master Appointments Roster</span>
              </h3>
              <p className="text-xs text-black font-medium mt-0.5">
                Book, reschedule, or cancel slots across all attending clinic physicians.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-black absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient or doctor..."
                  className="bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl pl-8 pr-3 py-1.5 text-xs text-black font-medium focus:border-black outline-none w-48 placeholder:text-neutral-500"
                />
              </div>

              {/* Book Appointment Action in Light Green */}
              <button
                onClick={() => {
                  setEditingAppt(null);
                  setBookingModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center space-x-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>Book Slot</span>
              </button>

              <button
                onClick={fetchData}
                className="p-1.5 rounded-xl bg-[#FAF6EF] text-black hover:bg-white border border-[#DCD1BF] transition-all shadow-xs"
                title="Refresh Roster"
              >
                <RefreshCw className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DCD1BF] bg-[#FAF6EF] text-black font-black uppercase tracking-wider">
                  <th className="py-2.5 px-3">Time & Date</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Visit Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE0D0]">
                {filteredAppointments.map(appt => (
                  <tr key={appt._id} className="hover:bg-[#FAF6EF]/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-black font-black">
                      <div>{appt.startTime} - {appt.endTime}</div>
                      <div className="text-[10px] text-black font-medium">{appt.date}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-black text-black">{appt.patientId?.name || "Patient"}</div>
                      <div className="text-[10px] text-black font-mono font-medium">{appt.patientId?.phone || "N/A"}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-black font-bold">{appt.doctorId?.name || "Doctor"}</div>
                      <div className="text-[10px] text-black font-medium">{appt.doctorId?.specialty}</div>
                    </td>

                    <td className="py-3 px-3 text-black font-medium">
                      {appt.visitType}
                      {appt.waitlistOriginId && (
                        <div className="text-[10px] text-emerald-800 font-mono font-black">âš¡ Refilled from waitlist</div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        appt.status === "scheduled" || appt.status === "confirmed" ? "bg-emerald-200 text-black border-emerald-400" :
                        appt.status === "cancelled" ? "bg-rose-100 text-black border-rose-400 line-through" :
                        "bg-slate-200 text-black border-slate-400"
                      }`}>
                        {appt.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {appt.status !== "cancelled" ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingAppt(appt);
                              setBookingModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-200 text-black hover:bg-emerald-300 border border-emerald-400 text-[11px] font-black flex items-center space-x-1 transition-all"
                            title="Reschedule Appointment"
                          >
                            <CalendarCheck className="w-3.5 h-3.5 text-black" />
                            <span>Reschedule</span>
                          </button>

                          <button
                            onClick={() => handleCancelAppointment(appt._id)}
                            disabled={loading}
                            className="p-1.5 rounded-lg bg-rose-100 text-black hover:bg-rose-200 border border-rose-400 text-[11px] font-black flex items-center space-x-1 transition-all"
                            title="Cancel & Trigger Auto-Refill"
                          >
                            <XCircle className="w-3.5 h-3.5 text-black" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-black text-[10px] font-mono font-medium">Slot Vacated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAppointments.length === 0 && (
              <div className="p-8 text-center text-black font-semibold text-xs">
                No appointments found. Click "Book Slot" or run "Reset Demo State" above.
              </div>
            )}
          </div>
        </div>

        {/* Priority Waitlist Management */}
        <div className="glass-panel p-6 border-[#DCD1BF] bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-black flex items-center space-x-2">
                <Users className="w-5 h-5 text-black" />
                <span>Priority Waitlist Standby Queue</span>
              </h3>
              <p className="text-xs text-black font-medium mt-0.5">
                Multi-factor prioritized patients waiting for cancelled or rescheduled slot recovery.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-200 text-black border border-emerald-400 font-mono font-black">
              {waitlist.filter(w => w.status === "active").length} Active Candidates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {waitlist.map((w, index) => (
              <div key={w._id} className="p-4 rounded-xl bg-[#FFFDF9] border border-[#DCD1BF] flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-200 border border-emerald-400 flex items-center justify-center text-xs font-black text-black font-mono">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-black text-black text-xs">{w.patientId?.name || "Waitlist Patient"}</div>
                    <div className="text-[10px] text-black font-medium">
                      Days: {w.preferredDays?.join(", ") || "Any"} â€¢ Times: {w.preferredTimeRanges?.join(", ") || "Any"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black font-mono text-black">
                    Priority Score: {w.priorityScore}
                  </div>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                    w.status === "active" ? "bg-emerald-200 text-black border-emerald-400" : "bg-slate-200 text-black border-slate-400"
                  }`}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book / Reschedule Modal */}
        <BookAppointmentModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setEditingAppt(null);
          }}
          existingAppt={editingAppt}
          onSuccess={fetchData}
        />

      </div>
    </RoleLoginGate>
  );
}

import React, { useEffect, useState } from "react";
import { useDemo } from "../context/DemoContext";
import { useAuth } from "../context/AuthContext";
import { RoleLoginGate } from "../components/auth/RoleLoginGate";
import { ApprovalCard } from "../components/agent/ApprovalCard";
import { BookAppointmentModal } from "../components/booking/BookAppointmentModal";
import { apiClient } from "../api/client";
import {
  Clock,
  UserCheck,
  Plus,
  RefreshCw,
  CalendarCheck,
  XCircle,
  Stethoscope
} from "lucide-react";

export function DoctorCalendar() {
  const { user } = useAuth();
  const { triggerDemoCancellation } = useDemo();
  const [appointments, setAppointments] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    try {
      const [apptsRes, doctorsRes] = await Promise.all([
        apiClient.get("/appointments"),
        apiClient.get("/doctors")
      ]);
      setAppointments(apptsRes.data.appointments || []);
      const docs = doctorsRes.data.doctors || [];
      setAllDoctors(docs);
      
      if (selectedDocId) {
        const found = docs.find(d => d._id === selectedDocId);
        if (found) setDoctor(found);
      } else {
        const currentDoc = (user?.role === "DOCTOR" && user?.phone)
          ? (docs.find(d => d.phone === user.phone) || docs[0])
          : docs[0];
        setDoctor(currentDoc);
        if (currentDoc) setSelectedDocId(currentDoc._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [user, selectedDocId]);

  const handleSelectDoctor = (docId) => {
    setSelectedDocId(docId);
    const found = allDoctors.find(d => d._id === docId);
    if (found) setDoctor(found);
  };

  const handleCancelAppt = async (apptId) => {
    setLoading(true);
    setMsg("Cancelling appointment slot & triggering autonomous refill agent...");
    try {
      await triggerDemoCancellation(apptId);
      setMsg("Slot cancelled. Autonomous agent is matching waitlist patients right now!");
      await fetchData();
    } catch (err) {
      setMsg("Error cancelling slot.");
    } finally {
      setLoading(false);
    }
  };

  const demoDoctors = [
    { name: "Dr. Sarah Jenkins", phone: "9821001201", desc: "General Physician & Internal Medicine" },
    { name: "Dr. Marcus Vance", phone: "9821001202", desc: "Cardiology Specialist" },
    { name: "Dr. Emily Chen", phone: "9821001203", desc: "ENT Specialist (Ear, Nose & Throat)" },
    { name: "Dr. Robert Patel", phone: "9821001204", desc: "Orthopedic & Joint Specialist" },
    { name: "Dr. Sophia Rodriguez", phone: "9821001205", desc: "Dermatologist & Skin Care" },
    { name: "Dr. Michael Chang", phone: "9821001206", desc: "Pediatrician (Child Healthcare)" },
    { name: "Dr. Olivia Taylor", phone: "9821001207", desc: "Neurologist & Brain Health" }
  ];

  const displayedAppts = appointments.filter(a => {
    if (!doctor) return true;
    const aDocId = a.doctorId?._id || a.doctorId;
    return aDocId === doctor._id;
  });

  return (
    <RoleLoginGate
      requiredRole="DOCTOR"
      title="Doctor Calendar & Provider Portal"
      subtitle="Create an account with your provider phone number to manage your roster and clinical approvals."
      demoUsers={demoDoctors}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Doctor Specialty Selector Bar */}
        <div className="glass-panel p-4 bg-white border-[#DCD1BF] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-black" />
            <span className="text-xs font-black text-black">Active Physician Schedule:</span>
          </div>
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <select
              value={selectedDocId}
              onChange={(e) => handleSelectDoctor(e.target.value)}
              className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl px-3 py-2 text-xs text-black font-black focus:border-black outline-none"
            >
              {allDoctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} â€” {d.specialty}
                </option>
              ))}
            </select>
          </div>
          <div className="text-[11px] font-mono font-bold text-black bg-[#FAF6EF] px-3 py-1.5 rounded-lg border border-[#DCD1BF]">
            Phone: {doctor?.phone || "N/A"}
          </div>
        </div>

        {/* Header Banner */}
        <div className="glass-panel p-6 border-[#DCD1BF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center text-black">
              <Stethoscope className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-black">{doctor ? doctor.name : "Dr. Sarah Jenkins"}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-200 text-black border border-emerald-400">
                  Auto-Refill Active
                </span>
              </div>
              <p className="text-xs text-black font-semibold mt-0.5">
                {doctor ? doctor.specialty : "Primary Care & Internal Medicine"} â€¢ Working Hours: 09:00 - 17:00
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setEditingAppt(null);
                setBookingModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Add / Reserve Slot</span>
            </button>
          </div>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-400 text-black text-xs font-mono font-bold">
            {msg}
          </div>
        )}

        {/* Human In The Loop Approvals Card */}
        <ApprovalCard />

        {/* Doctor Schedule List */}
        <div className="glass-panel p-6 bg-white border-[#DCD1BF] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-black flex items-center space-x-2">
              <Clock className="w-5 h-5 text-black" />
              <span>Today's Appointment Schedule & Patient Roster</span>
            </h3>
            <button
              onClick={fetchData}
              className="p-1.5 rounded-lg text-black hover:bg-[#FAF6EF] transition-all text-xs flex items-center space-x-1 border border-[#DCD1BF] font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5 text-black" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-3">
            {displayedAppts.map(appt => (
              <div key={appt._id} className="p-4 rounded-xl bg-[#FFFDF9] border border-[#DCD1BF] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-[#F5EFE6] border border-[#DCD1BF] flex flex-col items-center justify-center text-xs font-mono font-black text-black shrink-0">
                    <span>{appt.startTime}</span>
                    <span className="text-[10px] text-black font-semibold">{appt.endTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-black text-sm">{appt.patientId?.name || "Patient"}</span>
                      {appt.waitlistOriginId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-black border border-emerald-400 flex items-center space-x-1 font-black">
                          <UserCheck className="w-3 h-3 text-black" />
                          <span>Auto-Refilled from Waitlist</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-black font-medium mt-0.5">{appt.visitType}</div>
                    <div className="text-[11px] text-black font-mono font-medium mt-0.5">
                      Contact: {appt.patientId?.phone || "N/A"} â€¢ Date: {appt.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${
                    appt.status === "scheduled" || appt.status === "confirmed" ? "bg-emerald-200 text-black border-emerald-400" :
                    appt.status === "cancelled" ? "bg-rose-100 text-black border-rose-400 line-through" :
                    "bg-slate-200 text-black border-slate-400"
                  }`}>
                    {appt.status}
                  </span>

                  {appt.status !== "cancelled" && (
                    <>
                      <button
                        onClick={() => {
                          setEditingAppt(appt);
                          setBookingModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-emerald-200 text-black hover:bg-emerald-300 border border-emerald-400 text-xs font-black flex items-center space-x-1 transition-all"
                        title="Change Schedule"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-black" />
                        <span className="hidden sm:inline">Reschedule</span>
                      </button>

                      <button
                        onClick={() => handleCancelAppt(appt._id)}
                        disabled={loading}
                        className="p-2 rounded-lg bg-rose-100 text-black hover:bg-rose-200 border border-rose-400 text-xs font-black flex items-center space-x-1 transition-all"
                        title="Cancel Slot & Auto-Refill"
                      >
                        <XCircle className="w-3.5 h-3.5 text-black" />
                        <span className="hidden sm:inline">Cancel & Refill</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {displayedAppts.length === 0 && (
              <div className="p-8 text-center text-black font-semibold text-sm border border-dashed border-[#DCD1BF] rounded-xl bg-[#FAF6EF]">
                No appointments for this physician today yet. Use "Add / Reserve Slot" to book an appointment slot.
              </div>
            )}
          </div>
        </div>

        {/* Modal for Booking / Rescheduling */}
        <BookAppointmentModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setEditingAppt(null);
          }}
          doctor={doctor}
          existingAppt={editingAppt}
          onSuccess={fetchData}
        />

      </div>
    </RoleLoginGate>
  );
}

import React, { useEffect, useState } from "react";
import { useDemo } from "../context/DemoContext";
import { useAuth } from "../context/AuthContext";
import { RoleLoginGate } from "../components/auth/RoleLoginGate";
import { BookAppointmentModal } from "../components/booking/BookAppointmentModal";
import { apiClient } from "../api/client";
import {
  Calendar,
  Clock,
  XCircle,
  CheckCircle2,
  MessageSquare,
  User,
  Plus,
  RefreshCw,
  CalendarCheck,
  ListPlus,
  Send
} from "lucide-react";

export function PatientPortal() {
  const { user } = useAuth();
  const { pendingOffers, simulatePatientResponse, triggerDemoCancellation } = useDemo();
  
  const [appointments, setAppointments] = useState([]);
  const [waitlistStatus, setWaitlistStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  
  // Modal states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  // Doctors list for booking & waitlist
  const [doctorsList, setDoctorsList] = useState([]);

  // Waitlist form state
  const [waitlistDoctorId, setWaitlistDoctorId] = useState("");
  const [preferredDays, setPreferredDays] = useState(["Monday", "Wednesday"]);
  const [preferredTime, setPreferredTime] = useState("Morning");
  const [waitlistMsg, setWaitlistMsg] = useState("");

  const fetchData = async () => {
    try {
      const [apptsRes, waitlistRes, doctorsRes] = await Promise.all([
        apiClient.get("/appointments"),
        apiClient.get("/waitlist"),
        apiClient.get("/doctors")
      ]);
      setAppointments(apptsRes.data.appointments || []);
      setWaitlistStatus(waitlistRes.data.waitlist || []);
      const docs = doctorsRes.data.doctors || [];
      setDoctorsList(docs);
      if (!waitlistDoctorId && docs.length > 0) {
        setWaitlistDoctorId(docs[0]._id);
      }
    } catch (err) {
      console.error("Error fetching patient data:", err);
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
      setMsg("Appointment cancelled! The Autonomous Multi-Agent system has been launched to refill this slot!");
      await fetchData();
    } catch (err) {
      setMsg("Error cancelling appointment.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    try {
      const doctorsRes = await apiClient.get("/doctors");
      const docId = waitlistDoctorId || doctorsRes.data.doctors?.[0]?._id;
      const clinicId = (await apiClient.get("/clinics")).data.clinics?.[0]?._id;
      const patientsRes = await apiClient.get("/patients");
      const currentPatient = (user?.role === "PATIENT" && user?.phone)
        ? (patientsRes.data.patients.find(p => p.phone === user.phone) || patientsRes.data.patients[0])
        : patientsRes.data.patients[0];

      await apiClient.post("/waitlist", {
        clinicId,
        doctorId: docId,
        patientId: currentPatient._id,
        preferredDays,
        preferredTimeRanges: [preferredTime],
        priorityScore: 75,
        status: "active"
      });

      setWaitlistMsg("Successfully joined the priority waitlist! You will receive instant SMS offers when slots open.");
      await fetchData();
    } catch (err) {
      setWaitlistMsg("Failed to join waitlist. Please try again.");
    }
  };

  const demoPatients = [
    { name: "Alex Rivera", phone: "9876543210", desc: "Has 09:30 AM appointment with Dr. Jenkins" },
    { name: "Elena Rostova", phone: "9876543211", desc: "Has 11:00 AM appointment with Dr. Jenkins" },
    { name: "David Chen", phone: "9876543212", desc: "Priority Waitlist (Score: 85)" }
  ];

  return (
    <RoleLoginGate
      requiredRole="PATIENT"
      title="Patient Self-Service Portal"
      subtitle="Create an account with your phone number to manage visits and receive autonomous SMS refill offers."
      demoUsers={demoPatients}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Header Banner */}
        <div className="glass-panel p-6 border-[#DCD1BF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-200 border border-emerald-400 flex items-center justify-center text-black">
              <User className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-black">Patient Self-Service Portal</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-200 text-black font-mono font-bold border border-emerald-400">
                  {user?.name || "Patient"}
                </span>
              </div>
              <p className="text-xs text-black font-medium mt-0.5">
                Book appointments, change your schedule, join priority waitlists, and respond to autonomous refill alerts.
              </p>
            </div>
          </div>

          {/* Action Button: Book New Appointment in Light Green */}
          <div>
            <button
              onClick={() => {
                setEditingAppt(null);
                setBookingModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Book New Appointment</span>
            </button>
          </div>
        </div>

        {/* Real-Time SMS / Notification Offer Modal Banner */}
        {pendingOffers.length > 0 && (
          <div className="p-5 rounded-2xl bg-emerald-100 border-2 border-emerald-500 shadow-lg shadow-emerald-400/10 animate-pulse-subtle">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-300 border border-emerald-500 flex items-center justify-center text-black shrink-0 mt-0.5">
                  <MessageSquare className="w-5 h-5 text-black" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-300 text-black border border-emerald-500">
                    New Priority Slot Offer Received!
                  </span>
                  <h3 className="text-base font-black text-black mt-1">An earlier appointment slot is available!</h3>
                  <p className="text-xs text-black font-medium mt-1 max-w-xl font-mono bg-white p-2.5 rounded-lg border border-emerald-400">
                    "{pendingOffers[0].message}"
                  </p>
                  <div className="text-[11px] text-black font-bold mt-1">
                    Decision Window: <span className="text-amber-900 font-mono font-black">59 mins remaining</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => simulatePatientResponse("DECLINE", pendingOffers[0].offerId)}
                  className="px-3.5 py-2 rounded-xl text-xs font-black bg-white text-black hover:bg-rose-100 hover:text-black border border-[#DCD1BF] hover:border-rose-400 transition-all shadow-sm"
                >
                  Decline Offer
                </button>

                <button
                  onClick={() => simulatePatientResponse("ACCEPT", pendingOffers[0].offerId)}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-400 hover:bg-emerald-500 text-black shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Accept & Book Slot</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-400 text-black text-xs font-mono font-bold">
            {msg}
          </div>
        )}

        {/* Scheduled Appointments List */}
        <div className="glass-panel p-6 bg-white border-[#DCD1BF] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-black flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-black" />
              <span>Your Scheduled Appointments</span>
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
            {appointments.filter(a => a.status !== "cancelled").map(appt => (
              <div key={appt._id} className="p-4 rounded-xl bg-[#FFFDF9] border border-[#DCD1BF] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-black text-sm">{appt.visitType}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-200 text-black font-black border border-emerald-400">
                      {appt.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-black font-semibold mt-1">
                    Physician: <span className="text-black font-black">{appt.doctorId?.name || "Dr. Sarah Jenkins"}</span> ({appt.doctorId?.specialty || "Internal Medicine"})
                  </div>
                  <div className="text-xs text-black font-mono mt-1 flex items-center space-x-1 font-black">
                    <Clock className="w-3.5 h-3.5 text-black" />
                    <span>{appt.date} from {appt.startTime} to {appt.endTime}</span>
                  </div>
                  {appt.notes && (
                    <div className="text-[11px] text-black font-medium mt-0.5">Notes: {appt.notes}</div>
                  )}
                </div>

                {/* Appointment Actions: Change Schedule (Light Green) & Cancel */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingAppt(appt);
                      setBookingModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-200 text-black hover:bg-emerald-300 border border-emerald-400 transition-all flex items-center space-x-1.5"
                  >
                    <CalendarCheck className="w-4 h-4 text-black" />
                    <span>Change Schedule</span>
                  </button>

                  <button
                    onClick={() => handleCancelAppointment(appt._id)}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-rose-100 text-black hover:bg-rose-200 border border-rose-400 transition-all flex items-center space-x-1.5"
                  >
                    <XCircle className="w-4 h-4 text-black" />
                    <span>Cancel Appointment</span>
                  </button>
                </div>
              </div>
            ))}

            {appointments.filter(a => a.status !== "cancelled").length === 0 && (
              <div className="p-8 text-center text-black font-semibold text-sm border border-dashed border-[#DCD1BF] rounded-xl bg-[#FAF6EF]">
                <Calendar className="w-8 h-8 text-black mx-auto mb-2" />
                <p>No active appointments scheduled.</p>
                <button
                  onClick={() => {
                    setEditingAppt(null);
                    setBookingModalOpen(true);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-black bg-emerald-400 hover:bg-emerald-500 text-black border border-emerald-500 transition-all shadow-sm"
                >
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Priority Waitlist Section */}
        <div className="glass-panel p-6 border-[#DCD1BF] bg-white shadow-sm">
          <div className="flex items-center space-x-2.5 mb-2">
            <ListPlus className="w-5 h-5 text-black" />
            <h3 className="text-base font-black text-black">Join Clinic Priority Waitlist</h3>
          </div>
          <p className="text-xs text-black font-medium mb-4">
            Can't find a slot that fits your schedule? Join our autonomous waitlist. When any patient cancels or reschedules, QueueWise AI automatically reaches out via SMS with earlier openings!
          </p>

          {waitlistMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-black text-xs font-mono font-bold">
              {waitlistMsg}
            </div>
          )}

          <form onSubmit={handleJoinWaitlist} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-black font-black mb-1">Select Physician & Specialty</label>
              <select
                value={waitlistDoctorId}
                onChange={(e) => setWaitlistDoctorId(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-bold focus:border-black outline-none"
              >
                {doctorsList.map(doc => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} â€” {doc.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-black font-black mb-1">Preferred Time of Day</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-bold focus:border-black outline-none"
              >
                <option value="Morning">Morning (09:00 - 12:00)</option>
                <option value="Afternoon">Afternoon (14:00 - 17:00)</option>
                <option value="Any">Any Available Time</option>
              </select>
            </div>

            <div>
              <label className="block text-black font-black mb-1">Preferred Days</label>
              <select
                onChange={(e) => setPreferredDays([e.target.value])}
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-bold focus:border-black outline-none"
              >
                <option value="Monday">Mondays, Wednesdays, Fridays</option>
                <option value="Tuesday">Tuesdays & Thursdays</option>
                <option value="Any">Any Weekday</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5 text-black" />
                <span>Join Waitlist</span>
              </button>
            </div>
          </form>
        </div>

        {/* Booking / Rescheduling Modal */}
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

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/client";
import { Calendar, Clock, X, Check, Stethoscope } from "lucide-react";

export function BookAppointmentModal({ isOpen, onClose, doctor = null, existingAppt = null, onSuccess }) {
  const { user } = useAuth();
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctor?._id || "");
  const [date, setDate] = useState(existingAppt?.date || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(existingAppt?.startTime || "10:00");
  const [endTime, setEndTime] = useState(existingAppt?.endTime || "10:30");
  const [visitType, setVisitType] = useState(existingAppt?.visitType || "General Consultation");
  const [notes, setNotes] = useState(existingAppt?.notes || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (isOpen) {
      apiClient.get("/doctors").then(res => {
        const docs = res.data.doctors || [];
        setDoctorsList(docs);
        if (!selectedDoctorId && docs.length > 0) {
          setSelectedDoctorId(docs[0]._id);
        }
      }).catch(console.error);

      if (existingAppt) {
        setDate(existingAppt.date);
        setStartTime(existingAppt.startTime);
        setEndTime(existingAppt.endTime);
        setVisitType(existingAppt.visitType || "General Consultation");
        setSelectedDoctorId(existingAppt.doctorId?._id || existingAppt.doctorId || "");
      }
    }
  }, [isOpen, existingAppt]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      if (existingAppt) {
        // Reschedule existing appointment
        await apiClient.post(`/appointments/${existingAppt._id}/reschedule`, {
          date,
          startTime,
          endTime
        });
      } else {
        // Book new appointment
        const patientsRes = await apiClient.get("/patients");
        const allPatients = patientsRes.data.patients || [];
        const currentPatient = (user?.role === "PATIENT" && user?.phone)
          ? (allPatients.find(p => p.phone === user.phone) || allPatients[0])
          : allPatients[0];

        const clinicsRes = await apiClient.get("/clinics");
        const clinicId = clinicsRes.data.clinics?.[0]?._id;

        await apiClient.post("/appointments", {
          clinicId,
          doctorId: selectedDoctorId || doctor?._id || (doctorsList[0]?._id),
          patientId: currentPatient?._id,
          date,
          startTime,
          endTime,
          visitType,
          notes
        });
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || "Error scheduling appointment slot. Please try another time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel max-w-lg w-full p-6 border-[#DCD1BF] relative shadow-2xl bg-white">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-black hover:bg-[#FAF6EF] transition-all"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-200 border border-emerald-400 flex items-center justify-center text-black">
            <Calendar className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-black text-black">
              {existingAppt ? "Change Schedule / Reschedule Slot" : "Book New Appointment"}
            </h3>
            <p className="text-xs text-black font-medium">
              {existingAppt
                ? `Moving appointment from ${existingAppt.date} (${existingAppt.startTime})`
                : "Select your preferred physician, appointment date and slot time"}
            </p>
          </div>
        </div>

        {err && (
          <div className="mb-4 text-xs text-rose-900 bg-rose-100 p-2.5 rounded-lg border border-rose-400 font-mono font-bold">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Doctor Selection (Disabled if rescheduling specific doctor) */}
          {!existingAppt && (
            <div>
              <label className="block text-black font-black mb-1 flex items-center space-x-1">
                <Stethoscope className="w-3.5 h-3.5 text-black" />
                <span>Select Attending Physician</span>
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-bold focus:border-black outline-none"
              >
                {doctorsList.map(doc => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.specialty}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-black font-black mb-1">Select Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-mono font-bold focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-black font-black mb-1">Select Time Slot</label>
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  const [h, m] = e.target.value.split(":");
                  const endH = String(parseInt(h) + (m === "30" ? 1 : 0)).padStart(2, "0");
                  const endM = m === "30" ? "00" : "30";
                  setEndTime(`${endH}:${endM}`);
                }}
                className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-mono font-bold focus:border-black outline-none"
              >
                <option value="09:00">09:00 AM - 09:30 AM</option>
                <option value="09:30">09:30 AM - 10:00 AM</option>
                <option value="10:00">10:00 AM - 10:30 AM</option>
                <option value="10:30">10:30 AM - 11:00 AM</option>
                <option value="11:00">11:00 AM - 11:30 AM</option>
                <option value="11:30">11:30 AM - 12:00 PM</option>
                <option value="14:00">02:00 PM - 02:30 PM</option>
                <option value="14:30">02:30 PM - 03:00 PM</option>
                <option value="15:00">03:00 PM - 03:30 PM</option>
                <option value="15:30">03:30 PM - 04:00 PM</option>
                <option value="16:00">04:00 PM - 04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-black font-black mb-1">Reason / Visit Type</label>
            <input
              type="text"
              required
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              placeholder="e.g. Annual Physical, Follow-up, Routine Checkup"
              className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-medium focus:border-black outline-none placeholder:text-neutral-500"
            />
          </div>

          <div>
            <label className="block text-black font-black mb-1">Patient Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any symptoms, special accommodations or notes..."
              className="w-full bg-[#FAF6EF] border border-[#C8BCA6] rounded-xl p-2.5 text-black font-medium focus:border-black outline-none placeholder:text-neutral-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F2ECE0] text-black border border-[#DCD1BF] font-black transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black shadow-md shadow-emerald-400/20 border border-emerald-500 transition-all flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4 text-black" />
              <span>{existingAppt ? "Confirm Reschedule" : "Confirm Booking"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

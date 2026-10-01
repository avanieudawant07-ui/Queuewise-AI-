# QueueWise AI — 3-5 Minute Live Demo Script

## Act 1: The Problem (0:00 - 0:45)
- **Visual:** Present the clinic dashboard showing idle, cancelled slots.
- **Narrative:** "When a patient cancels an appointment at short notice, clinic staff must manually check schedules, search through paper or spreadsheet waitlists, call patients one by one, wait for callbacks, update calendars, and notify the doctor. That's over 10 manual steps per cancellation. The result? Unfilled slots, lost clinic revenue, and frustrated patients waiting weeks for care."

## Act 2: The Solution & Agent Architecture (0:45 - 1:30)
- **Visual:** Introduce QueueWise AI and show the multi-agent architecture.
- **Narrative:** "QueueWise AI replaces this manual burden with an autonomous multi-agent workflow. Rather than a simple chatbot, QueueWise coordinates five specialized agents: a Supervisor that plans workflows, a Scheduling Agent managing calendar state, a Waitlist Agent ranking eligible patients, a Reminder Agent mitigating no-shows, and a deterministic Verification Agent ensuring medical scheduling invariants are 100% strictly enforced."

## Act 3: Live Autonomous Cancellation Recovery (1:30 - 3:00)
- **Visual:**
  1. Open the Patient Portal and cancel an upcoming appointment.
  2. Switch to the Admin **Agent Activity** view. Watch the live timeline populate in real time!
  3. The Scheduling Agent confirms the released slot.
  4. The Waitlist Agent evaluates candidates and identifies the best match based on FIFO priority and time preferences.
  5. An offer is generated and dispatched to the waitlisted patient.
  6. In Demo Mode, watch the simulated patient accept the offer.
  7. The Scheduling Agent atomically books the slot.
  8. The Verification Agent runs all checks (no double-bookings, valid hours, consistent status).
  9. The Doctor's calendar immediately updates with the new patient!

## Act 4: Human-in-the-Loop & Fallback Resilience (3:00 - 4:00)
- **Visual:**
  1. Show a short-notice cancellation triggering an **Approval Card** for the Doctor.
  2. Doctor clicks "Approve" with one click to proceed.
  3. Demonstrate the "Force LLM Failure" toggle to prove the system degrades gracefully into deterministic fallback without skipping a beat.

## Act 5: Conclusion & Technical Takeaways (4:00 - 4:30)
- **Visual:** GitHub repository, system documentation, and architecture diagrams.
- **Narrative:** "QueueWise AI provides verifiable, resilient, and human-supervised operational automation for modern clinics. Built with Node.js, React, Tailwind CSS, MongoDB, and Gemini AI."

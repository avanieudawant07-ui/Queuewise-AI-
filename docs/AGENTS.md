# QueueWise AI — Multi-Agent Architecture & Tool Specification

## 1. Multi-Agent Ecosystem Overview
QueueWise AI deploys five specialized agent roles operating under a clear hierarchy:

| Agent Name | Engine Type | Core Responsibility | Allowed Tools |
|---|---|---|---|
| **Supervisor Agent** | Hybrid (State Machine + Planner) | Orchestrates workflows, handles policy checks, manages pauses/resumes, triggers verification. | `log_agent_action`, `request_approval`, `send_notification` |
| **Scheduling Agent** | Tool User + LLM Evaluator | Analyzes doctor availability, detects appointment conflicts, creates/updates bookings. | `get_appointment`, `get_doctor_availability`, `get_available_slots`, `check_schedule_conflict`, `create_appointment`, `reschedule_appointment`, `cancel_appointment`, `update_appointment_status` |
| **Waitlist Agent** | Deterministic Filter & Ranker + LLM Drafter | Queries eligible waitlist entries, ranks by administrative priority (FIFO + fit), drafts personalized offer messages. | `get_waitlist`, `get_patient_preferences`, `create_waitlist_offer`, `send_notification`, `update_waitlist_entry`, `remove_from_waitlist` |
| **Reminder / No-Show Agent** | Scheduled Trigger + LLM Drafter | Sweeps upcoming appointments within lead hours, generates reminders, flags unconfirmed appointments. | `get_upcoming_appointments`, `send_notification`, `update_appointment_status`, `get_patient_preferences` |
| **Verification Agent** | Pure Deterministic Engine | Runs invariant checks on DB state after mutations (no overlaps, within working hours, waitlist state consistent). | Deterministic database assertion suite |

## 2. Cancellation Recovery Workflow (P1)
When an appointment is cancelled:
1. `APPOINTMENT_CANCELLED` event is fired.
2. **Supervisor Agent** generates an execution plan with idempotency key `cancel-recovery:{appointmentId}`.
3. **Scheduling Agent** validates that the released slot is in the future, within doctor working hours, and unoccupied.
4. **Waitlist Agent** fetches waitlist candidates matching clinic, doctor, and date/time window.
5. Candidates are ranked deterministically:
   - Priority 1: FIFO by `joinedAt`
   - Priority 2: Specificity of time preferences
   - Priority 3: Fewest prior declined offers
6. **Approval Policy Check**: If the slot is < 2 hours away, approval is requested from the Doctor/Admin.
7. **Waitlist Agent** issues an offer to the top candidate with a time-limited expiry countdown. The run enters `WAITING_FOR_PATIENT`.
8. Upon patient acceptance:
   - **Scheduling Agent** creates the appointment atomically with an idempotency key.
   - **Waitlist Agent** marks the entry as `fulfilled`.
   - **Verification Agent** executes all 6 invariant checks.
   - **Supervisor Agent** emits notifications to Doctor, Patient, and Admin, and marks the run `COMPLETED`.

## 3. Human-in-the-Loop & Approval Rules
Agent autonomy is governed by `approvalPolicy.js`:
- **Fully Autonomous:** Standard slot matching ≥ 2 hours in advance, reminder dispatches, availability queries.
- **Approval Required:** Short-notice appointments (< 2 hours), exhausted candidate pool (> 3 declined offers), verification check failures, or cross-doctor transfers.
- **Actions:** Doctor/Admin can `Approve`, `Reject`, `Override`, or `Retry`.

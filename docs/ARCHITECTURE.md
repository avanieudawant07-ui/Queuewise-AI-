# QueueWise AI — System Architecture Specification

## 1. System Overview
QueueWise AI is an enterprise-grade multi-role clinic operations platform (Patient, Doctor, Admin/Receptionist). Its core differentiator is an **event-driven multi-agent system** that autonomously coordinates appointment operations (cancellation recovery, rescheduling, reminder sweeps) through explicit planning, tool use, observation, verification, retries, and human-in-the-loop escalation.

## 2. Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              FRONTEND                                    |
|   React 18 + Vite + Tailwind CSS + React Router v6 + Lucide Icons       |
|   [Patient Portal]        [Doctor Calendar]        [Admin Operations]   |
|   - Slot Booking          - Availability Editor    - Live Agent Feed    |
|   - Waitlist Dashboard    - Schedule View          - Approvals Queue    |
|   - Administrative AI     - Pending Approvals      - Demo Mode Control  |
+------------------------------------+------------------------------------+
                                     | HTTP / REST (JWT Bearer Auth)
                                     v
+-------------------------------------------------------------------------+
|                              BACKEND                                    |
|   Node 20 + Express (ESM) + Helmet + CORS + Zod Validation Middleware   |
|   Controllers  --->  Domain Services  --->  MongoDB Mongoose Models      |
|                              |                                          |
|                              v (Domain Events)                          |
|                       +---------------+                                 |
|                       | In-Process    |                                 |
|                       | Event Bus     |                                 |
|                       +-------+-------+                                 |
|                               |                                         |
|                               v                                         |
|                +------------------------------+                         |
|                |    SUPERVISOR AGENT          |                         |
|                | - Receives event             |                         |
|                | - Generates execution plan   |                         |
|                | - Enforces approval policy   |                         |
|                | - Dispatches specialists     |                         |
|                +--------------+---------------+                         |
|                               |                                         |
|      +------------------------+------------------------+                |
|      |                        |                        |                |
|      v                        v                        v                |
| +----------------+   +----------------+   +------------------+          |
| | SCHEDULING     |   | WAITLIST       |   | REMINDER /       |          |
| | AGENT          |   | AGENT          |   | NO-SHOW AGENT    |          |
| +--------+-------+   +--------+-------+   +--------+---------+          |
|          |                    |                    |                    |
|          +--------------------+--------------------+                    |
|                               |                                         |
|                               v                                         |
|                     +--------------------+                              |
|                     |    TOOL RUNNER     |                              |
|                     | - Permission check |                              |
|                     | - Zod input/output |                              |
|                     | - Idempotency lock |                              |
|                     | - Step recorder    |                              |
|                     +---------+----------+                              |
|                               |                                         |
|                               v                                         |
|                     +--------------------+                              |
|                     | VERIFICATION AGENT |                              |
|                     | (Deterministic     |                              |
|                     |  Invariant Engine) |                              |
|                     +---------+----------+                              |
|                               |                                         |
|                               v                                         |
|                     +--------------------+                              |
|                     | MongoDB Database   |                              |
|                     | (Atlas / Mongoose) |                              |
|                     +--------------------+                              |
+-------------------------------------------------------------------------+
```

## 3. Core Architectural Principles
1. **Tool-Mediated Operations:** Agents never interface with the database directly. All mutations occur through strictly typed, authorized tools.
2. **Deterministic Fallbacks:** Every LLM call is paired with a deterministic algorithmic fallback to ensure zero downtime even if external AI APIs rate-limit or fail.
3. **Deterministic Verification:** Critical healthcare scheduling invariants (no double bookings, valid doctor availability, atomic waitlist state transitions) are enforced by deterministic software routines, not probabilistic models.
4. **Resilient Polling:** Real-time visibility is achieved via adaptive HTTP polling (2s active / 15s idle), preventing the disconnection issues typical of WebSockets on free-tier serverless environments.
5. **Human-in-the-Loop:** Consequential actions (short-notice slots < 2 hours, exhausted candidate pools, policy exceptions) automatically suspend agent runs and request approval from doctors or admins.

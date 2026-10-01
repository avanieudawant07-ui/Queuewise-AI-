# QueueWise AI — Architecture & Technical Decisions Log

This document records the architectural and design decisions made for QueueWise AI in compliance with the system specification.

## Decision 1: Hybrid Deterministic & Agentic Multi-Agent Architecture
- **Context:** Fully autonomous LLM agents in critical healthcare/clinic scheduling paths risk non-determinism, timeout failures, or hallucinated slot assignments.
- **Decision:** Use a hybrid model. The deterministic state machine and Supervisor own workflow orchestration, state transitions, and tool coordination. LLMs are used for bounded, structured reasoning (candidate ranking rationale, offer message personalization, natural language administrative intent parsing) backed by strict Zod schema validation.
- **Fallback:** Every LLM call has a deterministic fallback rule engine so the entire clinic workflow operates smoothly without external AI API dependencies if unavailable.

## Decision 2: Deterministic Verification Agent
- **Context:** Verification of schedule invariants (no overlapping slots, valid doctor working hours, correct waitlist state transitions) must be exact and non-negotiable.
- **Decision:** The Verification Agent is implemented as pure deterministic code, rather than an LLM prompt. This guarantees 100% mathematical certainty that no double-bookings, phantom slots, or improper reassignments occur.

## Decision 3: Concurrency & Double-Booking Guard
- **Context:** Multiple patients or concurrent agent runs could attempt to claim the same released slot simultaneously.
- **Decision:** Implemented at the database level using a MongoDB partial unique index on `{ doctorId: 1, date: 1, startTime: 1 }` filtered on active appointment statuses (`scheduled`, `confirmed`, `pending`). Slot claims use atomic queries guarded by unique index constraints (`E11000` handling).

## Decision 4: Safe Polling over Long-Lived WebSockets
- **Context:** Free-tier cloud deployments (Vercel + Render) often drop idle WebSocket connections or restart dynos, leading to broken demo state.
- **Decision:** Client uses adaptive HTTP polling: 2 seconds when any run is `RUNNING` or `WAITING_*`, and 15 seconds otherwise. This provides instant real-time feedback during live workflows with maximum deployment stability.

## Decision 5: Administrative Scope & Medical Safety Boundaries
- **Context:** Clinic scheduling systems must strictly avoid medical liability.
- **Decision:** Zero medical data is stored (no symptoms, diagnoses, triage, notes, or prescriptions). Only administrative metadata is captured (patient name, contact window, appointment time, non-clinical visit type label). The AI Assistant incorporates a pre-filtering guardrail and refusal template for any medical or emergency query.

## Decision 6: Environment & Database Compatibility
- **Context:** Developers and reviewers need the demo and test suite to run immediately upon cloning without requiring an active MongoDB Atlas cluster upfront.
- **Decision:** The backend supports standard `MONGODB_URI` connection strings for MongoDB Atlas production/development, and automatically provides in-memory fallback support for testing and zero-setup local execution when desired.

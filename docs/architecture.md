# System Architecture — SmartCare

## 1. High-Level Architectural Pattern

SmartCare is structured as a **modular layered monolith with a decoupled Single Page Application (SPA)**:

```
[ Web Browser Client (React + Tailwind CSS) ]
                   │
                   ▼ (HTTP / RESTful API)
[ Express.js Server (Port 3000) ]
   ├── Authentication & Rate Limiting Middleware
   ├── RBAC Authorization (Patient, Doctor, Admin)
   ├── Controllers Layer (Request Validation with Zod)
   ├── Service Layer (Slot Engine, Recommendation, Notification, Audit)
   └── Persistence Layer (ACID Store + Prisma PostgreSQL Schema)
```

## 2. Core Modules

1. **Authentication & Identity Service**:
   - Manages bcrypt hashing, JWT issuance and verification.
   - Enforces role isolation across endpoints.

2. **Availability & Slot Generation Engine**:
   - Parses weekly shift rules (`startTime`, `endTime`, `breakStartTime`, `breakEndTime`, `slotDurationMinutes`).
   - Reconciles doctor blocked dates (leaves/holidays).
   - Generates non-conflicting time slots.

3. **Appointment Transaction Engine**:
   - Evaluates slot bookings under atomic consistency.
   - Prohibits doctor double-booking and patient simultaneous overlapping bookings.
   - Automatically transitions appointment states (CONFIRMED -> COMPLETED, NO_SHOW, CANCELLED).

4. **Clinical Triage & Smart Navigation**:
   - Heuristic classification engine mapping patient natural language symptoms to clinical departments.
   - Life-threatening emergency keyword detector triggering urgent 911 dispatch alerts.
   - Integrated with Google Gemini 3.8 Flash for advanced conversational triage.

5. **Security Audit Logger**:
   - Asynchronously captures actors, actions, timestamps, and target entities without logging passwords or sensitive patient health details.

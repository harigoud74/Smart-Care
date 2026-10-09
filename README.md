# SmartCare — Intelligent Healthcare Appointment & Patient Management System

**SmartCare** is an enterprise-grade full-stack healthcare web application designed for hospitals, outpatient clinics, and multi-specialty healthcare networks. It provides role-governed portals for **Patients**, **Doctors**, and **Administrators**, featuring conflict-free slot scheduling, symptom-guided department recommendation, encrypted medical history records, digital e-prescriptions, and continuous security audit logging.

---

## 🌟 Key Features

### 🧑‍⚕️ 1. Patient Portal
- **Demographics & Medical Profile**: Blood group, allergy register, emergency contacts, chronic conditions.
- **Doctor Discovery & Search**: Filter by medical specialization, hospital location, consultation fees, and patient ratings.
- **AI-Assisted Symptom Triage**: Symptom keyword engine with emergency detection directing patients to 911 or the right clinical department.
- **Conflict-Free Scheduling**: Automated generation of 30-minute intervals with double-booking prevention.
- **Appointment Management**: View upcoming visits, reschedule available slots, or cancel with reason (releasing the slot).
- **Electronic Health Records (EHR)**: View clinical notes, diagnoses, vital signs, and treatment plans.
- **Digital Prescriptions**: Official e-prescriptions with printable layout.
- **Document Vault**: Upload blood tests, MRI scans, and discharge summaries.
- **In-App Notifications**: Real-time alerts for confirmations, reschedules, and prescriptions.

### 🩺 2. Doctor Portal
- **Consultation Dashboard**: Daily appointments agenda, visit outcomes, and active patient count.
- **Working Hours & Availability Engine**: Configurable shift times, lunch breaks, 30-min slot intervals, and blocked dates.
- **Appointment Lifecycle**: Confirm, complete consultations, record no-shows, or cancel with reason.
- **Clinical Records Entry**: Record diagnoses, examination findings, vital signs (BP, Pulse, Temp, SpO2), and treatment plans.
- **E-Prescription Module**: Issue multi-item medications with dosage, frequency, duration, instructions, and dietary advice.
- **Authorized Patient Directory**: View clinical timelines (consultations, past prescriptions, lab tests) for patients under their care.

### 🏛️ 3. Hospital Admin Portal
- **Platform Analytics & KPI Dashboard**: Real-time charts for appointment status distribution, department volume, and daily trends.
- **Doctor Credentialing**: Inspect medical registration numbers, verify, reject, or suspend doctor applications.
- **Patient User Management**: View registered patients and toggle account active status.
- **Hospitals & Departments Directory**: Manage partner hospital campuses and clinical specialties.
- **Central Appointment Registry**: Monitor all scheduled visits with administrative status override.
- **Security Audit Trail**: Immutable logging of logins, password resets, appointment creation, prescriptions, and administrative actions.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript (tsx runtime)
- **Database & Architecture**:
  - Relational schema defined in `prisma/schema.prisma` (PostgreSQL target)
  - In-memory ACID relational store with disk persistence (`data/smartcare-db.json`)
  - Concurrency locking preventing double bookings
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing, role-based authorization middleware
- **AI Triage**: Google Gemini 3.8 Flash API integration with rule-based clinical fallback
- **Testing**: Node.js test runner (`node:test`, `node:assert/strict`)

---

## 🔐 Demo User Credentials

Quick test accounts pre-seeded into the database (or use the 1-Click Role Switcher in the top navigation):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@smartcare.org` | `Password@123` | John Doe (Blood group: O+) |
| **Doctor** | `sarah.jenkins@smartcare.org` | `Password@123` | Dr. Sarah Jenkins, MD (Cardiology) |
| **Doctor** | `marcus.vance@smartcare.org` | `Password@123` | Dr. Marcus Vance, MS (Orthopedics) |
| **Doctor** | `kimberly.adams@smartcare.org` | `Password@123` | Dr. Kimberly Adams (Pending Verification) |
| **Admin** | `admin@smartcare.org` | `Password@123` | System Administrator |

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npx tsx --test tests/smartcare.test.ts

# 3. Start development server (serves backend on port 3000 with Vite middleware)
npm run dev
```

Visit `http://localhost:3000` in your browser.

# REST API Specification — SmartCare

All API endpoints return JSON in the standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

## Authentication Routes (`/api/auth`)
- `POST /api/auth/register`: Patient registration.
- `POST /api/auth/register-doctor`: Doctor application submission.
- `POST /api/auth/login`: Authenticate email & password.
- `GET /api/auth/me`: Get current session and profile.
- `POST /api/auth/forgot-password`: Request password reset token.
- `POST /api/auth/reset-password`: Set new password with valid token.

## Patient Routes (`/api/patients`) — Requires Role: PATIENT
- `GET /api/patients/profile`: Retrieve patient profile.
- `PUT /api/patients/profile`: Update demographics & allergies.
- `GET /api/patients/dashboard-summary`: Aggregated dashboard metrics & next appointment.
- `GET /api/patients/appointments`: Patient's appointments.
- `GET /api/patients/medical-records`: Medical records belonging to patient.
- `GET /api/patients/prescriptions`: Prescriptions issued to patient.
- `GET /api/patients/documents`: Uploaded lab reports and scans.

## Doctor Routes (`/api/doctors`)
- `GET /api/doctors`: Public search and filter verified doctors.
- `GET /api/doctors/public/:id`: Public doctor profile by ID.
- `GET /api/doctors/portal/profile`: Doctor's own profile.
- `PUT /api/doctors/portal/profile`: Update doctor profile.
- `GET /api/doctors/portal/availability`: Get working hours and blocked dates.
- `PUT /api/doctors/portal/availability`: Update working hours.
- `POST /api/doctors/portal/blocked-dates`: Add leave date.
- `DELETE /api/doctors/portal/blocked-dates/:date`: Remove leave date.
- `GET /api/doctors/portal/dashboard-summary`: Today's appointments and metrics.
- `GET /api/doctors/portal/appointments`: Doctor's appointments list.
- `GET /api/doctors/portal/patients/:patientId`: Authorized patient history timeline.

## Appointment Routes (`/api/appointments`)
- `GET /api/appointments/slots`: Generate available slots for doctor on date.
- `POST /api/appointments`: Book consultation.
- `PUT /api/appointments/:id/reschedule`: Reschedule consultation.
- `PUT /api/appointments/:id/cancel`: Cancel consultation with reason.
- `PUT /api/appointments/:id/status`: Update status (COMPLETED, NO_SHOW).

## Clinical Records & Prescriptions
- `POST /api/medical-records`: Attending doctor records consultation notes.
- `GET /api/medical-records/:id`: View clinical record.
- `POST /api/prescriptions`: Attending doctor issues e-prescription.
- `GET /api/prescriptions/:id`: View printable prescription.
- `POST /api/documents/upload`: Patient uploads lab report/scan.
- `DELETE /api/documents/id`: Delete document.

## Admin Routes (`/api/admin`) — Requires Role: ADMIN
- `GET /api/admin/analytics`: Platform KPI metrics and Recharts series.
- `GET /api/admin/doctors`: Full doctors directory with credentials.
- `PUT /api/admin/doctors/:id/status`: Verify, reject, or suspend doctor.
- `GET /api/admin/patients`: Full patients directory.
- `PUT /api/admin/users/:userId/toggle-status`: Activate/deactivate account.
- `GET /api/admin/hospitals`: Hospitals list.
- `POST /api/admin/hospitals`: Add hospital campus.
- `GET /api/admin/departments`: Departments list.
- `POST /api/admin/departments`: Add department.
- `GET /api/admin/appointments`: Central appointment registry.
- `GET /api/admin/audit-logs`: Security audit log records.

## Recommendation Route (`/api/recommendations`)
- `POST /api/recommendations`: Natural language symptom analysis and department mapping.

# Database Schema & Entity Relationships

The SmartCare database schema is formally defined in `prisma/schema.prisma` targeting PostgreSQL.

## Entity Model Summary

1. **User**: Core authentication identity (id, email, passwordHash, role, isActive, emailVerified, timestamps).
2. **Patient**: Patient profile (userId, fullName, DOB, gender, phone, bloodGroup, allergies, emergencyContact).
3. **Doctor**: Physician credentials (userId, fullName, specialization, qualification, experienceYears, licenseNumber, consultationFee, rating, status).
4. **Admin**: System governance profile (userId, fullName, department).
5. **Hospital**: Campus information (name, address, city, contactPhone, contactEmail).
6. **Department**: Clinical specialties (name, description, hospitalId).
7. **DoctorAvailability**: Recurring shift rules per day of week (doctorId, dayOfWeek, startTime, endTime, breakStartTime, breakEndTime, slotDurationMinutes).
8. **BlockedDate**: Calendar blackout dates for leaves/holidays (doctorId, date, reason).
9. **Appointment**: Consultation reservation (patientId, doctorId, appointmentDate, appointmentTime, endTime, type, priority, status, reasonForVisit).
10. **MedicalRecord**: Clinical notes entered by doctor (patientId, doctorId, appointmentId, consultationDate, diagnosis, symptoms, clinicalNotes, treatmentPlan, vitalSigns).
11. **Prescription**: Official medication order (patientId, doctorId, appointmentId, prescriptionDate, diagnosis, instructions, dietAdvice).
12. **PrescriptionItem**: Individual medication lines (prescriptionId, medicineName, dosage, frequency, duration, instructions).
13. **MedicalDocument**: Uploaded lab reports/scans (patientId, title, documentType, fileName, fileSize, mimeType, fileUrl).
14. **Notification**: In-app notifications (userId, title, message, type, isRead, link).
15. **AuditLog**: Immutable compliance trail (userId, userEmail, userRole, action, entity, entityId, ipAddress, userAgent, details, timestamp).

## Concurrency & Conflict Prevention Rules

- **Unique Constraint**: `BlockedDate(doctorId, date)` prevents duplicate blackout dates.
- **Double-Booking Prevention**: Active appointments (`PENDING` or `CONFIRMED`) on `(doctorId, appointmentDate, appointmentTime)` and `(patientId, appointmentDate, appointmentTime)` are checked before booking and during rescheduling.
- **Slot Release**: Cancelled appointments immediately release the slot for new reservations.

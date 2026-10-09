import fs from 'fs';
import path from 'path';
import {
  User,
  Patient,
  Doctor,
  Admin,
  Hospital,
  Department,
  DoctorAvailability,
  BlockedDate,
  Appointment,
  MedicalRecord,
  MedicalDocument,
  Prescription,
  Notification,
  AuditLog,
} from '../types/index.js';
import {
  SEED_USERS,
  SEED_PATIENTS,
  SEED_DOCTORS,
  SEED_ADMINS,
  SEED_HOSPITALS,
  SEED_DEPARTMENTS,
  SEED_AVAILABILITIES,
  SEED_APPOINTMENTS,
  SEED_MEDICAL_RECORDS,
  SEED_PRESCRIPTIONS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
} from './seed-data.js';

interface DatabaseSchema {
  users: User[];
  patients: Patient[];
  doctors: Doctor[];
  admins: Admin[];
  hospitals: Hospital[];
  departments: Department[];
  availabilities: DoctorAvailability[];
  blockedDates: BlockedDate[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  medicalDocuments: MedicalDocument[];
  prescriptions: Prescription[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  passwordResetTokens: Array<{ token: string; userId: string; expiresAt: string; used: boolean }>;
}

class Store {
  private data: DatabaseSchema;
  private filePath: string;
  private isPersisting: boolean = false;

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'data', 'smartcare-db.json');
    this.data = this.initialize();
  }

  private initialize(): DatabaseSchema {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        // Verify key tables exist
        if (parsed.users && parsed.doctors && parsed.patients) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing fresh store:', err);
    }

    const initialData: DatabaseSchema = {
      users: [...SEED_USERS],
      patients: [...SEED_PATIENTS],
      doctors: [...SEED_DOCTORS],
      admins: [...SEED_ADMINS],
      hospitals: [...SEED_HOSPITALS],
      departments: [...SEED_DEPARTMENTS],
      availabilities: [...SEED_AVAILABILITIES],
      blockedDates: [],
      appointments: [...SEED_APPOINTMENTS],
      medicalRecords: [...SEED_MEDICAL_RECORDS],
      medicalDocuments: [
        {
          id: 'doc-report-1',
          patientId: 'pat-1',
          title: 'Comprehensive Metabolic & Lipid Profile',
          documentType: 'Lab Report',
          fileName: 'lipid_metabolic_panel_2026.pdf',
          fileSize: 245000,
          mimeType: 'application/pdf',
          fileUrl: '/uploads/sample_lab_report.pdf',
          description: 'Fasting glucose: 92 mg/dL, Total Cholesterol: 185 mg/dL, Triglycerides: 110 mg/dL.',
          uploadedAt: '2026-09-30T14:20:00.000Z',
        },
        {
          id: 'doc-report-2',
          patientId: 'pat-1',
          title: 'Resting Electrocardiogram (ECG) Report',
          documentType: 'Scan Report',
          fileName: 'ecg_cardio_trace.pdf',
          fileSize: 512000,
          mimeType: 'application/pdf',
          fileUrl: '/uploads/sample_ecg.pdf',
          description: '12-lead normal sinus rhythm tracing, verified by Dr. Jenkins.',
          uploadedAt: '2026-10-02T10:32:00.000Z',
        },
      ],
      prescriptions: [...SEED_PRESCRIPTIONS],
      notifications: [...SEED_NOTIFICATIONS],
      auditLogs: [...SEED_AUDIT_LOGS],
      passwordResetTokens: [],
    };

    this.persistSync(initialData);
    return initialData;
  }

  private persistSync(dataToSave: DatabaseSchema) {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  public persist() {
    if (this.isPersisting) return;
    this.isPersisting = true;
    setTimeout(() => {
      this.persistSync(this.data);
      this.isPersisting = false;
    }, 50);
  }

  // --- Users ---
  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[idx];
  }

  public getAllUsers(): User[] {
    return [...this.data.users];
  }

  // --- Patients ---
  public findPatientById(id: string): Patient | undefined {
    return this.data.patients.find((p) => p.id === id);
  }

  public findPatientByUserId(userId: string): Patient | undefined {
    return this.data.patients.find((p) => p.userId === userId);
  }

  public createPatient(patient: Patient): Patient {
    this.data.patients.push(patient);
    this.persist();
    return patient;
  }

  public updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const idx = this.data.patients.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.patients[idx] = {
      ...this.data.patients[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.patients[idx];
  }

  public getAllPatients(): Patient[] {
    return [...this.data.patients];
  }

  // --- Doctors ---
  public findDoctorById(id: string): Doctor | undefined {
    return this.data.doctors.find((d) => d.id === id);
  }

  public findDoctorByUserId(userId: string): Doctor | undefined {
    return this.data.doctors.find((d) => d.userId === userId);
  }

  public createDoctor(doctor: Doctor): Doctor {
    this.data.doctors.push(doctor);
    this.persist();
    return doctor;
  }

  public updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const idx = this.data.doctors.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.data.doctors[idx] = {
      ...this.data.doctors[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.doctors[idx];
  }

  public getAllDoctors(filterVerifiedOnly = false): Doctor[] {
    if (filterVerifiedOnly) {
      return this.data.doctors.filter((d) => d.status === 'VERIFIED');
    }
    return [...this.data.doctors];
  }

  // --- Admins ---
  public findAdminByUserId(userId: string): Admin | undefined {
    return this.data.admins.find((a) => a.userId === userId);
  }

  // --- Hospitals & Departments ---
  public getAllHospitals(): Hospital[] {
    return [...this.data.hospitals];
  }

  public findHospitalById(id: string): Hospital | undefined {
    return this.data.hospitals.find((h) => h.id === id);
  }

  public createHospital(hospital: Hospital): Hospital {
    this.data.hospitals.push(hospital);
    this.persist();
    return hospital;
  }

  public updateHospital(id: string, updates: Partial<Hospital>): Hospital | null {
    const idx = this.data.hospitals.findIndex((h) => h.id === id);
    if (idx === -1) return null;
    this.data.hospitals[idx] = { ...this.data.hospitals[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.hospitals[idx];
  }

  public getAllDepartments(): Department[] {
    return [...this.data.departments];
  }

  public findDepartmentById(id: string): Department | undefined {
    return this.data.departments.find((d) => d.id === id);
  }

  public createDepartment(dept: Department): Department {
    this.data.departments.push(dept);
    this.persist();
    return dept;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department | null {
    const idx = this.data.departments.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.data.departments[idx] = { ...this.data.departments[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.departments[idx];
  }

  // --- Availabilities & Blocked Dates ---
  public getDoctorAvailabilities(doctorId: string): DoctorAvailability[] {
    return this.data.availabilities.filter((a) => a.doctorId === doctorId && a.isActive);
  }

  public setDoctorAvailabilities(doctorId: string, newAvailabilities: DoctorAvailability[]): void {
    this.data.availabilities = this.data.availabilities.filter((a) => a.doctorId !== doctorId);
    this.data.availabilities.push(...newAvailabilities);
    this.persist();
  }

  public getDoctorBlockedDates(doctorId: string): BlockedDate[] {
    return this.data.blockedDates.filter((b) => b.doctorId === doctorId);
  }

  public addBlockedDate(blockedDate: BlockedDate): BlockedDate {
    this.data.blockedDates.push(blockedDate);
    this.persist();
    return blockedDate;
  }

  public removeBlockedDate(doctorId: string, date: string): boolean {
    const initial = this.data.blockedDates.length;
    this.data.blockedDates = this.data.blockedDates.filter(
      (b) => !(b.doctorId === doctorId && b.date === date)
    );
    this.persist();
    return this.data.blockedDates.length < initial;
  }

  // --- Appointments ---
  public findAppointmentById(id: string): Appointment | undefined {
    return this.data.appointments.find((a) => a.id === id);
  }

  public getAllAppointments(): Appointment[] {
    return [...this.data.appointments];
  }

  public getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.data.appointments.filter((a) => a.doctorId === doctorId);
  }

  public getAppointmentsByPatient(patientId: string): Appointment[] {
    return this.data.appointments.filter((a) => a.patientId === patientId);
  }

  /**
   * Double-booking check:
   * Returns true if either the doctor or the patient already has an active appointment (PENDING/CONFIRMED)
   * at the specified date and time.
   */
  public isSlotBooked(
    doctorId: string,
    patientId: string,
    appointmentDate: string,
    appointmentTime: string,
    excludeAppointmentId?: string
  ): { booked: boolean; reason?: string } {
    const activeStatuses: Appointment['status'][] = ['PENDING', 'CONFIRMED'];

    const doctorConflict = this.data.appointments.find(
      (a) =>
        a.id !== excludeAppointmentId &&
        a.doctorId === doctorId &&
        a.appointmentDate === appointmentDate &&
        a.appointmentTime === appointmentTime &&
        activeStatuses.includes(a.status)
    );
    if (doctorConflict) {
      return { booked: true, reason: 'Doctor is already booked at this time slot.' };
    }

    const patientConflict = this.data.appointments.find(
      (a) =>
        a.id !== excludeAppointmentId &&
        a.patientId === patientId &&
        a.appointmentDate === appointmentDate &&
        a.appointmentTime === appointmentTime &&
        activeStatuses.includes(a.status)
    );
    if (patientConflict) {
      return { booked: true, reason: 'You already have another appointment scheduled at this exact time.' };
    }

    return { booked: false };
  }

  public createAppointment(appointment: Appointment): Appointment {
    this.data.appointments.push(appointment);
    this.persist();
    return appointment;
  }

  public updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.appointments[idx] = {
      ...this.data.appointments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.appointments[idx];
  }

  // --- Medical Records ---
  public findMedicalRecordById(id: string): MedicalRecord | undefined {
    return this.data.medicalRecords.find((r) => r.id === id);
  }

  public getMedicalRecordsByPatient(patientId: string): MedicalRecord[] {
    return this.data.medicalRecords.filter((r) => r.patientId === patientId && !r.isArchived);
  }

  public getMedicalRecordsByDoctor(doctorId: string): MedicalRecord[] {
    return this.data.medicalRecords.filter((r) => r.doctorId === doctorId && !r.isArchived);
  }

  public createMedicalRecord(record: MedicalRecord): MedicalRecord {
    this.data.medicalRecords.push(record);
    this.persist();
    return record;
  }

  public updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): MedicalRecord | null {
    const idx = this.data.medicalRecords.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.medicalRecords[idx] = {
      ...this.data.medicalRecords[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.medicalRecords[idx];
  }

  // --- Medical Documents ---
  public getDocumentsByPatient(patientId: string): MedicalDocument[] {
    return this.data.medicalDocuments.filter((d) => d.patientId === patientId);
  }

  public createDocument(doc: MedicalDocument): MedicalDocument {
    this.data.medicalDocuments.push(doc);
    this.persist();
    return doc;
  }

  public deleteDocument(id: string): boolean {
    const initial = this.data.medicalDocuments.length;
    this.data.medicalDocuments = this.data.medicalDocuments.filter((d) => d.id !== id);
    this.persist();
    return this.data.medicalDocuments.length < initial;
  }

  // --- Prescriptions ---
  public findPrescriptionById(id: string): Prescription | undefined {
    return this.data.prescriptions.find((p) => p.id === id);
  }

  public getPrescriptionsByPatient(patientId: string): Prescription[] {
    return this.data.prescriptions.filter((p) => p.patientId === patientId);
  }

  public getPrescriptionsByDoctor(doctorId: string): Prescription[] {
    return this.data.prescriptions.filter((p) => p.doctorId === doctorId);
  }

  public createPrescription(prescription: Prescription): Prescription {
    this.data.prescriptions.push(prescription);
    this.persist();
    return prescription;
  }

  // --- Notifications ---
  public getNotificationsByUser(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notification: Notification): Notification {
    this.data.notifications.push(notification);
    this.persist();
    return notification;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persist();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications
      .filter((n) => n.userId === userId)
      .forEach((n) => {
        n.isRead = true;
      });
    this.persist();
  }

  // --- Audit Logs ---
  public getAllAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public createAuditLog(log: AuditLog): AuditLog {
    this.data.auditLogs.push(log);
    // Keep max 500 logs to prevent file explosion
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(-500);
    }
    this.persist();
    return log;
  }

  // --- Password Reset Tokens ---
  public createPasswordResetToken(token: string, userId: string): void {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    this.data.passwordResetTokens.push({ token, userId, expiresAt, used: false });
    this.persist();
  }

  public findPasswordResetToken(token: string): { token: string; userId: string; expiresAt: string; used: boolean } | undefined {
    return this.data.passwordResetTokens.find((t) => t.token === token && !t.used);
  }

  public markPasswordResetTokenUsed(token: string): void {
    const t = this.data.passwordResetTokens.find((x) => x.token === token);
    if (t) {
      t.used = true;
      this.persist();
    }
  }
}

export const db = new Store();

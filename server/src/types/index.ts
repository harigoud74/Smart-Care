export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type DoctorStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type AppointmentType = 'IN_PERSON' | 'TELECONSULTATION';

export type AppointmentPriority = 'ROUTINE' | 'URGENT';

export type NotificationType =
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_REMINDER'
  | 'PRESCRIPTION_CREATED'
  | 'MEDICAL_RECORD_UPDATED'
  | 'ACCOUNT_STATUS_CHANGED';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistoryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  profileImage?: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  licenseNumber: string;
  hospitalId?: string;
  departmentId?: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  bio?: string;
  languages?: string;
  status: DoctorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  userId: string;
  fullName: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  contactPhone: string;
  contactEmail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  hospitalId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  breakStartTime?: string; // "13:00"
  breakEndTime?: string; // "14:00"
  slotDurationMinutes: number; // 30
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedDate {
  id: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  reason?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "09:30"
  endTime: string; // "10:00"
  type: AppointmentType;
  priority: AppointmentPriority;
  status: AppointmentStatus;
  reasonForVisit: string;
  cancellationReason?: string;
  cancelledByRole?: Role;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  consultationDate: string; // "YYYY-MM-DD"
  diagnosis: string;
  symptoms?: string;
  clinicalNotes: string;
  treatmentPlan?: string;
  followUpDate?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    respiratoryRate?: string;
    spo2?: string;
    weight?: string;
  };
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  title: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  description?: string;
  uploadedAt: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  prescriptionDate: string;
  diagnosis: string;
  instructions?: string;
  dietAdvice?: string;
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: Role;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  patientId?: string;
  doctorId?: string;
  adminId?: string;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

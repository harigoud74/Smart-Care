export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type DoctorStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type AppointmentType = 'IN_PERSON' | 'TELECONSULTATION';
export type AppointmentPriority = 'ROUTINE' | 'URGENT';

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistoryNotes?: string;
  createdAt: string;
}

export interface DoctorProfile {
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
  email?: string;
  isActive?: boolean;
  hospital?: { id: string; name: string; city: string };
  department?: { id: string; name: string };
  availabilities?: DoctorAvailability[];
  blockedDates?: BlockedDate[];
}

export interface AdminProfile {
  id: string;
  userId: string;
  fullName: string;
  department?: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface BlockedDate {
  id: string;
  doctorId: string;
  date: string;
  reason?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  type: AppointmentType;
  priority: AppointmentPriority;
  status: AppointmentStatus;
  reasonForVisit: string;
  cancellationReason?: string;
  cancelledByRole?: Role;
  createdAt: string;
  doctor?: {
    id: string;
    fullName: string;
    specialization: string;
    profileImage?: string;
    consultationFee: number;
    hospitalName?: string;
  };
  patient?: {
    id: string;
    fullName: string;
    gender?: string;
    dateOfBirth?: string;
    phone?: string;
    bloodGroup?: string;
    allergies?: string;
  };
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  consultationDate: string;
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
  createdAt: string;
  doctor?: { id: string; fullName: string; specialization: string };
  patient?: PatientProfile;
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
  id?: string;
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
  doctor?: {
    id: string;
    fullName: string;
    specialization: string;
    qualification?: string;
    licenseNumber?: string;
    hospitalName?: string;
    hospitalAddress?: string;
    hospitalCity?: string;
    hospitalPhone?: string;
  };
  patient?: PatientProfile;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  contactPhone: string;
  contactEmail?: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  hospitalId?: string;
  isActive: boolean;
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

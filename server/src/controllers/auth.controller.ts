import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { hashPassword, comparePassword, generateToken, sanitizeUser } from '../utils/security.js';
import { logAudit } from '../services/audit.service.js';
import { sendNotification } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const PatientRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

const DoctorRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  experienceYears: z.number().min(0).default(0),
  licenseNumber: z.string().min(3, 'Medical license number is required'),
  hospitalId: z.string().optional(),
  departmentId: z.string().optional(),
  consultationFee: z.number().min(0).default(60),
  bio: z.string().optional(),
  languages: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function registerPatient(req: Request, res: Response) {
  try {
    const validated = PatientRegisterSchema.parse(req.body);

    const existingUser = db.findUserByEmail(validated.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await hashPassword(validated.password);
    const userId = `usr-pat-${uuidv4().substring(0, 8)}`;
    const patientId = `pat-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const newUser = db.createUser({
      id: userId,
      email: validated.email.toLowerCase(),
      passwordHash,
      role: 'PATIENT',
      isActive: true,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    const newPatient = db.createPatient({
      id: patientId,
      userId,
      fullName: validated.fullName,
      phone: validated.phone,
      dateOfBirth: validated.dateOfBirth,
      gender: validated.gender,
      bloodGroup: validated.bloodGroup,
      allergies: validated.allergies,
      address: validated.address,
      emergencyContact: validated.emergencyContact,
      createdAt: now,
      updatedAt: now,
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: 'PATIENT',
      patientId: newPatient.id,
      name: newPatient.fullName,
    });

    sendNotification(
      userId,
      'Welcome to SmartCare!',
      'Your patient account has been created successfully. You can now schedule appointments and access healthcare records.',
      'ACCOUNT_STATUS_CHANGED',
      '/patient/dashboard'
    );

    logAudit(req, 'REGISTER_PATIENT', 'User', userId, {
      fullName: newPatient.fullName,
      email: newUser.email,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SmartCare.',
      data: {
        token,
        user: sanitizeUser(newUser),
        patient: newPatient,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.issues.map((e) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
}

export async function registerDoctor(req: Request, res: Response) {
  try {
    const validated = DoctorRegisterSchema.parse(req.body);

    const existingUser = db.findUserByEmail(validated.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await hashPassword(validated.password);
    const userId = `usr-doc-${uuidv4().substring(0, 8)}`;
    const doctorId = `doc-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const newUser = db.createUser({
      id: userId,
      email: validated.email.toLowerCase(),
      passwordHash,
      role: 'DOCTOR',
      isActive: true,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    const newDoctor = db.createDoctor({
      id: doctorId,
      userId,
      fullName: validated.fullName,
      specialization: validated.specialization,
      qualification: validated.qualification,
      experienceYears: validated.experienceYears,
      licenseNumber: validated.licenseNumber,
      hospitalId: validated.hospitalId || 'hosp-1',
      departmentId: validated.departmentId || 'dept-1',
      consultationFee: validated.consultationFee,
      rating: 5.0,
      reviewCount: 0,
      bio: validated.bio || 'Consultant Physician at SmartCare Healthcare Network.',
      languages: validated.languages || 'English',
      status: 'PENDING', // Doctor applications require admin verification
      createdAt: now,
      updatedAt: now,
    });

    // Default availability Mon-Fri 09:00 - 17:00
    for (let day = 1; day <= 5; day++) {
      db.setDoctorAvailabilities(doctorId, [
        ...db.getDoctorAvailabilities(doctorId),
        {
          id: `avail-${doctorId}-${day}`,
          doctorId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          slotDurationMinutes: 30,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: 'DOCTOR',
      doctorId: newDoctor.id,
      name: newDoctor.fullName,
    });

    sendNotification(
      userId,
      'Application Submitted',
      'Your doctor profile and medical credentials have been submitted for administrator verification.',
      'ACCOUNT_STATUS_CHANGED',
      '/doctor/dashboard'
    );

    logAudit(req, 'REGISTER_DOCTOR_APPLICATION', 'Doctor', doctorId, {
      fullName: newDoctor.fullName,
      licenseNumber: newDoctor.licenseNumber,
      specialization: newDoctor.specialization,
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor application submitted successfully! Pending administrator verification.',
      data: {
        token,
        user: sanitizeUser(newUser),
        doctor: newDoctor,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.issues.map((e) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact SmartCare hospital administration.',
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    let profile: any = null;
    let name = user.email.split('@')[0];
    let patientId: string | undefined;
    let doctorId: string | undefined;
    let adminId: string | undefined;

    if (user.role === 'PATIENT') {
      const patient = db.findPatientByUserId(user.id);
      if (patient) {
        profile = patient;
        name = patient.fullName;
        patientId = patient.id;
      }
    } else if (user.role === 'DOCTOR') {
      const doctor = db.findDoctorByUserId(user.id);
      if (doctor) {
        profile = doctor;
        name = doctor.fullName;
        doctorId = doctor.id;
      }
    } else if (user.role === 'ADMIN') {
      const admin = db.findAdminByUserId(user.id);
      if (admin) {
        profile = admin;
        name = admin.fullName;
        adminId = admin.id;
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      patientId,
      doctorId,
      adminId,
      name,
    });

    logAudit(req, 'LOGIN_SUCCESS', 'User', user.id, { role: user.role, email: user.email });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: sanitizeUser(user),
        profile,
        role: user.role,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.issues.map((e) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const user = db.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    let profile: any = null;
    if (user.role === 'PATIENT') {
      profile = db.findPatientByUserId(user.id);
    } else if (user.role === 'DOCTOR') {
      profile = db.findDoctorByUserId(user.id);
    } else if (user.role === 'ADMIN') {
      profile = db.findAdminByUserId(user.id);
    }

    return res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        profile,
        role: user.role,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const user = db.findUserByEmail(email);
    if (user) {
      const resetToken = `rst-${uuidv4()}`;
      db.createPasswordResetToken(resetToken, user.id);
      console.log(`[PASSWORD RESET LINK]: /reset-password?token=${resetToken} for ${email}`);
      logAudit(req, 'REQUEST_PASSWORD_RESET', 'User', user.id, { email });
    }

    // Always respond with success to prevent user email enumeration
    return res.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been generated.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Valid token and new password (min 6 chars) are required.',
      });
    }

    const record = db.findPasswordResetToken(token);
    if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Password reset link is invalid or has expired.',
      });
    }

    const newHash = await hashPassword(newPassword);
    db.updateUser(record.userId, { passwordHash: newHash });
    db.markPasswordResetTokenUsed(token);

    logAudit(req, 'RESET_PASSWORD_SUCCESS', 'User', record.userId);

    return res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in with your new password.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function googleSignIn(req: Request, res: Response) {
  try {
    const { email, displayName, uid } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required for Google Sign-In.' });
    }

    let user = db.findUserByEmail(email);
    let profile: any = null;
    let name = displayName || email.split('@')[0];
    let patientId: string | undefined;
    let doctorId: string | undefined;
    let adminId: string | undefined;

    if (!user) {
      // Auto-provision patient user from Google Sign-In
      const userId = uid || `usr-g-${uuidv4().substring(0, 8)}`;
      const pId = `pat-${uuidv4().substring(0, 8)}`;
      const now = new Date().toISOString();

      user = db.createUser({
        id: userId,
        email,
        passwordHash: 'GOOGLE_OAUTH_MANAGED',
        role: 'PATIENT',
        isActive: true,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      profile = db.createPatient({
        id: pId,
        userId: user.id,
        fullName: name,
        dateOfBirth: '',
        gender: '',
        phone: '',
        bloodGroup: '',
        allergies: 'None reported',
        address: '',
        emergencyContact: '',
        createdAt: now,
        updatedAt: now,
      });
      patientId = profile.id;

      sendNotification(
        user.id,
        'Welcome to SmartCare',
        `Hello ${name}, your account has been authenticated via Google Sign-In with Firebase Auth.`,
        'ACCOUNT_STATUS_CHANGED'
      );
    } else {
      if (user.role === 'PATIENT') {
        const patient = db.findPatientByUserId(user.id);
        if (patient) {
          profile = patient;
          name = patient.fullName;
          patientId = patient.id;
        }
      } else if (user.role === 'DOCTOR') {
        const doctor = db.findDoctorByUserId(user.id);
        if (doctor) {
          profile = doctor;
          name = doctor.fullName;
          doctorId = doctor.id;
        }
      } else if (user.role === 'ADMIN') {
        const admin = db.findAdminByUserId(user.id);
        if (admin) {
          profile = admin;
          name = admin.fullName;
          adminId = admin.id;
        }
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      patientId,
      doctorId,
      adminId,
      name,
    });

    logAudit(req, 'GOOGLE_LOGIN_SUCCESS', 'User', user.id, { email });

    return res.json({
      success: true,
      data: {
        token,
        user: sanitizeUser(user),
        profile,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('[Google Sign-In Error]:', err);
    return res.status(500).json({ success: false, error: err.message || 'Google authentication failed' });
  }
}


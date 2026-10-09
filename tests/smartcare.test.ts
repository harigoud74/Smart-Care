import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../server/src/db/store.js';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../server/src/utils/security.js';
import { generateDoctorSlotsForDate } from '../server/src/services/slot.service.js';
import { recommendDepartmentAndDoctor } from '../server/src/services/recommendation.service.js';
import { config } from '../server/src/config/index.js';

// Ensure unit tests run locally against the clinical rule engine
config.geminiApiKey = '';

describe('SmartCare Core Test Suite', () => {
  describe('1. Security & Password Hashing', () => {
    test('should securely hash password and verify match', async () => {
      const rawPassword = 'SecretPassword!123';
      const hash = await hashPassword(rawPassword);
      assert.notEqual(rawPassword, hash);
      const isCorrect = await comparePassword(rawPassword, hash);
      assert.equal(isCorrect, true);
      const isWrong = await comparePassword('WrongPassword', hash);
      assert.equal(isWrong, false);
    });

    test('should generate valid JWT with user claims and verify correctly', () => {
      const payload = {
        userId: 'usr-pat-999',
        email: 'test.patient@example.com',
        role: 'PATIENT' as const,
        patientId: 'pat-999',
        name: 'Test Patient',
      };
      const token = generateToken(payload);
      assert.ok(token);

      const decoded = verifyToken(token);
      assert.ok(decoded);
      assert.equal(decoded.userId, payload.userId);
      assert.equal(decoded.role, 'PATIENT');
      assert.equal(decoded.patientId, 'pat-999');
    });
  });

  describe('2. Doctor Availability & Slot Generation', () => {
    test('should generate 30-minute slots respecting working hours and lunch break', () => {
      // doc-1 has availability on Mondays (e.g. 2026-10-12 is a Monday)
      const slotInfo = generateDoctorSlotsForDate('doc-1', '2026-10-12');
      assert.equal(slotInfo.isDateBlocked, false);
      assert.ok(slotInfo.slots.length > 0);

      // Verify slot duration is 30 mins
      const firstSlot = slotInfo.slots[0];
      assert.equal(firstSlot.time, '09:00');
      assert.equal(firstSlot.endTime, '09:30');

      // Verify no slots exist between 13:00 and 14:00 (break period)
      const breakSlot = slotInfo.slots.find((s) => s.time === '13:00' || s.time === '13:30');
      assert.equal(breakSlot, undefined, 'Slots must not overlap with break period');
    });

    test('should prevent booking on doctor blocked dates', () => {
      // Add blocked date for doc-1
      db.addBlockedDate({
        id: 'test-block-1',
        doctorId: 'doc-1',
        date: '2026-11-20',
        reason: 'Attending Cardiology Medical Conference',
        createdAt: new Date().toISOString(),
      });

      const slotInfo = generateDoctorSlotsForDate('doc-1', '2026-11-20');
      assert.equal(slotInfo.isDateBlocked, true);
      assert.equal(slotInfo.slots.length, 0);
    });
  });

  describe('3. Appointment Booking & Double-Booking Prevention', () => {
    test('should detect and prevent double-booking for doctor at same slot', () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const date = `2026-11-${(10 + (Date.now() % 15))}`;
      const time = '11:00';

      // Ensure slot is initially clean
      const existing = db.isSlotBooked('doc-1', 'pat-2', date, time);
      if (existing.booked) {
        // Find and cancel any test remnant
        const conflicts = db.getAllAppointments().filter(a => a.appointmentDate === date && a.appointmentTime === time);
        conflicts.forEach(c => db.updateAppointment(c.id, { status: 'CANCELLED' }));
      }

      const beforeBooking = db.isSlotBooked('doc-1', 'pat-2', date, time);
      assert.equal(beforeBooking.booked, false);

      // Create test appointment
      db.createAppointment({
        id: `test-apt-conflict-${uniqueSuffix}`,
        patientId: 'pat-2',
        doctorId: 'doc-1',
        appointmentDate: date,
        appointmentTime: time,
        endTime: '11:30',
        type: 'IN_PERSON',
        priority: 'ROUTINE',
        status: 'CONFIRMED',
        reasonForVisit: 'Chest discomfort',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Second booking attempt by a different patient at the exact same doctor and time
      const doctorConflict = db.isSlotBooked('doc-1', 'pat-3', date, time);
      assert.equal(doctorConflict.booked, true);
      assert.ok(doctorConflict.reason?.includes('Doctor is already booked'));

      // Patient attempting another appointment at the exact same time with a different doctor
      const patientConflict = db.isSlotBooked('doc-2', 'pat-2', date, time);
      assert.equal(patientConflict.booked, true);
      assert.ok(patientConflict.reason?.includes('You already have another appointment'));
    });

    test('should release slot when appointment is cancelled', () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const date = `2026-12-${(10 + (Date.now() % 15))}`;
      const time = '14:00';

      const apt = db.createAppointment({
        id: `test-apt-cancel-${uniqueSuffix}`,
        patientId: 'pat-4',
        doctorId: 'doc-2',
        appointmentDate: date,
        appointmentTime: time,
        endTime: '14:30',
        type: 'IN_PERSON',
        priority: 'ROUTINE',
        status: 'CONFIRMED',
        reasonForVisit: 'Knee injury check',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      assert.equal(db.isSlotBooked('doc-2', 'pat-4', date, time).booked, true);

      // Cancel the appointment
      db.updateAppointment(apt.id, {
        status: 'CANCELLED',
        cancellationReason: 'Patient personal conflict',
      });

      // Slot should now be free
      const checkReleased = db.isSlotBooked('doc-2', 'pat-5', date, time);
      assert.equal(checkReleased.booked, false, 'Cancelled appointment must release time slot');
    });
  });

  describe('4. Smart Recommendation & Emergency Navigation', () => {
    test('should recommend Orthopedics for knee pain symptoms', async () => {
      const res = await recommendDepartmentAndDoctor('I have persistent knee pain and difficulty walking.');
      assert.equal(res.recommendedDepartment, 'Orthopedics');
      assert.equal(res.isEmergency, false);
      assert.ok(res.disclaimer.includes('AI-assisted healthcare navigation'));
      assert.ok(res.matchedDoctors.length > 0);
    });

    test('should recommend Dermatology for skin rash and itching', async () => {
      const res = await recommendDepartmentAndDoctor('Severe skin rash and intense itching on arms.');
      assert.equal(res.recommendedDepartment, 'Dermatology');
      assert.equal(res.isEmergency, false);
    });

    test('should trigger critical emergency warning for life-threatening symptoms', async () => {
      const res = await recommendDepartmentAndDoctor('Crushing chest pain and difficulty breathing');
      assert.equal(res.isEmergency, true);
      assert.equal(res.urgencyRecommendation, 'EMERGENCY');
      assert.ok(res.emergencyWarning?.includes('call 911'));
    });
  });

  describe('5. Role-Based Access & Admin Verification Workflow', () => {
    test('doctor applications start with PENDING status and can be verified by admin', () => {
      // Ensure doc-7 starts as PENDING
      db.updateDoctor('doc-7', { status: 'PENDING' });
      const doctor = db.findDoctorById('doc-7');
      assert.ok(doctor);
      assert.equal(doctor.status, 'PENDING');

      // Only verified doctors appear in public bookable list
      const publicVerified = db.getAllDoctors(true);
      const isFound = publicVerified.some((d) => d.id === 'doc-7');
      assert.equal(isFound, false, 'Pending doctor must not be publicly bookable');

      // Admin verifies doctor
      db.updateDoctor('doc-7', { status: 'VERIFIED' });
      const verifiedDoctor = db.findDoctorById('doc-7');
      assert.equal(verifiedDoctor?.status, 'VERIFIED');

      // Now should appear in public list
      const updatedPublic = db.getAllDoctors(true);
      assert.equal(updatedPublic.some((d) => d.id === 'doc-7'), true);
    });
  });
});

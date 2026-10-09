import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';

export interface FirestoreUserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  photoURL?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  symptoms?: string;
  createdAt: string;
}

export interface FirestoreChatThread {
  id: string;
  userId: string;
  title: string;
  model: string;
  role: string;
  messages: Array<{ role: 'user' | 'model'; text: string; timestamp?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreAudioTranscription {
  id: string;
  userId: string;
  text: string;
  category: string;
  createdAt: string;
}

export interface FirestoreMedicalNote {
  id: string;
  patientId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string;
}

// ================= USER PERSISTENCE =================
export async function syncUserToFirestore(profile: FirestoreUserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.id);
    await setDoc(
      userRef,
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('[Firestore] Error saving user profile:', error);
  }
}

export async function getUserFromFirestore(uid: string): Promise<FirestoreUserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
  } catch (error) {
    console.error('[Firestore] Error fetching user profile:', error);
  }
  return null;
}

// ================= APPOINTMENTS PERSISTENCE =================
export async function saveAppointmentToFirestore(appointment: FirestoreAppointment): Promise<void> {
  try {
    const docRef = doc(db, 'appointments', appointment.id);
    await setDoc(docRef, appointment, { merge: true });
    console.log('[Firestore] Appointment successfully saved to Firestore:', appointment.id);
  } catch (error) {
    console.error('[Firestore] Error saving appointment:', error);
  }
}

export async function getAppointmentsFromFirestore(
  userId: string,
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
): Promise<FirestoreAppointment[]> {
  try {
    const appointmentsRef = collection(db, 'appointments');
    let q;
    if (role === 'DOCTOR') {
      q = query(appointmentsRef, where('doctorId', '==', userId));
    } else {
      q = query(appointmentsRef, where('patientId', '==', userId));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FirestoreAppointment);
  } catch (error) {
    console.error('[Firestore] Error fetching appointments:', error);
    return [];
  }
}

// ================= AI CHAT THREAD PERSISTENCE =================
export async function saveChatThreadToFirestore(thread: FirestoreChatThread): Promise<void> {
  try {
    const chatRef = doc(db, 'chatHistory', thread.id);
    await setDoc(chatRef, thread, { merge: true });
  } catch (error) {
    console.error('[Firestore] Error saving chat thread:', error);
  }
}

export async function getChatThreadsFromFirestore(userId: string): Promise<FirestoreChatThread[]> {
  try {
    const chatRef = collection(db, 'chatHistory');
    const q = query(chatRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FirestoreChatThread);
  } catch (error) {
    console.error('[Firestore] Error fetching chat threads:', error);
    return [];
  }
}

export async function deleteChatThreadFromFirestore(chatId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'chatHistory', chatId));
  } catch (error) {
    console.error('[Firestore] Error deleting chat thread:', error);
  }
}

// ================= AUDIO TRANSCRIPTIONS PERSISTENCE =================
export async function saveAudioTranscriptionToFirestore(
  transcription: FirestoreAudioTranscription
): Promise<void> {
  try {
    const transRef = doc(db, 'audioTranscriptions', transcription.id);
    await setDoc(transRef, transcription, { merge: true });
  } catch (error) {
    console.error('[Firestore] Error saving audio transcription:', error);
  }
}

export async function getAudioTranscriptionsFromFirestore(
  userId: string
): Promise<FirestoreAudioTranscription[]> {
  try {
    const transRef = collection(db, 'audioTranscriptions');
    const q = query(transRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FirestoreAudioTranscription);
  } catch (error) {
    console.error('[Firestore] Error fetching audio transcriptions:', error);
    return [];
  }
}

// ================= MEDICAL NOTES PERSISTENCE =================
export async function saveMedicalNoteToFirestore(note: FirestoreMedicalNote): Promise<void> {
  try {
    const noteRef = doc(db, 'medicalNotes', note.id);
    await setDoc(noteRef, note, { merge: true });
  } catch (error) {
    console.error('[Firestore] Error saving medical note:', error);
  }
}

export async function getMedicalNotesFromFirestore(patientId: string): Promise<FirestoreMedicalNote[]> {
  try {
    const noteRef = collection(db, 'medicalNotes');
    const q = query(noteRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FirestoreMedicalNote);
  } catch (error) {
    console.error('[Firestore] Error fetching medical notes:', error);
    return [];
  }
}

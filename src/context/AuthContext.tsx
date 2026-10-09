import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { apiRequest } from '../services/api';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
} from '../firebase/config';
import { syncUserToFirestore } from '../firebase/firestoreService';

interface AuthContextType {
  user: User | null;
  profile: any;
  role: Role | null;
  token: string | null;
  loading: boolean;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleQuick: (role: 'PATIENT' | 'DOCTOR' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('smartcare_token'));
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchCurrentUser = async () => {
    const currentToken = localStorage.getItem('smartcare_token');
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        setRole(res.data.role);
      } else {
        localStorage.removeItem('smartcare_token');
        setUser(null);
        setProfile(null);
        setRole(null);
      }
    } catch {
      localStorage.removeItem('smartcare_token');
      setUser(null);
      setProfile(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      localStorage.setItem('smartcare_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setProfile(res.data.profile);
      setRole(res.data.role);
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: false, error: res.error || 'Login failed.' };
  };

  /**
   * Google Sign-in with Firebase Auth
   * Securely authenticates user via Google, synchronizes profile to Cloud Firestore,
   * and creates application session.
   */
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = credential.user;

      // Sync user profile directly to Cloud Firestore
      await syncUserToFirestore({
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Google User',
        role: 'PATIENT',
        photoURL: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Synchronize with backend SmartCare session
      const res = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: fbUser.email,
          displayName: fbUser.displayName,
          uid: fbUser.uid,
          photoURL: fbUser.photoURL,
        }),
      });

      if (res.success && res.data) {
        localStorage.setItem('smartcare_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        setRole(res.data.role);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: res.error || 'Failed to initialize session from Google sign-in.' };
      }
    } catch (err: any) {
      console.error('[Google Sign-In Error]:', err);
      setLoading(false);
      return {
        success: false,
        error: err.message || 'Google Sign-In was cancelled or encountered an error.',
      };
    }
  };

  const logout = () => {
    try {
      firebaseSignOut(auth).catch(() => {});
    } catch (e) {}
    localStorage.removeItem('smartcare_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setFirebaseUser(null);
  };

  // Demo helper: allows examiners or users to switch roles instantly with valid accounts
  const switchRoleQuick = async (targetRole: 'PATIENT' | 'DOCTOR' | 'ADMIN') => {
    let email = 'patient@smartcare.org';
    if (targetRole === 'DOCTOR') {
      email = 'sarah.jenkins@smartcare.org';
    } else if (targetRole === 'ADMIN') {
      email = 'admin@smartcare.org';
    }
    await login(email, 'Password@123');
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        token,
        loading,
        firebaseUser,
        login,
        loginWithGoogle,
        logout,
        switchRoleQuick,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

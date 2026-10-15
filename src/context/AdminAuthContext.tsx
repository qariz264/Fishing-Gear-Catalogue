import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_SESSION_STORAGE_KEY,
} from '../utils/adminConstants';

// Primary authorized owner email from runtime
export const OWNER_ADMIN_EMAIL = 'stephenkariuki955@gmail.com';

export interface AdminSessionUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AdminAuthContextType {
  currentUser: AdminSessionUser | User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<boolean>;
  loginWithCredentials: (usernameOrEmail: string, pass: string) => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminSessionUser | User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check admin authorization in Firestore for Firebase Auth users
  const verifyAdminStatus = async (user: User | null): Promise<boolean> => {
    if (!user) return false;

    const email = user.email?.toLowerCase().trim();

    // Direct owner authorization check
    if (email === OWNER_ADMIN_EMAIL.toLowerCase()) {
      try {
        const adminDocRef = doc(db, 'admins', user.uid);
        await setDoc(
          adminDocRef,
          {
            email: user.email,
            role: 'superadmin',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        // Continue even if initial write fails
      }
      return true;
    }

    // Check by UID in Firestore
    try {
      const uidDoc = await getDoc(doc(db, 'admins', user.uid));
      if (uidDoc.exists()) return true;

      // Check by Email in Firestore
      if (email) {
        const emailDoc = await getDoc(doc(db, 'admins', email));
        if (emailDoc.exists()) return true;
      }
    } catch (err) {
      console.warn('Error checking admin doc:', err);
    }

    return false;
  };

  // Restore session from localStorage or Firebase Auth
  useEffect(() => {
    // 1. Check local admin session
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username?.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
          setCurrentUser({
            uid: 'admin-fishingwithnelson',
            email: ADMIN_USERNAME,
            displayName: 'FishingWithNelson (Administrator)',
          });
          setIsAdmin(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse admin session:', e);
    }

    // 2. Fall back to Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Don't overwrite if already signed in via credentials session
      const storedSession = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (storedSession) return;

      setLoading(true);
      setCurrentUser(user);
      if (user) {
        const authorized = await verifyAdminStatus(user);
        setIsAdmin(authorized);
        if (!authorized) {
          setError(`Access denied. The account (${user.email || 'user'}) is not authorized as an administrator.`);
        } else {
          setError(null);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Log in with username 'FishingWithNelson' and password '0987654321NelsonFishing'
   */
  const loginWithCredentials = async (
    usernameOrEmail: string,
    pass: string
  ): Promise<boolean> => {
    setError(null);
    setLoading(true);

    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const isMatchingUsername =
      cleanInput === ADMIN_USERNAME.toLowerCase() ||
      cleanInput === 'nelson' ||
      cleanInput === 'fishingwithnelson' ||
      cleanInput === 'stephenkariuki955@gmail.com';

    if (isMatchingUsername && pass === ADMIN_PASSWORD) {
      const sessionUser: AdminSessionUser = {
        uid: 'admin-fishingwithnelson',
        email: ADMIN_USERNAME,
        displayName: 'FishingWithNelson (Administrator)',
      };

      try {
        localStorage.setItem(
          ADMIN_SESSION_STORAGE_KEY,
          JSON.stringify({
            username: ADMIN_USERNAME,
            role: 'superadmin',
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn('Could not save session to localStorage:', e);
      }

      setCurrentUser(sessionUser);
      setIsAdmin(true);
      setError(null);
      setLoading(false);
      return true;
    } else {
      setError('Invalid username or password. Please verify your administrator credentials.');
      setLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const authorized = await verifyAdminStatus(result.user);
      setIsAdmin(authorized);
      if (!authorized) {
        setError(`Access denied. Account ${result.user.email} is not listed in the authorized administrators.`);
        return false;
      }
      setCurrentUser(result.user);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      await signOut(auth).catch(() => {});
      setCurrentUser(null);
      setIsAdmin(false);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        error,
        loginWithGoogle,
        loginWithCredentials,
        loginWithEmail: loginWithCredentials,
        logout,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, firestoreService, isFirebaseInitialized } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from '@/types';

interface AuthContextType {
  user: any | null;
  userData: UserData | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isFirebaseConfigured: boolean;
  enableDemoMode: () => Promise<void>;
  updateDemoUserData: (updates: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_DATA_KEY = '@treebuddy_demo_user_data';

const DEFAULT_DEMO_DATA: UserData = {
  email: 'demo@treebuddy.app',
  xp: 0,
  treeLevel: 1,
  completedTasks: [],
  streakCount: 0,
  lastActionDateKey: undefined,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsFirebaseConfigured(isFirebaseInitialized);

    if (!isFirebaseInitialized) {
      console.warn('⚠️ Firebase is not configured properly');
      console.warn('The app will work in demo mode without authentication');
      
      const demoModeEnabled = await AsyncStorage.getItem('@treebuddy_demo_mode');
      if (demoModeEnabled === 'true') {
        await loadDemoData();
        setIsDemoMode(true);
      }
      
      setLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserData(firebaseUser.uid);
        setIsDemoMode(false);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  };

  const loadUserData = async (userId: string) => {
    try {
      const data = await firestoreService.getUserData(userId);
      if (data) {
        setUserData(data as UserData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadDemoData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(DEMO_USER_DATA_KEY);
      if (storedData) {
        setUserData(JSON.parse(storedData));
      } else {
        setUserData(DEFAULT_DEMO_DATA);
        await AsyncStorage.setItem(DEMO_USER_DATA_KEY, JSON.stringify(DEFAULT_DEMO_DATA));
      }
    } catch (error) {
      console.error('Error loading demo data:', error);
      setUserData(DEFAULT_DEMO_DATA);
    }
  };

  const enableDemoMode = async () => {
    console.log('Enabling demo mode');
    setIsDemoMode(true);
    await AsyncStorage.setItem('@treebuddy_demo_mode', 'true');
    await loadDemoData();
  };

  const updateDemoUserData = async (updates: Partial<UserData>) => {
    if (!isDemoMode || !userData) return;
    
    const updatedData = { ...userData, ...updates };
    setUserData(updatedData);
    
    try {
      await AsyncStorage.setItem(DEMO_USER_DATA_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving demo data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase не налаштовано. Будь ласка, налаштуйте Firebase для використання автентифікації.');
    }
    try {
      await authService.login(email, password);
      setIsDemoMode(false);
      await AsyncStorage.removeItem('@treebuddy_demo_mode');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase не налаштовано. Будь ласка, налаштуйте Firebase для використання автентифікації.');
    }
    try {
      const user = await authService.register(email, password);
      await firestoreService.createUserData(user.uid, email);
      setIsDemoMode(false);
      await AsyncStorage.removeItem('@treebuddy_demo_mode');
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUserData(null);
      await AsyncStorage.removeItem('@treebuddy_demo_mode');
      await AsyncStorage.removeItem(DEMO_USER_DATA_KEY);
      return;
    }

    if (!isFirebaseInitialized) {
      throw new Error('Firebase не налаштовано.');
    }
    try {
      await authService.logout();
      setUser(null);
      setUserData(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase не налаштовано. Будь ласка, налаштуйте Firebase для використання автентифікації.');
    }
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (isDemoMode) {
      await loadDemoData();
      return;
    }
    
    if (user) {
      await loadUserData(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isDemoMode,
        login,
        register,
        logout,
        resetPassword,
        refreshUserData,
        isFirebaseConfigured,
        enableDemoMode,
        updateDemoUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

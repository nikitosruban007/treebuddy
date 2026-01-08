
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  runTransaction,
  Timestamp
} from 'firebase/firestore';

// Firebase configuration
// These should be set in your .env file or environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Check if all required config values are present
const isFirebaseConfigured = 
  firebaseConfig.apiKey !== 'demo-api-key' &&
  firebaseConfig.projectId !== 'demo-project';

// Initialize Firebase
let app: FirebaseApp | null = null;
let isFirebaseInitialized = false;

try {
  if (isFirebaseConfigured) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      isFirebaseInitialized = true;
      console.log('✅ Firebase initialized successfully');
    } else {
      app = getApps()[0];
      isFirebaseInitialized = true;
      console.log('✅ Firebase already initialized');
    }
  } else {
    console.warn('⚠️ Firebase configuration not found');
    console.warn('Please set EXPO_PUBLIC_FIREBASE_* environment variables');
    console.warn('The app will work in demo mode without authentication');
  }
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error.message);
  isFirebaseInitialized = false;
}

// Get Firebase services
const auth = isFirebaseInitialized && app ? getAuth(app) : null;
const db = isFirebaseInitialized && app ? getFirestore(app) : null;

// Firebase Auth Service
export const authService = {
  // Check if Firebase is initialized
  isInitialized() {
    return isFirebaseInitialized;
  },

  // Register new user
  async register(email: string, password: string) {
    if (!isFirebaseInitialized || !auth) {
      throw new Error('Firebase is not initialized. Please configure Firebase properly.');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string) {
    if (!isFirebaseInitialized || !auth) {
      throw new Error('Firebase is not initialized. Please configure Firebase properly.');
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    if (!isFirebaseInitialized || !auth) {
      throw new Error('Firebase is not initialized. Please configure Firebase properly.');
    }
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email: string) {
    if (!isFirebaseInitialized || !auth) {
      throw new Error('Firebase is not initialized. Please configure Firebase properly.');
    }
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    if (!isFirebaseInitialized || !auth) {
      return null;
    }
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    if (!isFirebaseInitialized || !auth) {
      console.warn('Firebase not initialized, auth state listener will not work');
      // Return a dummy unsubscribe function
      return () => {};
    }
    return firebaseOnAuthStateChanged(auth, callback);
  },
};

// Firestore Service
export const firestoreService = {
  // Check if Firebase is initialized
  isInitialized() {
    return isFirebaseInitialized;
  },

  // Create user data
  async createUserData(userId: string, email: string) {
    if (!isFirebaseInitialized || !db) {
      throw new Error('Firebase is not initialized. Please configure Firebase properly.');
    }
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        userId,
        email,
        xp: 0,
        treeLevel: 0,
        completedTasks: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('User data created');
    } catch (error: any) {
      console.error('Create user data error:', error);
      throw error;
    }
  },

  // Get user data
  async getUserData(userId: string) {
    if (!isFirebaseInitialized || !db) {
      throw new Error('Firebase is not initialized. Please configure Firebase properly.');
    }
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error: any) {
      console.error('Get user data error:', error);
      throw error;
    }
  },

  // Update XP
  async updateXP(
    userId: string,
    xpToAdd: number,
    taskId: string,
    streak?: { todayKey: string; yesterdayKey: string }
  ) {
    if (!isFirebaseInitialized || !db) {
      throw new Error('Firebase is not initialized. Please configure Firebase properly.');
    }
    try {
      const userRef = doc(db, 'users', userId);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User does not exist');
        }
        const currentXP = userDoc.data()?.xp || 0;
        const newXP = currentXP + xpToAdd;
        const completedTasks = userDoc.data()?.completedTasks || [];

        const updates: any = {
          xp: newXP,
          completedTasks: [
            ...completedTasks,
            {
              taskId,
              completedAt: serverTimestamp(),
              xpEarned: xpToAdd,
            },
          ],
          updatedAt: serverTimestamp(),
        };

        if (streak?.todayKey && streak?.yesterdayKey) {
          const lastKey = userDoc.data()?.lastActionDateKey as string | undefined;
          const prevStreak = Number(userDoc.data()?.streakCount || 0);
          const nextStreak = lastKey === streak.todayKey
            ? prevStreak
            : (lastKey === streak.yesterdayKey ? prevStreak + 1 : 1);
          updates.streakCount = nextStreak;
          updates.lastActionDateKey = streak.todayKey;
        }
        
        transaction.update(userRef, updates);
      });
      console.log('XP updated');
    } catch (error: any) {
      console.error('Update XP error:', error);
      throw error;
    }
  },

  // Listen to user data changes
  onUserDataChanged(userId: string, callback: (data: any) => void) {
    if (!isFirebaseInitialized || !db) {
      console.warn('Firebase not initialized, user data listener will not work');
      return () => {};
    }
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  },

  // Minimal community/shared progress ("shared tree")
  async incrementCommunityProgress(xpToAdd: number) {
    if (!isFirebaseInitialized || !db) {
      return;
    }

    const ref = doc(db, 'community', 'global');
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const current = snap.exists() ? snap.data() : {};
      const totalXP = Number(current.totalXP || 0) + xpToAdd;
      const totalActions = Number(current.totalActions || 0) + 1;

      if (!snap.exists()) {
        transaction.set(ref, {
          totalXP,
          totalActions,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      } else {
        transaction.update(ref, {
          totalXP,
          totalActions,
          updatedAt: serverTimestamp(),
        });
      }
    });
  },

  async getCommunityProgress() {
    if (!isFirebaseInitialized || !db) {
      return null;
    }
    const ref = doc(db, 'community', 'global');
    const snap = await getDoc(ref);
    if (!snap.exists()) return { totalXP: 0, totalActions: 0 };
    const data = snap.data();
    return {
      totalXP: Number(data.totalXP || 0),
      totalActions: Number(data.totalActions || 0),
    };
  },
};

// Messaging Service (placeholder for now - requires expo-notifications)
export const messagingService = {
  // Check if Firebase is initialized
  isInitialized() {
    return isFirebaseInitialized;
  },

  // Request permission
  async requestPermission() {
    console.warn('Push notifications require expo-notifications setup');
    return false;
  },

  // Get FCM token
  async getToken() {
    console.warn('Push notifications require expo-notifications setup');
    return null;
  },

  // Listen to token refresh
  onTokenRefresh(callback: (token: string) => void) {
    console.warn('Push notifications require expo-notifications setup');
    return () => {};
  },

  // Listen to messages
  onMessage(callback: (message: any) => void) {
    console.warn('Push notifications require expo-notifications setup');
    return () => {};
  },
};

export { isFirebaseInitialized };

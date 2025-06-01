// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy88lUBRaSYU8qxbJyPCg-8VWZNDfzsfA",
  authDomain: "autorent-cc2cc.firebaseapp.com",
  projectId: "autorent-cc2cc",
  storageBucket: "autorent-cc2cc.firebasestorage.app",
  messagingSenderId: "761548083869",
  appId: "1:761548083869:web:f86c8ec9a405a4c3e23a74"
};

// Initialize Firebase only if no apps exist
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} else {
  app = getApps()[0];
  console.log('Firebase already initialized');
}

// Initialize Firebase Authentication with AsyncStorage persistence
let auth;
try {
  // Try to initialize auth with AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('Firebase Auth initialized with AsyncStorage persistence');
} catch (error) {
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('Firebase Auth already initialized, using existing instance');
  } else {
    console.error('Firebase Auth initialization error:', error);
    // Fallback to basic auth
    auth = getAuth(app);
  }
}

export { auth };
export default app; 
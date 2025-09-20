/**
 * Firebase Configuration Module
 * Handles Firebase initialization and exports instances
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Firebase configuration - Using environment variables when available
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCkgz6_Zpu0VOW6GgJxOxd9QlVccsBXnog",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "tcgtrade-7ba27.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "tcgtrade-7ba27",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "tcgtrade-7ba27.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "207150886257",
    appId: process.env.FIREBASE_APP_ID || "1:207150886257:web:26edebbeb7df7a1d935ad0",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://tcgtrade-7ba27-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// App configuration
export const appId = process.env.APP_ID || 'tcgtrade-pokemon-app';

// Export Firebase methods for use in other modules
export { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    signInAnonymously, 
    signInWithCustomToken, 
    updateEmail, 
    updatePassword, 
    reauthenticateWithCredential, 
    EmailAuthProvider, 
    sendPasswordResetEmail 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

export { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    getDocs, 
    deleteDoc 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
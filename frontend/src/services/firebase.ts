// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDROxAwSvVKzQdC2H63G9CAVOHuKldegnY",
  authDomain: "concoevents.firebaseapp.com",
  databaseURL: "https://concoevents-default-rtdb.firebaseio.com",
  projectId: "concoevents",
  storageBucket: "concoevents.firebasestorage.app",
  messagingSenderId: "290142780899",
  appId: "1:290142780899:web:9b9187b443695c00fcb4d6",
  measurementId: "G-7WTC6QRWZG",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Add Google authentication provider
export const googleProvider = new GoogleAuthProvider();

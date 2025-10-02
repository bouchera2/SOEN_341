import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDROxAwSvVKzQdC2H63G9CAVOHuKldegnY",
  authDomain: "concoevents.firebaseapp.com",
  databaseURL: "https://concoevents-default-rtdb.firebaseio.com",
  projectId: "concoevents",
  storageBucket: "concoevents.firebasestorage.app",
  messagingSenderId: "290142780899",
  appId: "1:290142780899:web:9b9187b443695c00fcb4d6",
  measurementId: "G-7WTC6QRWZG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
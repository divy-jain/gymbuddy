import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS0dBzA72i7wfz1ya4YwEMmgJeNMGWqnE",
  authDomain: "gymtracker-73ede.firebaseapp.com",
  projectId: "gymtracker-73ede",
  storageBucket: "gymtracker-73ede.firebasestorage.app",
  messagingSenderId: "983010018067",
  appId: "1:983010018067:web:57a7bc2b2b0372e37890e6",
  measurementId: "G-KJ30SM37Z5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "controle-de-acesso---cbs.firebaseapp.com",
  projectId: "controle-de-acesso---cbs",
  storageBucket: "controle-de-acesso---cbs.firebasestorage.app",
  messagingSenderId: "1010444702418",
  appId: "1:1010444702418:web:b4c41410772d122637d30b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
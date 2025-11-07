import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "wisemindsadmin.firebaseapp.com",
  databaseURL: "https://wisemindsadmin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wisemindsadmin",
  storageBucket: "wisemindsadmin.firebasestorage.app",
  messagingSenderId: "149980377851",
  appId: "1:149980377851:web:c27b24a0cb00564e14b65e",
  measurementId: "G-LPVX749JKR"
};

export const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const sb = getStorage(app);
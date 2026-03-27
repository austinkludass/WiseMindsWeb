import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

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
export const functions = getFunctions(app, "australia-southeast1");
export const sb = getStorage(app);
export const messaging = getMessaging(app);

// Local dev: start emulators with `docker-compose up` (see Dockerfile.emulators)
if (window.location.hostname === "localhost") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
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
export const sb = getStorage(app);
export const messaging = getMessaging(app);

// Firestore emulator runs in Docker (native JAR has broken Netty on macOS 12 Intel).
// Start it with: docker run -d --name firestore-emulator -p 8080:8080 google/cloud-sdk:emulators gcloud emulators firestore start --host-port=0.0.0.0:8080 --project=bens-dev-wma
if (window.location.hostname === "localhost") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
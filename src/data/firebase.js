import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCS1y393ouUcF8zX4MB3B_79_LnH650StM",
  authDomain: "testappforwisemindsadmin.firebaseapp.com",
  databaseURL: "https://testappforwisemindsadmin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testappforwisemindsadmin",
  storageBucket: "testappforwisemindsadmin.firebasestorage.app",
  messagingSenderId: "221401094009",
  appId: "1:221401094009:web:4e145cb01ddbb4f4d741a8",
  measurementId: "G-72B7PB2YJ3"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
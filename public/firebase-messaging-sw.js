importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDG7qPVs5RFgoRzgbqDl4ylB_ZKRUS-X1k",
  authDomain: "wisemindsadmin.firebaseapp.com",
  projectId: "wisemindsadmin",
  storageBucket: "wisemindsadmin.firebasestorage.app",
  messagingSenderId: "149980377851",
  appId: "1:149980377851:web:c27b24a0cb00564e14b65e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
});

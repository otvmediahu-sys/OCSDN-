// ============================================================
// Ouchaks OCSDN - Firebase Configuration
// ============================================================
// IMPORTANT:
// Replace the placeholder values below with the Web App
// configuration from your Firebase Console.
//
// This file does NOT contain your Firebase Admin password
// or service-account private key.
// ============================================================

const firebaseConfig = {

  apiKey: "YOUR_FIREBASE_API_KEY",

  authDomain:
    "YOUR_PROJECT_ID.firebaseapp.com",

  projectId:
    "YOUR_PROJECT_ID",

  storageBucket:
    "YOUR_PROJECT_ID.firebasestorage.app",

  messagingSenderId:
    "YOUR_MESSAGING_SENDER_ID",

  appId:
    "YOUR_FIREBASE_APP_ID"

};


// ============================================================
// Firebase SDK imports
// ============================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// ============================================================
// Initialize Firebase
// ============================================================

const app = initializeApp(firebaseConfig);


// ============================================================
// Firebase Services
// ============================================================

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// ============================================================
// Make services available to the OCSDN application
// ============================================================

export {
  app,
  auth,
  db,
  storage
};

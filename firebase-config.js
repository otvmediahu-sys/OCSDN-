import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBO5LgvMnQI-jMtuJYLW0CKOABUKUsXuQ",
  authDomain: "ouchaks-ocsdn.firebaseapp.com",
  projectId: "ouchaks-ocsdn",
  storageBucket: "ouchaks-ocsdn.firebasestorage.app",
  messagingSenderId: "22564436960",
  appId: "1:22564436960:web:45385f4bc04ee8bb780985",
  measurementId: "G-6NCF6MSWPF"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  app,
  auth,
  db,
  storage
};

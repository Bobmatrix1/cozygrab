import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC7e6H468SWbdcuxgSZdDKk-9AvOlqAHTE",
  authDomain: "cozygrab-cb8f0.firebaseapp.com",
  projectId: "cozygrab-cb8f0",
  storageBucket: "cozygrab-cb8f0.firebasestorage.app",
  messagingSenderId: "740293166317",
  appId: "1:740293166317:web:3b09bcbcc5f3a921e038e4",
  measurementId: "G-6LJGRJYSG9"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app); 

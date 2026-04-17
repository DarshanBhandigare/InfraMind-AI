import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBDIdj0veNc0-icVZRK2aS_ATKb9yt2bIE",
  authDomain: "inframind-ai.firebaseapp.com",
  projectId: "inframind-ai",
  storageBucket: "inframind-ai.firebasestorage.app",
  messagingSenderId: "382306754129",
  appId: "1:382306754129:web:2476cc8e0f6482a17f6270",
  measurementId: "G-HP5GT1E0NX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics;

// Analytics only works in browser environments 
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { auth, db, storage, analytics };
export default app;
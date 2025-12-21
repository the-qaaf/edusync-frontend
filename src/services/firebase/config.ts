import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// ------------------------------------------------------------------
// Firebase Configuration
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCCOeRnQ94-GbPuNAQ00d-cg2OAAhJoHhA",
  authDomain: "school-ai-7eaa3.firebaseapp.com",
  projectId: "school-ai-7eaa3",
  storageBucket: "school-ai-7eaa3.firebasestorage.app",
  messagingSenderId: "42291399040",
  appId: "1:42291399040:web:6239d648f0e75adb755965",
};

// Helper to check if config is valid (for UI feedback)
export const isFirebaseConfigured = () => {
  return (
    typeof firebaseConfig.apiKey === "string" &&
    firebaseConfig.apiKey.length > 0
  );
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}

export { app, auth, db, storage };

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKevoZnhsx5R_KbMUyGSuD7V_6pkOVSt0",
  authDomain: "endterm-project-87a06.firebaseapp.com",
  projectId: "endterm-project-87a06",
  storageBucket: "endterm-project-87a06.appspot.com",
  messagingSenderId: "269215711232",
  appId: "1:269215711232:web:4dff56bd9257f8a61298e5",
  measurementId: "G-MJK60H014X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// Export the services you need
export { app, analytics, auth, db, storage };
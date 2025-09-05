// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYppRf_0Wv_W2ToGiYI7Nb0i0rEEH_n9Q",
  authDomain: "zenith-list.firebaseapp.com",
  projectId: "zenith-list",
  storageBucket: "zenith-list.firebasestorage.app",
  messagingSenderId: "356000800351",
  appId: "1:356000800351:web:80700858580fdda9b985ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize and export Firebase services
export const db = getFirestore(app);      // This is your Firestore database instance
export const auth = getAuth(app);     // This is your Authentication instance
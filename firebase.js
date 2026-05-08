// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnoQ7M8t9O02UNYcXHcznvpf7sHAB3AQ8",
  authDomain: "ensemble-c1f8c.firebaseapp.com",
  projectId: "ensemble-c1f8c",
  storageBucket: "ensemble-c1f8c.firebasestorage.app",
  messagingSenderId: "87436960116",
  appId: "1:87436960116:web:5a956922573352e12b8c21",
  measurementId: "G-ELQHZH1NHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const analytics = isBrowser ? getAnalytics(app) : null;
const firestore = getFirestore(app);

export { analytics, auth, firestore };


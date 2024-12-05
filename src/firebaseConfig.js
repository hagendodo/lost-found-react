import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBTL8dzakSAdkAVp6PYORQ2F0AeEeE7sLg",
  authDomain: "lostfound-a8675.firebaseapp.com",
  projectId: "lostfound-a8675",
  storageBucket: "lostfound-a8675.firebasestorage.app",
  messagingSenderId: "397253524821",
  appId: "1:397253524821:web:4a464caef89dd4a3e2c3dc",
  measurementId: "G-XBP4ZCRX9L",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, db, storage };

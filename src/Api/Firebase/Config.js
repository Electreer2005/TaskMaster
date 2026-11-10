import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase - VERIFICA QUE ESTÉ COMPLETA
const firebaseConfig = {
  apiKey: "AIzaSyCkko9ONjeTw7IvzL3J4-QmDrMqyFOCgQU",
  authDomain: "taskmaster-6bf01.firebaseapp.com",
  databaseURL: "https://taskmaster-6bf01-default-rtdb.firebaseio.com",
  projectId: "taskmaster-6bf01", 
  storageBucket: "taskmaster-6bf01.firebasestorage.app",
  messagingSenderId: "966772067530",
  appId: "1:966772067530:web:f510de6d7bc080946d7833",
  measurementId: "G-W61ZZ1HPP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANTE: Reemplaza esto con la configuración de tu propio proyecto de Firebase
// Puedes encontrarla en la configuración de tu proyecto en la consola de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSy...-Your-Key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "1:your-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});


export { auth, db, googleProvider };

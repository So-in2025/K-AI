
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANTE: Reemplaza esto con la configuración de tu propio proyecto de Firebase
// La encontraste en el "Paso 2" de la guía.
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_AUTH_DOMAIN_AQUI",
  projectId: "TU_PROJECT_ID_AQUI",
  storageBucket: "TU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI",
  appId: "TU_APP_ID_AQUI"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});


export { auth, db, googleProvider };
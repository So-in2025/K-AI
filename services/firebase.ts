
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración del proyecto de Firebase del usuario.
const firebaseConfig = {
  apiKey: "AIzaSyAVEAnKo_Mhn6clvjEOBXqCddUVISej3ik",
  authDomain: "kia-ia.firebaseapp.com",
  projectId: "kia-ia",
  storageBucket: "kia-ia.firebasestorage.app",
  messagingSenderId: "1049688942439",
  appId: "1:1049688942439:web:0b777351804ea2bd71b1c2",
  measurementId: "G-H625JY35NP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});


export { auth, db, googleProvider };
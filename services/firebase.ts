import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cargar configuración de forma segura desde variables de entorno para VITE
// Fix: Cast `import.meta` to `any` to resolve TypeScript errors when accessing `env`. This is a workaround for missing Vite client type definitions.
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validar que todas las variables de entorno estén presentes
const missingVars = Object.entries(firebaseConfig).filter(([, value]) => !value);

if (missingVars.length > 0) {
  const errorMessage = `Error: Faltan las siguientes variables de entorno de Firebase: ${missingVars.map(([key]) => key).join(', ')}. Asegúrate de configurarlas en Netlify.`;
  console.error(errorMessage);
  // Esto detendrá la ejecución si faltan claves, lo que es más seguro.
  throw new Error(errorMessage);
}


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});


export { auth, db, googleProvider };
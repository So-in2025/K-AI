declare global {
    interface ImportMetaEnv {
        readonly VITE_FIREBASE_PUBLIC_KEY: string;
        readonly VITE_FIREBASE_AUTH_DOMAIN: string;
        readonly VITE_FIREBASE_PROJECT_ID: string;
        readonly VITE_FIREBASE_STORAGE_BUCKET: string;
        readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
        readonly VITE_FIREBASE_APP_ID: string;
        readonly VITE_FIREBASE_MEASUREMENT_ID: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_PUBLIC_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let db: Firestore | null = null;
let firebaseInitializationError: string | null = null;

try {
  const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
  const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno de Firebase: VITE_FIREBASE_${missingKeys.map(k => k.toUpperCase()).join(', VITE_FIREBASE_')}.`);
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);

} catch (error: any) {
  console.error("Error al inicializar Firebase:", error);
  firebaseInitializationError = `Error de Configuración de Firebase: ${error.message} Asegúrate de que todas las variables de entorno VITE_FIREBASE_* estén correctamente configuradas en tu proveedor de hosting (ej. Netlify).`;
  app = null;
  auth = null;
  googleProvider = null;
  db = null;
}

export { app, auth, googleProvider, db, firebaseInitializationError };

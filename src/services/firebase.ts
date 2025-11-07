// Fix: Manually define types for import.meta.env as the vite/client types could not be resolved.
// By using `declare global`, we augment the global ImportMeta type instead of declaring a new one in this module's scope.
declare global {
    interface ImportMetaEnv {
        // THIS IS THE FIX: Using the new, clearer variable name you requested.
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

// Your web app's Firebase configuration
const firebaseConfig = {
  // THIS IS THE FIX: Using the new, clearer variable name.
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
  // Check if all required Firebase config keys are present.
  const requiredConfig: Record<string, string | undefined> = {
    VITE_FIREBASE_PUBLIC_KEY: firebaseConfig.apiKey,
    VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
    VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  };

  const missingKeys = Object.keys(requiredConfig).filter(key => !requiredConfig[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno de Firebase: ${missingKeys.join(', ')}.`);
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);

} catch (error: any) {
  console.error("Error al inicializar Firebase:", error);
  firebaseInitializationError = `Error de Configuración de Firebase: ${error.message} Asegúrate de que todas las variables de entorno VITE_FIREBASE_* estén correctamente configuradas en tu proveedor de hosting (ej. Netlify).`;
  // Set services to null so the app can handle this state gracefully
  app = null;
  auth = null;
  googleProvider = null;
  db = null;
}

export { app, auth, googleProvider, db, firebaseInitializationError };
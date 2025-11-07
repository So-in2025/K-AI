import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { UserProvider } from './contexts/UserContext.tsx';
import './index.css';
import { firebaseInitializationError } from './services/firebase.ts';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento raíz para montar la aplicación.");
}

const root = ReactDOM.createRoot(rootElement);

if (firebaseInitializationError) {
  root.render(
    <React.StrictMode>
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white p-4">
        <div className="max-w-2xl bg-slate-800 p-8 rounded-lg border border-red-500 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Crítico de Configuración</h1>
          <p className="text-slate-300">{firebaseInitializationError}</p>
          <p className="mt-4 text-sm text-slate-400">
            Una vez que hayas configurado las variables en tu hosting, por favor, redespliega tu sitio.
          </p>
        </div>
      </div>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <UserProvider>
        <App />
      </UserProvider>
    </React.StrictMode>
  );
}
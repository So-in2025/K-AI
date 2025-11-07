import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { UserProvider } from './contexts/UserContext.tsx';
import './index.css';

// Nota: Se ha vaciado el archivo 'AppContext.tsx'. Este archivo era un remanente
// que estaba causando un error de compilación e impedía que la aplicación se cargara.
// La aplicación ahora usa exclusivamente UserProvider y UserContext para funcionar correctamente.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento raíz para montar la aplicación.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

import React from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import { KiaIcon } from '../components/KiaIcon.tsx';
import { firebaseInitializationError } from '../services/firebase.ts';

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.519-3.487-11.181-8.26l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.011 35.797 44 30.134 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


export const LoginView: React.FC = () => {
  const { login, loading } = useUser();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
        console.error("Falló el inicio de sesión:", error);
        // User-facing errors for auth problems are now handled here
        alert('Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="text-center max-w-lg">
        <KiaIcon className="h-24 w-24 text-teal-400 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Bienvenido a KIA</h1>
        <p className="text-slate-300 text-lg mb-8">
          Tu santuario digital y compañero de sanación. Un espacio para cultivar Amabilidad, Introspección y Conciencia.
        </p>
        
        {firebaseInitializationError ? (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg text-left">
            <h3 className="font-bold text-red-400">Acción Requerida (para el dueño de la app)</h3>
            <p className="text-sm text-slate-300 mt-2">{firebaseInitializationError}</p>
          </div>
        ) : loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={!!firebaseInitializationError}
            className="bg-white text-slate-800 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-slate-200 transition-colors flex items-center justify-center mx-auto disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            <span>Iniciar Sesión con Google</span>
          </button>
        )}
      </div>
    </div>
  );
};
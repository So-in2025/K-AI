
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { KiaIcon } from '../components/KiaIcon';

const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.596 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

export const LoginView: React.FC = () => {
    const { login } = useUser();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-4">
            <div className="text-center animate-fade-in-up">
                <KiaIcon className="h-20 w-20 text-teal-400 mx-auto" />
                <h1 className="text-4xl font-bold text-slate-100 mt-4 tracking-wider">KIA</h1>
                <p className="font-semibold text-teal-300">Kindness, Introspection, Awareness</p>
                <p className="text-slate-400 mt-6 max-w-md">
                    Tu santuario digital y compañero de sanación. Inicia sesión para continuar tu viaje.
                </p>

                <button
                    onClick={login}
                    className="mt-8 bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-colors flex items-center mx-auto"
                >
                    <GoogleIcon />
                    Iniciar sesión con Google
                </button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
};

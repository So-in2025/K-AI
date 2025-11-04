import React, { useState } from 'react';

interface ApiKeyModalProps {
    onSave: (apiKey: string, remember: boolean) => void;
    onClose: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!apiKey.trim()) {
            setError('Por favor, introduce una API Key válida.');
            return;
        }
        setError('');
        onSave(apiKey, remember);
    };

    const hasExistingKey = !!(localStorage.getItem('geminiApiKey') || sessionStorage.getItem('geminiApiKey'));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto animate-fade-in-up text-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-100">Configuración de IA</h2>
                    {hasExistingKey && (
                         <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                    )}
                </div>

                <p className="text-slate-400 mb-4">Para activar las funciones de inteligencia artificial, como el análisis personalizado y los consejos, necesitas una API Key de Google AI Studio.</p>

                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="block text-center w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4">
                    Obtén tu API Key gratuita
                </a>

                <div className="mb-4">
                    <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-1">
                        Tu API Key de Gemini
                    </label>
                    <input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Pega tu clave aquí"
                        className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-teal-500 transition-shadow"
                    />
                     {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                </div>
                
                <div className="flex items-center justify-between mb-6">
                    <label htmlFor="remember" className="flex items-center text-sm text-slate-300 cursor-pointer">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="h-4 w-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
                        />
                        <span className="ml-2">Recordar en este navegador</span>
                    </label>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Guardar y Continuar
                </button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
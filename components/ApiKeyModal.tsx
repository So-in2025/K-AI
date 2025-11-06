import React, { useState } from 'react';
import { saveApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
    onClose: () => void;
    onSave: (key: string) => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSave }) => {
    const [key, setKey] = useState('');

    const handleSave = (forSession: boolean) => {
        if (key.trim()) {
            saveApiKey(key, forSession);
            onSave(key);
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto animate-fade-in-up text-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-100">Configura tu API Key</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                    KIA necesita tu propia API Key de Google Gemini para funcionar. Esto asegura que tu uso sea privado y no dependa de la clave del desarrollador.
                </p>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-teal-400 hover:underline mb-4 block">
                    Obtén tu API Key gratuita aquí &rarr;
                </a>
                
                <div className="mb-4">
                    <label htmlFor="apiKeyInput" className="block text-sm font-medium text-slate-300 mb-1">Tu API Key de Gemini</label>
                    <input
                        id="apiKeyInput"
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Pega tu clave aquí"
                        className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg"
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                     <button
                        onClick={() => handleSave(false)}
                        disabled={!key.trim()}
                        className="flex-1 bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 disabled:bg-slate-500"
                    >
                        Guardar en este dispositivo
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={!key.trim()}
                        className="flex-1 bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-slate-500 disabled:bg-slate-500"
                    >
                        Guardar solo para esta sesión
                    </button>
                </div>
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

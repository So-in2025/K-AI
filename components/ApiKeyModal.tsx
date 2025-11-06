import React, { useState, useEffect } from 'react';
import ttsService from '../services/ttsService';
import { ITtsSettings } from '../types';

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
    const [apiKeyError, setApiKeyError] = useState('');
    
    // TTS Settings State
    const [ttsSettings, setTtsSettings] = useState<ITtsSettings | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        // give it a moment for voices to load from the browser
        const timer = setTimeout(() => {
            setTtsSettings(ttsService.getSettings());
            setVoices(ttsService.getAvailableVoices());
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSave = () => {
        if (!apiKey.trim()) {
            setApiKeyError('Por favor, introduce una API Key válida.');
            return;
        }
        setApiKeyError('');
        onSave(apiKey, remember);
    };

    const handleTtsChange = (change: Partial<ITtsSettings>) => {
        if (!ttsSettings) return;
        const newSettings = { ...ttsSettings, ...change };
        setTtsSettings(newSettings);
        ttsService.updateSettings(newSettings);
    };

    const handleTestVoice = () => {
        ttsService.speak("Hola, esta es una prueba de mi voz.");
    };

    const hasExistingKey = !!(localStorage.getItem('geminiApiKey') || sessionStorage.getItem('geminiApiKey'));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto animate-fade-in-up text-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-100">Configuración</h2>
                    {hasExistingKey && (
                         <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                    )}
                </div>

                {/* API Key Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-teal-300 mb-2">IA de Gemini</h3>
                    <p className="text-slate-400 mb-4 text-sm">Para activar las funciones de inteligencia artificial, necesitas una API Key de Google AI Studio.</p>

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
                         {apiKeyError && <p className="text-red-400 text-xs mt-1">{apiKeyError}</p>}
                    </div>
                    
                    <div className="flex items-center justify-between">
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
                </div>

                 <hr className="border-slate-600 my-6" />

                {/* TTS Settings Section */}
                {ttsSettings && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-teal-300 mb-2">Configuración de Voz (TTS)</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="voiceSelect" className="block text-sm font-medium text-slate-300 mb-1">Narrador</label>
                                <select 
                                    id="voiceSelect"
                                    value={ttsSettings.voiceName || ''}
                                    onChange={(e) => handleTtsChange({ voiceName: e.target.value })}
                                    className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg"
                                >
                                    {voices.map(voice => (
                                        <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="rate" className="block text-sm font-medium text-slate-300 mb-1">Velocidad: {ttsSettings.rate.toFixed(1)}</label>
                                <input type="range" id="rate" min="0.5" max="2" step="0.1" value={ttsSettings.rate} onChange={e => handleTtsChange({ rate: parseFloat(e.target.value) })} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div>
                                <label htmlFor="pitch" className="block text-sm font-medium text-slate-300 mb-1">Tono: {ttsSettings.pitch.toFixed(1)}</label>
                                <input type="range" id="pitch" min="0" max="2" step="0.1" value={ttsSettings.pitch} onChange={e => handleTtsChange({ pitch: parseFloat(e.target.value) })} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <button onClick={handleTestVoice} className="w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-500">
                                Probar Voz
                            </button>
                        </div>
                    </div>
                )}


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
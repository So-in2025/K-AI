import React, { useState, useEffect } from 'react';
import ttsService from '../services/ttsService';
import { ITtsSettings } from '../types';

interface SettingsModalProps {
    onClose: () => void;
    onOpenApiKeyModal: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenApiKeyModal }) => {
    const [ttsSettings, setTtsSettings] = useState<ITtsSettings | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        // Poll for voices, as they load asynchronously on mobile.
        const voiceInterval = setInterval(() => {
            const availableVoices = ttsService.getAvailableVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                setTtsSettings(ttsService.getSettings());
                clearInterval(voiceInterval);
            }
        }, 100);

        return () => clearInterval(voiceInterval);
    }, []);

    const handleTtsChange = (change: Partial<ITtsSettings>) => {
        if (!ttsSettings) return;
        const newSettings = { ...ttsSettings, ...change };
        setTtsSettings(newSettings);
        ttsService.updateSettings(newSettings);
    };

    const handleTestVoice = () => {
        ttsService.speak("Hola, esta es una prueba de mi voz.");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto animate-fade-in-up text-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-100">Configuración</h2>
                     <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-teal-300 mb-2">API Key de Gemini</h3>
                    <p className="text-sm text-slate-400 mb-3">
                        Tu clave personal para interactuar con la IA de Kai.
                    </p>
                    <button 
                        onClick={() => {
                            onClose(); // Close this modal first
                            onOpenApiKeyModal(); // Then open the other
                        }}
                        className="w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-500"
                    >
                        Cambiar API Key
                    </button>
                </div>


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
                                    {voices.length > 0 ? voices.map(voice => (
                                        <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
                                    )) : <option>Cargando voces...</option>}
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
                    onClick={onClose}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Cerrar
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
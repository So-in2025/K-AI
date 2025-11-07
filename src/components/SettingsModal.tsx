
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import ttsService from '../services/ttsService';
import { ITtsSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  onOpenApiKeyModal: () => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenApiKeyModal }) => {
    const { logout, userData } = useUser();
    const [ttsSettings, setTtsSettings] = useState<ITtsSettings>(ttsService.getSettings());
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        // Voices may load asynchronously
        const loadVoices = () => {
            const availableVoices = ttsService.getAvailableVoices();
            setVoices(availableVoices);

            if (!ttsSettings.voiceName && availableVoices.length > 0) {
                const spanishVoice = availableVoices.find(v => v.lang.startsWith('es-ES')) || availableVoices.find(v => v.lang.startsWith('es'));
                if (spanishVoice) {
                    handleSettingChange('voiceName', spanishVoice.name);
                }
            }
        };

        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []); // Run only once

    const handleSettingChange = (key: keyof ITtsSettings, value: any) => {
        setTtsSettings(prevSettings => {
            const newSettings = { ...prevSettings, [key]: value };
            ttsService.saveSettings(newSettings);
            return newSettings;
        });
    };
    
    const handleTestVoice = () => {
        ttsService.speak("Hola, esta es una prueba de mi voz.", ttsSettings);
    };

    const handleLogout = async () => {
        await logout();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-100">Configuración</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700">
                        <CloseIcon />
                    </button>
                </div>

                <div className="overflow-y-auto space-y-6 flex-grow pr-2 -mr-2">
                    {/* API Key Section */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-teal-400">API Key de Gemini</h3>
                        <p className="text-sm text-slate-400">Tu API Key es necesaria para que Kai, tu compañero de IA, funcione correctamente.</p>
                        <button onClick={onOpenApiKeyModal} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            Gestionar API Key
                        </button>
                    </div>

                    {/* TTS Settings Section */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-teal-400">Voz de Kai (TTS)</h3>
                        
                        <div>
                            <label htmlFor="voice-select" className="block text-sm font-medium text-slate-300 mb-1">Voz</label>
                            <select
                                id="voice-select"
                                value={ttsSettings.voiceName || ''}
                                onChange={(e) => handleSettingChange('voiceName', e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="">Voz por defecto del navegador</option>
                                {voices.map(voice => (
                                    <option key={voice.name} value={voice.name}>
                                        {`${voice.name} (${voice.lang})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="rate-slider" className="block text-sm font-medium text-slate-300">Velocidad: {ttsSettings.rate.toFixed(1)}</label>
                            <input
                                id="rate-slider"
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={ttsSettings.rate}
                                onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <label htmlFor="pitch-slider" className="block text-sm font-medium text-slate-300">Tono: {ttsSettings.pitch.toFixed(1)}</label>
                            <input
                                id="pitch-slider"
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={ttsSettings.pitch}
                                onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        
                        <button onClick={handleTestVoice} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            Probar Voz
                        </button>
                    </div>
                    
                    {/* Account Section */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-teal-400">Cuenta</h3>
                         <p className="text-sm text-slate-400">Conectado como {userData?.displayName || userData?.email}</p>
                        <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
                
                <div className="text-center text-xs text-slate-500 pt-4 mt-auto flex-shrink-0">
                    <p>KIA: Kindness, Introspection, Awareness</p>
                    <p>Versión 1.0.0</p>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .appearance-none {
                    -webkit-appearance: none;
                    appearance: none;
                }
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #2dd4bf; /* teal-400 */
                    cursor: pointer;
                    border-radius: 50%;
                }

                input[type='range']::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #2dd4bf; /* teal-400 */
                    cursor: pointer;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

export default SettingsModal;

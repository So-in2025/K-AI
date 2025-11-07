import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import ttsService from '../services/ttsService.ts';
import { ITtsSettings } from '../types.ts';

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
  const { user, logout, userData } = useUser();
  const [ttsSettings, setTtsSettings] = useState<ITtsSettings>(ttsService.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const availableVoices = ttsService.getAvailableVoices();
    if (availableVoices.length) {
      setVoices(availableVoices);
    } else if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(ttsService.getAvailableVoices());
      };
    }
  }, []);
  
  const handleTtsChange = (key: keyof ITtsSettings, value: string | number) => {
      const newSettings = { ...ttsSettings, [key]: value };
      setTtsSettings(newSettings);
      ttsService.saveSettings(newSettings);
  };
  
  const handleTestVoice = () => {
      ttsService.speak("Hola, esta es una prueba de mi voz.", ttsSettings);
  };

  const spanishVoices = voices.filter(v => v.lang.startsWith('es'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Configuración</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
        </div>
        
        <div className="space-y-6">
            {user && (
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{user.displayName}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <button onClick={logout} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Cerrar Sesión</button>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold mb-2">API Key de Gemini</h3>
                <p className="text-sm text-slate-400 mb-2">Tu clave para activar las capacidades de IA de Kai.</p>
                <button onClick={onOpenApiKeyModal} className="bg-slate-700 text-teal-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-600">
                    {userData?.geminiApiKey ? "Cambiar API Key" : "Añadir API Key"}
                </button>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Ajustes de Voz de Kai (TTS)</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Voz</label>
                        <select
                            value={ttsSettings.voiceName || ''}
                            onChange={(e) => handleTtsChange('voiceName', e.target.value)}
                            className="w-full bg-slate-700 p-2 rounded"
                        >
                            <option value="">Voz por defecto del navegador</option>
                            {spanishVoices.map(voice => (
                                <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm text-slate-300 mb-1">Velocidad ({ttsSettings.rate})</label>
                            <input type="range" min="0.5" max="2" step="0.1" value={ttsSettings.rate} onChange={e => handleTtsChange('rate', parseFloat(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Tono ({ttsSettings.pitch})</label>
                            <input type="range" min="0" max="2" step="0.1" value={ttsSettings.pitch} onChange={e => handleTtsChange('pitch', parseFloat(e.target.value))} className="w-full" />
                        </div>
                    </div>
                    <button onClick={handleTestVoice} className="bg-slate-700 text-teal-400 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-slate-600">Probar Voz</button>
                </div>
            </div>
             {userData?.isSubscribed && (
                <div>
                    <h3 className="text-lg font-semibold text-yellow-400">KIA Plus Activado</h3>
                    <p className="text-sm text-slate-400">¡Gracias por tu apoyo! Disfruta de todas las funciones sin límites.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;
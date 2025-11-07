
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-100">Configura tu API Key de Gemini</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <CloseIcon />
          </button>
        </div>
        <p className="text-slate-400 mb-4">
          Para activar las funciones de IA de Kai, necesitas una API Key de Google AI Studio. Es gratis y fácil de obtener.
        </p>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
            Tu API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Pega tu API Key aquí"
          />
        </div>
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-teal-400 hover:underline text-sm block text-center mb-4"
        >
          Obtener una API Key de Google AI Studio 
        </a>
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          Guardar y Activar a Kai
        </button>
      </div>
    </div>
  );
};
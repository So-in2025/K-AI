import React, { useState } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { TtsInfoButton } from './TtsInfoButton';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" />
    </svg>
);

export const AffirmationGeneratorCard: React.FC = () => {
    const [userInput, setUserInput] = useState('');
    const [affirmation, setAffirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!userInput.trim()) {
            setError('Por favor, escribe cómo te sientes.');
            return;
        }
        
        setIsLoading(true);
        setAffirmation('');
        setError('');

        const prompt = `Actúa como un coach de recuperación empático. Basado en el siguiente sentimiento o situación de un usuario: "${userInput}", crea una afirmación positiva, corta y poderosa en primera persona (empezando con 'Yo...'). La afirmación debe ser inspiradora, dar fuerza y estar en español. No incluyas comillas ni explicaciones adicionales, solo la frase.`;

        try {
            const response = await getGeminiResponse(prompt);
            setAffirmation(response);
        } catch (err) {
            setError('No se pudo generar la afirmación. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Las palabras tienen poder. Esta herramienta es tu alquimista personal. Escribe cómo te sientes, sin filtros, y Kai transformará esa energía en una afirmación positiva y personalizada en primera persona, dándote una frase de poder para anclar tu intención." />
            <div className="flex items-center space-x-3 mb-3">
                <SparklesIcon />
                <h2 className="text-xl font-bold text-slate-100">Generador de Afirmaciones</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">¿Cómo te sientes? Escribe una palabra o frase para crear una afirmación personalizada que te dé fuerza.</p>
            
            <div className="flex flex-col space-y-3">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ej: con ansiedad, fuerte, con dudas..."
                    className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-teal-500 transition-shadow"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !userInput.trim()}
                    className="w-full bg-teal-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creando...' : 'Crear mi Afirmación'}
                </button>
            </div>

            {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}

            {isLoading && (
                 <div className="h-20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                 </div>
            )}

            {affirmation && !isLoading && (
                <div className="mt-4 bg-teal-900/50 border-l-4 border-teal-500 p-4 rounded-r-lg">
                    <p className="text-lg font-medium text-teal-300 italic">"{affirmation}"</p>
                </div>
            )}
        </div>
    );
};

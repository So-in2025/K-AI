import React, { useState } from 'react';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" />
    </svg>
);

export const AffirmationGeneratorCard: React.FC = () => {
    const { userData, geminiService, checkAndConsumeUsage } = useUser();
    const [userInput, setUserInput] = useState('');
    const [affirmation, setAffirmation] = useState('');
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!userData || !geminiService) return null;

    const handleGenerate = async () => {
        if (!userInput.trim()) { setError('Por favor, escribe cómo te sientes.'); return; }
        if (!checkAndConsumeUsage('affirmation_generator', 3)) return;
        
        setIsLoading(true);
        setError('');

        const prompt = `Actúa como un coach de TCC. Un usuario se siente: "${userInput}". Crea una afirmación positiva y corta en primera persona para contrarrestar ese sentimiento, seguida de "||" y una explicación breve de por qué es útil.`;

        try {
            const response = await geminiService.generateContent(prompt);
            const parts = response.split('||');
            setAffirmation(parts[0]?.trim() || response.trim());
            setExplanation(parts[1]?.trim() || '');
        } catch (err) { setError('No se pudo generar la afirmación.'); }
        finally { setIsLoading(false); }
    };

    const remainingUses = userData.isSubscribed ? -1 : (3 - (userData.usageTracker?.affirmation_generator?.count ?? 0));
    const canGenerate = userData.isSubscribed || remainingUses > 0;

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Escribe cómo te sientes, y Kai transformará esa energía en una afirmación positiva y personalizada para darte fuerza." />
            <div className="flex items-center space-x-3 mb-3">
                <SparklesIcon />
                <h2 className="text-xl font-bold text-slate-100">Generador de Afirmaciones</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">¿Cómo te sientes? Escribe una palabra o frase para crear una afirmación personalizada.</p>
            
            <div className="flex flex-col space-y-3">
                <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ej: con ansiedad, fuerte..." className="w-full p-2 bg-slate-700 rounded-lg" disabled={isLoading} />
                <button onClick={handleGenerate} disabled={isLoading || !userInput.trim() || !canGenerate} className="w-full bg-teal-600 text-white font-semibold py-3 rounded-lg hover:bg-teal-700 disabled:bg-slate-500">
                    {isLoading ? 'Creando...' : canGenerate ? 'Crear mi Afirmación' : 'Usos gratuitos agotados'}
                </button>
            </div>

            {!userData.isSubscribed && <p className="text-xs text-center text-slate-500 mt-2">Te quedan {remainingUses} usos gratuitos este mes.</p>}
            {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
            {isLoading && <div className="h-20 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div></div>}

            {affirmation && !isLoading && (
                <div className="mt-4 bg-teal-900/50 border-l-4 border-teal-500 p-4 rounded-r-lg">
                    <p className="text-lg font-medium text-teal-300 italic">"{affirmation}"</p>
                    {explanation && <p className="text-xs text-slate-400 mt-2">Kai sugiere esto porque: {explanation}</p>}
                </div>
            )}
        </div>
    );
};

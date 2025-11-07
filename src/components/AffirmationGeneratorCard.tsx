import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import { TtsInfoButton } from './TtsInfoButton.tsx';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a2.25 2.25 0 01-1.473-1.473L12 18.75l1.938-.648a2.25 2.25 0 011.473-1.473L17.5 15.75l.648 1.938a2.25 2.25 0 011.473 1.473L21.75 20.25l-1.938.648a2.25 2.25 0 01-1.473 1.473z" />
    </svg>
);

export const AffirmationGeneratorCard: React.FC = () => {
    const { geminiService, userData, checkAndConsumeUsage } = useUser();
    const [affirmation, setAffirmation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!geminiService || !checkAndConsumeUsage('affirmation_generator', 5)) return;

        setIsLoading(true);
        setAffirmation('');

        const prompt = `Crea una afirmación positiva, personal y poderosa para alguien que está trabajando en: ${userData?.onboardingData?.focuses.join(', ')}. Su principal desafío es: "${userData?.onboardingData?.mainChallenge}". La afirmación debe ser corta (1-2 frases) y en primera persona.`;
        
        try {
            const response = await geminiService.generateContent(prompt, "Eres un coach de vida especializado en PNL. Tu tono es inspirador y empoderador.");
            setAffirmation(response);
        } catch (error) {
            console.error("Error generating affirmation:", error);
            setAffirmation("Soy capaz de superar cualquier desafío con fuerza y serenidad.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full flex flex-col">
            <TtsInfoButton explanation="Las palabras tienen poder. Kai puede generar una afirmación positiva y personalizada para ti, basada en tu enfoque y desafíos. Úsala para re-cablear tu mente hacia la positividad." />
            <div className="flex items-center space-x-3 mb-3">
                <SparklesIcon />
                <h2 className="text-xl font-bold text-slate-100">Generador de Afirmaciones</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Recibe una afirmación personalizada de Kai para fortalecer tu mente.
            </p>
            
            {isLoading && <div className="text-center text-slate-300 my-4">Generando...</div>}
            
            {affirmation && !isLoading && (
                <div className="text-center p-4 my-4 bg-slate-700/50 rounded-lg">
                    <p className="text-lg italic text-white">"{affirmation}"</p>
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-auto bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-600"
            >
                {affirmation ? 'Generar Otra' : 'Generar Afirmación'}
            </button>
        </div>
    );
};
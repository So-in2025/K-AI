
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import { IMoodJournal, IMoodPlan } from '../types.ts';
import { TtsInfoButton } from './TtsInfoButton.tsx';

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.672l1.318-1.354a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);

const MoodJournalModal: React.FC<{
    onClose: () => void;
    onAnalyze: (transcript: string) => Promise<void>;
    isLoading: boolean;
}> = ({ onClose, onAnalyze, isLoading }) => {
    const [transcript, setTranscript] = useState('');

    const handleAnalyze = () => {
        if (transcript.trim()) {
            onAnalyze(transcript.trim());
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-2">Registro de Estado de Ánimo</h3>
                <p className="text-slate-400 text-sm mb-4">Haz un "vaciado mental". Escribe todo lo que sientes ahora, sin filtros. Kai lo analizará para darte un plan de acción.</p>
                <textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder="¿Qué hay en tu mente y en tu corazón en este momento?"
                    className="w-full h-40 bg-slate-700 p-2 rounded mb-4"
                    disabled={isLoading}
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="text-slate-400" disabled={isLoading}>Cancelar</button>
                    <button onClick={handleAnalyze} disabled={isLoading || !transcript.trim()} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-slate-500">
                        {isLoading ? 'Analizando...' : 'Analizar con Kai'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const MoodJournalCard: React.FC = () => {
    const { userData, updateUserData, geminiService } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const lastMood = userData?.moodJournal;

    const handleAnalyze = async (transcript: string) => {
        if (!geminiService) return;
        setIsLoading(true);

        const prompt = `Analiza el siguiente texto de un diario personal.
        1. Detecta el estado de ánimo principal (ej: "Ansiedad y Agobio", "Tristeza reflexiva", "Calma y gratitud", "Frustración e Impaciencia").
        2. Crea un plan de acción simple con 3 partes (Nutrición, Atuendo, Rutina) para apoyar ese estado de ánimo. Cada parte debe tener un título y una descripción breve y motivadora. Para Nutrición, añade un color (ej: "Verde para calmar").
        
        Texto: "${transcript}"
        
        Formatea la respuesta como un objeto JSON con las claves "detectedMood" (string) y "plan" (un objeto con claves "nutrition", "attire", "routine", cada una con "title", "description", y "color" para nutrición).`;

        try {
            const response = await geminiService.generateContent(prompt, "You are an empathetic wellness coach.", true);
            const { detectedMood, plan } = JSON.parse(response) as { detectedMood: string; plan: IMoodPlan };
            
            const newMoodJournal: IMoodJournal = {
                date: new Date().toISOString(),
                detectedMood,
                transcript,
                plan
            };
            updateUserData({ moodJournal: newMoodJournal });
        } catch (error) {
            console.error("Error analyzing mood:", error);
            alert("Hubo un error al analizar tu estado de ánimo.");
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="A veces es difícil nombrar lo que sentimos. Describe cómo te sientes y Kai analizará tus palabras, detectará tu estado de ánimo principal y te dará un micro-plan de acción para el día." />
            <div className="flex items-center space-x-3 mb-3">
                <HeartIcon />
                <h2 className="text-xl font-bold text-slate-100">Diario de Ánimo</h2>
            </div>
            {lastMood ? (
                <div>
                    <p className="text-slate-400 text-sm mb-2">Último registro: <span className="font-bold" style={{color: lastMood.plan.nutrition.color}}>{lastMood.detectedMood}</span></p>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-slate-200">{lastMood.plan.routine.title}</p>
                        <p className="text-xs text-slate-300">{lastMood.plan.routine.description}</p>
                    </div>
                </div>
            ) : (
                <p className="text-slate-400 text-sm">Registra cómo te sientes para que Kai te ofrezca un plan de acción personalizado.</p>
            )}
             <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
                Registrar Estado de Ánimo
            </button>
            {isModalOpen && <MoodJournalModal onClose={() => setIsModalOpen(false)} onAnalyze={handleAnalyze} isLoading={isLoading} />}
        </div>
    );
};
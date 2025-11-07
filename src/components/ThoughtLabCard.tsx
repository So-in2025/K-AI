
import React, { useState } from 'react';
import { useUser } from '/src/contexts/UserContext.tsx';
import { IThoughtLabEntry } from '/src/types.ts';
import { v4 as uuidv4 } from 'uuid';
import { TtsInfoButton } from '/src/components/TtsInfoButton.tsx';

const FlaskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 003.86.517l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100-4m0 4a2 2 0 110-4" />
    </svg>
);

const ThoughtLabModal: React.FC<{ onClose: () => void; onSave: (entry: Omit<IThoughtLabEntry, 'id'|'date'|'kaiAnalysis'>) => Promise<void> }> = ({ onClose, onSave }) => {
    const [situation, setSituation] = useState('');
    const [automaticThought, setAutomaticThought] = useState('');
    const [alternativeThought, setAlternativeThought] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (situation && automaticThought && alternativeThought) {
            setIsLoading(true);
            await onSave({ situation, automaticThought, alternativeThought });
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">Analizar Pensamiento</h3>
                <div className="space-y-3 text-sm">
                    <textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder="Situación: ¿Qué pasó?" className="w-full h-16 bg-slate-700 p-2 rounded" />
                    <textarea value={automaticThought} onChange={e => setAutomaticThought(e.target.value)} placeholder="Pensamiento Automático: ¿Qué te dijiste a ti mismo?" className="w-full h-20 bg-slate-700 p-2 rounded" />
                    <textarea value={alternativeThought} onChange={e => setAlternativeThought(e.target.value)} placeholder="Pensamiento Alternativo: ¿Cuál es otra forma de ver esto?" className="w-full h-20 bg-slate-700 p-2 rounded" />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="text-slate-400">Cancelar</button>
                    <button onClick={handleSave} disabled={isLoading} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-slate-500">
                        {isLoading ? 'Analizando...' : 'Guardar y Analizar con Kai'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ThoughtLabCard: React.FC = () => {
    const { userData, updateUserData, geminiService, checkAndConsumeUsage } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = async (entryData: Omit<IThoughtLabEntry, 'id'|'date'|'kaiAnalysis'>) => {
        if (!geminiService || !checkAndConsumeUsage('thought_lab', 3)) return;

        const prompt = `Analiza este pensamiento automático usando Terapia Cognitivo-Conductual. Identifica la distorsión cognitiva y valida la perspectiva alternativa. Sé breve (2-3 frases).
        Situación: "${entryData.situation}"
        Pensamiento Automático: "${entryData.automaticThought}"
        Pensamiento Alternativo: "${entryData.alternativeThought}"`;

        const analysis = await geminiService.generateContent(prompt, "You are a CBT therapist assistant.");

        const newEntry: IThoughtLabEntry = {
            ...entryData,
            id: uuidv4(),
            date: new Date().toISOString(),
            kaiAnalysis: analysis,
        };

        const updatedEntries = [...(userData?.thoughtLabEntries || []), newEntry];
        updateUserData({ thoughtLabEntries: updatedEntries });
        setIsModalOpen(false);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Nuestros pensamientos automáticos no siempre son la verdad. Este laboratorio te ayuda a capturar un pensamiento, analizarlo con la ayuda de Kai, y encontrar una perspectiva más equilibrada y útil." />
            <div className="flex items-center space-x-3 mb-3">
                <FlaskIcon />
                <h2 className="text-xl font-bold text-slate-100">Laboratorio de Pensamientos</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Examina tus pensamientos automáticos y re-escribe tus narrativas internas.
            </p>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
                Analizar un Pensamiento
            </button>
            {isModalOpen && <ThoughtLabModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};
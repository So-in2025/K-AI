import React, { useState } from 'react';
import { IHabitLoop } from '../types';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const LoopIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M5 9a7 7 0 107-7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 20v-5h-5M19 15a7 7 0 10-7 7" /></svg> );

export const HabitLoopCard: React.FC = () => {
    const { userData, geminiService, addHabitLoop, checkAndConsumeUsage } = useUser();
    const [isCreating, setIsCreating] = useState(false);
    const [step, setStep] = useState(1);
    const [currentLoop, setCurrentLoop] = useState<Partial<IHabitLoop>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    if (!userData || !geminiService) return null;

    const resetState = () => { setIsCreating(false); setStep(1); setCurrentLoop({}); setIsLoading(false); };
    
    const handleStart = () => {
        if (!checkAndConsumeUsage('habit_architect', 3)) return;
        setIsCreating(true);
    };

    const handleNext = async () => {
        setIsLoading(true);
        if (step === 2) { 
            const prompt = `Actúa como un coach de TCC. Un usuario está analizando un hábito. Señal: "${currentLoop.cue}". Rutina: "${currentLoop.oldRoutine}". Ayúdale a identificar la necesidad subyacente (el "craving") con una pregunta reflexiva. Responde solo con la pregunta.`;
            const cravingQuestion = await geminiService.generateContent(prompt);
            setCurrentLoop(prev => ({ ...prev, craving: cravingQuestion })); 
        }
        if (step === 4) {
            const prompt = `Un usuario ha rediseñado un bucle de hábito. Señal: "${currentLoop.cue}", Rutina Antigua: "${currentLoop.oldRoutine}", Nueva Rutina: "${currentLoop.newRoutine}", Recompensa: "${currentLoop.reward}". Escribe un breve párrafo de resumen y ánimo (2-3 frases).`;
            const summary = await geminiService.generateContent(prompt);
            setCurrentLoop(prev => ({...prev, kaiSummary: summary}));
        }
        setIsLoading(false);
        setStep(prev => prev + 1);
    };

    const handleSave = () => {
        const finalLoop: IHabitLoop = { id: crypto.randomUUID(), date: new Date().toISOString(), cue: currentLoop.cue || '', oldRoutine: currentLoop.oldRoutine || '', craving: currentLoop.craving || '', newRoutine: currentLoop.newRoutine || '', reward: currentLoop.reward || '', kaiSummary: currentLoop.kaiSummary || '' };
        addHabitLoop(finalLoop);
        resetState();
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-2">
                        <label className="text-sm">1. La Señal: ¿Qué acaba de pasar?</label>
                        <input type="text" value={currentLoop.cue || ''} onChange={e => setCurrentLoop(p => ({ ...p, cue: e.target.value }))} placeholder="Ej: Me senté en el sofá" className="w-full p-2 bg-slate-700 rounded-md" />
                        <label className="text-sm">2. La Rutina Antigua: ¿Qué hiciste?</label>
                        <input type="text" value={currentLoop.oldRoutine || ''} onChange={e => setCurrentLoop(p => ({ ...p, oldRoutine: e.target.value }))} placeholder="Ej: Abrí Instagram" className="w-full p-2 bg-slate-700 rounded-md" />
                    </div>
                );
            case 2:
                return (
                    <div>
                        <p className="text-sm text-slate-400">Kai pregunta:</p>
                        <p className="italic text-teal-300">"{currentLoop.craving}"</p>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-2">
                        <label className="text-sm">3. La Nueva Rutina: ¿Qué harás en su lugar?</label>
                        <input type="text" value={currentLoop.newRoutine || ''} onChange={e => setCurrentLoop(p => ({ ...p, newRoutine: e.target.value }))} placeholder="Ej: Leeré 2 páginas de un libro" className="w-full p-2 bg-slate-700 rounded-md" />
                        <label className="text-sm">4. La Recompensa: ¿Cómo te sentirás?</label>
                        <input type="text" value={currentLoop.reward || ''} onChange={e => setCurrentLoop(p => ({ ...p, reward: e.target.value }))} placeholder="Ej: Satisfecho y tranquilo" className="w-full p-2 bg-slate-700 rounded-md" />
                    </div>
                );
            case 4:
                return (
                    <div>
                        <p className="text-sm text-slate-400">Resumen de Kai:</p>
                        <p className="italic text-teal-300">"{currentLoop.kaiSummary}"</p>
                    </div>
                );
            case 5:
                return <p>¡Bucle rediseñado! Guárdalo para recordarlo.</p>;
            default:
                return null;
        }
    };

    const remainingUses = userData.isSubscribed ? -1 : (3 - (userData.usageTracker?.habit_architect?.count ?? 0));
    const canStart = userData.isSubscribed || remainingUses > 0;
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Todo hábito es un bucle: señal, rutina y recompensa. Para cambiar un hábito, necesitas identificar estos componentes. Esta herramienta te guía, con Kai, para deconstruir un bucle y diseñar uno nuevo y constructivo." />
            <div className="flex items-center space-x-3 mb-3"><LoopIcon /><h2 className="text-xl font-bold text-slate-100">Arquitecto de Hábitos</h2></div>
            {!isCreating ? (
                <>
                    <p className="text-slate-400 mb-4 text-sm">Deconstruye un hábito (Señal → Rutina → Recompensa) y diseña un nuevo bucle constructivo.</p>
                    <button onClick={handleStart} disabled={!canStart} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 rounded-lg hover:bg-teal-600/30 disabled:opacity-50">{canStart ? 'Analizar un Hábito' : 'Usos gratuitos agotados'}</button>
                    {!userData.isSubscribed && <p className="text-xs text-center text-slate-500 mt-2">Te quedan {remainingUses} usos gratuitos este mes.</p>}
                </>
            ) : (
                <div>
                    {renderStepContent()}
                    <div className="flex justify-between mt-4">
                        <button onClick={resetState} className="text-sm text-slate-400">Cancelar</button>
                        {step < 5 ? ( <button onClick={handleNext} disabled={isLoading} className="bg-teal-600 font-semibold text-white px-4 py-1 rounded-lg disabled:bg-slate-500">{isLoading ? "..." : "Siguiente"}</button> ) : ( <button onClick={handleSave} className="bg-teal-600 font-semibold text-white px-4 py-1 rounded-lg">Guardar Bucle</button> )}
                    </div>
                </div>
            )}
        </div>
    );
};

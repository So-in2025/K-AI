
import React, { useState } from 'react';
import { IHabitLoop } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import { TtsInfoButton } from './TtsInfoButton';

const LoopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M5 9a7 7 0 107-7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 20v-5h-5M19 15a7 7 0 10-7 7" />
    </svg>
);

interface HabitLoopCardProps {
    apiKey: string | null;
    loops: IHabitLoop[];
    onAddLoop: (loop: IHabitLoop) => void;
}

export const HabitLoopCard: React.FC<HabitLoopCardProps> = ({ apiKey, loops, onAddLoop }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [step, setStep] = useState(1);
    const [currentLoop, setCurrentLoop] = useState<Partial<IHabitLoop>>({});
    const [isLoading, setIsLoading] = useState(false);

    const resetState = () => {
        setIsCreating(false);
        setStep(1);
        setCurrentLoop({});
        setIsLoading(false);
    };

    const handleNext = async () => {
        if (step === 2) { 
            setIsLoading(true);
            const prompt = `
                Actúa como un coach de TCC. Un usuario está analizando un hábito. La señal que lo activa es: "${currentLoop.cue}". La rutina que sigue es: "${currentLoop.oldRoutine}".
                Ayúdale a identificar la necesidad o recompensa subyacente (el "craving"). Hazle una pregunta reflexiva.
                Ejemplo: "Gracias por compartir eso. Y cuando haces [rutina], ¿qué sentimiento o alivio estás buscando realmente? ¿Es escapar del estrés, buscar conexión, aliviar el aburrimiento?".
                Responde solo con la pregunta.
            `;
            const cravingQuestion = await getGeminiResponse(apiKey, prompt);
            setCurrentLoop(prev => ({ ...prev, craving: cravingQuestion })); 
            setIsLoading(false);
        }
         if (step === 4) { // Moving to final summary
            setIsLoading(true);
            const prompt = `
                Un usuario ha rediseñado un bucle de hábito.
                - Señal: "${currentLoop.cue}"
                - Rutina Antigua: "${currentLoop.oldRoutine}"
                - Nueva Rutina: "${currentLoop.newRoutine}"
                - Recompensa buscada: "${currentLoop.reward}"
                Escribe un breve párrafo de resumen y ánimo (2-3 frases) que valide su trabajo.
                Ejemplo: "Excelente trabajo de introspección. Has identificado que [Señal] te llevaba a [Rutina Antigua] para buscar [Recompensa]. Al reemplazarlo con [Nueva Rutina], estás atendiendo esa misma necesidad de una forma que te fortalece. Cada vez que elijas la nueva rutina, estarás reforzando este nuevo camino."
            `;
            const summary = await getGeminiResponse(apiKey, prompt);
            setCurrentLoop(prev => ({...prev, kaiSummary: summary}));
            setIsLoading(false);
        }
        setStep(prev => prev + 1);
    };

    const handleSave = () => {
        const finalLoop: IHabitLoop = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            cue: currentLoop.cue || '',
            oldRoutine: currentLoop.oldRoutine || '',
            craving: currentLoop.craving || '',
            newRoutine: currentLoop.newRoutine || '',
            reward: currentLoop.reward || '',
            kaiSummary: currentLoop.kaiSummary || ''
        };
        onAddLoop(finalLoop);
        resetState();
    };
    
    const renderStepContent = () => {
        switch(step) {
            case 1: return (
                <div>
                    <label className="text-sm font-semibold">La Señal (El detonante)</label>
                    <p className="text-xs text-slate-400 mb-2">¿Qué pasa justo antes de que empiece el hábito? (Un lugar, una hora, una emoción).</p>
                    <input value={currentLoop.cue || ''} onChange={e => setCurrentLoop(p => ({...p, cue: e.target.value}))} className="w-full p-2 bg-slate-700 rounded-md" />
                </div>
            );
            case 2: return (
                <div>
                    <label className="text-sm font-semibold">La Rutina (El hábito en sí)</label>
                    <p className="text-xs text-slate-400 mb-2">Describe la acción o comportamiento que quieres cambiar.</p>
                    <input value={currentLoop.oldRoutine || ''} onChange={e => setCurrentLoop(p => ({...p, oldRoutine: e.target.value}))} className="w-full p-2 bg-slate-700 rounded-md" />
                </div>
            );
            case 3: return (
                 <div>
                     <label className="text-sm font-semibold">La Recompensa (La necesidad real)</label>
                     <p className="text-xs text-slate-400 mb-2">Kai te pregunta para reflexionar:</p>
                     <p className="text-teal-300 italic mb-2">{isLoading ? "Analizando..." : currentLoop.craving}</p>
                     <input placeholder="Escribe aquí tu reflexión..." value={currentLoop.reward || ''} onChange={e => setCurrentLoop(p => ({...p, reward: e.target.value}))} className="w-full p-2 bg-slate-700 rounded-md" />
                </div>
            );
            case 4: return (
                <div>
                    <label className="text-sm font-semibold">Diseña tu Nueva Rutina</label>
                    <p className="text-xs text-slate-400 mb-2">¿Qué acción constructiva puedes hacer en su lugar para obtener una recompensa similar?</p>
                    <input placeholder="Ej: Llamar a un amigo, salir a caminar 5 min..." value={currentLoop.newRoutine || ''} onChange={e => setCurrentLoop(p => ({...p, newRoutine: e.target.value}))} className="w-full p-2 bg-slate-700 rounded-md" />
                </div>
            );
            case 5: return (
                 <div>
                     <label className="text-sm font-semibold">Resumen de Kai</label>
                     <p className="text-xs text-slate-400 mb-2">Este es tu nuevo plan de acción:</p>
                     <p className="text-teal-300 italic whitespace-pre-wrap">{isLoading ? "Generando resumen..." : currentLoop.kaiSummary}</p>
                </div>
            );
        }
    };
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Esta es una herramienta de neurociencia avanzada. Todo hábito es un bucle de tres pasos: una señal, una rutina y una recompensa. Para cambiar un hábito, necesitas identificar estos tres componentes. Esta herramienta te guía, con la ayuda de Kai, para deconstruir un bucle destructivo y diseñar conscientemente una nueva rutina que te dé una recompensa similar, pero de una forma constructiva. Es la ingeniería inversa de tus patrones." />
            <div className="flex items-center space-x-3 mb-3">
                <LoopIcon />
                <h2 className="text-xl font-bold text-slate-100">Arquitecto de Hábitos</h2>
            </div>
            {!isCreating ? (
                <>
                    <p className="text-slate-400 mb-4 text-sm">Una herramienta para deconstruir un hábito (Señal → Rutina → Recompensa) y diseñar un nuevo bucle constructivo.</p>
                    <button onClick={() => setIsCreating(true)} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg hover:bg-teal-600/30">
                        Analizar un Hábito
                    </button>
                </>
            ) : (
                <div>
                    {renderStepContent()}
                    <div className="flex justify-between mt-4">
                        <button onClick={resetState} className="text-sm text-slate-400">Cancelar</button>
                        {step < 5 ? (
                             <button onClick={handleNext} disabled={isLoading} className="bg-teal-600 font-semibold text-white px-4 py-1 rounded-lg disabled:bg-slate-500">
                                {isLoading ? "..." : "Siguiente"}
                            </button>
                        ) : (
                            <button onClick={handleSave} className="bg-teal-600 font-semibold text-white px-4 py-1 rounded-lg">Guardar Bucle</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

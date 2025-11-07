
import React, { useState } from 'react';
import { useUser } from '/src/contexts/UserContext.tsx';
import { IHabitLoop } from '/src/types.ts';
import { v4 as uuidv4 } from 'uuid';
import { TtsInfoButton } from '/src/components/TtsInfoButton.tsx';

const LoopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
    </svg>
);

const HabitLoopModal: React.FC<{ onClose: () => void; onSave: (loop: Omit<IHabitLoop, 'id' | 'date'>) => void }> = ({ onClose, onSave }) => {
    const [cue, setCue] = useState('');
    const [craving, setCraving] = useState('');
    const [oldRoutine, setOldRoutine] = useState('');
    const [newRoutine, setNewRoutine] = useState('');
    const [reward, setReward] = useState('');

    const handleSave = () => {
        if (cue && oldRoutine && newRoutine && reward) {
            onSave({ cue, craving, oldRoutine, newRoutine, reward });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">Analizar Bucle de Hábito</h3>
                <div className="space-y-3 text-sm">
                    <input type="text" value={cue} onChange={e => setCue(e.target.value)} placeholder="Señal (¿Qué lo dispara?)" className="w-full bg-slate-700 p-2 rounded" />
                    <input type="text" value={craving} onChange={e => setCraving(e.target.value)} placeholder="Anhelo (¿Qué necesidad buscas cubrir?)" className="w-full bg-slate-700 p-2 rounded" />
                    <input type="text" value={oldRoutine} onChange={e => setOldRoutine(e.target.value)} placeholder="Tu Rutina Antigua" className="w-full bg-slate-700 p-2 rounded" />
                    <input type="text" value={newRoutine} onChange={e => setNewRoutine(e.target.value)} placeholder="Tu Nueva Rutina Positiva" className="w-full bg-slate-700 p-2 rounded" />
                    <input type="text" value={reward} onChange={e => setReward(e.target.value)} placeholder="Recompensa (¿Qué obtienes al final?)" className="w-full bg-slate-700 p-2 rounded" />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="text-slate-400">Cancelar</button>
                    <button onClick={handleSave} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg">Guardar y Analizar</button>
                </div>
            </div>
        </div>
    );
};


export const HabitLoopCard: React.FC = () => {
    const { userData, updateUserData, geminiService, checkAndConsumeUsage } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const lastHabit = userData?.habitLoops?.[(userData.habitLoops.length || 0) - 1];

    const handleSave = async (loopData: Omit<IHabitLoop, 'id' | 'date'>) => {
        if (!geminiService || !checkAndConsumeUsage('habit_architect', 3)) {
            setIsModalOpen(false);
            return;
        }

        setIsLoading(true);
        setIsModalOpen(false);
        
        const newHabitLoop: IHabitLoop = { ...loopData, id: uuidv4(), date: new Date().toISOString() };

        const prompt = `Analiza este bucle de hábito y da un resumen de 1-2 frases con un consejo práctico.
        Señal: ${loopData.cue}
        Anhelo: ${loopData.craving}
        Rutina Antigua: ${loopData.oldRoutine}
        Nueva Rutina: ${loopData.newRoutine}
        Recompensa: ${loopData.reward}`;

        try {
            const summary = await geminiService.generateContent(prompt, "You are a habit change expert based on Charles Duhigg's work.");
            newHabitLoop.kaiSummary = summary;
        } catch (error) {
            console.error("Error analyzing habit loop:", error);
        }

        const updatedLoops = [...(userData?.habitLoops || []), newHabitLoop];
        updateUserData({ habitLoops: updatedLoops });
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Todo hábito sigue un ciclo: Señal, Rutina, Recompensa. Usa esta herramienta para desarmar un hábito no deseado y construir uno nuevo y positivo, manteniendo la misma recompensa." />
            <div className="flex items-center space-x-3 mb-3">
                <LoopIcon />
                <h2 className="text-xl font-bold text-slate-100">Arquitecto de Hábitos</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Deconstruye un hábito y diséñalo a tu favor.
            </p>

            {isLoading && <p className="text-sm text-slate-300">Kai está analizando tu hábito...</p>}

            {lastHabit?.kaiSummary && !isLoading && (
                 <div className="bg-slate-700/50 p-3 rounded-lg mt-2">
                    <p className="text-xs text-teal-300 font-bold">Análisis de Kai:</p>
                    <p className="text-sm text-slate-200 italic">"{lastHabit.kaiSummary}"</p>
                </div>
            )}
            
            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
                Analizar un Hábito
            </button>

            {isModalOpen && <HabitLoopModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { IDopamineHit, IDopamineQuest } from '../types';
import { DOPAMINE_QUESTS } from '../constants';
import { TtsInfoButton } from './TtsInfoButton';

const BrainCircuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v.01M12 15v.01" />
    </svg>
);

interface DopamineSanctuaryCardProps {
    onLogHit: (hit: IDopamineHit) => void;
}

export const DopamineSanctuaryCard: React.FC<DopamineSanctuaryCardProps> = ({ onLogHit }) => {
    const [activeQuest, setActiveQuest] = useState<IDopamineQuest | null>(null);
    const [textInput, setTextInput] = useState('');
    const [timer, setTimer] = useState(60);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        let interval: number | undefined;
        if (isTimerActive && timer > 0) {
            interval = window.setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);

    const handleStartQuest = (quest: IDopamineQuest) => {
        setActiveQuest(quest);
        if (quest.id === 'mindfulness') {
            setTimer(60);
            setIsTimerActive(true);
        }
    };

    const handleCompleteQuest = () => {
        if (!activeQuest) return;

        const newHit: IDopamineHit = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            activity: activeQuest.activityLogName,
            // FIX: Add the missing 'category' property from the active quest.
            category: activeQuest.category,
        };
        onLogHit(newHit);
        
        // Reset state
        setActiveQuest(null);
        setTextInput('');
        setTimer(60);
        setIsTimerActive(false);
    };

    const isCompletionValid = () => {
        if (!activeQuest) return false;
        switch (activeQuest.id) {
            case 'gratitude':
            case 'victory':
                return textInput.trim().length >= 10;
            case 'mindfulness':
                return timer === 0;
            default:
                return false;
        }
    };

    const renderQuestContent = () => {
        if (!activeQuest) return null;

        switch (activeQuest.id) {
            case 'gratitude':
            case 'victory':
                return (
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Escribe tu reflexión aquí..."
                        className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                );
            case 'mindfulness':
                return (
                    <div className="text-center">
                        <p className="text-4xl font-bold font-mono text-teal-300">{timer}</p>
                        <p className="text-sm text-slate-400">Observa tu entorno. Siente tu respiración.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Este es tu Santuario de Dopamina. En lugar de solo registrar, aquí practicas. Completa una 'Misión' guiada para generar una recompensa natural en tu cerebro. Tu progreso solo se registra cuando la tarea se completa de verdad, entrenando activamente las autopistas neuronales del bienestar." />
            <div className="flex items-center space-x-3 mb-3">
                <BrainCircuitIcon />
                <h2 className="text-xl font-bold text-slate-100">Santuario de Dopamina</h2>
            </div>
            
            {!activeQuest ? (
                <>
                    <p className="text-slate-400 mb-4 text-sm">Completa una misión para entrenar tu cerebro y registrar una fuente de bienestar.</p>
                    <div className="space-y-2">
                        {DOPAMINE_QUESTS.map(quest => (
                            <button
                                key={quest.id}
                                onClick={() => handleStartQuest(quest)}
                                className="w-full text-left p-3 rounded-lg border-2 border-slate-700 hover:border-teal-500 transition-colors"
                            >
                                <h4 className="font-semibold text-slate-200">{quest.name}</h4>
                                <p className="text-xs text-slate-400">{quest.description}</p>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <h3 className="text-md font-semibold mb-2 text-center text-teal-300">{activeQuest.name}</h3>
                    <p className="text-xs text-slate-400 mb-3 text-center">{activeQuest.description}</p>
                    <div className="mb-3">
                        {renderQuestContent()}
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => setActiveQuest(null)} className="flex-1 text-xs text-slate-400 text-center hover:underline">Cancelar</button>
                         <button
                            onClick={handleCompleteQuest}
                            disabled={!isCompletionValid()}
                            className="flex-1 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                        >
                            Completar Misión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

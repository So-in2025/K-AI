import React, { useState, useEffect, useRef } from 'react';
import { NEURO_QUESTS } from '../constants';
import { IDopamineHit, INeuroQuest } from '../types';
import ttsService from '../services/ttsService';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" />
    </svg>
);

type QuestStep = 'intention' | 'practice' | 'reflection' | 'done';

export const DopamineSanctuaryCard: React.FC = () => {
    const { logDopamineHit } = useUser();
    const [view, setView] = useState<'list' | 'active_quest'>('list');
    const [activeQuest, setActiveQuest] = useState<INeuroQuest | null>(null);
    const [questStep, setQuestStep] = useState<QuestStep>('intention');
    const [questTextInput, setQuestTextInput] = useState('');
    
    const practiceCompletedRef = useRef(false);
    const activePracticeRef = useRef<string | null>(null);

    const cleanup = (isCompleted: boolean = false) => {
        ttsService.stop();

        if (activePracticeRef.current && !isCompleted && !practiceCompletedRef.current) {
            ttsService.speak("Noté que no terminamos la práctica. Recuerda que cada pequeño esfuerzo cuenta. Vuelve cuando estés listo.");
        }
        setView('list');
        setActiveQuest(null);
        setQuestTextInput('');
        setQuestStep('intention');
        practiceCompletedRef.current = false;
        activePracticeRef.current = null;
    };

    useEffect(() => {
        return () => cleanup(practiceCompletedRef.current);
    }, []);

    const completeDopamineHit = (hit: IDopamineHit) => {
        if (practiceCompletedRef.current) return;
        practiceCompletedRef.current = true;
        logDopamineHit(hit);
        cleanup(true);
    };

    const handleStartQuest = async (quest: INeuroQuest) => {
        cleanup();
        setView('active_quest');
        activePracticeRef.current = quest.name;
        setActiveQuest(quest);
        setQuestStep('intention');
        
        const stepScript = quest.script.find(s => s.step === 'intention');
        if (stepScript) {
            await ttsService.speak(stepScript.text);
        }
        if (activePracticeRef.current) {
            setQuestStep('practice');
        }
    };

    useEffect(() => {
        const runPractice = async () => {
            if (activePracticeRef.current && activeQuest && questStep === 'practice') {
                const stepScript = activeQuest.script.find(s => s.step === 'practice');
                if (stepScript) {
                    await ttsService.speak(stepScript.text);
                }
                if (activePracticeRef.current) {
                    setQuestStep('reflection');
                }
            }
        }
        runPractice();
    }, [questStep, activeQuest]);

    const renderActiveQuest = () => {
        if (!activeQuest) return null;
        return (
            <div className="p-3 bg-slate-700/50 rounded-lg">
                <h3 className="text-md font-semibold mb-2 text-center text-yellow-300">{activeQuest.name}</h3>
                <p className="text-sm text-slate-300 mb-3 text-center min-h-[50px]">
                    {activeQuest.script.find(s => s.step === questStep)?.text}
                </p>
                {questStep === 'reflection' && (
                    <textarea
                        value={questTextInput}
                        onChange={(e) => setQuestTextInput(e.target.value)}
                        placeholder="Escribe tu reflexión..."
                        className="w-full h-24 p-2 bg-slate-700 rounded-lg"
                        autoFocus
                    />
                )}
                <div className="flex gap-2 mt-3">
                    <button onClick={() => cleanup()} className="flex-1 text-xs text-slate-400 hover:underline">Cancelar</button>
                    <button
                        onClick={() => completeDopamineHit({ id: crypto.randomUUID(), date: new Date().toISOString(), activity: activeQuest.activityLogName, category: activeQuest.category })}
                        disabled={questStep !== 'reflection' || questTextInput.trim().length < 5}
                        className="flex-1 bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-slate-500"
                    >
                        Completar
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative min-h-[400px]">
            <TtsInfoButton explanation="Bienvenido al Santuario de Dopamina. Estos 'Neuro-Rituales' son prácticas cortas y guiadas, basadas en neurociencia, para enseñarle a tu cerebro a generar dopamina y serotonina de forma natural y saludable." />
            <div className="flex items-center space-x-3 mb-3">
                <SparklesIcon />
                <h2 className="text-xl font-bold text-slate-100">Santuario de Dopamina</h2>
            </div>
            {view === 'list' ? (
                <>
                    <p className="text-slate-400 mb-4 text-sm">Prácticas cortas y guiadas para re-cablear tu sistema de recompensa.</p>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {NEURO_QUESTS.map(quest => (
                            <button key={quest.id} onClick={() => handleStartQuest(quest)} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700">
                                <h4>{quest.name}</h4>
                                <p className="text-xs text-slate-400">{quest.description}</p>
                            </button>
                        ))}
                    </div>
                </>
            ) : renderActiveQuest()}
        </div>
    );
};

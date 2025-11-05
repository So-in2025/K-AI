
import React, { useState, useEffect, useRef } from 'react';
import { BREATHING_EXERCISES, GUIDED_MEDITATIONS, MOVEMENT_VIDEOS, DOPAMINE_QUESTS } from '../constants';
import { IExercise, IWellnessActivity, IMeditation, IMovementVideo, IDopamineHit, IDopamineQuest } from '../types';
import ttsService from '../services/ttsService';
import { TtsInfoButton } from './TtsInfoButton';

const LungsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

interface WellnessSanctuaryCardProps {
    onLogActivity: (activity: IWellnessActivity) => void;
    onLogDopamineHit: (hit: IDopamineHit) => void;
}

type View = 'menu' | 'breathing' | 'meditation' | 'movement' | 'active_movement' | 'rest_ritual' | 'dopamine';

export const WellnessSanctuaryCard: React.FC<WellnessSanctuaryCardProps> = ({ onLogActivity, onLogDopamineHit }) => {
    const [view, setView] = useState<View>('menu');
    const [selectedExercise, setSelectedExercise] = useState<IExercise | null>(null);
    const [selectedMeditation, setSelectedMeditation] = useState<IMeditation | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<IMovementVideo | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [isActive, setIsActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStepInfo, setCurrentStepInfo] = useState({ name: '', duration: 0, animationClass: '' });

    // Dopamine Quest State
    const [activeQuest, setActiveQuest] = useState<IDopamineQuest | null>(null);
    const [questTextInput, setQuestTextInput] = useState('');
    const [questTimer, setQuestTimer] = useState(300); // 5 minutes for movement/creative
    const [isQuestTimerActive, setIsQuestTimerActive] = useState(false);
    
    const intervalRef = useRef<number | null>(null);
    const stepTimeoutRef = useRef<number | null>(null);
    const questTimerRef = useRef<number | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (view !== 'menu' && cardRef.current) {
            setTimeout(() => {
                if (!cardRef.current) return;
                const cardRect = cardRef.current.getBoundingClientRect();
                const isNearBottom = cardRect.bottom > window.innerHeight - 150; 
                if (isNearBottom) {
                    cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 100);
        }
    }, [view]);

     useEffect(() => {
        if (isQuestTimerActive && questTimer > 0) {
            questTimerRef.current = window.setInterval(() => {
                setQuestTimer(prev => prev - 1);
            }, 1000);
        } else if (questTimer === 0) {
            setIsQuestTimerActive(false);
            if(questTimerRef.current) clearInterval(questTimerRef.current);
        }
        return () => { if(questTimerRef.current) clearInterval(questTimerRef.current); };
    }, [isQuestTimerActive, questTimer]);

    const resetState = (completed = false, activity?: IWellnessActivity) => {
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
        setProgress(0);
        setCurrentStepInfo({ name: '', duration: 0, animationClass: '' });
        
        if (completed && activity) {
            onLogActivity(activity);
        } else {
            ttsService.stop();
        }
        
        setSelectedExercise(null);
        setSelectedMeditation(null);
        setSelectedVideo(null);
        setView('menu');
    };

    const startBreathingExercise = () => {
        if (!selectedExercise) return;
        setIsActive(true);
        let elapsedTime = 0;
        let totalDuration = selectedDuration * 60 * 1000;
        
        // Special case for Wim Hof inspired breathing
        if (selectedExercise.id === 'wim-hof') {
            totalDuration = 30 * 3000; // 30 breaths, 3s each
        }

        ttsService.speak(`Comenzando ${selectedExercise.name}.`);

        intervalRef.current = window.setInterval(() => {
            elapsedTime += 100;
            const currentProgress = (elapsedTime / totalDuration) * 100;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                 resetState(true, { date: new Date().toISOString(), exerciseName: selectedExercise.name, durationMinutes: selectedDuration });
            }
        }, 100);

        let stepIndex = -1;
        let breathCount = 0;
        const runCycle = () => {
            stepIndex = (stepIndex + 1) % selectedExercise.steps.length;
            const currentStep = selectedExercise.steps[stepIndex];
            const animationClass = currentStep.name.toLowerCase().includes('inhala') ? 'animate-inhale' : currentStep.name.toLowerCase().includes('exhala') ? 'animate-exhale' : 'animate-hold';
            setCurrentStepInfo({ name: currentStep.name, duration: currentStep.duration, animationClass });
            ttsService.speak(currentStep.name, 0.9, 1.2);
            
            if (selectedExercise.id === 'wim-hof') {
                breathCount++;
                if (breathCount < 60) { // 30 inhales + 30 exhales
                     stepTimeoutRef.current = window.setTimeout(runCycle, currentStep.duration);
                }
            } else {
                stepTimeoutRef.current = window.setTimeout(runCycle, currentStep.duration);
            }
        };
        setTimeout(runCycle, 2000); // Initial delay
    };

    const startMeditation = (meditation: IMeditation) => {
        setSelectedMeditation(meditation);
        setIsActive(true);
        const totalDuration = meditation.script.reduce((sum, step) => sum + step.text.split(' ').length * 300 + step.pause, 0); // Estimate duration
        let elapsedTime = 0;
        
        intervalRef.current = window.setInterval(() => {
            elapsedTime += 100;
            setProgress((elapsedTime / totalDuration) * 100);
        }, 100);

        ttsService.speakSequence(meditation.script).then(() => {
            // Check if still active before logging
            if (selectedMeditation?.id === meditation.id && isActive) {
                resetState(true, { date: new Date().toISOString(), exerciseName: meditation.name, durationMinutes: Math.round(totalDuration / 60000) || 1 });
            }
        });
    }

    const handleStartQuest = (quest: IDopamineQuest) => {
        setActiveQuest(quest);
        if (quest.id === 'movement' || quest.id === 'creative') {
            setQuestTimer(300); // 5 minutes
            setIsQuestTimerActive(true);
        }
    };

    const handleCompleteQuest = () => {
        if (!activeQuest) return;

        const newHit: IDopamineHit = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            activity: activeQuest.activityLogName,
            category: activeQuest.category,
        };
        onLogDopamineHit(newHit);
        
        setActiveQuest(null);
        setQuestTextInput('');
        setQuestTimer(300);
        setIsQuestTimerActive(false);
    };

    const isQuestCompletionValid = () => {
        if (!activeQuest) return false;
        switch (activeQuest.id) {
            case 'gratitude':
            case 'victory':
                return questTextInput.trim().length >= 15;
            case 'movement':
            case 'creative':
                return questTimer === 0;
            default:
                return false;
        }
    };


    useEffect(() => {
        return () => {
            ttsService.stop();
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
            if (questTimerRef.current) clearInterval(questTimerRef.current);
        };
    }, []);

    const renderMenu = () => (
        <>
            <TtsInfoButton explanation="Este es tu Santuario de Bienestar. Un espacio para conectar contigo a través de prácticas guiadas. Elige 'Respiración' para calmar tu sistema nervioso, 'Meditación' para encontrar paz, 'Movimiento' para liberar tensiones, 'Recalibración de Dopamina' para entrenar tu cerebro, o el 'Ritual de Descanso' para preparar un sueño reparador." />
            <div className="flex items-center space-x-3 mb-3">
                <LungsIcon />
                <h2 className="text-xl font-bold text-slate-100">Santuario de Bienestar</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Elige una práctica para calmar la mente, mover el cuerpo y re-calibrar tu bienestar.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button onClick={() => setView('breathing')} className="bg-teal-900/50 text-teal-300 font-semibold py-3 px-4 rounded-lg hover:bg-teal-900 transition-colors">Respiración</button>
                <button onClick={() => setView('meditation')} className="bg-indigo-900/50 text-indigo-300 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-900 transition-colors">Meditación</button>
                <button onClick={() => setView('movement')} className="bg-lime-900/50 text-lime-300 font-semibold py-3 px-4 rounded-lg hover:bg-lime-900 transition-colors">Movimiento</button>
                <button onClick={() => setView('dopamine')} className="bg-yellow-900/50 text-yellow-300 font-semibold py-3 px-4 rounded-lg hover:bg-yellow-900 transition-colors">Recalibración de Dopamina</button>
                <div className="md:col-span-2">
                    <button onClick={() => setView('rest_ritual')} className="w-full bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">Ritual de Descanso</button>
                </div>
            </div>
        </>
    );

    const renderRestRitual = () => {
        const ritualSteps = [
            { name: "Estiramiento Nocturno", description: "Libera la tensión del día con 10 minutos de estiramiento suave.", action: () => { setSelectedVideo(MOVEMENT_VIDEOS.find(v => v.id === 'estiramiento-espalda')!); setView('active_movement'); } },
            { name: "Yoga Nidra (Sueño Yóguico)", description: "Calma tu mente con esta meditación de relajación profunda.", action: () => { startMeditation(GUIDED_MEDITATIONS.find(m => m.id === 'yoga-nidra')!); } },
            { name: "Vaciado Mental (Diario)", description: "Escribe y suelta tus preocupaciones en el diario para un descanso reparador.", action: () => { alert("Ve a la sección 'Herramientas' para usar tu diario. Esta función se integrará aquí próximamente."); } },
        ];
        return (
             <>
                <button onClick={() => setView('menu')} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
                <h3 className="font-bold text-slate-100 text-lg mb-2">Ritual de Descanso</h3>
                <p className="text-slate-400 mb-4 text-sm">Sigue estos pasos para preparar tu cuerpo y mente para un sueño reparador.</p>
                <div className="space-y-3">
                    {ritualSteps.map((step, index) => (
                        <div key={step.name} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 bg-slate-700 h-8 w-8 rounded-full flex items-center justify-center font-bold text-teal-400">{index + 1}</div>
                            <div>
                                <h4 className="font-semibold text-slate-200">{step.name}</h4>
                                <p className="text-xs text-slate-400">{step.description}</p>
                                <button onClick={step.action} className="text-sm text-teal-400 hover:underline mt-1">Comenzar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    };

    const renderBreathingSelection = () => (
        <>
             <button onClick={() => setView('menu')} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
             <h3 className="font-bold text-slate-100 text-lg mb-2">Ejercicios de Respiración</h3>
             <div className="space-y-3">
                {BREATHING_EXERCISES.map(ex => (
                    <button key={ex.id} onClick={() => setSelectedExercise(ex)} className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedExercise?.id === ex.id ? 'border-teal-500 bg-teal-900/50 shadow-md' : 'border-slate-700 hover:border-teal-500'}`}>
                        <h4 className="font-semibold text-slate-200">{ex.name}</h4>
                        <p className="text-xs text-slate-400">{ex.description}</p>
                    </button>
                ))}
            </div>
             {selectedExercise && selectedExercise.id !== 'wim-hof' && (
              <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-300 mb-2 text-center">Duración:</p>
                  <div className="flex justify-center gap-2">
                      {[1, 3, 5].map(min => (
                          <button key={min} onClick={() => setSelectedDuration(min)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedDuration === min ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                              {min} min
                          </button>
                      ))}
                  </div>
              </div>
            )}
            <button onClick={startBreathingExercise} disabled={!selectedExercise} className="w-full bg-teal-600 text-white font-semibold py-3 px-5 rounded-lg mt-4 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">Comenzar</button>
        </>
    );
    
    const renderMeditationSelection = () => (
        <>
            <button onClick={() => setView('menu')} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
            <h3 className="font-bold text-slate-100 text-lg mb-2">Meditaciones Guiadas</h3>
            <div className="space-y-3">
                {GUIDED_MEDITATIONS.map(med => (
                    <button key={med.id} onClick={() => startMeditation(med)} className="w-full text-left p-3 rounded-lg border-2 border-slate-700 hover:border-indigo-500">
                        <h4 className="font-semibold text-slate-200">{med.name}</h4>
                        <p className="text-xs text-slate-400">{med.description}</p>
                    </button>
                ))}
            </div>
        </>
    );

    const renderMovementSelection = () => (
         <>
            <button onClick={() => setView('menu')} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
            <h3 className="font-bold text-slate-100 text-lg mb-2">Prácticas de Movimiento</h3>
            <div className="space-y-3">
                {MOVEMENT_VIDEOS.map(vid => (
                    <button key={vid.id} onClick={() => { setSelectedVideo(vid); setView('active_movement'); }} className="w-full text-left p-3 rounded-lg border-2 border-slate-700 hover:border-lime-500">
                        <h4 className="font-semibold text-slate-200">{vid.name}</h4>
                        <p className="text-xs text-slate-400">{vid.description}</p>
                    </button>
                ))}
            </div>
        </>
    );

    const renderDopamineQuests = () => {
        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        }

        const renderQuestContent = () => {
            if (!activeQuest) return null;
            switch (activeQuest.id) {
                case 'gratitude': case 'victory':
                    return <textarea value={questTextInput} onChange={(e) => setQuestTextInput(e.target.value)} placeholder="Escribe tu reflexión aquí..." className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-lg"/>;
                case 'movement': case 'creative':
                    return <div className="text-center p-4"><p className="text-4xl font-bold font-mono text-yellow-300">{formatTime(questTimer)}</p></div>;
                default: return null;
            }
        };

        return (
            <>
                <button onClick={() => setView('menu')} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
                <h3 className="font-bold text-slate-100 text-lg mb-2">Recalibración de Dopamina</h3>
                {!activeQuest ? (
                     <>
                        <p className="text-slate-400 mb-4 text-sm">Elige una misión para entrenar tu cerebro y generar una recompensa natural. Tu progreso se registrará automáticamente al completar la tarea.</p>
                        <div className="space-y-2">
                            {DOPAMINE_QUESTS.map(quest => (
                                <button key={quest.id} onClick={() => handleStartQuest(quest)} className="w-full text-left p-3 rounded-lg border-2 border-slate-700 hover:border-yellow-500">
                                    <h4 className="font-semibold text-slate-200">{quest.name}</h4>
                                    <p className="text-xs text-slate-400">{quest.description}</p>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                        <h3 className="text-md font-semibold mb-2 text-center text-yellow-300">{activeQuest.name}</h3>
                        <div className="mb-3">{renderQuestContent()}</div>
                        <div className="flex gap-2">
                             <button onClick={() => setActiveQuest(null)} className="flex-1 text-xs text-slate-400 text-center hover:underline">Cancelar</button>
                             <button onClick={handleCompleteQuest} disabled={!isQuestCompletionValid()} className="flex-1 bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:bg-slate-500">Completar Misión</button>
                        </div>
                    </div>
                )}
            </>
        )
    };

    const renderActiveSession = () => {
       const sessionName = selectedExercise?.name || selectedMeditation?.name;
       const isBreathing = !!selectedExercise;
       return (
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
                <style>{`
                    @keyframes inhale { 0% { transform: scale(1); } 100% { transform: scale(1.2); } }
                    @keyframes exhale { 0% { transform: scale(1.2); } 100% { transform: scale(0.8); } }
                    .animate-inhale { animation: inhale ${currentStepInfo.duration / 1000}s ease-in-out forwards; }
                    .animate-exhale { animation: exhale ${currentStepInfo.duration / 1000}s ease-in-out forwards; }
                `}</style>
                <h3 className="text-lg font-bold text-center text-slate-100 mb-4">{sessionName}</h3>
                <div className="flex flex-col items-center justify-center my-4 h-40">
                    <div className="relative w-36 h-36">
                        <div className={`absolute inset-0 ${isBreathing ? 'bg-teal-400' : 'bg-indigo-400'} rounded-full transition-transform duration-1000 ease-in-out ${currentStepInfo.animationClass}`} />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white z-10">
                           {isBreathing ? currentStepInfo.name : 'Meditando'}
                        </div>
                    </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
                    <div className={`${isBreathing ? 'bg-teal-600' : 'bg-indigo-600'} h-2.5 rounded-full`} style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
                </div>
                <button onClick={() => resetState()} className="w-full bg-red-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-red-700">
                    Detener Práctica
                </button>
            </div>
       )
    }

    const renderActiveMovement = () => {
        if (!selectedVideo) return null;
        return (
             <>
                <button onClick={() => setView('movement')} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver a la lista'}</button>
                <h3 className="font-bold text-slate-100 text-lg mb-2">{selectedVideo.name}</h3>
                <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                     <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                        title={selectedVideo.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                 <button 
                    onClick={() => resetState(true, { date: new Date().toISOString(), exerciseName: selectedVideo.name, durationMinutes: selectedVideo.duration })}
                    className="w-full mt-4 bg-lime-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-lime-700 transition-colors"
                >
                    He completado esta rutina
                </button>
             </>
        )
    }

    const renderContent = () => {
        if (isActive) return renderActiveSession();
        if (view === 'active_movement') return renderActiveMovement();

        switch(view) {
            case 'menu': return renderMenu();
            case 'breathing': return renderBreathingSelection();
            case 'meditation': return renderMeditationSelection();
            case 'movement': return renderMovementSelection();
            case 'dopamine': return renderDopamineQuests();
            case 'rest_ritual': return renderRestRitual();
            default: return renderMenu();
        }
    }

    return (
        <div ref={cardRef} className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
             <style>{`
                .aspect-w-16 { position: relative; padding-bottom: 56.25%; }
                .aspect-h-9 { height: 0; }
                .aspect-w-16 > iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            `}</style>
            {renderContent()}
        </div>
    );
};

import React, { useState, useEffect, useRef } from 'react';
import { BREATHING_EXERCISES, GUIDED_MEDITATIONS, MOVEMENT_VIDEOS, NEURO_QUESTS } from '../constants';
import { IExercise, IWellnessActivity, IMeditation, IMovementVideo, IDopamineHit, INeuroQuest } from '../types';
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

type View = 'menu' | 'breathing' | 'meditation' | 'movement' | 'active_movement' | 'rest_ritual' | 'neuro_selection' | 'neuro_quests' | 'shamanic_journey';
type JourneyStep = 'idle' | 'intention' | 'callingIn' | 'journeyDeep' | 'returnCall' | 'integration' | 'finished';
type QuestStep = 'intention' | 'practice' | 'reflection' | 'done';
type Neurotransmitter = 'dopamine' | 'serotonin';


export const WellnessSanctuaryCard: React.FC<WellnessSanctuaryCardProps> = ({ onLogActivity, onLogDopamineHit }) => {
    const [view, setView] = useState<View>('menu');
    const [selectedExercise, setSelectedExercise] = useState<IExercise | null>(null);
    const [selectedMeditation, setSelectedMeditation] = useState<IMeditation | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<IMovementVideo | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [isActive, setIsActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStepInfo, setCurrentStepInfo] = useState({ name: '', duration: 0, animationClass: '' });
    const [selectedNeurotransmitter, setSelectedNeurotransmitter] = useState<Neurotransmitter>('dopamine');

    // Shamanic Journey State
    const [journeyStep, setJourneyStep] = useState<JourneyStep>('idle');
    // Fix: Changed NodeJS.Timeout to number for browser compatibility as setTimeout in browsers returns a number.
    const journeyTimeoutRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioElementsRef = useRef<{ [key: string]: any }>({});


    // Neuro Quest State
    const [activeQuest, setActiveQuest] = useState<INeuroQuest | null>(null);
    const [questStep, setQuestStep] = useState<QuestStep>('intention');
    const [questTextInput, setQuestTextInput] = useState('');
    
    const intervalRef = useRef<number | null>(null);
    const stepTimeoutRef = useRef<number | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const isActiveRef = useRef(isActive);

    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

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


    const resetState = (options: {
        completed?: boolean;
        activity?: IWellnessActivity;
        keepTts?: boolean;
    } = {}) => {
        const { completed = false, activity, keepTts = false } = options;
        const wasActive = isActiveRef.current;
    
        // Clear all timers and audio contexts
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
        if (journeyTimeoutRef.current) clearTimeout(journeyTimeoutRef.current);
        
        // Stop all shamanic journey sounds
        if (audioElementsRef.current.drumInterval) clearInterval(audioElementsRef.current.drumInterval);
        if (audioElementsRef.current.rattleInterval) clearInterval(audioElementsRef.current.rattleInterval);
        if (audioElementsRef.current.wind) audioElementsRef.current.wind.stop();

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        audioElementsRef.current = {};
    
        // Reset UI state
        setIsActive(false);
        setProgress(0);
        setCurrentStepInfo({ name: '', duration: 0, animationClass: '' });
        setSelectedExercise(null);
        setSelectedMeditation(null);
        setSelectedVideo(null);
        setJourneyStep('idle');
        setActiveQuest(null);
        setQuestTextInput('');
        setQuestStep('intention');
        setView('menu');
    
        // Voice feedback logic
        if (!keepTts) {
            ttsService.stop();
        }
    
        if (completed && activity) {
            onLogActivity(activity); // This gives its own positive feedback
        } else if (wasActive && !completed) {
            if (!keepTts) {
                ttsService.speak("Noté que no terminamos la práctica. Recuerda que cada pequeño esfuerzo cuenta. Vuelve cuando estés listo.");
            }
        }
    };

    const startBreathingExercise = async () => {
        if (!selectedExercise) return;
        setIsActive(true);
        let elapsedTime = 0;
        let totalDuration = selectedDuration * 60 * 1000;
        
        if (selectedExercise.id === 'wim-hof') {
            totalDuration = 30 * 3000; // 30 breaths, 3s each
        }

        const runCycle = () => {
            let stepIndex = -1;
            let breathCount = 0;
            const cycle = () => {
                if (!isActiveRef.current) {
                    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
                    return;
                }
                stepIndex = (stepIndex + 1) % selectedExercise.steps.length;
                const currentStep = selectedExercise.steps[stepIndex];
                const animationClass = currentStep.name.toLowerCase().includes('inhala') ? 'animate-inhale' : currentStep.name.toLowerCase().includes('exhala') ? 'animate-exhale' : 'animate-hold';
                setCurrentStepInfo({ name: currentStep.name, duration: currentStep.duration, animationClass });
                ttsService.speak(currentStep.name, 0.9, 1.2);
                
                if (selectedExercise.id === 'wim-hof') {
                    breathCount++;
                    if (breathCount < 60) { // 30 pairs of inhale/exhale
                         stepTimeoutRef.current = window.setTimeout(cycle, currentStep.duration);
                    }
                } else {
                    stepTimeoutRef.current = window.setTimeout(cycle, currentStep.duration);
                }
            };
            cycle();
        };

        if (selectedExercise.setup) {
            await ttsService.speakSequence(selectedExercise.setup);
            if(isActiveRef.current) runCycle();
        } else {
            runCycle();
        }

        intervalRef.current = window.setInterval(() => {
            elapsedTime += 100;
            const currentProgress = (elapsedTime / totalDuration) * 100;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                 resetState({ completed: true, activity: { date: new Date().toISOString(), exerciseName: selectedExercise.name, durationMinutes: selectedDuration } });
            }
        }, 100);
    };

    const startMeditation = async (meditation: IMeditation) => {
        setSelectedMeditation(meditation);
        setIsActive(true);
        const totalDuration = meditation.script.reduce((sum, step) => sum + step.text.split(' ').length * 300 + step.pause, 0);
        let elapsedTime = 0;
        
        intervalRef.current = window.setInterval(() => {
            elapsedTime += 100;
            setProgress((elapsedTime / totalDuration) * 100);
        }, 100);

        await ttsService.speakSequence(meditation.script);
        if (isActiveRef.current) {
            resetState({ completed: true, activity: { date: new Date().toISOString(), exerciseName: meditation.name, durationMinutes: Math.round(totalDuration / 60000) || 1 } });
        }
    }
    
    const startShamanicJourney = () => {
        if (journeyStep !== 'idle') return;
        setIsActive(true);

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        audioCtx.resume();

        // --- Sound Generators ---
        const playDrum = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime); // Lowered volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
        };

        const playRattle = () => {
            const bufferSize = audioCtx.sampleRate * 0.1;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // Lowered volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            noise.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            noise.start(audioCtx.currentTime);
            noise.stop(audioCtx.currentTime + 0.1);
        };

        const playChime = () => {
            [440, 880, 1320].forEach(freq => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.value = freq;
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 4);
            });
        };

        const createWind = () => {
            const bufferSize = audioCtx.sampleRate * 2;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            let lastOut = 0;
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
            const wind = audioCtx.createBufferSource();
            wind.buffer = buffer;
            wind.loop = true;
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 0.1;
            wind.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            wind.start();
            return wind;
        };
        
        audioElementsRef.current = { playChime };
        audioElementsRef.current.wind = createWind();
        
        // Start the journey sequence
        setJourneyStep('intention');
    };


    useEffect(() => {
        const runJourneyStep = async () => {
            if (!isActiveRef.current) return;

            const clearTimeouts = () => {
                if (journeyTimeoutRef.current) clearTimeout(journeyTimeoutRef.current);
            };

            switch (journeyStep) {
                case 'intention':
                    await ttsService.speakSequence([
                        { text: "Bienvenido al Viaje de Sonido. Prepara un espacio tranquilo y usa auriculares.", pause: 3000 },
                        { text: "Cierra los ojos. Establece una intención. ¿Qué buscas sanar? ¿Qué buscas encontrar?", pause: 5000 },
                        { text: "Mantenla en tu corazón.", pause: 2000 }
                    ]);
                    if (isActiveRef.current) setJourneyStep('callingIn');
                    break;

                case 'callingIn':
                    audioElementsRef.current.drumInterval = setInterval(audioElementsRef.current.playDrum, 333); // 180 BPM
                    audioElementsRef.current.rattleInterval = setInterval(audioElementsRef.current.playRattle, 166);
                    await ttsService.speakSequence([
                        { text: "Sincroniza tu respiración con el ritmo. Inhala... exhala...", pause: 4000 },
                        { text: "Repite conmigo, internamente...", pause: 2000 },
                        { text: "Suelto lo que pesa... recibo lo que sana.", pause: 5000 },
                    ]);
                    if (isActiveRef.current) setJourneyStep('journeyDeep');
                    break;
                
                case 'journeyDeep':
                    await ttsService.speak("Ahora, déjate llevar. Observa sin juicio. Estás a salvo.", 0.9);
                    clearTimeouts();
                    journeyTimeoutRef.current = window.setTimeout(() => {
                        if (isActiveRef.current) setJourneyStep('returnCall');
                    }, 45000); // 45 seconds of deep journey
                    break;
                
                case 'returnCall':
                    if (audioElementsRef.current.rattleInterval) clearInterval(audioElementsRef.current.rattleInterval);
                    audioElementsRef.current.playChime();
                    await ttsService.speak("Es hora de volver. Escucha el llamado. Regresa a tu cuerpo.", 0.9);
                    clearTimeouts();
                    journeyTimeoutRef.current = window.setTimeout(() => {
                         if (isActiveRef.current) setJourneyStep('integration');
                    }, 10000); // 10 seconds to return
                    break;

                case 'integration':
                    if (audioElementsRef.current.drumInterval) clearInterval(audioElementsRef.current.drumInterval);
                     await ttsService.speakSequence([
                        { text: "Poco a poco, mueve tus dedos. Siente el espacio a tu alrededor.", pause: 4000 },
                        { text: "El viaje ha terminado. Agradece la experiencia.", pause: 2000 }
                    ]);
                    if (isActiveRef.current) setJourneyStep('finished');
                    break;

                case 'finished':
                     resetState({ completed: true, activity: { date: new Date().toISOString(), exerciseName: 'Viaje de Sonido Chamánico', durationMinutes: 3 } });
                    break;
            }
        };
        runJourneyStep();

        // Cleanup function
        return () => {
             if (journeyTimeoutRef.current) clearTimeout(journeyTimeoutRef.current);
        }
    }, [journeyStep]);


    // Neuro Quest Logic
    const handleStartQuest = async (quest: INeuroQuest) => {
        setIsActive(true);
        setActiveQuest(quest);
        setQuestStep('intention');
        const stepScript = quest.script.find(s => s.step === 'intention');
        if (stepScript) {
            await ttsService.speak(stepScript.text);
            if(isActiveRef.current && activeQuest) setQuestStep('practice');
        } else {
            setQuestStep('practice');
        }
    };

    useEffect(() => {
        const runPractice = async () => {
            if (isActiveRef.current && activeQuest && questStep === 'practice') {
                 const stepScript = activeQuest.script.find(s => s.step === 'practice');
                 if (stepScript) {
                    await ttsService.speak(stepScript.text);
                    if(isActiveRef.current && activeQuest) setQuestStep('reflection');
                 } else {
                    setQuestStep('reflection');
                 }
            }
        }
        runPractice();
    }, [questStep, activeQuest]);
    
    useEffect(() => {
        if (isActiveRef.current && activeQuest && questStep === 'reflection') {
             const stepScript = activeQuest.script.find(s => s.step === 'reflection');
             if (stepScript) {
                ttsService.speak(stepScript.text);
             }
        }
    }, [questStep, activeQuest]);


    const handleCompleteQuest = () => {
        if (!activeQuest) return;
        const newHit: IDopamineHit = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            activity: activeQuest.activityLogName,
            category: activeQuest.category,
        };
        onLogDopamineHit(newHit);
        resetState({ keepTts: true });
    };

    useEffect(() => {
        return () => {
            const wasActive = isActiveRef.current;
            
            ttsService.stop();
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
            if (journeyTimeoutRef.current) clearTimeout(journeyTimeoutRef.current);
            if (audioElementsRef.current.drumInterval) clearInterval(audioElementsRef.current.drumInterval);
            if (audioElementsRef.current.rattleInterval) clearInterval(audioElementsRef.current.rattleInterval);
            if (audioElementsRef.current.wind) audioElementsRef.current.wind.stop();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            
            if (wasActive) {
                ttsService.speak("Noté que no terminamos la práctica. Recuerda que cada pequeño esfuerzo cuenta. Vuelve cuando estés listo.");
            }
        };
    }, []);

    const renderMenu = () => (
        <>
            <TtsInfoButton explanation="Este es tu Santuario de Bienestar. Un espacio para conectar contigo a través de prácticas guiadas y rituales. Cada sección está diseñada para apoyarte de una forma única, desde calmar tu sistema nervioso hasta re-cablear tu cerebro para el bienestar." />
            <div className="flex items-center space-x-3 mb-3">
                <LungsIcon />
                <h2 className="text-xl font-bold text-slate-100">Santuario de Bienestar</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Elige una práctica para calmar la mente, mover el cuerpo y re-calibrar tu bienestar.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button onClick={() => setView('breathing')} className="bg-teal-900/50 text-teal-300 font-semibold py-3 px-4 rounded-lg hover:bg-teal-900 transition-colors">Respiración</button>
                <button onClick={() => setView('meditation')} className="bg-indigo-900/50 text-indigo-300 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-900 transition-colors">Meditación</button>
                <button onClick={() => setView('movement')} className="bg-lime-900/50 text-lime-300 font-semibold py-3 px-4 rounded-lg hover:bg-lime-900 transition-colors">Movimiento</button>
                <button onClick={() => setView('neuro_selection')} className="bg-yellow-900/50 text-yellow-300 font-semibold py-3 px-4 rounded-lg hover:bg-yellow-900 transition-colors">Santuario Neuroquímico</button>
                <button onClick={() => setView('shamanic_journey')} className="bg-purple-900/50 text-purple-300 font-semibold py-3 px-4 rounded-lg hover:bg-purple-900 transition-colors">Viaje de Sonido</button>
                <div className="md:col-span-1">
                    <button onClick={() => setView('rest_ritual')} className="w-full h-full bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">Ritual de Descanso</button>
                </div>
            </div>
        </>
    );

    const renderRestRitual = () => {
        const ritualSteps = [
            { name: "Estiramiento Nocturno (10 min)", description: "Libera la tensión del día con una rutina suave.", action: () => { const video = MOVEMENT_VIDEOS.find(v => v.id === 'estiramiento-espalda'); if(video) { setSelectedVideo(video); setView('active_movement'); } } },
            { name: "Yoga Nidra (Sueño Yóguico)", description: "Calma tu mente con esta meditación de relajación profunda.", action: () => { const meditation = GUIDED_MEDITATIONS.find(m => m.id === 'yoga-nidra'); if(meditation) startMeditation(meditation); } },
            { name: "Vaciado Mental (Diario)", description: "Escribe y suelta tus preocupaciones en el diario para un descanso reparador.", action: () => { alert("Ve a 'Herramientas > Mi Diario' para escribir. Este acto de 'vaciar' la mente antes de dormir es una práctica poderosa."); } },
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
             <button onClick={() => { setIsActive(false); setView('menu'); }} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
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
            <button onClick={() => { setIsActive(false); setView('menu'); }} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
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
    
    const renderNeuroSelection = () => (
         <>
            <button onClick={() => setView('menu')} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
            <h3 className="font-bold text-slate-100 text-lg mb-2">Santuario Neuroquímico</h3>
             <p className="text-slate-400 mb-4 text-sm">Elige un camino para re-cablear conscientemente tu cerebro. Cada ritual es una práctica guiada para liberar neurotransmisores de bienestar.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button onClick={() => { setSelectedNeurotransmitter('dopamine'); setView('neuro_quests'); }} className="bg-yellow-900/50 text-yellow-300 font-semibold py-3 px-4 rounded-lg hover:bg-yellow-900 transition-colors">Rituales de Dopamina</button>
                <button onClick={() => { setSelectedNeurotransmitter('serotonin'); setView('neuro_quests'); }} className="bg-sky-900/50 text-sky-300 font-semibold py-3 px-4 rounded-lg hover:bg-sky-900 transition-colors">Rituales de Serotonina</button>
            </div>
        </>
    );


    const renderNeuroQuests = () => {
        const quests = NEURO_QUESTS.filter(q => q.neurotransmitter === selectedNeurotransmitter);
        const colorClass = selectedNeurotransmitter === 'dopamine' ? 'yellow' : 'sky';

        if (!activeQuest) {
            return (
                 <>
                    <button onClick={() => setView('neuro_selection')} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
                    <h3 className={`font-bold text-${colorClass}-300 text-lg mb-2`}>Rituales de {selectedNeurotransmitter === 'dopamine' ? 'Dopamina' : 'Serotonina'}</h3>
                    <p className="text-slate-400 mb-4 text-sm">Elige un ritual guiado para entrenar tu cerebro. Tu progreso se registrará automáticamente.</p>
                    <div className="space-y-2">
                        {quests.map(quest => (
                            <button key={quest.id} onClick={() => handleStartQuest(quest)} className={`w-full text-left p-3 rounded-lg border-2 border-slate-700 hover:border-${colorClass}-500`}>
                                <h4 className="font-semibold text-slate-200">{quest.name}</h4>
                                <p className="text-xs text-slate-400">{quest.description}</p>
                            </button>
                        ))}
                    </div>
                </>
            );
        }

        const currentStepScript = activeQuest.script.find(s => s.step === questStep);
        const isReflectionStep = questStep === 'reflection';
        const canComplete = isReflectionStep && questTextInput.trim().length >= 10;

        return (
            <div className={`p-3 bg-slate-700/50 rounded-lg border border-${colorClass}-500/50`}>
                <h3 className={`text-md font-semibold mb-2 text-center text-${colorClass}-300`}>{activeQuest.name}</h3>
                <p className="text-sm text-slate-300 mb-3 text-center">{currentStepScript?.text}</p>
                {isReflectionStep && (
                     <textarea value={questTextInput} onChange={(e) => setQuestTextInput(e.target.value)} placeholder="Escribe tu reflexión aquí..." className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-lg"/>
                )}
                <div className="flex gap-2 mt-3">
                     <button onClick={() => resetState({})} className="flex-1 text-xs text-slate-400 text-center hover:underline">Cancelar</button>
                     <button onClick={handleCompleteQuest} disabled={!canComplete} className={`flex-1 bg-${colorClass}-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-${colorClass}-700 disabled:bg-slate-500`}>Completar Ritual</button>
                </div>
            </div>
        );
    };

    const renderShamanicJourney = () => {
        const stepText: Record<JourneyStep, string> = {
            idle: '',
            intention: 'Estableciendo Intención...',
            callingIn: 'Llamando a la Sanación...',
            journeyDeep: 'Viajando con el Sonido...',
            returnCall: 'Regresando al Presente...',
            integration: 'Integrando la Experiencia...',
            finished: 'Viaje Completado.'
        };

        const visualClasses: Record<JourneyStep, string> = {
            idle: '',
            intention: 'journey-intention',
            callingIn: 'journey-callingIn',
            journeyDeep: 'journey-deep',
            returnCall: 'journey-return',
            integration: 'journey-integration',
            finished: 'journey-integration'
        };
        
        return (
             <div className="text-center">
                 <button onClick={() => resetState({})} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
                 <h3 className="font-bold text-slate-100 text-lg mb-2">Viaje de Sonido Chamánico</h3>
                 
                 {journeyStep === 'idle' ? (
                     <>
                        <TtsInfoButton explanation="Esta es una práctica de inmersión profunda. Usa un ritmo de tambor constante para guiar tu cerebro a un estado de meditación Theta, ideal para la introspección. Te guiaré para establecer una intención, respirar y usar un mantra antes de dejarte con el sonido." />
                        <p className="text-slate-400 mb-4 text-sm">Prepara un espacio tranquilo y usa auriculares para una mejor experiencia. Este viaje dura aproximadamente 3 minutos.</p>
                        <button onClick={startShamanicJourney} className="w-full bg-purple-600 text-white font-semibold py-3 px-5 rounded-lg">Comenzar Viaje</button>
                    </>
                 ) : (
                     <div className="p-4 bg-slate-900/50 rounded-lg">
                         <div className="flex justify-center items-center my-4 h-32 relative">
                             <div className={`relative w-32 h-32 ${visualClasses[journeyStep]}`}>
                                 <div className="visual-bg"></div>
                                 <div className="visual-core"></div>
                             </div>
                         </div>
                         <p className="text-purple-300 font-semibold min-h-[24px]">{stepText[journeyStep]}</p>
                         {journeyStep === 'finished' && (
                            <div className="mt-4">
                                <p className="text-slate-400 text-sm mb-2">La sesión ha terminado. Tómate un momento. Te recomiendo ir a tu Diario para escribir cualquier palabra o imagen que haya surgido.</p>
                                <button onClick={() => resetState({})} className="w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg">Finalizar</button>
                            </div>
                         )}
                     </div>
                 )}
             </div>
        );
    };

    const renderActiveSession = () => {
       const sessionName = selectedExercise?.name || selectedMeditation?.name;
       const isBreathing = !!selectedExercise;
       return (
            <div>
                <button onClick={() => resetState({})} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
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
                <button onClick={() => resetState({})} className="w-full bg-red-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-red-700">
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
                    onClick={() => resetState({ completed: true, activity: { date: new Date().toISOString(), exerciseName: selectedVideo.name, durationMinutes: selectedVideo.duration }})}
                    className="w-full mt-4 bg-lime-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-lime-700 transition-colors"
                >
                    He completado esta rutina
                </button>
             </>
        )
    }

    const renderContent = () => {
        if (isActive && !activeQuest && journeyStep === 'idle') return renderActiveSession();
        if (view === 'active_movement') return renderActiveMovement();

        switch(view) {
            case 'menu': return renderMenu();
            case 'breathing': return renderBreathingSelection();
            case 'meditation': return renderMeditationSelection();
            case 'movement': return renderMovementSelection();
            case 'neuro_selection': return renderNeuroSelection();
            case 'neuro_quests': return renderNeuroQuests();
            case 'rest_ritual': return renderRestRitual();
            case 'shamanic_journey': return renderShamanicJourney();
            default: return renderMenu();
        }
    }

    return (
        <div ref={cardRef} className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
             <style>{`
                @keyframes inhale { from { transform: scale(1); } to { transform: scale(1.15); } }
                @keyframes exhale { from { transform: scale(1.15); } to { transform: scale(1); } }
                @keyframes hold { /* No visual change */ }
                .animate-inhale { animation: inhale 4s ease-in-out forwards; }
                .animate-exhale { animation: exhale 4s ease-in-out forwards; }
                .animate-hold { animation: hold 4s ease-in-out forwards; }
                
                .visual-bg, .visual-core {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 50%;
                    transition: all 1.5s ease-in-out;
                }
                .journey-intention .visual-bg { background: radial-gradient(circle, #384269, #1e293b); transform: scale(0.95); animation: pulse 4s infinite; }
                .journey-intention .visual-core { background: #a5b4fc; box-shadow: 0 0 20px #a5b4fc; transform: scale(0.2); }
                
                .journey-callingIn .visual-bg { background: radial-gradient(circle, #4c1d95, #2e1065); transform: scale(1); animation: pulse 2s infinite; }
                .journey-callingIn .visual-core { background: #c4b5fd; box-shadow: 0 0 30px #c4b5fd; transform: scale(0.25); }

                .journey-deep .visual-bg { background: radial-gradient(circle, #1e1b4b, #171717); transform: scale(1.05); animation: swirl 10s linear infinite; }
                .journey-deep .visual-core { background: #e0e7ff; box-shadow: 0 0 40px #e0e7ff; transform: scale(0.15); animation: pulse 3s infinite alternate; }
                
                .journey-return .visual-bg { background: radial-gradient(circle, #86198f, #4a044e); transform: scale(1); animation: pulse 1s infinite; }
                .journey-return .visual-core { background: #f0abfc; box-shadow: 0 0 30px #f0abfc; transform: scale(0.3); }

                .journey-integration .visual-bg { background: radial-gradient(circle, #384269, #1e293b); transform: scale(0.95); animation: pulse 5s infinite; }
                .journey-integration .visual-core { background: #a5b4fc; box-shadow: 0 0 20px #a5b4fc; transform: scale(0.2); }

                @keyframes pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
                @keyframes swirl { from { transform: scale(1.05) rotate(0deg); } to { transform: scale(1.05) rotate(360deg); } }

                .animation-delay-300 { animation-delay: 300ms; }
                .aspect-w-16 { position: relative; padding-bottom: 56.25%; }
                .aspect-h-9 { height: 0; }
                .aspect-w-16 > iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
             `}</style>
            {renderContent()}
        </div>
    );
};
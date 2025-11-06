
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

type SanctuaryTab = 'calm' | 'body' | 'rituals';
type View = 'tabs' | 'active_breathing' | 'active_meditation' | 'active_movement' | 'active_quest' | 'active_journey' | 'active_dump';
type JourneyStep = 'idle' | 'grounding' | 'descent' | 'deepening' | 'vision' | 'return' | 'integration' | 'finished';
type QuestStep = 'intention' | 'practice' | 'reflection' | 'done';

const mentalDumpPrompts = [
    {
        title: "Tareas Pendientes",
        instruction: "Primero, escribe todo lo que tengas pendiente para mañana. Sácalo de tu cabeza y ponlo aquí.",
        placeholder: "Ej: Enviar el correo a Juan, comprar leche, preparar la reunión..."
    },
    {
        title: "Conversaciones en tu Mente",
        instruction: "Ahora, escribe cualquier conversación o interacción de hoy que siga dando vueltas en tu mente.",
        placeholder: "Ej: La llamada con mi madre, el comentario de mi jefe..."
    },
    {
        title: "Preocupaciones Futuras",
        instruction: "Finalmente, escribe cualquier preocupación o miedo sobre el futuro, por pequeño que sea.",
        placeholder: "Ej: ¿Qué pasará con...?, me preocupa si podré..."
    }
];


export const WellnessSanctuaryCard: React.FC<WellnessSanctuaryCardProps> = ({ onLogActivity, onLogDopamineHit }) => {
    const [activeTab, setActiveTab] = useState<SanctuaryTab>('calm');
    const [view, setView] = useState<View>('tabs');
    const [selectedExercise, setSelectedExercise] = useState<IExercise | null>(null);
    const [selectedMeditation, setSelectedMeditation] = useState<IMeditation | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<IMovementVideo | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [progress, setProgress] = useState(0);
    const [currentStepInfo, setCurrentStepInfo] = useState({ name: '', duration: 0, animationClass: '' });
    
    // Journey, Quest, Dump states
    const [journeyStep, setJourneyStep] = useState<JourneyStep>('idle');
    const [activeQuest, setActiveQuest] = useState<INeuroQuest | null>(null);
    const [questStep, setQuestStep] = useState<QuestStep>('intention');
    const [questTextInput, setQuestTextInput] = useState('');
    const [mentalDumpStep, setMentalDumpStep] = useState(0);

    // Refs for managing async operations and state
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioElementsRef = useRef<{ [key: string]: any }>({});
    const vibrationIntervalRef = useRef<number | null>(null);
    const practiceCompletedRef = useRef(false);
    const activePracticeRef = useRef<string | null>(null);

    const cleanup = (isCompleted: boolean = false) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
        
        ttsService.stop();
        if(navigator.vibrate) navigator.vibrate(0);
        
        if (audioElementsRef.current.drumInterval) clearInterval(audioElementsRef.current.drumInterval);
        if (audioElementsRef.current.nodes) {
            audioElementsRef.current.nodes.forEach((node: any) => node.stop(0));
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }

        if (activePracticeRef.current && !isCompleted) {
             ttsService.speak("Noté que no terminamos la práctica. Recuerda que cada pequeño esfuerzo cuenta. Vuelve cuando estés listo.");
        }
        
        // Reset all states
        setView('tabs');
        setSelectedExercise(null);
        setSelectedMeditation(null);
        setSelectedVideo(null);
        setActiveQuest(null);
        setJourneyStep('idle');
        setProgress(0);
        setCurrentStepInfo({ name: '', duration: 0, animationClass: '' });
        setQuestTextInput('');
        setQuestStep('intention');
        setMentalDumpStep(0);
        
        // Reset refs
        intervalRef.current = null;
        timeoutRef.current = null;
        audioContextRef.current = null;
        audioElementsRef.current = {};
        vibrationIntervalRef.current = null;
        practiceCompletedRef.current = false;
        activePracticeRef.current = null;
    };
    
    useEffect(() => {
        return () => cleanup(practiceCompletedRef.current);
    }, []);

    const completePractice = (activity: IWellnessActivity) => {
        practiceCompletedRef.current = true;
        onLogActivity(activity);
        ttsService.speak("Excelente trabajo. Has completado tu ejercicio. Cada práctica es un paso hacia tu bienestar.");
        cleanup(true);
    }
    
    const completeDopamineHit = (hit: IDopamineHit) => {
        practiceCompletedRef.current = true;
        onLogDopamineHit(hit);
        cleanup(true);
    }

    const startBreathingExercise = async (exercise: IExercise) => {
        setSelectedExercise(exercise);
        setView('active_breathing');
        activePracticeRef.current = exercise.name;
        
        let elapsedTime = 0;
        let totalDuration = selectedDuration * 60 * 1000;
        if (exercise.id === 'wim-hof') totalDuration = 30 * 3000;

        const runCycle = () => {
            let stepIndex = -1;
            let breathCount = 0;
            const cycle = () => {
                if (!activePracticeRef.current) return;
                stepIndex = (stepIndex + 1) % exercise.steps.length;
                const currentStep = exercise.steps[stepIndex];
                const animationClass = currentStep.name.toLowerCase().includes('inhala') ? 'animate-inhale' : currentStep.name.toLowerCase().includes('exhala') ? 'animate-exhale' : 'animate-hold';
                setCurrentStepInfo({ name: currentStep.name, duration: currentStep.duration, animationClass });
                ttsService.speak(currentStep.name, 0.9, 1.2);
                
                if (exercise.id === 'wim-hof' && breathCount++ < 59) {
                     timeoutRef.current = window.setTimeout(cycle, currentStep.duration);
                } else if (exercise.id !== 'wim-hof') {
                    timeoutRef.current = window.setTimeout(cycle, currentStep.duration);
                }
            };
            cycle();
        };

        if (exercise.setup) await ttsService.speakSequence(exercise.setup);
        if(activePracticeRef.current) runCycle();
        
        intervalRef.current = window.setInterval(() => {
            elapsedTime += 100;
            const currentProgress = (elapsedTime / totalDuration) * 100;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                 completePractice({ date: new Date().toISOString(), exerciseName: exercise.name, durationMinutes: selectedDuration, category: 'Breathing' });
            }
        }, 100);
    };

    const startMeditation = async (meditation: IMeditation) => {
        setSelectedMeditation(meditation);
        setView('active_meditation');
        activePracticeRef.current = meditation.name;
        
        const totalDuration = meditation.script.reduce((sum, step) => sum + step.text.split(' ').length * 300 + step.pause, 0);
        let elapsedTime = 0;
        
        intervalRef.current = window.setInterval(() => {
            elapsedTime += 100;
            setProgress((elapsedTime / totalDuration) * 100);
        }, 100);

        await ttsService.speakSequence(meditation.script);
        if (activePracticeRef.current) {
            completePractice({ date: new Date().toISOString(), exerciseName: meditation.name, durationMinutes: Math.round(totalDuration / 60000) || 1, category: 'Meditation' });
        }
    }
    
    const startShamanicJourney = () => {
        setView('active_journey');
        activePracticeRef.current = 'Viaje de Sonido Chamánico Profundo';
        setJourneyStep('grounding');
    };

    useEffect(() => {
        if (view !== 'active_journey' || journeyStep === 'idle') return;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const allNodes: any[] = [];
        
        const fade = (gainNode: GainNode, targetVolume: number, duration: number) => {
            if (!audioCtx || audioCtx.state === 'closed') return;
            gainNode.gain.linearRampToValueAtTime(targetVolume, audioCtx.currentTime + duration);
        };
        const createSoundSource = (createFn: (gainNode: GainNode) => any, initialVolume = 0) => {
            if (!audioCtx) return { gainNode: null };
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = initialVolume;
            gainNode.connect(audioCtx.destination);
            createFn(gainNode);
            return { gainNode };
        };
        const playDrum = () => {
            if (!audioCtx || audioCtx.state === 'closed') return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioElementsRef.current.drum.gainNode);
            osc.frequency.setValueAtTime(120, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.5);
        };
        const playRainstick = (gainNode: GainNode) => {
            if (!audioCtx || audioCtx.state === 'closed') return;
            const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1)*Math.pow(1-i/data.length,2);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(gainNode);
            source.start();
            allNodes.push(source);
        };
        const createDrone = (gainNode: GainNode) => createOscillator(gainNode, 50, 'sine', 0.1, 5);
        const createWind = (gainNode: GainNode) => {
             const noise = audioCtx.createBufferSource();
             const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate*5, audioCtx.sampleRate);
             const data = buffer.getChannelData(0);
             for (let i=0; i<data.length; i++) data[i] = Math.random()*2-1;
             noise.buffer = buffer; noise.loop = true;
             const filter = audioCtx.createBiquadFilter();
             filter.type = 'bandpass'; filter.frequency.value = 1000; filter.Q.value = 0.5;
             noise.connect(filter); filter.connect(gainNode); noise.start();
             allNodes.push(noise, filter);
        };
        const createChant = (gainNode: GainNode) => [60, 62, 65].forEach(f => createOscillator(gainNode, f, 'sawtooth'));
        const createOscillator = (gainNode: GainNode, freq: number, type: OscillatorType, lfoFreq?: number, lfoGain?: number) => {
            const osc = audioCtx.createOscillator();
            osc.type = type; osc.frequency.value = freq;
            if (lfoFreq && lfoGain) {
                const lfo = audioCtx.createOscillator(); lfo.frequency.value = lfoFreq;
                const lfoG = audioCtx.createGain(); lfoG.gain.value = lfoGain;
                lfo.connect(lfoG); lfoG.connect(osc.frequency); lfo.start();
                allNodes.push(lfo, lfoG);
            }
            osc.connect(gainNode); osc.start(); allNodes.push(osc);
        };

        audioElementsRef.current = {
            drum: createSoundSource(() => {}),
            rainstick: createSoundSource(playRainstick),
            drone: createSoundSource(createDrone),
            wind: createSoundSource(createWind),
            chant: createSoundSource(createChant),
            fade,
            nodes: allNodes,
            drumInterval: setInterval(playDrum, 333),
        };

        const runJourneyStep = async () => {
            if (!activePracticeRef.current) return;
            const { fade, drum, rainstick, drone, chant, wind } = audioElementsRef.current;
            if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
            if (navigator.vibrate) navigator.vibrate(0);

            switch (journeyStep) {
                case 'grounding':
                    vibrationIntervalRef.current = window.setInterval(() => navigator.vibrate([100, 50, 100]), 1250);
                    await ttsService.speakSequence([{ text: "Bienvenido a un viaje chamánico profundo. Cierra los ojos. Siente el peso de tu cuerpo.", pause: 4000 }, { text: "Tu intención es tu mapa. ¿Qué sabiduría buscas?", pause: 5000 }]);
                    if (activePracticeRef.current) setJourneyStep('descent');
                    break;
                case 'descent':
                    fade(drone.gainNode, 0.1, 5); fade(wind.gainNode, 0.05, 10); fade(drum.gainNode, 0.4, 5); fade(chant.gainNode, 0.15, 10);
                    vibrationIntervalRef.current = window.setInterval(() => navigator.vibrate(50), 333);
                    await ttsService.speak("El tambor ha comenzado. Este es el latido de la Tierra, guiándote hacia abajo. Los cantos ancestrales te envuelven.", 0.9);
                    timeoutRef.current = window.setTimeout(() => { if (activePracticeRef.current) setJourneyStep('deepening'); }, 120000);
                    break;
                case 'deepening':
                     vibrationIntervalRef.current = window.setInterval(() => navigator.vibrate(1000), 4000);
                     await ttsService.speak("Continúa descendiendo... Más allá del pensamiento...", 0.9);
                    timeoutRef.current = window.setTimeout(() => { if (activePracticeRef.current) setJourneyStep('vision'); }, 180000);
                    break;
                 case 'vision':
                    fade(drum.gainNode, 0.25, 10); fade(chant.gainNode, 0.1, 10);
                    vibrationIntervalRef.current = window.setInterval(() => navigator.vibrate(1500), 5000);
                    await ttsService.speak("Estás en el corazón del viaje. Permanece abierto. Recibe tu regalo.", 0.9);
                    timeoutRef.current = window.setTimeout(() => { if (activePracticeRef.current) setJourneyStep('return'); }, 120000);
                    break;
                case 'return':
                    if (audioElementsRef.current.drumInterval) clearInterval(audioElementsRef.current.drumInterval);
                    vibrationIntervalRef.current = window.setInterval(() => navigator.vibrate([20, 80, 20]), 510);
                    fade(drum.gainNode, 0, 10); fade(chant.gainNode, 0, 15); fade(rainstick.gainNode, 0.2, 5);
                    await ttsService.speak("El tambor se desvanece. Escucha la lluvia purificadora. Es el llamado para volver.", 0.9);
                    timeoutRef.current = window.setTimeout(() => { if (activePracticeRef.current) setJourneyStep('integration'); }, 120000);
                    break;
                case 'integration':
                    fade(rainstick.gainNode, 0, 5); fade(wind.gainNode, 0, 10); fade(drone.gainNode, 0, 10);
                    await ttsService.speakSequence([{ text: "Estás de vuelta. Siente tu cuerpo. Respira.", pause: 5000 }, { text: "El viaje ha terminado, pero la integración comienza. ¿Qué te ha traído de vuelta? Agradece.", pause: 6000 }]);
                    if (activePracticeRef.current) setJourneyStep('finished');
                    break;
                case 'finished':
                    completePractice({ date: new Date().toISOString(), exerciseName: 'Viaje de Sonido Chamánico Profundo', durationMinutes: 10, category: 'Shamanic Journey' });
                    break;
            }
        };
        runJourneyStep();
    }, [journeyStep]);


    const handleStartQuest = async (quest: INeuroQuest) => {
        setView('active_quest');
        activePracticeRef.current = quest.name;
        setActiveQuest(quest);
        setQuestStep('intention');
        const stepScript = quest.script.find(s => s.step === 'intention');
        if (stepScript) await ttsService.speak(stepScript.text);
        if(activePracticeRef.current) setQuestStep('practice');
    };
    
    useEffect(() => {
        const runPractice = async () => {
            if (activePracticeRef.current && activeQuest && questStep === 'practice') {
                 const stepScript = activeQuest.script.find(s => s.step === 'practice');
                 if (stepScript) await ttsService.speak(stepScript.text);
                 if(activePracticeRef.current) setQuestStep('reflection');
            }
        }
        runPractice();
    }, [questStep, activeQuest]);

    const handleStartMentalDump = () => {
        setView('active_dump');
        activePracticeRef.current = 'Vaciado Mental Guiado';
        ttsService.speak("Bienvenido al Vaciado Mental. El objetivo es sacar de tu mente todo lo que te preocupa para que puedas descansar. Empecemos.").then(() => {
            if(activePracticeRef.current) ttsService.speak(mentalDumpPrompts[0].instruction);
        });
    };
    
    const handleNextDumpStep = () => {
        if (mentalDumpStep < mentalDumpPrompts.length - 1) {
            setMentalDumpStep(prev => prev + 1);
            ttsService.speak(mentalDumpPrompts[mentalDumpStep + 1].instruction);
        } else {
            ttsService.speak("Excelente. Has vaciado tu mente. Estos pensamientos están a salvo y ya no necesitan ocupar tu espacio esta noche.");
            completePractice({ date: new Date().toISOString(), exerciseName: 'Vaciado Mental Guiado', durationMinutes: 5, category: 'Meditation' });
        }
    };
    
    // Tabbed Content
    const renderTabContent = () => {
        switch(activeTab) {
            case 'calm': return (
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-100 mt-2">Respiración Guiada</h3>
                    {BREATHING_EXERCISES.map(ex => <button key={ex.id} onClick={() => startBreathingExercise(ex)} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{ex.name}</h4><p className="text-xs text-slate-400">{ex.description}</p></button>)}
                    <h3 className="font-semibold text-slate-100 mt-4">Meditación</h3>
                    {GUIDED_MEDITATIONS.map(med => <button key={med.id} onClick={() => startMeditation(med)} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{med.name}</h4><p className="text-xs text-slate-400">{med.description}</p></button>)}
                    <h3 className="font-semibold text-slate-100 mt-4">Liberación Mental</h3>
                    <button onClick={handleStartMentalDump} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>Vaciado Mental Guiado</h4><p className="text-xs text-slate-400">Escribe y suelta tus preocupaciones para un descanso reparador.</p></button>
                </div>
            );
            case 'body': return (
                 <div className="space-y-3">
                     <h3 className="font-semibold text-slate-100 mt-2">Movimiento Consciente</h3>
                     {MOVEMENT_VIDEOS.map(vid => <button key={vid.id} onClick={() => { setSelectedVideo(vid); setView('active_movement'); activePracticeRef.current = vid.name; }} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{vid.name}</h4><p className="text-xs text-slate-400">{vid.description}</p></button>)}
                </div>
            );
            case 'rituals': return (
                <div className="space-y-3">
                     <h3 className="font-semibold text-slate-100 mt-2">Rituales Neuroquímicos</h3>
                    {NEURO_QUESTS.map(q => <button key={q.id} onClick={() => handleStartQuest(q)} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{q.name}</h4><p className="text-xs text-slate-400">{q.description}</p></button>)}
                     <h3 className="font-semibold text-slate-100 mt-4">Ritual de Introspección</h3>
                     <button onClick={startShamanicJourney} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>Viaje de Sonido Chamánico</h4><p className="text-xs text-slate-400">Una experiencia de inmersión profunda para la introspección.</p></button>
                </div>
            );
        }
    }
    
    // Active Session Renders
    const renderActiveBreathing = () => (
        <div className="text-center">
            <h3 className="text-lg font-bold text-slate-100 mb-4">{selectedExercise?.name}</h3>
            <div className="flex items-center justify-center my-4 h-40">
                <div className="relative w-36 h-36"><div className={`absolute inset-0 bg-teal-400 rounded-full ${currentStepInfo.animationClass}`} /><div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{currentStepInfo.name}</div></div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4"><div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} /></div>
            <button onClick={() => cleanup()} className="w-full bg-red-600 text-white font-semibold py-3 px-5 rounded-lg">Detener</button>
        </div>
    );
     const renderActiveMeditation = () => (
        <div className="text-center">
            <h3 className="text-lg font-bold text-slate-100 mb-4">{selectedMeditation?.name}</h3>
            <p className="text-slate-400 mb-4">Escucha la guía de Kai...</p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} /></div>
            <button onClick={() => cleanup()} className="w-full bg-red-600 text-white font-semibold py-3 px-5 rounded-lg">Detener</button>
        </div>
    );
    const renderActiveMovement = () => (
         <>
            <button onClick={() => { setSelectedVideo(null); setView('tabs'); activePracticeRef.current = null; }} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver'}</button>
            <h3 className="font-bold text-slate-100 text-lg mb-2">{selectedVideo?.name}</h3>
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden"><iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideo?.youtubeId}?autoplay=1`} title={selectedVideo?.name} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe></div>
            <button onClick={() => completePractice({ date: new Date().toISOString(), exerciseName: selectedVideo!.name, durationMinutes: selectedVideo!.duration, category: 'Movement' })} className="w-full mt-4 bg-lime-600 text-white font-semibold py-3 px-5 rounded-lg">He completado esta rutina</button>
         </>
    );
    const renderActiveQuest = () => (
        <div className="p-3 bg-slate-700/50 rounded-lg">
            <h3 className="text-md font-semibold mb-2 text-center text-yellow-300">{activeQuest?.name}</h3>
            <p className="text-sm text-slate-300 mb-3 text-center">{activeQuest?.script.find(s=>s.step===questStep)?.text}</p>
            {questStep === 'reflection' && <textarea value={questTextInput} onChange={(e) => setQuestTextInput(e.target.value)} placeholder="Escribe tu reflexión..." className="w-full h-24 p-2 bg-slate-700 rounded-lg"/>}
            <div className="flex gap-2 mt-3">
                 <button onClick={() => cleanup()} className="flex-1 text-xs text-slate-400 hover:underline">Cancelar</button>
                 <button onClick={() => completeDopamineHit({ id: crypto.randomUUID(), date: new Date().toISOString(), activity: activeQuest!.activityLogName, category: activeQuest!.category })} disabled={questStep !== 'reflection' || questTextInput.trim().length < 10} className="flex-1 bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-slate-500">Completar</button>
            </div>
        </div>
    );
    const renderShamanicJourney = () => {
        const stepText: Record<JourneyStep, string> = { idle: '', grounding: 'Enraizando...', descent: 'Descendiendo...', deepening: 'Profundizando...', vision: 'Recibiendo...', return: 'Regresando...', integration: 'Integrando...', finished: 'Completado.' };
        return (
            <div className="text-center">
                 <h3 className="font-bold text-slate-100 text-lg mb-2">Viaje de Sonido Chamánico</h3>
                 <div className="p-4 bg-slate-900/50 rounded-lg">
                     <div className={`relative w-32 h-32 mx-auto my-4 journey-${journeyStep}`}><div className="visual-bg"></div><div className="visual-core"></div></div>
                     <p className="text-purple-300 font-semibold min-h-[24px]">{stepText[journeyStep]}</p>
                     {journeyStep !== 'finished' ? 
                        <button onClick={() => cleanup()} className="w-full mt-4 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">Detener Viaje</button> :
                        <button onClick={() => cleanup(true)} className="w-full mt-4 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg">Finalizar</button>
                    }
                 </div>
            </div>
        );
    };
    const renderMentalDump = () => {
        const currentPrompt = mentalDumpPrompts[mentalDumpStep];
        return (
            <>
                <h3 className="font-bold text-slate-100 text-lg mb-2">Vaciado Mental Guiado</h3>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="font-semibold text-teal-300">{currentPrompt.title}</p>
                    <p className="text-sm text-slate-300 mb-3">{currentPrompt.instruction}</p>
                    <textarea key={mentalDumpStep} placeholder={currentPrompt.placeholder} className="w-full h-28 p-3 bg-slate-700 rounded-lg" autoFocus/>
                    <div className="flex gap-2 mt-3">
                        <button onClick={() => cleanup()} className="flex-1 text-xs text-slate-400 hover:underline">Cancelar</button>
                        <button onClick={handleNextDumpStep} className="flex-1 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg">{mentalDumpStep < 2 ? 'Siguiente' : 'Finalizar'}</button>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
             <style>{`
                @keyframes inhale { from { transform: scale(1); } to { transform: scale(1.15); } }
                @keyframes exhale { from { transform: scale(1.15); } to { transform: scale(1); } }
                .animate-inhale, .animate-exhale, .animate-hold { animation-duration: ${currentStepInfo.duration}ms; }
                .animate-inhale { animation-name: inhale; } .animate-exhale { animation-name: exhale; }
                .visual-bg, .visual-core { position: absolute; top:0;left:0;right:0;bottom:0; border-radius: 50%; transition: all 1.5s ease-in-out; }
                .journey-grounding .visual-bg { background: radial-gradient(circle, #384269, #1e293b); animation: pulse 4s infinite; }
                .journey-descent .visual-bg, .journey-return .visual-bg { background: radial-gradient(circle, #4c1d95, #2e1065); animation: pulse 2s infinite; }
                .journey-deepening .visual-bg { background: radial-gradient(circle, #1e1b4b, #171717); animation: swirl 10s linear infinite; }
                .journey-vision .visual-bg { background: radial-gradient(circle, #86198f, #4a044e); animation: pulse 1s infinite; }
                .journey-integration .visual-bg, .journey-finished .visual-bg { background: radial-gradient(circle, #384269, #1e293b); animation: pulse 5s infinite; }
                @keyframes pulse { 50% { opacity: 0.8; } } @keyframes swirl { to { transform: rotate(360deg); } }
                .aspect-w-16 { position: relative; padding-bottom: 56.25%; } .aspect-h-9 { height: 0; }
                .aspect-w-16 > iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
             `}</style>
            
            {view === 'tabs' ? (
                <>
                    <div className="flex items-center space-x-3 mb-3">
                        <LungsIcon />
                        <h2 className="text-xl font-bold text-slate-100">Santuario de Bienestar</h2>
                    </div>
                    <div className="border-b border-slate-700 mb-4">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            {([['calm', 'Calma'], ['body', 'Cuerpo'], ['rituals', 'Rituales']] as [SanctuaryTab, string][]).map(([tabId, tabName]) => (
                                <button key={tabId} onClick={() => setActiveTab(tabId)}
                                    className={`${activeTab === tabId ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}
                                    whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>
                                    {tabName}
                                </button>
                            ))}
                        </nav>
                    </div>
                    {renderTabContent()}
                </>
            ) : view === 'active_breathing' ? renderActiveBreathing()
              : view === 'active_meditation' ? renderActiveMeditation()
              : view === 'active_movement' ? renderActiveMovement()
              : view === 'active_quest' ? renderActiveQuest()
              : view === 'active_journey' ? renderShamanicJourney()
              : view === 'active_dump' ? renderMentalDump()
              : null
            }
        </div>
    );
};

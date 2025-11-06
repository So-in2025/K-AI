

import React, { useState, useEffect, useRef } from 'react';
import { BREATHING_EXERCISES, GUIDED_MEDITATIONS, MOVEMENT_VIDEOS, NEURO_QUESTS } from '../constants';
import { IExercise, IWellnessActivity, IMeditation, IMovementVideo, IDopamineHit, INeuroQuest } from '../types';
import ttsService from '../services/ttsService';
import { TtsInfoButton } from './TtsInfoButton';

// --- ICONOS PARA PESTAÑAS Y BOTONES ---
const LungsIcon = ({className = "h-6 w-6"}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>);
const BrainIcon = ({className = "h-6 w-6"}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M12 6v.01M12 12v.01M12 18v.01" /></svg>);
const BodyIcon = ({className = "h-6 w-6"}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15A2 2 0 014 13.586V6.414A2 2 0 015.586 5h12.828A2 2 0 0120 6.414v7.172A2 2 0 0118.414 15H5.586z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v5m-3-5v5m6-5v5" /></svg>);
const MoonIcon = ({className = "h-6 w-6"}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const SparklesIcon = ({className = "h-6 w-6"}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" /></svg>);
const FeatherIcon = ({className = "h-6 w-6"}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12V3m0 9a3 3 0 013 3v0a3 3 0 01-3 3m0-6h11.586l-4.293 4.293a1 1 0 001.414 1.414l6-6a1 1 0 000-1.414l-6-6a1 1 0 00-1.414 1.414L16.586 9H5z" /></svg>);
const LockIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>);


interface WellnessSanctuaryCardProps {
    onLogActivity: (activity: IWellnessActivity) => void;
    onLogDopamineHit: (hit: IDopamineHit) => void;
    isSubscribed: boolean;
}

type SanctuaryTab = 'breathing' | 'meditation' | 'movement' | 'rest' | 'neuro' | 'journey';
type View = 'tabs' | 'active_breathing' | 'active_meditation' | 'active_movement' | 'active_quest' | 'active_journey' | 'active_dump';
type JourneyStep = 'idle' | 'grounding' | 'descent' | 'deepening' | 'vision' | 'return' | 'integration' | 'finished';
type JourneyType = 'shamanic' | 'solfeggio' | 'binaural' | 'trauma-release' | 'manifestation' | 'nature-connect';
type QuestStep = 'intention' | 'practice' | 'reflection' | 'done';

const mentalDumpPrompts = [
    { title: "Tareas Pendientes", instruction: "Primero, escribe todo lo que tengas pendiente para mañana.", placeholder: "Ej: Enviar el correo a Juan..." },
    { title: "Conversaciones en tu Mente", instruction: "Ahora, escribe cualquier conversación que siga dando vueltas en tu mente.", placeholder: "Ej: La llamada con mi madre..." },
    { title: "Preocupaciones Futuras", instruction: "Finalmente, escribe cualquier preocupación sobre el futuro.", placeholder: "Ej: ¿Qué pasará con...?" }
];


export const WellnessSanctuaryCard: React.FC<WellnessSanctuaryCardProps> = ({ onLogActivity, onLogDopamineHit, isSubscribed }) => {
    const [activeTab, setActiveTab] = useState<SanctuaryTab>('breathing');
    const [view, setView] = useState<View>('tabs');
    const [selectedExercise, setSelectedExercise] = useState<IExercise | null>(null);
    const [selectedMeditation, setSelectedMeditation] = useState<IMeditation | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<IMovementVideo | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [progress, setProgress] = useState(0);
    const [currentStepInfo, setCurrentStepInfo] = useState({ name: '', duration: 0, animationClass: '' });
    
    const [journeyStep, setJourneyStep] = useState<JourneyStep>('idle');
    const [journeyType, setJourneyType] = useState<JourneyType | null>(null);
    const [journeyTimeLeft, setJourneyTimeLeft] = useState<number>(0);
    const [activeQuest, setActiveQuest] = useState<INeuroQuest | null>(null);
    const [questStep, setQuestStep] = useState<QuestStep>('intention');
    const [questTextInput, setQuestTextInput] = useState('');
    const [mentalDumpStep, setMentalDumpStep] = useState(0);

    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioElementsRef = useRef<{ [key: string]: any }>({});
    const vibrationIntervalRef = useRef<number | null>(null);
    const journeyTimerIntervalRef = useRef<number | null>(null);
    const practiceCompletedRef = useRef(false);
    const activePracticeRef = useRef<string | null>(null);

    const cleanup = (isCompleted: boolean = false) => {
        // Stop sounds with a fade
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
            const { drum, solfeggio, drone, binaural, noise, shimmer, focus, fade } = audioElementsRef.current;
            const fadeDuration = 0.5; // half a second to fade out
            if (fade) {
                if (drum?.gainNode) fade(drum.gainNode, 0, fadeDuration);
                if (solfeggio?.gainNode) fade(solfeggio.gainNode, 0, fadeDuration);
                if (drone?.gainNode) fade(drone.gainNode, 0, fadeDuration);
                if (binaural?.gainNode) fade(binaural.gainNode, 0, fadeDuration);
                if (noise?.gainNode) fade(noise.gainNode, 0, fadeDuration);
                if (shimmer?.gainNode) fade(shimmer.gainNode, 0, fadeDuration);
                if (focus?.gainNode) fade(focus.gainNode, 0, fadeDuration);
            }
            
            setTimeout(() => {
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close().catch(console.error);
                }
            }, fadeDuration * 1000 + 100);
        } else if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
        
        // Clear intervals immediately
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
        if (audioElementsRef.current.drumInterval) clearInterval(audioElementsRef.current.drumInterval);
        if (journeyTimerIntervalRef.current) clearInterval(journeyTimerIntervalRef.current);
        
        ttsService.stop();
        if(navigator.vibrate) navigator.vibrate(0);
        
        if (activePracticeRef.current && !isCompleted && !practiceCompletedRef.current) {
             ttsService.speak("Noté que no terminamos la práctica. Recuerda que cada pequeño esfuerzo cuenta. Vuelve cuando estés listo.");
        }

        // Reset states
        setJourneyStep('idle');
        setJourneyType(null);
        setJourneyTimeLeft(0);
        setView('tabs');
        setSelectedExercise(null); setSelectedMeditation(null); setSelectedVideo(null);
        setActiveQuest(null); setProgress(0);
        setCurrentStepInfo({ name: '', duration: 0, animationClass: '' });
        setQuestTextInput(''); setQuestStep('intention'); setMentalDumpStep(0);
        
        // Reset refs
        intervalRef.current = null; 
        timeoutRef.current = null; 
        audioContextRef.current = null;
        audioElementsRef.current = {}; 
        vibrationIntervalRef.current = null;
        journeyTimerIntervalRef.current = null;
        practiceCompletedRef.current = false; 
        activePracticeRef.current = null;
    };
    
    useEffect(() => {
        return () => cleanup(practiceCompletedRef.current);
    }, []);

    const completePractice = (activity: IWellnessActivity) => {
        if (practiceCompletedRef.current) return;
        practiceCompletedRef.current = true;
        onLogActivity(activity);
        ttsService.speak("Excelente trabajo. Has completado tu ejercicio. Cada práctica es un paso hacia tu bienestar.");
        cleanup(true);
    }
    
    const completeDopamineHit = (hit: IDopamineHit) => {
        if (practiceCompletedRef.current) return;
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
    
    const startShamanicJourney = (type: JourneyType) => {
        setJourneyType(type);
        setView('active_journey');
        activePracticeRef.current = `Viaje Sonoro (${type})`;

        const totalDurationSeconds = 12 * 60;
        setJourneyTimeLeft(totalDurationSeconds);

        if (journeyTimerIntervalRef.current) clearInterval(journeyTimerIntervalRef.current);
        journeyTimerIntervalRef.current = window.setInterval(() => {
            setJourneyTimeLeft(prev => {
                if (prev <= 1) {
                    if (journeyTimerIntervalRef.current) clearInterval(journeyTimerIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setJourneyStep('grounding');
    };

    useEffect(() => {
        if (view !== 'active_journey' || journeyStep === 'idle' || !journeyType) return;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const allNodes: any[] = [];
        
        const fade = (gainNode: GainNode, targetVolume: number, duration: number) => { if (!audioCtx || audioCtx.state === 'closed') return; gainNode.gain.linearRampToValueAtTime(targetVolume, audioCtx.currentTime + duration); };
        const createSoundSource = (createFn: (gainNode: GainNode) => any, initialVolume = 0) => { if (!audioCtx) return { gainNode: null }; const gainNode = audioCtx.createGain(); gainNode.gain.value = initialVolume; gainNode.connect(audioCtx.destination); allNodes.push(gainNode); createFn(gainNode); return { gainNode }; };
        const playDrum = () => { if (!audioCtx || audioCtx.state === 'closed' || !audioElementsRef.current.drum) return; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioElementsRef.current.drum.gainNode); osc.frequency.setValueAtTime(120, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15); gain.gain.setValueAtTime(1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.5); allNodes.push(osc, gain); };
        const createDrone = (gainNode: GainNode, freq: number) => createOscillator(gainNode, freq, 'sine');
        const createBinaural = (gainNode: GainNode, baseFreq: number, beatFreq: number) => { if(!audioCtx) return; const pannerL = audioCtx.createStereoPanner(); pannerL.pan.value = -1; const pannerR = audioCtx.createStereoPanner(); pannerR.pan.value = 1; createOscillator(pannerL, baseFreq - beatFreq / 2, 'sine'); createOscillator(pannerR, baseFreq + beatFreq / 2, 'sine'); pannerL.connect(gainNode); pannerR.connect(gainNode); allNodes.push(pannerL, pannerR); };
        const createOscillator = (node: AudioNode, freq: number, type: OscillatorType) => { if(!audioCtx) return; const osc = audioCtx.createOscillator(); osc.type = type; osc.frequency.value = freq; osc.connect(node); osc.start(); allNodes.push(osc); };
        const createFilteredNoise = (gainNode: GainNode, type: BiquadFilterType, frequency: number) => { if (!audioCtx) return; const noise = audioCtx.createBufferSource(); const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate); const data = buffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1; noise.buffer = buffer; noise.loop = true; const filter = audioCtx.createBiquadFilter(); filter.type = type; filter.frequency.value = frequency; noise.connect(filter); filter.connect(gainNode); noise.start(); allNodes.push(noise, filter); };

        let sounds: { [key: string]: any } = { nodes: allNodes, fade };
        if (journeyType === 'shamanic') {
             sounds.drum = createSoundSource(() => {}, 0);
             sounds.drumInterval = setInterval(playDrum, 333);
        } else if (journeyType === 'solfeggio') {
             sounds.solfeggio = createSoundSource(g => createOscillator(g, 528, 'sine'), 0);
             sounds.drone = createSoundSource(g => createDrone(g, 60), 0);
        } else if (journeyType === 'binaural') {
             sounds.binaural = createSoundSource(g => createBinaural(g, 100, 7), 0); // Theta wave
             sounds.noise = createSoundSource(g => { if(!audioCtx) return; const noise = audioCtx.createBufferSource(); const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate*2, audioCtx.sampleRate); const data = buffer.getChannelData(0); for (let i=0; i<data.length; i++) data[i] = Math.random()*2-1; noise.buffer = buffer; noise.loop = true; noise.connect(g); noise.start(); allNodes.push(noise); }, 0);
        } else if (journeyType === 'trauma-release') {
            sounds.drone = createSoundSource(g => createDrone(g, 98), 0);
            sounds.binaural = createSoundSource(g => createBinaural(g, 100, 10), 0);
            sounds.shimmer = createSoundSource(g => createOscillator(g, 392, 'sine'), 0);
        } else if (journeyType === 'manifestation') {
            sounds.drone = createSoundSource(g => createDrone(g, 261), 0);
            sounds.focus = createSoundSource(g => createOscillator(g, 417, 'sine'), 0);
            sounds.binaural = createSoundSource(g => createBinaural(g, 150, 15), 0);
        } else if (journeyType === 'nature-connect') {
            sounds.drone = createSoundSource(g => createDrone(g, 87), 0);
            sounds.noise = createSoundSource(g => createFilteredNoise(g, 'lowpass', 400), 0);
        }
        audioElementsRef.current = sounds;

        const runJourneyStep = async () => {
            if (!activePracticeRef.current) return;
            const { fade } = audioElementsRef.current;
            if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
            if (navigator.vibrate) navigator.vibrate(0);

            switch (journeyStep) {
                case 'grounding':
                    if (journeyType === 'shamanic') fade(audioElementsRef.current.drum.gainNode, 0.4, 5);
                    if (journeyType === 'solfeggio') { fade(audioElementsRef.current.solfeggio.gainNode, 0.3, 5); fade(audioElementsRef.current.drone.gainNode, 0.1, 10); }
                    if (journeyType === 'binaural') { fade(audioElementsRef.current.binaural.gainNode, 0.5, 5); fade(audioElementsRef.current.noise.gainNode, 0.05, 10); }
                    if (journeyType === 'trauma-release') { fade(audioElementsRef.current.drone.gainNode, 0.2, 10); fade(audioElementsRef.current.binaural.gainNode, 0.4, 5); fade(audioElementsRef.current.shimmer.gainNode, 0.05, 15); }
                    if (journeyType === 'manifestation') { fade(audioElementsRef.current.drone.gainNode, 0.2, 10); fade(audioElementsRef.current.focus.gainNode, 0.15, 12); fade(audioElementsRef.current.binaural.gainNode, 0.3, 5); }
                    if (journeyType === 'nature-connect') { fade(audioElementsRef.current.drone.gainNode, 0.3, 10); fade(audioElementsRef.current.noise.gainNode, 0.1, 8); }
                    await ttsService.speakSequence([{ text: "Comenzamos. Cierra los ojos. Concéntrate en tu respiración.", pause: 4000 }]);
                    if (activePracticeRef.current) setJourneyStep('descent');
                    break;
                case 'descent':
                    await ttsService.speak("Permite que el sonido te guíe hacia adentro.", 0.9);
                    timeoutRef.current = window.setTimeout(() => { if (activePracticeRef.current) setJourneyStep('deepening'); }, 120000);
                    break;
                case 'deepening':
                     await ttsService.speak("Más profundo...", 0.9);
                     timeoutRef.current = window.setTimeout(() => { if (activePracticeRef.current) setJourneyStep('vision'); }, 180000);
                     break;
                case 'vision':
                     await ttsService.speak("Permanece abierto. Observa sin juicio.", 0.9);
                     timeoutRef.current = window.setTimeout(() => { if (activePracticeRef.current) setJourneyStep('return'); }, 180000);
                     break;
                case 'return':
                    if (journeyType === 'shamanic') fade(audioElementsRef.current.drum.gainNode, 0, 10);
                    if (journeyType === 'solfeggio') { fade(audioElementsRef.current.solfeggio.gainNode, 0, 10); fade(audioElementsRef.current.drone.gainNode, 0, 15); }
                    if (journeyType === 'binaural') { fade(audioElementsRef.current.binaural.gainNode, 0, 10); fade(audioElementsRef.current.noise.gainNode, 0, 15); }
                    if (journeyType === 'trauma-release') { fade(audioElementsRef.current.drone.gainNode, 0, 15); fade(audioElementsRef.current.binaural.gainNode, 0, 10); fade(audioElementsRef.current.shimmer.gainNode, 0, 12); }
                    if (journeyType === 'manifestation') { fade(audioElementsRef.current.drone.gainNode, 0, 15); fade(audioElementsRef.current.focus.gainNode, 0, 12); fade(audioElementsRef.current.binaural.gainNode, 0, 10); }
                    if (journeyType === 'nature-connect') { fade(audioElementsRef.current.drone.gainNode, 0, 15); fade(audioElementsRef.current.noise.gainNode, 0, 10); }
                    await ttsService.speak("Es hora de volver. Lentamente, trae tu conciencia de vuelta a tu cuerpo.", 0.9);
                    timeoutRef.current = window.setTimeout(() => { if (activePracticeRef.current) setJourneyStep('integration'); }, 60000);
                    break;
                case 'integration':
                    await ttsService.speakSequence([{ text: "Respira hondo. Siente el espacio que te rodea.", pause: 5000 }, { text: "El viaje ha terminado. Agradece la experiencia.", pause: 6000 }]);
                    if (activePracticeRef.current) setJourneyStep('finished');
                    break;
                case 'finished':
                    let name = 'Viaje Sonoro';
                    if (journeyType === 'shamanic') name = 'Viaje de Sonido Chamánico';
                    if (journeyType === 'solfeggio') name = 'Viaje de Frecuencias Solfeggio';
                    if (journeyType === 'binaural') name = 'Viaje de Sonido Binaural';
                    if (journeyType === 'trauma-release') name = 'Viaje de Liberación Emocional';
                    if (journeyType === 'manifestation') name = 'Viaje de Visualización y Manifestación';
                    if (journeyType === 'nature-connect') name = 'Viaje de Conexión con la Naturaleza';
                    completePractice({ date: new Date().toISOString(), exerciseName: name, durationMinutes: 12, category: 'Shamanic Journey' });
                    break;
            }
        };
        runJourneyStep();
    }, [journeyStep, journeyType, view]);

    const handleStartQuest = async (quest: INeuroQuest) => {
        setView('active_quest'); activePracticeRef.current = quest.name; setActiveQuest(quest); setQuestStep('intention');
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
        setView('active_dump'); activePracticeRef.current = 'Vaciado Mental Guiado';
        ttsService.speak("Bienvenido al Vaciado Mental. El objetivo es sacar de tu mente lo que preocupa para que puedas descansar.").then(() => {
            if(activePracticeRef.current) ttsService.speak(mentalDumpPrompts[0].instruction);
        });
    };
    
    const handleNextDumpStep = () => {
        if (mentalDumpStep < mentalDumpPrompts.length - 1) {
            setMentalDumpStep(prev => prev + 1);
            ttsService.speak(mentalDumpPrompts[mentalDumpStep + 1].instruction);
        } else {
            ttsService.speak("Excelente. Has vaciado tu mente. Estos pensamientos están a salvo y ya no necesitan ocupar tu espacio.");
            completePractice({ date: new Date().toISOString(), exerciseName: 'Vaciado Mental Guiado', durationMinutes: 5, category: 'Meditation' });
        }
    };
    
    const tabs: { id: SanctuaryTab; name: string; icon: React.FC<{className?: string}>; color: string }[] = [
        { id: 'breathing', name: 'Respiración', icon: LungsIcon, color: 'text-teal-400' },
        { id: 'meditation', name: 'Meditación', icon: BrainIcon, color: 'text-indigo-400' },
        { id: 'movement', name: 'Movimiento', icon: BodyIcon, color: 'text-lime-400' },
        { id: 'rest', name: 'Descanso', icon: MoonIcon, color: 'text-purple-400' },
        { id: 'neuro', name: 'Neuro-Rituales', icon: SparklesIcon, color: 'text-yellow-400' },
        { id: 'journey', name: 'Viaje Sonoro', icon: FeatherIcon, color: 'text-slate-400' },
    ];

    const renderTabContent = () => (
        <div className="mt-4 space-y-3">
            {activeTab === 'breathing' && (
                <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-slate-400 relative">
                    <TtsInfoButton explanation="La respiración consciente es la forma más rápida de regular tu sistema nervioso. Al controlar tu respiración, activas el nervio vago y pasas de un estado de 'lucha o huida' a uno de 'descanso y digestión', reduciendo el cortisol y la ansiedad." className="!text-slate-400 hover:!text-teal-400" />
                    <p><strong className="text-slate-200">¿Cómo funciona?</strong> Estas técnicas calman tu sistema nervioso para reducir el estrés y la ansiedad de forma inmediata.</p>
                </div>
            )}
            {activeTab === 'breathing' && BREATHING_EXERCISES.map(ex => <button key={ex.id} onClick={() => startBreathingExercise(ex)} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{ex.name}</h4><p className="text-xs text-slate-400">{ex.description}</p></button>)}

            {activeTab === 'meditation' && (
                 <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-slate-400 relative">
                    <TtsInfoButton explanation="La meditación es un entrenamiento para tu cerebro. Prácticas como el escaneo corporal fortalecen la corteza prefrontal, mejorando tu enfoque y control emocional, y reducen la actividad en la 'Red Neuronal por Defecto', lo que disminuye la rumiación y los pensamientos ansiosos." className="!text-slate-400 hover:!text-teal-400" />
                    <p><strong className="text-slate-200">¿Cómo funciona?</strong> Entrena tu mente para enfocarse en el presente, reduciendo el ruido mental y fomentando la claridad.</p>
                </div>
            )}
            {activeTab === 'meditation' && GUIDED_MEDITATIONS.map(med => <button key={med.id} onClick={() => startMeditation(med)} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{med.name}</h4><p className="text-xs text-slate-400">{med.description}</p></button>)}
            
            {activeTab === 'movement' && (
                 <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-slate-400 relative">
                    <TtsInfoButton explanation="El movimiento consciente, como el yoga suave, libera endorfinas, los analgésicos naturales de tu cuerpo, y reduce las hormonas del estrés. Además, mejora la interocepción, que es tu capacidad de sentir las señales internas de tu cuerpo, fortaleciendo la conexión mente-cuerpo." className="!text-slate-400 hover:!text-teal-400" />
                    <p><strong className="text-slate-200">¿Cómo funciona?</strong> Libera endorfinas y reduce las hormonas del estrés a través de prácticas corporales conscientes.</p>
                </div>
            )}
            {activeTab === 'movement' && MOVEMENT_VIDEOS.filter(v=>v.category === 'movement').map(vid => <button key={vid.id} onClick={() => { setSelectedVideo(vid); setView('active_movement'); activePracticeRef.current = vid.name; }} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{vid.name}</h4><p className="text-xs text-slate-400">{vid.description}</p></button>)}

            {activeTab === 'rest' && (
                <>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-slate-400 relative">
                        <TtsInfoButton explanation="El descanso activo, como el Yoga Nidra o el vaciado mental, es crucial para la recuperación neuronal. Facilita la consolidación de la memoria y permite que tu sistema nervioso parasimpático se active, lo que es esencial para la reparación celular y la reducción de la inflamación sistémica." className="!text-slate-400 hover:!text-teal-400" />
                        <p><strong className="text-slate-200">¿Cómo funciona?</strong> Prepara tu mente y cuerpo para una recuperación profunda, calmando el sistema nervioso antes de dormir.</p>
                    </div>
                    {MOVEMENT_VIDEOS.filter(v=>v.category === 'rest').map(vid => <button key={vid.id} onClick={() => { setSelectedVideo(vid); setView('active_movement'); activePracticeRef.current = vid.name; }} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{vid.name}</h4><p className="text-xs text-slate-400">{vid.description}</p></button>)}
                    <button onClick={handleStartMentalDump} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>Vaciado Mental Guiado</h4><p className="text-xs text-slate-400">Escribe y suelta tus preocupaciones para un descanso reparador.</p></button>
                </>
            )}

            {activeTab === 'neuro' && (
                 <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-slate-400 relative">
                    <TtsInfoButton explanation="Los Neuro-Rituales aprovechan la neuroplasticidad de tu cerebro. Al realizar acciones cortas y conscientes, como practicar la gratitud o celebrar un logro, activas intencionadamente las vías de recompensa de dopamina y serotonina. Repetir estos rituales fortalece estas conexiones neuronales, re-cableando tu cerebro para encontrar satisfacción en fuentes saludables y sostenibles." className="!text-slate-400 hover:!text-teal-400" />
                    <p><strong className="text-slate-200">¿Cómo funciona?</strong> Utiliza la neuroplasticidad para re-cablear tu cerebro. Pequeñas acciones conscientes para generar dopamina y serotonina de forma natural.</p>
                </div>
            )}
            {activeTab === 'neuro' && NEURO_QUESTS.map(q => <button key={q.id} onClick={() => handleStartQuest(q)} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>{q.name}</h4><p className="text-xs text-slate-400">{q.description}</p></button>)}
            
            {activeTab === 'journey' && (
                <div className="space-y-3">
                    <button onClick={() => startShamanicJourney('shamanic')} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700"><h4>Viaje de Sonido Chamánico</h4><p className="text-xs text-slate-400">Una experiencia de inmersión profunda con tambor para la introspección.</p></button>
                    
                    <button onClick={() => isSubscribed && startShamanicJourney('solfeggio')} disabled={!isSubscribed} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                        <div className="flex-grow"><h4>Viaje de Frecuencias Solfeggio (528 Hz)</h4><p className="text-xs text-slate-400">Una experiencia sanadora y armónica para la calma y la reparación.</p></div>
                        {!isSubscribed && <LockIcon />}
                    </button>
                    
                     <button onClick={() => isSubscribed && startShamanicJourney('binaural')} disabled={!isSubscribed} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                        <div className="flex-grow"><h4>Viaje de Sonido Binaural (Theta)</h4><p className="text-xs text-slate-400">Guía tus ondas cerebrales a un estado de meditación profunda y creatividad.</p></div>
                         {!isSubscribed && <LockIcon />}
                    </button>
                    
                    <button onClick={() => isSubscribed && startShamanicJourney('trauma-release')} disabled={!isSubscribed} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                        <div className="flex-grow"><h4>Viaje de Liberación Emocional</h4><p className="text-xs text-slate-400">Un espacio sonoro seguro para procesar y liberar traumas y emociones estancadas.</p></div>
                        {!isSubscribed && <LockIcon />}
                    </button>

                    <button onClick={() => isSubscribed && startShamanicJourney('manifestation')} disabled={!isSubscribed} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                        <div className="flex-grow"><h4>Viaje de Visualización y Manifestación</h4><p className="text-xs text-slate-400">Frecuencias para enfocar tu intención y alinear tu energía con tus objetivos.</p></div>
                        {!isSubscribed && <LockIcon />}
                    </button>

                    <button onClick={() => isSubscribed && startShamanicJourney('nature-connect')} disabled={!isSubscribed} className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                        <div className="flex-grow"><h4>Viaje de Conexión con la Naturaleza</h4><p className="text-xs text-slate-400">Sonidos orgánicos y frecuencias terrestres para enraizarte y sentirte parte del todo.</p></div>
                        {!isSubscribed && <LockIcon />}
                    </button>


                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg text-sm text-slate-400 relative">
                        <TtsInfoButton 
                            explanation="El Viaje Sonoro Chamánico utiliza principios de neurociencia para guiar tu cerebro hacia un estado de introspección profunda. El ritmo constante del tambor, a una frecuencia específica, induce ondas cerebrales Theta, asociadas con la meditación, la creatividad y el acceso al subconsciente. Este proceso, llamado arrastre rítmico, calma la mente consciente y permite que emerjan insights más profundos. Es una tecnología ancestral para la exploración interior."
                            className="!text-slate-400 hover:!text-teal-400"
                        />
                        <p>
                            <strong className="text-slate-200">¿Cómo funciona?</strong> Estas experiencias utilizan el arrastre rítmico para inducir estados meditativos profundos a través del sonido, facilitando la introspección. Se recomienda realizarlos no más de 2-3 veces por semana para permitir una integración adecuada.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
    
    // Active Session Renders
    const renderActiveBreathing = () => ( <div className="text-center"> <h3 className="text-lg font-bold text-slate-100 mb-4">{selectedExercise?.name}</h3> <div className="flex items-center justify-center my-4 h-40"> <div className="relative w-36 h-36"><div className={`absolute inset-0 bg-teal-400 rounded-full ${currentStepInfo.animationClass}`} /><div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{currentStepInfo.name}</div></div> </div> <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4"><div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} /></div> <button onClick={() => cleanup()} className="w-full bg-red-600 text-white font-semibold py-3 px-5 rounded-lg">Detener</button> </div> );
    const renderActiveMeditation = () => ( <div className="text-center"> <h3 className="text-lg font-bold text-slate-100 mb-4">{selectedMeditation?.name}</h3> <p className="text-slate-400 mb-4">Escucha la guía de Kai...</p> <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} /></div> <button onClick={() => cleanup()} className="w-full bg-red-600 text-white font-semibold py-3 px-5 rounded-lg">Detener</button> </div> );
    const renderActiveMovement = () => ( <> <button onClick={() => { setSelectedVideo(null); setView('tabs'); activePracticeRef.current = null; }} className="text-sm text-slate-400 mb-2 hover:underline">{'< Volver a la lista'}</button> <h3 className="font-bold text-slate-100 text-lg mb-2">{selectedVideo?.name}</h3> <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden"><iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideo?.youtubeId}?autoplay=1`} title={selectedVideo?.name} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe></div> <button onClick={() => completePractice({ date: new Date().toISOString(), exerciseName: selectedVideo!.name, durationMinutes: selectedVideo!.duration, category: 'Movement' })} className="w-full mt-4 bg-lime-600 text-white font-semibold py-3 px-5 rounded-lg">He completado esta rutina</button> </> );
    const renderActiveQuest = () => ( <div className="p-3 bg-slate-700/50 rounded-lg"> <h3 className="text-md font-semibold mb-2 text-center text-yellow-300">{activeQuest?.name}</h3> <p className="text-sm text-slate-300 mb-3 text-center">{activeQuest?.script.find(s=>s.step===questStep)?.text}</p> {questStep === 'reflection' && <textarea value={questTextInput} onChange={(e) => setQuestTextInput(e.target.value)} placeholder="Escribe tu reflexión..." className="w-full h-24 p-2 bg-slate-700 rounded-lg"/>} <div className="flex gap-2 mt-3"> <button onClick={() => cleanup()} className="flex-1 text-xs text-slate-400 hover:underline">Cancelar</button> <button onClick={() => completeDopamineHit({ id: crypto.randomUUID(), date: new Date().toISOString(), activity: activeQuest!.activityLogName, category: activeQuest!.category })} disabled={questStep !== 'reflection' || questTextInput.trim().length < 10} className="flex-1 bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-slate-500">Completar</button> </div> </div> );
    const renderShamanicJourney = () => { 
        const stepText: Record<JourneyStep, string> = { idle: '', grounding: 'Enraizando...', descent: 'Descendiendo...', deepening: 'Profundizando...', vision: 'Recibiendo Visión...', return: 'Regresando...', integration: 'Integrando...', finished: 'Completado.' }; 
        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        };
        return ( 
            <div className="text-center"> 
                <h3 className="font-bold text-slate-100 text-lg mb-2 capitalize">Viaje Sonoro {journeyType}</h3> 
                <div className="p-4 bg-slate-900/50 rounded-lg"> 
                    <div className={`journey-visual journey-${journeyStep}`}>
                        <div className="heart"></div>
                        <div className="energy-ring"></div>
                        <div className="particle p1"></div>
                        <div className="particle p2"></div>
                        <div className="particle p3"></div>
                    </div> 
                    <p className="text-purple-300 font-semibold min-h-[24px] transition-opacity duration-500">{stepText[journeyStep]}</p> 
                    {journeyStep !== 'finished' && journeyStep !== 'idle' && (
                        <p className="text-sm text-slate-400 font-mono mt-2">
                            Tiempo restante: {formatTime(journeyTimeLeft)}
                        </p>
                    )}
                    {journeyStep !== 'finished' ? 
                        <button onClick={() => cleanup()} className="w-full mt-4 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">Detener Viaje</button> 
                        : <button onClick={() => cleanup(true)} className="w-full mt-4 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg">Finalizar</button> 
                    } 
                </div> 
            </div> 
        ); 
    };
    const renderMentalDump = () => { const currentPrompt = mentalDumpPrompts[mentalDumpStep]; return ( <> <h3 className="font-bold text-slate-100 text-lg mb-2">Vaciado Mental Guiado</h3> <div className="bg-slate-700/50 p-4 rounded-lg"> <p className="font-semibold text-teal-300">{currentPrompt.title}</p> <p className="text-sm text-slate-300 mb-3">{currentPrompt.instruction}</p> <textarea key={mentalDumpStep} placeholder={currentPrompt.placeholder} className="w-full h-28 p-3 bg-slate-700 rounded-lg" autoFocus/> <div className="flex gap-2 mt-3"> <button onClick={() => cleanup()} className="flex-1 text-xs text-slate-400 hover:underline">Cancelar</button> <button onClick={handleNextDumpStep} className="flex-1 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg">{mentalDumpStep < 2 ? 'Siguiente' : 'Finalizar'}</button> </div> </div> </> ); };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
             <style>{`
                @keyframes inhale { from { transform: scale(1); } to { transform: scale(1.15); } }
                @keyframes exhale { from { transform: scale(1.15); } to { transform: scale(1); } }
                .animate-inhale, .animate-exhale, .animate-hold { animation-duration: ${currentStepInfo.duration}ms; }
                .animate-inhale { animation-name: inhale; } .animate-exhale { animation-name: exhale; }
                .aspect-w-16 { position: relative; padding-bottom: 56.25%; } .aspect-h-9 { height: 0; }
                .aspect-w-16 > iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

                .journey-visual { position: relative; width: 140px; height: 140px; margin: 1rem auto; display: flex; align-items: center; justify-content: center; }
                .heart, .energy-ring, .particle { position: absolute; transition: all 2s ease-in-out; }
                .heart { width: 40px; height: 40px; background: radial-gradient(circle, #f0abfc, #a855f7); border-radius: 50%; box-shadow: 0 0 20px #e9d5ff; }
                .energy-ring { width: 100px; height: 100px; border: 2px solid #a855f7; border-radius: 50%; opacity: 0.5; }
                .particle { width: 4px; height: 4px; background: #e9d5ff; border-radius: 50%; }

                /* Animations */
                @keyframes pulse { 50% { transform: scale(1.1); box-shadow: 0 0 30px #e9d5ff; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes burst { 0% { transform: scale(0.2); opacity: 0; } 100% { transform: scale(1.5); opacity: 1; } }
                @keyframes flow-in { 0% { transform: translate(0,0) scale(1.2); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0.1); opacity: 0; } }
                @keyframes flow-out { 0% { transform: translate(0,0) scale(0.1); opacity: 0; } 100% { transform: translate(var(--tx), var(--ty)) scale(1.2); opacity: 1; } }

                /* Grounding */
                .journey-grounding .heart { animation: pulse 4s infinite ease-in-out; }
                .journey-grounding .energy-ring { animation: pulse 4s infinite ease-in-out reverse; }
                
                /* Descent & Deepening */
                .journey-descent .heart, .journey-deepening .heart { animation: pulse 2s infinite; }
                .journey-descent .energy-ring, .journey-deepening .energy-ring { animation: spin 10s linear infinite; }
                .journey-descent .particle, .journey-deepening .particle { animation: flow-in 3s infinite; }
                .journey-deepening .heart { background: radial-gradient(circle, #d8b4fe, #7e22ce); }
                .journey-deepening .energy-ring { border-width: 3px; }

                /* Vision */
                .journey-vision .heart { background: radial-gradient(circle, #ffffff, #f0abfc); box-shadow: 0 0 40px #fff; animation: pulse 1s infinite; }
                .journey-vision .energy-ring { animation: burst 3s infinite alternate; border-color: #f0abfc; opacity: 1; }
                .journey-vision .particle { animation: flow-out 3s infinite; }

                /* Return & Integration */
                .journey-return .heart, .journey-integration .heart { animation: pulse 5s infinite; }
                .journey-return .particle { animation: flow-in 4s infinite reverse; }
                .journey-integration .energy-ring { opacity: 0.2; }
                
                /* Particle positions */
                .p1 { --tx: 70px; --ty: 0px; animation-delay: 0s; }
                .p2 { --tx: -35px; --ty: 60px; animation-delay: 1s; }
                .p3 { --tx: -35px; --ty: -60px; animation-delay: 2s; }
             `}</style>
            
            {view === 'tabs' ? (
                <>
                    <TtsInfoButton explanation="Bienvenido al Santuario de Bienestar. Este es tu espacio para practicar la calma y la conexión. Explora las diferentes pestañas para encontrar ejercicios de respiración, meditaciones, movimiento consciente, rituales para re-cablear tu cerebro y viajes de sonido para una introspección profunda. Cada práctica es una herramienta para tu sanación." />
                    <div className="flex items-center space-x-3 mb-3">
                        <LungsIcon className="h-8 w-8 text-teal-400" />
                        <h2 className="text-xl font-bold text-slate-100">Santuario de Bienestar</h2>
                    </div>
                     <div className="border-b border-slate-700">
                        <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm transition-colors
                                    ${activeTab === tab.id ? `${tab.color.replace('text-', 'border-')} ${tab.color}` : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                                    <tab.icon />
                                    <span>{tab.name}</span>
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
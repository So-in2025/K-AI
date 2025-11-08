import React, { useState, useRef, useEffect } from 'react';
import { IMoodJournal, IMoodPlan } from '../types';
import { Type } from '@google/genai';
import { TtsInfoButton } from './TtsInfoButton';
import ttsService from '../services/ttsService';
import { useUser } from '../contexts/UserContext';

// Fix: Provide types for the Web Speech API to resolve 'SpeechRecognition' not found errors.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onstart: () => void;
    onend: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}
  
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

const MicIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> );
const colorMap: Record<string, { bg: string; text: string; border: string; }> = { verde: { bg: 'bg-green-900/50', text: 'text-green-300', border: 'border-green-500' }, naranja: { bg: 'bg-orange-900/50', text: 'text-orange-300', border: 'border-orange-500' }, azul: { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-500' }, amarillo: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', border: 'border-yellow-500' }, rojo: { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-500' }, violeta: { bg: 'bg-violet-900/50', text: 'text-violet-300', border: 'border-violet-500' }, default: { bg: 'bg-slate-700/50', text: 'text-slate-300', border: 'border-slate-500' }, };

export const MoodJournalCard: React.FC = () => {
    const { userData, geminiService, updateMoodJournal } = useUser();
    const [status, setStatus] = useState<'idle' | 'recording' | 'analyzing' | 'error'>('idle');
    const [error, setError] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            setError("El reconocimiento de voz no es compatible con este navegador.");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'es-ES';

        recognitionRef.current.onstart = () => setStatus('recording');
        recognitionRef.current.onend = () => setStatus('idle'); // Will be overridden by analysis if there's a result
        recognitionRef.current.onerror = (event) => {
            setError(event.error === 'no-speech' ? 'No se detectó voz.' : 'Error de reconocimiento.');
            setStatus('error');
        };
        recognitionRef.current.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript.trim()) {
                handleAnalysis(finalTranscript.trim());
            }
        };
    }, []);

    const handleMicClick = () => {
        setError('');
        if (status === 'recording') {
            recognitionRef.current?.stop();
        } else {
            ttsService.speak("Hola, soy Kai. ¿Cómo te sientes ahora mismo? Habla con libertad.");
            recognitionRef.current?.start();
        }
    };
    
    const handleAnalysis = async (transcript: string) => {
        setStatus('analyzing');
        if (!geminiService) { setError("Servicio de IA no disponible."); setStatus('error'); return; }

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedMood: { type: Type.STRING, description: 'Una palabra que resuma el estado de ánimo (ej: Ansioso, Contento, Frustrado, etc.)' },
                plan: {
                    type: Type.OBJECT,
                    properties: {
                        nutrition: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, description: {type: Type.STRING}, color: {type: Type.STRING, enum: ['verde', 'naranja', 'azul', 'amarillo', 'rojo', 'violeta']} } },
                        attire: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, description: {type: Type.STRING} } },
                        routine: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, description: {type: Type.STRING} } },
                    }
                }
            }
        };

        const prompt = `Actúa como Kai, un coach de bienestar altamente empático. Un usuario acaba de describir cómo se siente. Su transcripción es: "${transcript}". Analiza el texto y genera un "Plan de Sintonía Anímica" para apoyarle. El plan debe ser amable, práctico y breve. Responde ÚNICAMENTE con un objeto JSON que siga el esquema proporcionado. El 'detectedMood' debe ser conciso. Las descripciones del plan deben ser de 1-2 frases.`;

        // Fix: Removed the \`finally\` block and set status within \`try\` and \`catch\` to prevent race conditions with state updates.
        try {
            const response = await geminiService.generateContent(prompt, undefined, true);
            const parsedResponse = JSON.parse(response);
            const newJournal: IMoodJournal = { date: new Date().toISOString(), transcript, detectedMood: parsedResponse.detectedMood, plan: parsedResponse.plan as IMoodPlan };
            updateMoodJournal(newJournal);
            setStatus('idle');
        } catch (err) { 
            console.error("Error al analizar el diario anímico:", err);
            setError("No se pudo generar el plan."); 
            setStatus('error'); 
        }
    };

    const renderPlan = (journal: IMoodJournal) => {
        const { plan, detectedMood } = journal;
        const color = colorMap[plan.nutrition.color] || colorMap.default;
        
        return (
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <p className="text-sm text-slate-400">Kai detectó que te sientes:</p>
                    <h3 className={`text-xl font-bold ${color.text} mb-3`}>{detectedMood}</h3>
                    <p className="text-sm text-slate-400 mb-2">Aquí tienes un pequeño plan para sintonizar con tu estado de ánimo:</p>
                    <div className={`border-l-4 ${color.border} p-3 space-y-2 ${color.bg}`}>
                        <div><strong className="text-slate-100">{plan.nutrition.title}</strong><p className="text-sm text-slate-300">{plan.nutrition.description}</p></div>
                        <div><strong className="text-slate-100">{plan.attire.title}</strong><p className="text-sm text-slate-300">{plan.attire.description}</p></div>
                        <div><strong className="text-slate-100">{plan.routine.title}</strong><p className="text-sm text-slate-300">{plan.routine.description}</p></div>
                    </div>
                </div>
                <button onClick={() => updateMoodJournal(null)} className="w-full text-center text-xs text-slate-400 hover:underline mt-4">Registrar nuevo estado de ánimo</button>
            </div>
        );
    };
    
    const renderRecorder = () => {
        let text: string, buttonClass: string;
        switch (status) {
            case 'recording': text = "Escuchando..."; buttonClass = "bg-red-500 animate-pulse"; break;
            case 'analyzing': text = "Kai está analizando tu voz..."; buttonClass = "bg-yellow-500 animate-pulse"; break;
            case 'error': text = error || "Hubo un error."; buttonClass = "bg-slate-600"; break;
            default: text = "Presiona el botón y describe cómo te sientes hoy."; buttonClass = "bg-teal-600"; break;
        }

        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                {status === 'analyzing' ? (
                     <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
                ) : (
                    // Fix: The comparison `status === 'analyzing'` is always false here due to TypeScript's control flow analysis within the ternary operator. The button is only rendered when status is not 'analyzing', so the `disabled` prop was redundant and incorrect.
                    <button onClick={handleMicClick} className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-colors mb-4 ${buttonClass}`}>
                        <MicIcon className="h-10 w-10" />
                    </button>
                )}
                <p className="text-slate-300">{text}</p>
            </div>
        );
    };
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative min-h-[250px] flex flex-col">
            <TtsInfoButton explanation="Presiona el botón y habla sobre cómo te sientes. Kai escuchará y creará un 'Plan de Sintonía Anímica' con sugerencias de nutrición, vestimenta y una micro-rutina para apoyarte." />
            <div className="flex items-center space-x-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V8m10 8V8M3 8c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6v8c0 3.314-2.686 6-6 6H9c-3.314 0-6-2.686-6-6V8z" /></svg>
                <h2 className="text-xl font-bold text-slate-100">Diario Anímico por Voz</h2>
            </div>
            {userData?.moodJournal ? renderPlan(userData.moodJournal) : renderRecorder()}
        </div>
    );
};

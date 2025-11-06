import React, { useState, useRef, useEffect } from 'react';
import { IMoodJournal, IMoodPlan } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { TtsInfoButton } from './TtsInfoButton';
import ttsService from '../services/ttsService';

// Speech Recognition Types
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
interface SpeechRecognitionStatic { new(): SpeechRecognition; }
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

const MicIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const colorMap: Record<string, { bg: string; text: string; border: string; }> = {
    verde: { bg: 'bg-green-900/50', text: 'text-green-300', border: 'border-green-500' },
    naranja: { bg: 'bg-orange-900/50', text: 'text-orange-300', border: 'border-orange-500' },
    azul: { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-500' },
    amarillo: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', border: 'border-yellow-500' },
    rojo: { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-500' },
    violeta: { bg: 'bg-violet-900/50', text: 'text-violet-300', border: 'border-violet-500' },
    default: { bg: 'bg-slate-700/50', text: 'text-slate-300', border: 'border-slate-500' },
};

interface MoodJournalCardProps {
    moodJournal: IMoodJournal | null;
    onUpdateMoodJournal: (journal: IMoodJournal | null) => void;
}

export const MoodJournalCard: React.FC<MoodJournalCardProps> = ({ moodJournal, onUpdateMoodJournal }) => {
    const [status, setStatus] = useState<'idle' | 'recording' | 'analyzing' | 'error'>('idle');
    const [error, setError] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            setError("El reconocimiento de voz no es compatible con tu navegador.");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';

        recognition.onstart = () => setStatus('recording');
        recognition.onend = () => setStatus('idle');
        recognition.onerror = (event) => {
            setError(`Error de reconocimiento: ${event.error}`);
            setStatus('error');
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleAnalysis(transcript);
        };
        recognitionRef.current = recognition;
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
        // Fix: Replaced getApiKey() with direct access to environment variable and added a check for its existence, following API guidelines.
        if (!process.env.API_KEY) {
            setError("API Key no configurada.");
            setStatus('error');
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedMood: { type: Type.STRING, description: "El estado de ánimo principal detectado en el texto del usuario." },
                plan: {
                    type: Type.OBJECT,
                    properties: {
                        nutrition: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, color: { type: Type.STRING, description: 'Una sola palabra de color en español (ej: verde, naranja, azul).' } } },
                        attire: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } },
                        routine: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } }
                    }
                }
            }
        };

        const prompt = `Actúa como Kai, un coach de bienestar holístico y empático con conocimientos en neurociencia, cromoterapia y mindfulness. El usuario acaba de depositar su estado de ánimo a través de la voz. Su transcripción es: "${transcript}". Tu tarea es analizar este texto y generar un 'Plan de Sintonía Anímica' en formato JSON. El plan debe ser potente, eficiente y tangible. Debe contener tres secciones: Nutrición por Color (sugiere alimentos y una receta simple basada en un color que equilibre el ánimo detectado), Vestimenta Consciente (una sugerencia de ropa o texturas para apoyar el estado emocional), y una Micro-Rutina Sanadora (una acción corta y específica para el día). Responde únicamente con el objeto JSON estructurado según el schema provisto.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json", responseSchema: schema },
            });
            const parsedResponse = JSON.parse(response.text);
            const newJournal: IMoodJournal = {
                date: new Date().toISOString(),
                transcript: transcript,
                detectedMood: parsedResponse.detectedMood,
                plan: parsedResponse.plan as IMoodPlan,
            };
            onUpdateMoodJournal(newJournal);
        } catch (err) {
            console.error(err);
            setError("No se pudo generar el plan. Inténtalo de nuevo.");
            setStatus('error');
        } finally {
            if (status !== 'error') setStatus('idle');
        }
    };

    const renderPlan = (journal: IMoodJournal) => {
        const plan = journal.plan;
        const nutritionColor = colorMap[plan.nutrition.color.toLowerCase() as keyof typeof colorMap] || colorMap.default;
        return (
            <div className="space-y-4 animate-fade-in-up">
                <div>
                    <p className="text-sm text-center text-slate-400">Kai ha detectado un ánimo de:</p>
                    <p className="text-lg font-semibold text-center text-teal-300 mb-4">{journal.detectedMood}</p>
                </div>
                <div className={`p-4 rounded-lg border-l-4 ${nutritionColor.bg} ${nutritionColor.border}`}>
                    <h4 className={`font-bold ${nutritionColor.text}`}>{plan.nutrition.title}</h4>
                    <p className="text-sm text-slate-300">{plan.nutrition.description}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50">
                    <h4 className="font-bold text-slate-200">{plan.attire.title}</h4>
                    <p className="text-sm text-slate-300">{plan.attire.description}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50">
                    <h4 className="font-bold text-slate-200">{plan.routine.title}</h4>
                    <p className="text-sm text-slate-300">{plan.routine.description}</p>
                </div>
                <button onClick={() => onUpdateMoodJournal(null)} className="w-full text-xs text-center text-slate-400 hover:underline mt-2">
                    Crear nuevo análisis
                </button>
            </div>
        );
    };

    const renderContent = () => {
        if (moodJournal) return renderPlan(moodJournal);

        const buttonText = status === 'recording' ? 'Escuchando... (pulsa para detener)' : 'Deposita tu estado de ánimo';
        return (
            <div className="text-center flex flex-col items-center justify-center h-full">
                <p className="text-slate-400 mb-4 text-sm">¿Cómo te sientes? Toca el botón y habla con Kai para recibir un plan de autocuidado personalizado.</p>
                <button onClick={handleMicClick} disabled={status === 'analyzing'} className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50
                    ${status === 'recording' ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-600 text-white hover:bg-teal-500'}`}>
                    <MicIcon className="h-10 w-10" />
                </button>
                <p className="mt-3 text-sm font-semibold">{status === 'analyzing' ? 'Kai está analizando...' : buttonText}</p>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>
        );
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative min-h-[250px] flex flex-col justify-between">
            <TtsInfoButton explanation="Este es tu Diario Anímico por Voz. Es un espacio para la honestidad radical. Presiona el botón y habla sobre cómo te sientes, sin filtros. Kai escuchará y, basándose en tu estado, creará un 'Plan de Sintonía Anímica' holístico con sugerencias de nutrición, vestimenta y una micro-rutina para apoyarte en tu día. Es una herramienta para convertir tus sentimientos en autocuidado." />
            <div>
                <div className="flex items-center space-x-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V8m10 8V8M3 8c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6v8c0 3.314-2.686 6-6 6H9c-3.314 0-6-2.686-6-6V8z" /></svg>
                    <h2 className="text-xl font-bold text-slate-100">Diario Anímico por Voz</h2>
                </div>
                {renderContent()}
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};
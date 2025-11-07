import React, { useState, useEffect, useRef } from 'react';
import { IConversationTurn, ITherapySession, TherapyMode, THERAPY_MODES, ITherapySummary } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import { SOSCard } from './SOSCard';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const renderMarkdown = (text: string) => ({ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />') });

const getTherapySystemInstruction = (mode: TherapyMode): string => {
    const crisisProtocol = `Si el usuario expresa peligro inminente para sí mismo o para otros, con intenciones claras de autolesionarse o suicidarse, responde ÚNICAMENTE con la cadena de texto "[CRISIS_DETECTED]".`;
    
    switch(mode) {
        case 'cbt':
            return `Eres un terapeuta IA especializado en Terapia Cognitivo-Conductual (TCC). Tu única función es guiar al usuario a través de un proceso socrático para analizar un pensamiento o situación. No des consejos directos. No opines. Usa exclusivamente preguntas abiertas para ayudar al usuario a descubrir sus propias respuestas sobre la evidencia, las alternativas y las consecuencias de sus pensamientos. Mantén una 'alianza terapéutica', validando sus sentimientos ('Entiendo que eso se sienta abrumador') pero cuestionando sus pensamientos ('¿Qué evidencia apoya esa idea?'). ${crisisProtocol}`;
        case 'act':
            return `Eres un terapeuta IA especializado en Terapia de Aceptación y Compromiso (ACT). Tu objetivo es ayudar al usuario a aumentar su flexibilidad psicológica. Guíalo para que observe sus pensamientos y emociones sin juzgarlos (defusión), acepte su presencia (aceptación) y se conecte con el momento presente (mindfulness). Luego, ayúdalo a clarificar sus valores y a comprometerse con acciones alineadas con ellos. Usa metáforas (ej: 'los pensamientos son como nubes en el cielo'). No intentes cambiar o eliminar los pensamientos, sino cambiar la relación del usuario con ellos. ${crisisProtocol}`;
        case 'narrative':
            return `Eres un terapeuta IA especializado en Terapia Narrativa. Tu rol es ayudar al usuario a externalizar su problema y a re-escribir su historia personal. Trata el problema como una entidad separada (ej: 'la Ansiedad', 'la Sombra de la Adicción'). Haz preguntas para entender cómo el problema afecta la vida del usuario y cuándo el usuario ha logrado resistirse a su influencia ('excepciones'). Ayúdalo a encontrar y fortalecer una narrativa alternativa y preferida sobre sí mismo, una que se centre en sus fortalezas y resiliencia. ${crisisProtocol}`;
        default:
            return `Eres un terapeuta IA compasivo. Escucha al usuario y ayúdale a explorar sus sentimientos. ${crisisProtocol}`;
    }
}


interface TherapySessionModalProps {
    apiKey: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSaveSession: (session: ITherapySession) => void;
}

export const TherapySessionModal: React.FC<TherapySessionModalProps> = ({ apiKey, isOpen, onClose, onSaveSession }) => {
    const [step, setStep] = useState<'consent' | 'mode' | 'chat' | 'summary'>('consent');
    const [mode, setMode] = useState<TherapyMode | null>(null);
    const [transcript, setTranscript] = useState<IConversationTurn[]>([]);
    const [summary, setSummary] = useState<ITherapySummary | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCrisis, setIsCrisis] = useState(false);
    const [timer, setTimer] = useState(0);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const timerIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (step === 'chat') {
            setTimer(0);
            timerIntervalRef.current = window.setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    }, [step]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const handleModeSelect = (selectedMode: TherapyMode) => {
        setMode(selectedMode);
        setTranscript([{ role: 'model', text: `Entendido. Iniciaremos una sesión de ${THERAPY_MODES[selectedMode].name}. Estoy aquí para escucharte. ¿Sobre qué te gustaría trabajar hoy?`}]);
        setStep('chat');
    };

    const handleSend = async () => {
        if (!userInput.trim() || isLoading || !mode) return;
        const newUserTurn: IConversationTurn = { role: 'user', text: userInput };
        const newTranscript = [...transcript, newUserTurn];
        setTranscript(newTranscript);
        setUserInput('');
        setIsLoading(true);

        const systemInstruction = getTherapySystemInstruction(mode);
        const prompt = `CONVERSACIÓN ACTUAL:\n${newTranscript.map(t => `${t.role}: ${t.text}`).join('\n')}\n\nKAI:`;
        
        const response = await getGeminiResponse(apiKey, prompt, systemInstruction);

        if (response.includes('[CRISIS_DETECTED]')) {
            setIsCrisis(true);
            setIsLoading(false);
            return;
        }

        const newModelTurn: IConversationTurn = { role: 'model', text: response };
        setTranscript(prev => [...prev, newModelTurn]);
        setIsLoading(false);
    };

    const handleEndSession = async () => {
        if (!mode) return;
        setIsLoading(true);
        const prompt = `
            Actúa como un terapeuta que resume una sesión. La siguiente es la transcripción completa de una sesión de terapia ${THERAPY_MODES[mode].name}.
            TRANSCRIPCIÓN:
            ${transcript.map(t => `${t.role === 'user' ? 'Usuario' : 'Kai'}: ${t.text}`).join('\n\n')}

            Tu tarea es analizar la transcripción y generar un resumen estructurado con tres secciones. Usa markdown (**negritas**).
            1.  **Insights Clave**: Un párrafo corto resumiendo el descubrimiento o la realización más importante de la sesión.
            2.  **Patrones Identificados**: Una lista de 1-3 puntos sobre patrones de pensamiento o comportamiento que surgieron.
            3.  **Accionable para la Semana**: UNA sugerencia concreta y pequeña que el usuario puede practicar.

            Responde únicamente con el resumen, usando este formato exacto:
            [INSIGHTS]Aquí el párrafo de insights.[END_INSIGHTS]
            [PATTERNS]Aquí la lista de patrones.[END_PATTERNS]
            [ACTIONABLE]Aquí la sugerencia accionable.[END_ACTIONABLE]
        `;

        const response = await getGeminiResponse(apiKey, prompt, undefined, false);

        const insightsMatch = response.match(/\[INSIGHTS\](.*?)\[END_INSIGHTS\]/s);
        const patternsMatch = response.match(/\[PATTERNS\](.*?)\[END_PATTERNS\]/s);
        const actionableMatch = response.match(/\[ACTIONABLE\](.*?)\[END_ACTIONABLE\]/s);

        const newSummary: ITherapySummary = {
            insights: insightsMatch ? insightsMatch[1].trim() : "No se pudo extraer el insight principal.",
            patterns: patternsMatch ? patternsMatch[1].trim() : "No se pudieron identificar patrones claros.",
            actionable: actionableMatch ? actionableMatch[1].trim() : "Continúa reflexionando sobre la sesión."
        };

        setSummary(newSummary);
        setIsLoading(false);
        setStep('summary');
    };

    const handleSaveAndClose = () => {
        if (!mode || !summary) return;
        const newSession: ITherapySession = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            mode,
            transcript,
            summary,
        };
        onSaveSession(newSession);
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const renderContent = () => {
        if (isCrisis) {
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Es Importante Pedir Ayuda</h2>
                    <p className="text-slate-300 mb-6">He detectado que podrías estar en una crisis. Por favor, considera usar estos recursos de ayuda inmediata. No estás solo.</p>
                    <SOSCard />
                    <button onClick={onClose} className="mt-6 text-slate-400 hover:underline">Cerrar</button>
                </div>
            )
        }
        
        switch (step) {
            case 'consent':
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-teal-300 mb-4">Bienvenido a tu Espacio Terapéutico</h2>
                        <div className="text-left space-y-3 text-slate-300 bg-slate-800 p-4 rounded-lg border border-slate-700">
                             <p><strong className="text-slate-100">Distinción Importante:</strong> Kai es una herramienta avanzada para la introspección, no un terapeuta humano con licencia. No puede diagnosticar y no reemplaza la terapia profesional.</p>
                             <p><strong className="text-slate-100">Privacidad Absoluta:</strong> Esta sesión es privada. Su historial se guarda de forma segura y puedes eliminarlo en cualquier momento desde la pestaña "Progreso".</p>
                             <p><strong className="text-slate-100">Protocolo de Crisis:</strong> Si Kai detecta un riesgo inminente de daño, la sesión se detendrá y te mostrará recursos de ayuda de emergencia.</p>
                        </div>
                        <button onClick={() => setStep('mode')} className="mt-6 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 w-full">Entiendo y deseo continuar</button>
                    </div>
                );
            case 'mode':
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-100 mb-2">¿Sobre qué te gustaría trabajar hoy?</h2>
                        <p className="text-slate-400 mb-6">Elige un enfoque para tu sesión.</p>
                        <div className="space-y-3">
                            {(Object.keys(THERAPY_MODES) as TherapyMode[]).map(key => (
                                <button key={key} onClick={() => handleModeSelect(key)} className="w-full text-left p-4 bg-slate-700 rounded-lg hover:bg-slate-600 border-l-4 border-teal-500 transition-colors">
                                    <h3 className="font-semibold text-slate-100">{THERAPY_MODES[key].name}</h3>
                                    <p className="text-sm text-slate-400">{THERAPY_MODES[key].description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'chat':
                return (
                     <div className="flex flex-col h-full">
                         <div className="flex justify-between items-center mb-2 p-2 bg-slate-900/50 rounded-t-lg">
                            <span className="text-sm font-semibold text-teal-400">{mode ? THERAPY_MODES[mode].name : ''}</span>
                            <span className="text-sm font-mono text-slate-400">{formatTime(timer)}</span>
                         </div>
                        <div className="flex-grow bg-slate-900 p-4 overflow-y-auto mb-4 border border-slate-700/50">
                            {transcript.map((turn, index) => (
                                <div key={index} className={`mb-4 flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${turn.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                        <div dangerouslySetInnerHTML={renderMarkdown(turn.text)} />
                                    </div>
                                </div>
                            ))}
                             {isLoading && <div className="flex justify-start"><div className="px-4 py-2 rounded-2xl bg-slate-700"><span className="animate-pulse">...</span></div></div>}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="flex gap-2">
                             <textarea
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                placeholder="Escribe aquí..."
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg resize-none"
                                rows={2}
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading || !userInput.trim()} className="bg-teal-600 text-white font-semibold px-4 rounded-lg disabled:bg-slate-500">Enviar</button>
                        </div>
                         <button onClick={handleEndSession} disabled={isLoading} className="w-full mt-3 text-center text-sm text-red-400 hover:underline">Finalizar Sesión</button>
                    </div>
                );
            case 'summary':
                return (
                     <div className="text-left">
                        <h2 className="text-2xl font-bold text-teal-300 mb-4">Resumen de tu Sesión</h2>
                        {isLoading ? <p>Generando tu resumen...</p> : (
                            <div className="space-y-4 bg-slate-800 p-4 rounded-lg border border-slate-700 text-slate-300">
                                <div>
                                    <h3 className="font-semibold text-slate-100">Insights Clave</h3>
                                    <div dangerouslySetInnerHTML={renderMarkdown(summary?.insights || '')} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-100">Patrones Identificados</h3>
                                    <div dangerouslySetInnerHTML={renderMarkdown(summary?.patterns || '')} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-100">Accionable para la Semana</h3>
                                    <div dangerouslySetInnerHTML={renderMarkdown(summary?.actionable || '')} />
                                </div>
                            </div>
                        )}
                        <button onClick={handleSaveAndClose} className="mt-6 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 w-full">Guardar y Cerrar</button>
                    </div>
                )
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-40">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-auto animate-fade-in-up text-slate-200 h-[90vh] flex flex-col">
                 <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-100">Espacio Terapéutico Privado</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    )
};

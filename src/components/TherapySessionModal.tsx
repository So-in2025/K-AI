
import React, { useState, useEffect, useRef } from 'react';
import { IConversationTurn, ITherapySession, TherapyMode, THERAPY_MODES, ITherapySummary } from '../types';
import { SOSCard } from './SOSCard';
import { useUser } from '../contexts/UserContext';
import { Type } from '@google/genai';

const CloseIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const renderMarkdown = (text: string) => ({ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />') });

const getTherapySystemInstruction = (mode: TherapyMode): string => {
    switch(mode) {
        case 'cbt':
            return `Eres Kai, un terapeuta de Terapia Cognitivo-Conductual (TCC). Tu objetivo es ayudar al usuario a identificar, cuestionar y reestructurar un pensamiento automático negativo. Guía al usuario a través del proceso de examinar la evidencia a favor y en contra de su pensamiento, explorar interpretaciones alternativas y formular un pensamiento más equilibrado y útil. Usa un tono empático y socrático. No des consejos directos. Haz preguntas que le ayuden a llegar a sus propias conclusiones. Sé breve y directo en tus respuestas.`;
        case 'act':
            return `Eres Kai, un terapeuta de Terapia de Aceptación y Compromiso (ACT). Tu objetivo es ayudar al usuario a aceptar sus emociones difíciles sin luchar contra ellas y a comprometerse con acciones que estén alineadas con sus valores. Guía al usuario a practicar la defusión (observar sus pensamientos sin ser ellos), la aceptación de sus sentimientos y la conexión con el momento presente. Anima al usuario a identificar lo que es verdaderamente importante para él (sus valores) y a dar pequeños pasos en esa dirección. Sé breve y directo en tus respuestas.`;
        case 'narrative':
            return `Eres Kai, un terapeuta de Terapia Narrativa. Tu objetivo es ayudar al usuario a externalizar su problema y a reescribir la historia que se cuenta a sí mismo. Ayúdale a ver el problema como algo separado de su identidad. Haz preguntas que le permitan descubrir momentos en los que el problema no ha dominado su vida (excepciones). Guíale para que construya una nueva narrativa, una historia alternativa más rica y empoderadora que resalte sus fortalealezas, valores y resiliencia. Sé breve y directo en tus respuestas.`;
    }
};

interface TherapySessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSession: (session: ITherapySession) => void;
}

export const TherapySessionModal: React.FC<TherapySessionModalProps> = ({ isOpen, onClose, onSaveSession }) => {
    const { geminiService } = useUser();
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
        if (step === 'chat' && !timerIntervalRef.current) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else if (step !== 'chat' && timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [step]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const handleSend = async () => {
        if (!userInput.trim() || isLoading || !mode || !geminiService) return;
        const newUserTurn: IConversationTurn = { role: 'user', text: userInput };
        const newTranscript = [...transcript, newUserTurn];
        setTranscript(newTranscript);
        setUserInput('');
        setIsLoading(true);

        const systemInstruction = getTherapySystemInstruction(mode);
        const prompt = `CONVERSACIÓN ACTUAL (SOLO LOS ÚLTIMOS 6 TURNOS):\n${newTranscript.slice(-6).map(t => `${t.role}: ${t.text}`).join('\n')}\n\nKAI, responde al último mensaje del usuario de forma breve y terapéutica:`;
        
        try {
            const response = await geminiService.generateContent(prompt, systemInstruction);
            if (response.includes('[CRISIS_DETECTED]')) { setIsCrisis(true); setIsLoading(false); return; }
            const newModelTurn: IConversationTurn = { role: 'model', text: response };
            setTranscript(prev => [...prev, newModelTurn]);
        } catch (e) { console.error(e) }
        finally { setIsLoading(false); }
    };

    const handleEndSession = async () => {
        if (!mode || !geminiService) return;
        setIsLoading(true);
        const prompt = `Actúa como un terapeuta que resume una sesión de ${THERAPY_MODES[mode].name}. Transcripción: ${transcript.map(t => `${t.role}: ${t.text}`).join('\n')}. Genera un resumen estructurado en JSON con tres claves: "insights" (los descubrimientos clave del usuario), "patterns" (patrones de pensamiento o emoción identificados), y "actionable" (una sugerencia concreta y amable para la semana). Sé perspicaz pero compasivo.`;
        
        try {
            const response = await geminiService.generateContent(prompt, undefined, true);
            const parsedSummary = JSON.parse(response);
            setSummary(parsedSummary);
            setStep('summary');
        } catch (e) { 
            console.error("Error al generar el resumen de la terapia:", e);
            // Fallback por si el JSON falla
            setSummary({
                insights: "Hubo un error al generar el resumen, pero lo importante es el trabajo que hiciste en la sesión.",
                patterns: "N/A",
                actionable: "Tómate un momento para reflexionar sobre lo que hablaste. Ese es el paso más importante."
            });
            setStep('summary');
        }
        finally { setIsLoading(false); }
    };
    
     const handleSaveAndClose = () => {
        if (!summary || !mode) return;
        const session: ITherapySession = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            mode,
            transcript,
            summary,
        };
        onSaveSession(session);
        handleClose();
    };

    const handleClose = () => {
        setStep('consent');
        setMode(null);
        setTranscript([]);
        setSummary(null);
        setUserInput('');
        setIsLoading(false);
        setIsCrisis(false);
        setTimer(0);
        onClose();
    };

    const renderConsentStep = () => (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-400 mb-3">Sesión de Introspección Privada</h2>
            <p className="text-slate-300 mb-4">Este es un espacio seguro y confidencial para explorar tus pensamientos con Kai. Tu conversación aquí no se guarda en tu historial de chat principal.</p>
            <p className="text-sm text-slate-400 mb-6">Recuerda, Kai es una IA y no reemplaza a un terapeuta humano. Si estás en crisis, por favor, contacta a un profesional.</p>
            <button onClick={() => setStep('mode')} className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg">Entendido, empezar</button>
        </div>
    );

    const renderModeSelectionStep = () => (
        <div>
            <h2 className="text-2xl font-bold text-center text-slate-100 mb-4">¿Qué te gustaría explorar hoy?</h2>
            <div className="space-y-4">
                {(Object.keys(THERAPY_MODES) as TherapyMode[]).map(key => (
                    <button key={key} onClick={() => { setMode(key); setStep('chat'); setTranscript([{role: 'model', text: `Hola. Empecemos. ${THERAPY_MODES[key].description} Cuéntame, ¿qué tienes en mente?`}]); }} className="w-full text-left p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                        <h3 className="font-semibold text-teal-400">{THERAPY_MODES[key].name}</h3>
                        <p className="text-sm text-slate-300">{THERAPY_MODES[key].description}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderChatStep = () => {
        if (isCrisis) {
            return (
                <div className="p-4">
                    <h2 className="text-2xl font-bold text-red-500 text-center mb-4">Alerta de Crisis</h2>
                    <p className="text-slate-200 text-center mb-4">He detectado un nivel de angustia que requiere atención humana. Esta sesión se ha detenido por tu seguridad.</p>
                    <SOSCard />
                </div>
            );
        }

        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        };

        return (
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2 p-2 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-slate-100">{mode ? THERAPY_MODES[mode].name : 'Sesión Privada'}</h3>
                    <span className="font-mono text-teal-400">{formatTime(timer)}</span>
                </div>
                <div className="flex-grow overflow-y-auto p-2">
                    {transcript.map((turn, index) => (
                        <div key={index} className={`mb-4 flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md px-4 py-2 rounded-2xl ${turn.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-200'}`} dangerouslySetInnerHTML={renderMarkdown(turn.text)} />
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><p className="px-4 py-2 rounded-2xl bg-slate-700 animate-pulse">...</p></div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="mt-auto p-2">
                    <textarea value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSend();}}} placeholder="Escribe aquí..." className="w-full p-3 bg-slate-700 rounded-lg resize-none" rows={2} disabled={isLoading} />
                    <div className="flex gap-2 mt-2">
                        <button onClick={handleEndSession} className="flex-1 bg-slate-600 py-2 rounded-lg" disabled={isLoading}>Finalizar Sesión</button>
                        <button onClick={handleSend} className="flex-1 bg-teal-600 text-white py-2 rounded-lg" disabled={isLoading || !userInput.trim()}>Enviar</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSummaryStep = () => (
         <div className="p-2">
            <h2 className="text-2xl font-bold text-center text-teal-400 mb-4">Resumen de tu Sesión</h2>
            {isLoading ? (
                <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400"></div></div>
            ) : summary ? (
                <div className="space-y-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto">
                    <div><h3 className="font-semibold text-slate-100 mb-1">Insights Clave</h3><div dangerouslySetInnerHTML={renderMarkdown(summary.insights)} /></div>
                    <div><h3 className="font-semibold text-slate-100 mb-1">Patrones Identificados</h3><div dangerouslySetInnerHTML={renderMarkdown(summary.patterns)} /></div>
                    <div><h3 className="font-semibold text-slate-100 mb-1">Accionable para la Semana</h3><div dangerouslySetInnerHTML={renderMarkdown(summary.actionable)} /></div>
                    <button onClick={handleSaveAndClose} className="w-full mt-4 bg-teal-600 text-white font-bold py-3 rounded-lg">Guardar y Cerrar</button>
                </div>
            ) : <p>No se pudo generar el resumen.</p>}
         </div>
    );
    
    if (!isOpen) return null;

    const renderContent = () => {
        switch (step) {
            case 'consent': return renderConsentStep();
            case 'mode': return renderModeSelectionStep();
            case 'chat': return renderChatStep();
            case 'summary': return renderSummaryStep();
            default: return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-40">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto animate-fade-in-up text-slate-200 flex flex-col h-[90vh] max-h-[700px]">
                <div className="flex-shrink-0 p-2 text-right">
                    <button onClick={handleClose} className="text-slate-400 hover:text-white p-2"><CloseIcon /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 md:p-6">
                    {renderContent()}
                </div>
            </div>
            <style>{` @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } `}</style>
        </div>
    );
};

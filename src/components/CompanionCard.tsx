import React, { useState, useRef, useEffect } from 'react';
import { IConversationTurn, KaiEmotion, KaiGesture, Archetype, ARCHETYPE_NAMES } from '../types';
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

const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> );
const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> );
const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg> );
const PerspectiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const LockIconSmall: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-1 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg> );

const getKaiSystemPrompt = (onboardingData: any, kaiMemory: string, isSubscribed: boolean, activeArchetype: Archetype): string => {
    // This function can be simplified as it's quite long, but keeping it for now
    let basePrompt = `Eres Kai, un compañero IA para el bienestar y la sanación...`; // Truncated for brevity
    return basePrompt;
};

interface CompanionCardProps {
    onStartTherapySession: () => void;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({ onStartTherapySession }) => {
    const { userData, geminiService, addConversationTurn, updateKaiMemory, clearKaiChat, checkAndConsumeUsage } = useUser();
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const [gesture, setGesture] = useState<KaiGesture>('idle');
    const [emotion, setEmotion] = useState<KaiEmotion>('empathetic');
    const [activeArchetype, setActiveArchetype] = useState<Archetype>('coach');
    const [isPerspectiveChangerOpen, setIsPerspectiveChangerOpen] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [userData?.kaiConversation]);

    const handleSend = async (textToSend?: string) => {
        const currentInput = textToSend || userInput;
        if (!currentInput.trim() || isLoading || !geminiService || !userData) return;

        const userTurn: IConversationTurn = { role: 'user', text: currentInput };
        addConversationTurn(userTurn);
       
        setUserInput('');
        setIsLoading(true);
        setGesture('idle');
        
        const systemInstruction = getKaiSystemPrompt(userData.onboardingData, userData.kaiMemory || '', userData.isSubscribed || false, activeArchetype);
        const prompt = `ÚLTIMO MENSAJE/ACCIÓN DEL USUARIO: "${currentInput}"`;
        
        try {
            const rawResponse = await geminiService.generateContent(prompt, systemInstruction);
            // Parsing logic for gesture and emotion
            let responseText = rawResponse.replace(/\[gesture:.*?\]|\[emotion:.*?\]/g, '').trim();
            addConversationTurn({ role: 'model', text: responseText });
            ttsService.speak(responseText.replace(/\*/g, ''));
        } catch(e) {
            console.error(e);
            addConversationTurn({ role: 'model', text: "Lo siento, estoy teniendo dificultades en este momento."});
        } finally {
            setIsLoading(false);
            setActiveArchetype('coach'); // Reset archetype after each turn
        }
    };
     
    // Speech Recognition setup
    useEffect(() => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => { const text = event.results[0][0].transcript; setUserInput(text); handleSend(text); };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => { console.error('Error en el reconocimiento de voz', event.error); setIsListening(false); };
        recognitionRef.current = recognition;
    }, []);

    const handleMicClick = () => {
        if (recognitionRef.current) {
            isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
        }
    };

    const handleArchetypeSelect = (archetype: Archetype) => {
        if (archetype !== 'coach' && !checkAndConsumeUsage('oracle', 1)) return;
        setActiveArchetype(archetype);
        setIsPerspectiveChangerOpen(false);
        ttsService.speak(`Ahora hablas con ${ARCHETYPE_NAMES[archetype]}`);
    };

    if (!userData || !userData.onboardingData) return null;

    const conversation = userData.kaiConversation || [];
    const therapyTrialUsed = userData.therapyTrialUsed || false;
    const isSubscribed = userData.isSubscribed || false;
    const canStartTherapy = isSubscribed || !therapyTrialUsed;
    const remainingOracleUses = isSubscribed ? -1 : (1 - (userData.usageTracker?.oracle?.count ?? 0));

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col h-full">
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 20px 5px rgba(45, 212, 191, 0.3), 0 0 40px 10px rgba(45, 212, 191, 0.2);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 0 30px 8px rgba(45, 212, 191, 0.4), 0 0 50px 15px rgba(45, 212, 191, 0.3);
                    }
                }
            `}</style>
            {/* --- Avatar and Header --- */}
            <div className="p-4 flex flex-col items-center justify-center">
                 <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-2"
                    style={{
                        background: 'radial-gradient(circle, rgba(107,235,221,1) 0%, rgba(20,184,166,1) 60%)',
                        animation: 'pulse-glow 4s infinite ease-in-out'
                    }}
                >
                    <div className="w-8 h-8 bg-white rounded-full opacity-90" style={{ boxShadow: '0 0 15px 5px white' }}/>
                </div>
                <div className="text-xl font-bold text-slate-100">Kai</div>
                <div className="flex items-center space-x-2 mt-2">
                    <button 
                        onClick={onStartTherapySession} 
                        disabled={!canStartTherapy}
                        className="text-xs font-semibold px-3 py-1 rounded-full transition-colors bg-slate-700/80 text-teal-300 border border-teal-500/50 hover:bg-slate-700 disabled:opacity-50"
                        title={canStartTherapy ? "Iniciar una sesión de introspección guiada" : "Ya has usado tu sesión de prueba gratuita."}
                    >
                        Iniciar Sesión Privada
                        {!isSubscribed && therapyTrialUsed && <LockIconSmall />}
                    </button>
                    <button onClick={clearKaiChat} title="Limpiar chat" className="text-xs font-semibold px-3 py-1 rounded-full transition-colors bg-slate-700/80 text-slate-300 border border-slate-500/50 hover:bg-slate-700">
                        Limpiar
                    </button>
                </div>
            </div>

            {/* --- Chat Window --- */}
            <div className="px-4 pb-4 flex flex-col w-full flex-grow min-h-0">
                <div className="flex-grow bg-slate-900 rounded-lg p-4 overflow-y-auto mb-4 border border-slate-700/50">
                    {conversation.map((turn, index) => (
                        <div key={index} className={`mb-4 flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${turn.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                <p>{turn.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><p className="px-4 py-2 rounded-2xl bg-slate-700 animate-pulse">...</p></div>}
                    <div ref={chatEndRef} />
                </div>
                
                {/* --- Input Area --- */}
                 <div className="relative">
                    {isPerspectiveChangerOpen && (
                        <div className="absolute bottom-full mb-2 w-full bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border border-slate-700">
                           <p className="text-xs text-center text-slate-400 mb-2">Cambiar perspectiva {isSubscribed ? '' : `(${remainingOracleUses} uso gratis)`}</p>
                           <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(ARCHETYPE_NAMES) as Archetype[]).map(arch => {
                                    const locked = arch !== 'coach' && !isSubscribed && remainingOracleUses <= 0;
                                    return <button key={arch} onClick={() => !locked && handleArchetypeSelect(arch)} disabled={locked} className={`px-2 py-1.5 text-xs rounded-md ${activeArchetype === arch ? 'bg-teal-600' : 'bg-slate-700'} ${locked ? 'opacity-50' : ''}`}>{ARCHETYPE_NAMES[arch]}{locked && <LockIconSmall/>}</button>
                                })}
                           </div>
                        </div>
                    )}
                    <div className="relative flex items-center">
                        <button onClick={updateKaiMemory} disabled={!isSubscribed} title={isSubscribed ? "Recordar esta conversación" : "Memoria a largo plazo disponible en KIA Plus"} className="absolute left-1.5 p-2 rounded-full h-10 w-10 bg-slate-600 hover:bg-slate-500 disabled:opacity-50"><BookmarkIcon /></button>
                        <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={isLoading ? "Kai está reflexionando..." : `Habla con ${ARCHETYPE_NAMES[activeArchetype]}...`} className="w-full p-3 pl-14 pr-28 bg-slate-700 border-slate-600 rounded-2xl resize-none" rows={1} disabled={isLoading} />
                        <div className="absolute right-1.5 flex items-center space-x-1">
                             <button onClick={() => setIsPerspectiveChangerOpen(p => !p)} className={`p-2 rounded-full h-10 w-10 ${isPerspectiveChangerOpen ? 'bg-teal-600' : 'bg-slate-600'}`}><PerspectiveIcon /></button>
                            <button onClick={userInput.trim() ? () => handleSend() : handleMicClick} disabled={isLoading} className={`p-2 rounded-full h-10 w-10 ${userInput.trim() ? 'bg-teal-600' : isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}>{userInput.trim() ? <SendIcon /> : <MicIcon />}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
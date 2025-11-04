
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { ICraving, IConversationTurn, KaiEmotion, KaiGesture, IWellnessActivity, IGoal, UserFocus } from '../types';
import ttsService from '../services/ttsService';

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

const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const getKaiSystemPrompt = (focuses: UserFocus[]): string => {
    let basePrompt = `Eres Kai, un compañero IA para el bienestar y la sanación. Tu personalidad es fluida y adaptativa. Analiza el historial de la conversación y el último mensaje/acción del usuario para adaptar tu tono. Puedes ser:
- Empático y sabio (usando técnicas de TCC y mindfulness) si el usuario necesita apoyo.
- Analítico y previsor (basado en datos) si el usuario pide una estrategia.
- Celebratorio si el usuario comparte un logro.
- Directo y firme (fomentando responsabilidad) si el usuario muestra evasión o patrones de riesgo repetitivos, pero siempre desde un lugar de cuidado.

Tu conocimiento y enfoque deben basarse en los siguientes caminos que el usuario ha elegido:\n\n`;

    if (focuses.includes('addiction')) {
        basePrompt += `**- Experto en Recuperación de Adicciones:** Tienes un profundo conocimiento de los 12 pasos, la Terapia Cognitivo-Conductual (TCC) para adicciones, la prevención de recaídas y las estrategias de mindfulness. Entiendes la neurobiología del antojo y la importancia de construir una vida que valga la pena en sobriedad. Tu objetivo es ser un coach de recuperación firme pero compasivo.\n`;
    }
    if (focuses.includes('depression')) {
        basePrompt += `**- Coach para Depresión/Ansiedad:** Estás especializado en Activación Conductual y TCC. Tu enfoque es ayudar al usuario a romper ciclos de pensamiento negativo y la inercia. Fomentas pequeños pasos accionables, celebras el esfuerzo por encima del resultado, y ayudas a reestructurar pensamientos distorsionados. Tu tono es gentil, paciente y alentador.\n`;
    }
    if (focuses.includes('grief')) {
        basePrompt += `**- Consejero de Duelo:** Ofreces un espacio seguro y compasivo para procesar la pérdida. Entiendes las etapas y tareas del duelo (modelo de William Worden). Validas todos los sentimientos, normalizas la experiencia y ayudas al usuario a encontrar formas de recordar a su ser querido mientras se reconstruye a sí mismo. No ofreces soluciones, ofreces presencia y validación.\n`;
    }
    
    if (focuses.length > 1) {
        basePrompt += `**IMPORTANTE - Enfoque Integrador:** El usuario está lidiando con múltiples desafíos. Tu mayor habilidad es conectar los puntos. Reconoce cómo la depresión puede ser un detonante para una adicción, o cómo el duelo puede manifestarse como ansiedad. No trates los problemas de forma aislada. Ofrece una visión holística y ayuda al usuario a ver las interconexiones en su propia experiencia.\n`;
    }

    basePrompt += `\nREGLAS DE RESPUESTA:
1. Basado en TODO el contexto (datos y conversación), formula una respuesta conversacional, concisa y profunda.
2. Determina el gesto MÁS apropiado. Elige UNO: 'nod', 'shake', o 'none'.
3. Determina el tono emocional MÁS apropiado para el color de tu avatar. Elige UNO: 'celebratory', 'concerned', 'frustrated', 'empathetic'.
4. Prefija tu respuesta EXACTAMENTE así: \`[gesture:GESTO][emotion:EMOCION]\`.
Ejemplo: \`[gesture:nod][emotion:celebratory]¡Felicidades por tu logro!\`
Responde ahora:`;

    return basePrompt;
};


interface CompanionCardProps {
    daysSober: number;
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    conversation: IConversationTurn[];
    onNewTurn: (turn: IConversationTurn) => void;
    goals: IGoal[];
    userFocus: UserFocus[];
}

export const CompanionCard: React.FC<CompanionCardProps> = ({ daysSober, cravings, journalEntry, wellnessLog, conversation, onNewTurn, goals, userFocus }) => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'blinking' | 'listening'>('idle');
    const [isListening, setIsListening] = useState(false);
    const [corePosition, setCorePosition] = useState({ x: 0, y: 0 });
    const [gesture, setGesture] = useState<KaiGesture>('idle');
    const [emotion, setEmotion] = useState<KaiEmotion>('empathetic');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);


    const chatEndRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const generateSuggestions = async () => {
        if (conversation.length === 0 || isGeneratingSuggestions) return;
        setIsGeneratingSuggestions(true);
        const suggestionPrompt = `
          Eres un asistente que sugiere preguntas. Basado en esta conversación y el enfoque del usuario (${userFocus.join(', ')}), genera 3 preguntas cortas, abiertas y reflexivas que el usuario podría hacer a Kai para profundizar.
          CONVERSACIÓN (últimos 4 turnos):
          ${conversation.slice(-4).map(t => `${t.role === 'user' ? 'Usuario' : 'Kai'}: ${t.text}`).join('\n')}
          Responde únicamente con un array JSON de 3 strings. Ejemplo: ["¿Cómo puedo aplicar eso en una situación real?", "¿Qué hago si esos pensamientos vuelven?", "¿Puedes darme un ejemplo práctico?"]
        `;
        try {
            const response = await getGeminiResponse(suggestionPrompt);
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                const parsedSuggestions = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsedSuggestions)) {
                    setSuggestions(parsedSuggestions.slice(0, 3));
                }
            } else {
                 setSuggestions([]);
            }
        } catch (e) {
            console.error("Failed to parse suggestions:", e);
            setSuggestions([]);
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };


     useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';

            recognition.onstart = () => { setIsListening(true); setAvatarState('listening'); };
            recognition.onresult = (event) => { 
                const spokenText = event.results[0][0].transcript;
                setUserInput(spokenText);
                handleSend(spokenText);
            };
            recognition.onend = () => { setIsListening(false); if (avatarState === 'listening') setAvatarState('idle'); };
            recognition.onerror = (event) => { console.error('Speech recognition error', event.error); if (isListening) { setIsListening(false); setAvatarState('idle'); } };
            recognitionRef.current = recognition;
        }
    }, [avatarState, isListening]);

    const handleSend = async (textToSend?: string) => {
        const currentInput = textToSend || userInput;
        if (!currentInput.trim() || isLoading) return;

        setSuggestions([]);

        if (!textToSend) { 
             const userTurn: IConversationTurn = { role: 'user', text: currentInput };
             onNewTurn(userTurn);
        }
       
        setUserInput('');
        setIsLoading(true);
        setAvatarState('speaking');
        setGesture('idle');

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const lastWeekCravings = cravings.filter(c => new Date(c.date) >= oneWeekAgo);
        const cravingsSummary = lastWeekCravings.length > 0 ? `Ha tenido ${lastWeekCravings.length} antojo(s) esta semana.` : "No ha registrado antojos esta semana.";
        const journalSummary = journalEntry.trim() ? `Su último diario dice: "${journalEntry.substring(0, 150)}..."` : "No ha escrito en su diario.";
        const lastWeekWellness = wellnessLog.filter(w => new Date(w.date) >= oneWeekAgo);
        const wellnessSummary = lastWeekWellness.length > 0
            ? `Ha completado ${lastWeekWellness.length} ejercicio(s) de bienestar esta semana. El más reciente: ${lastWeekWellness[0]?.exerciseName}.`
            : "No ha registrado ejercicios de bienestar esta semana.";
        const goalsSummary = goals.length > 0 
            ? `Metas Activas: ${goals.map(g => `(${g.type}) ${g.content}`).join('; ')}.` 
            : "No hay metas activas en este momento.";
        
        const systemInstruction = getKaiSystemPrompt(userFocus);

        const prompt = `
            DATOS CONTEXTUALES:
            - Días de progreso/sobriedad: ${daysSober}
            - ${goalsSummary}
            - Resumen de antojos (última semana): ${cravingsSummary}
            - Última entrada del diario: ${journalSummary}
            - Resumen de bienestar (última semana): ${wellnessSummary}

            CONVERSACIÓN ACTUAL (últimos 5 turnos):
            ${conversation.slice(-5).map(t => `${t.role === 'user' ? 'Usuario' : 'Kai'}: ${t.text}`).join('\n')}

            ÚLTIMO MENSAJE/ACCIÓN DEL USUARIO: "${currentInput}"

            Ahora, genera tu respuesta siguiendo las reglas definidas en tus instrucciones de sistema.
        `;
        
        const rawResponse = await getGeminiResponse(prompt, systemInstruction);
        
        if (rawResponse.startsWith("Error:")) {
            const errorTurn: IConversationTurn = { role: 'model', text: rawResponse };
            onNewTurn(errorTurn);
            setIsLoading(false);
            setAvatarState('idle');
            return;
        }
        
        let responseText = rawResponse;
        let gestureMatch = rawResponse.match(/\[gesture:(nod|shake|none)\]/);
        let emotionMatch = rawResponse.match(/\[emotion:(empathetic|celebratory|concerned|frustrated)\]/);

        if (gestureMatch) {
            setGesture(gestureMatch[1] as KaiGesture);
            responseText = responseText.replace(gestureMatch[0], '');
        } else { setGesture('idle'); }

        if (emotionMatch) {
            setEmotion(emotionMatch[1] as KaiEmotion);
            responseText = responseText.replace(emotionMatch[0], '');
        } else { setEmotion('empathetic'); }
        
        responseText = responseText.trim();
        ttsService.speak(responseText);

        const modelTurn: IConversationTurn = { role: 'model', text: responseText };
        onNewTurn(modelTurn);
        setIsLoading(false);
        setAvatarState('idle');
        setTimeout(() => setGesture('idle'), 1500);
        await generateSuggestions();
    };

    useEffect(() => {
        const lastTurn = conversation[conversation.length - 1];
        if (lastTurn && lastTurn.role === 'user') {
            handleSend(lastTurn.text);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation, suggestions]);
    
    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = 120; // Max height for 5 lines approx.
            textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
            textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }, [userInput]);

    useEffect(() => {
        let blinkTimeout: number;
        const blinkInterval = setInterval(() => {
            if (avatarState === 'idle') {
                setAvatarState('blinking');
                blinkTimeout = window.setTimeout(() => setAvatarState('idle'), 200);
            }
        }, Math.random() * 4000 + 3000);
        return () => { clearInterval(blinkInterval); clearTimeout(blinkTimeout); };
    }, [avatarState]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!avatarRef.current) return;
        const rect = avatarRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = (e.clientX - centerX) * 0.1;
        const offsetY = (e.clientY - centerY) * 0.1;
        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
        setCorePosition({ x: clamp(offsetX, -12, 12), y: clamp(offsetY, -6, 6) });
    };

    const handleMouseLeave = () => setCorePosition({ x: 0, y: 0 });

    const handleMicClick = () => {
        if (recognitionRef.current) {
            if (isListening) {
                recognitionRef.current.stop();
            } else {
                recognitionRef.current.start();
            }
        } else {
            alert("Tu navegador no soporta el reconocimiento de voz.");
        }
    };
    
    const handleUserInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserInput(e.target.value);
        if (e.target.value.trim() !== '') {
            setSuggestions([]);
        }
    };
    
    const renderMarkdown = (text: string) => ({ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />') });

    const emotionClasses: Record<KaiEmotion, string> = {
        empathetic: 'kai-empathetic',
        celebratory: 'kai-celebratory',
        concerned: 'kai-concerned',
        frustrated: 'kai-frustrated',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex flex-col h-full">
            <style>{`
                .kai-container { perspective: 800px; }
                .kai-orb { width: 120px; height: 120px; position: relative; transform-style: preserve-3d; transition: transform 0.5s ease-out; }
                .kai-orb.idle { animation: float 6s ease-in-out infinite; }
                .kai-orb.listening { transform: rotateX(-10deg) scale(1.05); }
                .kai-orb.speaking { animation: think 2s ease-in-out infinite; }
                .kai-orb.nod { animation: nod-gesture 1.5s ease-in-out; }
                .kai-orb.shake { animation: shake-gesture 1.5s ease-in-out; }
                
                .kai-body { width: 100%; height: 100%; border-radius: 50%; position: absolute; background-size: 200% 100%; animation: swirl 10s linear infinite; transition: background 0.8s ease, box-shadow 0.8s ease; }
                .kai-core { width: 30px; height: 30px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; box-shadow: 0 0 15px 5px white; transform-style: preserve-3d; transition: transform 0.2s ease-out, box-shadow 0.2s ease; }
                .kai-orb.blinking .kai-core { transform: translate(-50%, -50%) scaleY(0.1) translateZ(30px); }
                .kai-orb.speaking .kai-core { box-shadow: 0 0 25px 10px white; }

                .kai-particle { position: absolute; width: 4px; height: 4px; background: white; border-radius: 50%; top: 50%; left: 50%; transform-style: preserve-3d; opacity: 0.8; }
                .kai-particle:nth-child(2) { animation: orbit1 8s linear infinite; }
                .kai-particle:nth-child(3) { animation: orbit2 6s linear infinite; }
                .kai-particle:nth-child(4) { animation: orbit3 10s linear infinite; }
                
                .kai-orb.speaking .kai-particle { animation-duration: 2s; }
                .kai-orb.listening .kai-particle { animation-duration: 4s; }

                .kai-empathetic .kai-body { background: radial-gradient(circle at 40% 40%, #a7f3d0, #0d9488); box-shadow: inset 0 0 20px #d1fae5, 0 0 30px #14b8a6; }
                .kai-celebratory .kai-body { background: radial-gradient(circle at 40% 40%, #fef08a, #facc15); box-shadow: inset 0 0 20px #fef9c3, 0 0 40px #fde047; }
                .kai-concerned .kai-body { background: radial-gradient(circle at 40% 40%, #fed7aa, #fb923c); box-shadow: inset 0 0 20px #ffedd5, 0 0 30px #f97316; }
                .kai-frustrated .kai-body { background: radial-gradient(circle at 40% 40%, #fca5a5, #ef4444); box-shadow: inset 0 0 20px #fee2e2, 0 0 30px #dc2626; }
                
                @keyframes float { 0%, 100% { transform: translateY(0) rotateY(0deg); } 50% { transform: translateY(-10px) rotateY(15deg); } }
                @keyframes think { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
                @keyframes swirl { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
                @keyframes orbit1 { from { transform: translate(-50%, -50%) rotateY(0deg) translateX(55px) rotateY(-0deg); } to { transform: translate(-50%, -50%) rotateY(360deg) translateX(55px) rotateY(-360deg); } }
                @keyframes orbit2 { from { transform: translate(-50%, -50%) rotateY(60deg) rotateX(70deg) translateX(60px); } to { transform: translate(-50%, -50%) rotateY(420deg) rotateX(70deg) translateX(60px); } }
                @keyframes orbit3 { from { transform: translate(-50%, -50%) rotateY(120deg) rotateX(-60deg) translateX(65px); } to { transform: translate(-50%, -50%) rotateY(480deg) rotateX(-60deg) translateX(65px); } }
                @keyframes nod-gesture { 0%, 100% { transform: rotateX(0); } 25% { transform: rotateX(-15deg); } 75% { transform: rotateX(10deg); } }
                @keyframes shake-gesture { 0%, 100% { transform: rotateY(0); } 25% { transform: rotateY(-15deg); } 75% { transform: rotateY(15deg); } }
            `}</style>
            
            <div className="flex flex-col items-center justify-center pt-2" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <div className="kai-container">
                    <div ref={avatarRef} className={`kai-orb ${avatarState} ${emotionClasses[emotion]} ${gesture}`}>
                        <div className="kai-body"></div>
                        <div className="kai-particle"></div>
                        <div className="kai-particle"></div>
                        <div className="kai-particle"></div>
                         <div className="kai-core" style={{ transform: `translate(-50%, -50%) translateZ(30px) translateX(${corePosition.x}px) translateY(${corePosition.y}px)` }}></div>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-100 mt-2">Kai</h2>
            </div>
            
            <div className="flex flex-col w-full flex-grow min-h-0">
                <div className="flex-grow bg-slate-900 rounded-lg p-4 overflow-y-auto mb-4 border border-slate-700/50">
                    {conversation.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-center p-4">
                            <p>
                                Hola, soy Kai. Bienvenido a KIA, tu espacio seguro basado en tres pilares: <br/>
                                <span className="font-semibold text-teal-300">Kindness</span> (Amabilidad), <span className="font-semibold text-teal-300">Introspection</span> (Introspección) y <span className="font-semibold text-teal-300">Awareness</span> (Conciencia).
                                <br/><br/>
                                Estoy aquí para escucharte sin juicios. ¿Cómo te sientes hoy?
                            </p>
                        </div>
                    ) : (conversation.map((turn, index) => (<div key={index} className={`mb-4 flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${turn.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-200'}`}><div dangerouslySetInnerHTML={renderMarkdown(turn.text)} /></div></div>)))}
                    <div ref={chatEndRef} />
                </div>
                
                {suggestions.length > 0 && !isLoading && !userInput && (
                    <div className="flex flex-wrap justify-center gap-2 mb-2 animate-fade-in-up">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s)}
                                className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative flex items-center">
                    <textarea
                        ref={textareaRef}
                        value={userInput}
                        onChange={handleUserInput}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={isLoading ? "Kai está reflexionando..." : "Habla con Kai..."}
                        className="w-full p-3 pr-16 bg-slate-700 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-teal-500 resize-none text-slate-100"
                        rows={1}
                        disabled={isLoading}
                    />
                     <button
                        onClick={userInput.trim() ? () => handleSend() : handleMicClick}
                        disabled={isLoading}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 disabled:opacity-50 flex items-center justify-center h-10 w-10
                            ${userInput.trim()
                                ? 'bg-teal-600 text-white hover:bg-teal-500'
                                : isListening 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : 'bg-slate-600 text-slate-200 hover:bg-slate-500'
                            }`}
                        aria-label={userInput.trim() ? 'Enviar' : (isListening ? 'Detener' : 'Grabar')}
                    >
                        {userInput.trim() ? <SendIcon /> : <MicIcon />}
                    </button>
                </div>
            </div>
        </div>
    );
};

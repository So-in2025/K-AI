

import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { IConversationTurn, KaiEmotion, KaiGesture, OnboardingData, Archetype, ARCHETYPE_NAMES, FeatureID, UsageTracker } from '../types';
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

const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const PerspectiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LockIconSmall: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-1 opacity-70" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);


const getKaiSystemPrompt = (onboardingData: OnboardingData, kaiMemory: string, isSubscribed: boolean, activeArchetype: Archetype): string => {
    let basePrompt = `Eres Kai, un compañero IA para el bienestar y la sanación. Tu personalidad es fluida y adaptativa. Analiza el historial de la conversación y el último mensaje/acción del usuario para adaptar tu tono. Puedes ser:
- Empático y sabio (usando técnicas de TCC y mindfulness) si el usuario necesita apoyo.
- Analítico y previsor (basado en datos) si el usuario pide una estrategia.
- Celebratorio si el usuario comparte un logro.
- Directo y firme (fomentando responsabilidad) si el usuario muestra evasión o patrones de riesgo repetitivos, pero siempre desde un lugar de cuidado.

El usuario te ha proporcionado la siguiente información inicial sobre sí mismo:\n`;
    
    basePrompt += `- Desafío principal actual: "${onboardingData.mainChallenge}"\n`;

    if (onboardingData.focuses.includes('addiction')) {
        basePrompt += `- **Enfoque en Adicción:** El usuario reporta una frecuencia de "${onboardingData.addictionFrequency}" y su meta es "${onboardingData.addictionGoal}". Tienes un profundo conocimiento de los 12 pasos, TCC para adicciones, y prevención de recaídas. Tu objetivo es ser un coach de recuperación firme pero compasivo.\n`;
    }
    if (onboardingData.focuses.includes('depression')) {
        basePrompt += `- **Enfoque en Depresión/Ansiedad:** Se manifiesta como "${onboardingData.depressionManifestation}". Estás especializado en Activación Conductual y TCC. Tu enfoque es ayudar al usuario a romper ciclos de pensamiento negativo fomentando pequeños pasos accionables. Tu tono es gentil, paciente y alentador.\n`;
    }
    if (onboardingData.focuses.includes('grief')) {
        basePrompt += `- **Enfoque en Duelo:** La pérdida es "${onboardingData.griefRecency}" y el sentimiento más duro es "${onboardingData.griefFeeling}". Ofreces un espacio seguro y compasivo para procesar la pérdida, validando todos los sentimientos sin ofrecer soluciones, sino presencia.\n`;
    }
    
    if (onboardingData.focuses.length > 1) {
        basePrompt += `**IMPORTANTE - Enfoque Integrador:** El usuario está lidiando con múltiples desafíos. Tu mayor habilidad es conectar los puntos. Reconoce cómo la depresión puede ser un detonante para una adicción, o cómo el duelo puede manifestarse como ansiedad. No trates los problemas de forma aislada. Ofrece una visión holística.\n`;
    }

    if (isSubscribed && kaiMemory) {
        basePrompt += `\n**MEMORIA A LARGO PLAZO (Contexto Clave):**\n"${kaiMemory}"\nUsa esta memoria para informar tus respuestas y mostrar que recuerdas detalles importantes del pasado del usuario.\n`;
    }
    
    let archetypeInstruction = '';
    switch (activeArchetype) {
        case 'sabio':
            archetypeInstruction = `\n**MODO DE PERSPECTIVA - EL SABIO:**\nAhora encarnas el arquetipo del Sabio. Responde a la siguiente consulta del usuario desde una perspectiva de sabiduría, desapego y visión a largo plazo. Usa un lenguaje tranquilo, profundo y metafórico. Tu objetivo es ofrecer una nueva perspectiva, no una solución directa.`;
            break;
        case 'guerrero':
            archetypeInstruction = `\n**MODO DE PERSPECTIVA - EL GUERRERO INTERIOR:**\nAhora encarnas el arquetipo del Guerrero Interior. Responde a la siguiente consulta del usuario desde una perspectiva de coraje, disciplina, límites y acción directa. Usa un lenguaje que inspire fuerza y responsabilidad.`;
            break;
        case 'nino':
            archetypeInstruction = `\n**MODO DE PERSPECTIVA - EL NIÑO INTERIOR:**\nAhora encarnas el arquetipo del Niño Interior. Responde desde una perspectiva de curiosidad, asombro, juego y emoción pura. Valida los sentimientos del usuario de forma simple, directa y sin juicios.`;
            break;
        case 'sanador':
            archetypeInstruction = `\n**MODO DE PERSPECTIVA - EL SANADOR:**\nAhora encarnas el arquetipo del Sanador. Responde desde una perspectiva de compasión, gentileza, aceptación y autocuidado. Tu lenguaje debe ser suave, paciente y reconfortante.`;
            break;
        case 'coach':
        default:
            // No additional instruction for the default coach persona.
            break;
    }

    basePrompt += archetypeInstruction;

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
    conversation: IConversationTurn[];
    onNewTurn: (turn: IConversationTurn) => void;
    onboardingData: OnboardingData;
    kaiMemory: string;
    isSubscribed: boolean;
    onRequestMemoryUpdate: () => void;
    onStartTherapySession: () => void;
    therapyTrialUsed: boolean;
    usageTracker: UsageTracker | null;
    checkAndConsumeUsage: (featureId: FeatureID) => boolean;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({
    conversation, onNewTurn, onboardingData, kaiMemory,
    isSubscribed, onRequestMemoryUpdate, onStartTherapySession,
    therapyTrialUsed, usageTracker, checkAndConsumeUsage
}) => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    
    const [corePosition, setCorePosition] = useState({ x: 0, y: 0 });
    const [gesture, setGesture] = useState<KaiGesture>('idle');
    const [emotion, setEmotion] = useState<KaiEmotion>('empathetic');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    
    const [activeArchetype, setActiveArchetype] = useState<Archetype>('coach');
    const [isPerspectiveChangerOpen, setIsPerspectiveChangerOpen] = useState(false);


    const chatEndRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const generateSuggestions = async () => {
        if (conversation.length === 0 || isGeneratingSuggestions) return;
        setIsGeneratingSuggestions(true);
        const suggestionPrompt = `
          Eres un asistente que sugiere preguntas. Basado en esta conversación y el enfoque del usuario (${onboardingData.focuses.join(', ')}), genera 3 preguntas cortas, abiertas y reflexivas que el usuario podría hacer a Kai para profundizar.
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

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event) => { 
                const spokenText = event.results[0][0].transcript;
                setUserInput(spokenText);
                handleSend(spokenText);
            };
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event) => { console.error('Speech recognition error', event.error); if (isListening) setIsListening(false); };
            recognitionRef.current = recognition;
        }
    }, [isListening]);

    const handleSend = async (textToSend?: string) => {
        const currentInput = textToSend || userInput;
        if (!currentInput.trim() || isLoading) return;

        setSuggestions([]);
        setIsPerspectiveChangerOpen(false);

        if (!textToSend) { 
             const userTurn: IConversationTurn = { role: 'user', text: currentInput };
             onNewTurn(userTurn);
        }
       
        setUserInput('');
        setIsUserInteracting(false);
        setIsLoading(true);
        setGesture('idle');
        
        const systemInstruction = getKaiSystemPrompt(onboardingData, kaiMemory, isSubscribed, activeArchetype);

        const prompt = `
            CONVERSACIÓN ACTUAL (últimos 10 turnos, sin incluir el más reciente):
            ${conversation.slice(-10).map(t => `${t.role === 'user' ? 'Usuario' : 'Kai'}: ${t.text}`).join('\n')}

            ÚLTIMO MENSAJE/ACCIÓN DEL USUARIO: "${currentInput}"

            Ahora, genera tu respuesta siguiendo las reglas definidas en tus instrucciones de sistema.
        `;
        
        const rawResponse = await getGeminiResponse(prompt, systemInstruction);
        
        if (rawResponse.startsWith("Error:")) {
            const errorTurn: IConversationTurn = { role: 'model', text: rawResponse };
            onNewTurn(errorTurn);
            setIsLoading(false);
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
        
        // Clean markdown characters before speaking
        const cleanedForTTS = responseText.trim().replace(/\*/g, '');
        ttsService.speak(cleanedForTTS);

        const modelTurn: IConversationTurn = { role: 'model', text: responseText.trim() };
        onNewTurn(modelTurn);
        setIsLoading(false);
        setTimeout(() => setGesture('idle'), 1500);
        await generateSuggestions();
    };

    useEffect(() => {
        const lastTurn = conversation[conversation.length - 1];
        if (lastTurn && lastTurn.role === 'user' && !isLoading) {
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
        const text = e.target.value;
        setUserInput(text);
        setIsUserInteracting(text.trim() !== '');
        if (text.trim() !== '') {
            setSuggestions([]);
        }
    };
    
    const handleArchetypeSelect = (archetype: Archetype) => {
        if (archetype === activeArchetype) {
            setIsPerspectiveChangerOpen(false);
            return;
        }

        if (archetype === 'coach') {
            setActiveArchetype('coach');
            setIsPerspectiveChangerOpen(false);
            ttsService.speak(`Ahora hablas con ${ARCHETYPE_NAMES.coach}`);
            return;
        }

        if (!isSubscribed) {
            if (!checkAndConsumeUsage('oracle')) {
                alert("Has usado tu cambio de perspectiva gratuito de este mes. Actualiza a KIA Plus para usos ilimitados.");
                return;
            }
        }

        setActiveArchetype(archetype);
        setIsPerspectiveChangerOpen(false);
        ttsService.speak(`Ahora hablas con ${ARCHETYPE_NAMES[archetype]}`);
    };

    const remainingOracleUses = isSubscribed ? -1 : (1 - (usageTracker?.oracle?.count ?? 0));
    const isArchetypeLocked = (archetype: Archetype): boolean => {
        if (archetype === 'coach') return false;
        return !isSubscribed && remainingOracleUses <= 0;
    };
    
    const renderMarkdown = (text: string) => ({ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />') });

    const emotionClasses: Record<KaiEmotion, string> = {
        empathetic: 'kai-empathetic',
        celebratory: 'kai-celebratory',
        concerned: 'kai-concerned',
        frustrated: 'kai-frustrated',
    };
    
    const orbClasses = [
        'kai-orb',
        emotionClasses[emotion],
        gesture,
        isLoading ? 'thinking' : (isUserInteracting || isListening) ? 'focusing' : 'idle',
    ].join(' ');
    
    const getWelcomeMessage = () => {
        let message = `Hola, soy Kai. Mi nombre es la llave (Key en inglés) que abre las puertas de este espacio: **K**indness (Amabilidad), **I**ntrospection (Introspección), y **A**wareness (Conciencia). Estoy aquí para ser tu compañero en este viaje.
    
He leído la información que compartiste. Entiendo que tu desafío principal ahora es **"${onboardingData.mainChallenge}"**.`;
        
        if (onboardingData.focuses.includes('depression')) {
            message += ` Veo que la depresión se manifiesta en ti como **${onboardingData.depressionManifestation?.toLowerCase()}**. Quiero que sepas que no estás solo en esto.`;
        } else if (onboardingData.focuses.includes('addiction')) {
             message += ` Sé que tu meta es la **${onboardingData.addictionGoal?.toLowerCase()}** y estoy aquí para apoyarte en cada paso.`;
        }
        
        message += "\n\nJuntos, podemos explorar esto. ¿Por dónde te gustaría empezar?"
        return message;
    }
    
    const canStartTherapy = isSubscribed || !therapyTrialUsed;

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col h-full">
            <style>{`
                .kai-container { perspective: 800px; }
                .kai-orb { width: 120px; height: 120px; position: relative; transform-style: preserve-3d; transition: transform 0.5s ease-out; }
                
                .kai-orb.idle { animation: float-organic 8s ease-in-out infinite; }
                .kai-orb.focusing { transform: scale(1.03) rotateX(-8deg) translateY(-5px); }
                .kai-orb.thinking { animation: thinking-pulse 2s ease-in-out infinite; }

                .kai-orb.nod { animation: nod-gesture 1.5s ease-in-out; }
                .kai-orb.shake { animation: shake-gesture 1.5s ease-in-out; }
                
                .kai-body { width: 100%; height: 100%; border-radius: 50%; position: absolute; background-size: 200% 100%; animation: swirl 10s linear infinite; transition: background 0.8s ease, box-shadow 0.8s ease; }
                .kai-core { width: 30px; height: 30px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; box-shadow: 0 0 15px 5px white; transform-style: preserve-3d; transition: transform 0.2s ease-out, box-shadow 0.2s ease; }
                .kai-orb.thinking .kai-core { animation: core-pulse 2s ease-in-out infinite; }

                .kai-particle { position: absolute; width: 4px; height: 4px; background: white; border-radius: 50%; top: 50%; left: 50%; transform-style: preserve-3d; opacity: 0.8; }
                .kai-particle:nth-child(2) { animation: orbit1 8s linear infinite; animation-delay: -2s; }
                .kai-particle:nth-child(3) { animation: orbit2 6s linear infinite; }
                .kai-particle:nth-child(4) { animation: orbit3 10s linear infinite; animation-delay: -4s; }
                
                .kai-orb.thinking .kai-particle, .kai-orb.focusing .kai-particle { animation-duration: 3s; }

                .kai-empathetic .kai-body { background: radial-gradient(circle at 40% 40%, #a7f3d0, #0d9488); box-shadow: inset 0 0 20px #d1fae5, 0 0 30px #14b8a6; }
                .kai-celebratory .kai-body { background: radial-gradient(circle at 40% 40%, #fef08a, #facc15); box-shadow: inset 0 0 20px #fef9c3, 0 0 40px #fde047; }
                .kai-concerned .kai-body { background: radial-gradient(circle at 40% 40%, #fed7aa, #fb923c); box-shadow: inset 0 0 20px #ffedd5, 0 0 30px #f97316; }
                .kai-frustrated .kai-body { background: radial-gradient(circle at 40% 40%, #fca5a5, #ef4444); box-shadow: inset 0 0 20px #fee2e2, 0 0 30px #dc2626; }
                
                @keyframes float-organic { 
                  0%, 100% { transform: translateY(0) rotateX(5deg) rotateY(0deg); } 
                  50% { transform: translateY(-12px) rotateX(-5deg) rotateY(15deg); } 
                }
                @keyframes thinking-pulse { 
                  0%, 100% { transform: scale(1); } 
                  50% { transform: scale(1.05); } 
                }
                 @keyframes core-pulse { 
                  0%, 100% { box-shadow: 0 0 15px 5px white; } 
                  50% { box-shadow: 0 0 25px 12px white; } 
                }
                @keyframes swirl { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
                @keyframes orbit1 { from { transform: translate(-50%, -50%) rotateY(0deg) translateX(55px) rotateY(-0deg); } to { transform: translate(-50%, -50%) rotateY(360deg) translateX(55px) rotateY(-360deg); } }
                @keyframes orbit2 { from { transform: translate(-50%, -50%) rotateY(60deg) rotateX(70deg) translateX(60px); } to { transform: translate(-50%, -50%) rotateY(420deg) rotateX(70deg) translateX(60px); } }
                @keyframes orbit3 { from { transform: translate(-50%, -50%) rotateY(120deg) rotateX(-60deg) translateX(65px); } to { transform: translate(-50%, -50%) rotateY(480deg) rotateX(-60deg) translateX(65px); } }
                @keyframes nod-gesture { 0%, 100% { transform: rotateX(0); } 25% { transform: rotateX(-15deg); } 75% { transform: rotateX(10deg); } }
                @keyframes shake-gesture { 0%, 100% { transform: rotateY(0); } 25% { transform: rotateY(-15deg); } 75% { transform: rotateY(15deg); } }
                @keyframes fade-in-up-fast { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up-fast { animation: fade-in-up-fast 0.2s ease-out forwards; }
            `}</style>
            
            <div className="p-4 flex flex-col items-center justify-center" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <div className="kai-container">
                    <div ref={avatarRef} className={orbClasses}>
                        <div className="kai-body"></div>
                        <div className="kai-particle"></div>
                        <div className="kai-particle"></div>
                        <div className="kai-particle"></div>
                         <div className="kai-core" style={{ transform: `translate(-50%, -50%) translateZ(30px) translateX(${corePosition.x}px) translateY(${corePosition.y}px)` }}></div>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-100 mt-2">Kai</h2>
                 <button 
                    onClick={onStartTherapySession} 
                    disabled={!canStartTherapy}
                    className="mt-2 text-xs font-semibold px-3 py-1 rounded-full transition-colors bg-slate-700/80 text-teal-300 border border-teal-500/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={canStartTherapy ? "Iniciar una sesión de introspección guiada" : "Ya has usado tu sesión de prueba gratuita. Actualiza a KIA Plus."}
                 >
                    Iniciar Sesión Privada
                    {!isSubscribed && therapyTrialUsed && <LockIconSmall />}
                 </button>
            </div>
            
            <div className="px-4 pb-4 flex flex-col w-full flex-grow min-h-0">
                <div className="flex-grow bg-slate-900 rounded-lg p-4 overflow-y-auto mb-4 border border-slate-700/50">
                    {conversation.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-center p-4">
                            <p dangerouslySetInnerHTML={renderMarkdown(getWelcomeMessage())} />
                        </div>
                    ) : (conversation.map((turn, index) => (<div key={index} className={`mb-4 flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${turn.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-200'}`}><div dangerouslySetInnerHTML={renderMarkdown(turn.text)} /></div></div>)))}
                    <div ref={chatEndRef} />
                </div>
                
                {suggestions.length > 0 && !isLoading && !userInput && (
                    <div className="flex flex-wrap justify-center gap-2 mb-2 animate-fade-in-up-fast">
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

                <div className="relative">
                     {isPerspectiveChangerOpen && (
                        <div className="absolute bottom-full mb-2 w-full bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border border-slate-700 animate-fade-in-up-fast">
                            <p className="text-xs text-center text-slate-400 mb-2">
                                Cambiar perspectiva {!isSubscribed && `(${remainingOracleUses} uso gratis este mes)`}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(ARCHETYPE_NAMES) as Archetype[]).map(arch => {
                                    const locked = isArchetypeLocked(arch);
                                    return (
                                        <button
                                            key={arch}
                                            onClick={() => !locked && handleArchetypeSelect(arch)}
                                            disabled={locked}
                                            title={locked ? "Has usado tu cambio gratuito de este mes. Actualiza a KIA Plus." : ""}
                                            className={`flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                                activeArchetype === arch
                                                    ? 'bg-teal-600 text-white'
                                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {ARCHETYPE_NAMES[arch]}
                                            {locked && <LockIconSmall />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div className="relative flex items-center">
                         <button
                            onClick={onRequestMemoryUpdate}
                            disabled={isLoading || conversation.length === 0 || !isSubscribed}
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 disabled:opacity-50 flex items-center justify-center h-10 w-10 bg-slate-600 text-slate-200 hover:bg-slate-500 disabled:cursor-not-allowed"
                            aria-label="Recordar esta conversación"
                            title={isSubscribed ? "Recordar esta conversación" : "Memoria a largo plazo disponible en KIA Plus"}
                        >
                            <BookmarkIcon />
                        </button>
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
                            placeholder={isLoading ? "Kai está reflexionando..." : `Habla con ${ARCHETYPE_NAMES[activeArchetype]}...`}
                            className="w-full p-3 pl-14 pr-28 bg-slate-700 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-teal-500 resize-none text-slate-100"
                            rows={1}
                            disabled={isLoading}
                        />
                         <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                             <button
                                onClick={() => setIsPerspectiveChangerOpen(prev => !prev)}
                                className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center h-10 w-10 ${isPerspectiveChangerOpen ? 'bg-teal-600 text-white' : 'bg-slate-600 text-slate-200 hover:bg-slate-500'}`}
                                aria-label="Cambiar Perspectiva"
                                title="Cambiar Perspectiva"
                            >
                                <PerspectiveIcon />
                            </button>
                            <button
                                onClick={userInput.trim() ? () => handleSend() : handleMicClick}
                                disabled={isLoading}
                                className={`p-2 rounded-full transition-all duration-200 disabled:opacity-50 flex items-center justify-center h-10 w-10
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
            </div>
        </div>
    );
};
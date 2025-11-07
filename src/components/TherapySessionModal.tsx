import React, { useState, useEffect, useRef } from 'react';
import { IConversationTurn, ITherapySession, TherapyMode, THERAPY_MODES, ITherapySummary } from '../types';
import { SOSCard } from './SOSCard';
import { useUser } from '../contexts/UserContext';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const renderMarkdown = (text: string) => ({ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />') });

const getTherapySystemInstruction = (mode: TherapyMode): string => {
    switch(mode) {
        case 'cbt':
            return `Eres Kai, un terapeuta de Terapia Cognitivo-Conductual (TCC). Tu objetivo es ayudar al usuario a identificar, cuestionar y reestructurar un pensamiento automático negativo. Guía al usuario a través del proceso de examinar la evidencia a favor y en contra de su pensamiento, explorar interpretaciones alternativas y formular un pensamiento más equilibrado y útil. Usa un tono empático y socrático. No des consejos directos. Haz preguntas que le ayuden a llegar a sus propias conclusiones.`;
        case 'act':
            return `Eres Kai, un terapeuta de Terapia de Aceptación y Compromiso (ACT). Tu objetivo es ayudar al usuario a aceptar sus emociones difíciles sin luchar contra ellas y a comprometerse con acciones que estén alineadas con sus valores. Guía al usuario a practicar la defusión (observar sus pensamientos sin ser ellos), la aceptación de sus sentimientos y la conexión con el momento presente. Anima al usuario a identificar lo que es verdaderamente importante para él (sus valores) y a dar pequeños pasos en esa dirección.`;
        case 'narrative':
            return `Eres Kai, un terapeuta de Terapia Narrativa. Tu objetivo es ayudar al usuario a externalizar su problema y a reescribir la historia que se cuenta a sí mismo. Ayúdale a ver el problema como algo separado de su identidad. Haz preguntas que le permitan descubrir momentos en los que el problema no ha dominado su vida (excepciones). Guíale para que construya una nueva narrativa, una historia alternativa más rica y empoderadora que resalte sus fortalezas, valores y resiliencia.`;
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

    // ... useEffects for timer and scrolling remain the same ...

    const handleSend = async () => {
        if (!userInput.trim() || isLoading || !mode || !geminiService) return;
        const newUserTurn: IConversationTurn = { role: 'user', text: userInput };
        const newTranscript = [...transcript, newUserTurn];
        setTranscript(newTranscript);
        setUserInput('');
        setIsLoading(true);

        const systemInstruction = getTherapySystemInstruction(mode);
        const prompt = `CONVERSACIÓN ACTUAL:\n${newTranscript.map(t => `${t.role}: ${t.text}`).join('\n')}\n\nKAI:`;
        
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
        const prompt = `Actúa como un terapeuta que resume una sesión. Transcripción: ${transcript.map(t => `${t.role}: ${t.text}`).join('\n')}. Genera un resumen estructurado con [INSIGHTS], [PATTERNS], [ACTIONABLE].`;
        
        try {
            const response = await geminiService.generateContent(prompt);
            const insightsMatch = response.match(/\[INSIGHTS\](.*?)\[END_INSIGHTS\]/s);
            const patternsMatch = response.match(/\[PATTERNS\](.*?)\[END_PATTERNS\]/s);
            const actionableMatch = response.match(/\[ACTIONABLE\](.*?)\[END_ACTIONABLE\]/s);
            setSummary({
                insights: insightsMatch ? insightsMatch[1].trim() : "N/A",
                patterns: patternsMatch ? patternsMatch[1].trim() : "N/A",
                actionable: actionableMatch ? actionableMatch[1].trim() : "N/A"
            });
            setStep('summary');
        } catch (e) { console.error(e) }
        finally { setIsLoading(false); }
    };
    
    // ... other handlers and rendering logic remain largely the same ...
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-40">
            {/* The modal JSX remains the same, but its logic now uses the context's geminiService */}
        </div>
    );
};

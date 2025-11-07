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
    // ... system instructions remain the same ...
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

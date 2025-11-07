
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import ttsService from '../services/ttsService';
import { KiaIcon } from '../components/KiaIcon.tsx';
import { IConversationTurn } from '../types';
import { TherapySessionModal } from '../components/TherapySessionModal';

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

export const KaiView: React.FC = () => {
    const { userData, geminiService, addConversationTurn } = useUser();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const conversation = userData?.kaiConversation || [];
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);
    
    useEffect(() => {
        // Stop TTS when navigating away
        return () => {
            ttsService.stop();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !geminiService) return;

        const userTurn: IConversationTurn = { role: 'user', text: input };
        addConversationTurn(userTurn);
        setInput('');
        setIsLoading(true);

        const prompt = input;
        const systemInstruction = `You are Kai, an empathetic AI companion for healing. Your personality is kind, introspective, and aware. Your goal is to provide a safe, non-judgmental space. Use a warm, supportive, and slightly informal tone. Keep responses concise and focused. Reference the user's focus areas: ${userData?.onboardingData?.focuses.join(', ')}. Key challenge: ${userData?.onboardingData?.mainChallenge}.`;
        
        try {
            const responseText = await geminiService.generateContent(prompt, systemInstruction);
            const modelTurn: IConversationTurn = { role: 'model', text: responseText };
            addConversationTurn(modelTurn);
            ttsService.speak(responseText);
        } catch (error) {
            console.error("Error with Kai's response:", error);
            const errorTurn: IConversationTurn = { role: 'model', text: "Lo siento, estoy teniendo problemas para conectar en este momento. Por favor, inténtalo de nuevo más tarde." };
            addConversationTurn(errorTurn);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
            <button 
                onClick={() => setIsTherapyModalOpen(true)}
                className="mb-4 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors self-start mx-auto"
            >
                Iniciar Modo Terapeuta
            </button>

            <div className="flex-grow overflow-y-auto pr-2">
                <div className="space-y-6">
                    {conversation.map((turn, index) => (
                        <div key={index} className={`flex items-start gap-3 ${turn.role === 'user' ? 'justify-end' : ''}`}>
                            {turn.role === 'model' && <KiaIcon className="h-8 w-8 text-teal-400 flex-shrink-0 mt-1" />}
                            <div className={`max-w-md p-4 rounded-2xl ${turn.role === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p>{turn.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <KiaIcon className="h-8 w-8 text-teal-400 flex-shrink-0 mt-1" />
                            <div className="max-w-md p-4 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex-shrink-0">
                <div className="flex items-center bg-slate-700 rounded-full p-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu mensaje a Kai..."
                        className="w-full bg-transparent text-slate-200 placeholder-slate-400 focus:outline-none px-4"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-teal-500 text-white rounded-full p-3 hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>
            {isTherapyModalOpen && <TherapySessionModal onClose={() => setIsTherapyModalOpen(false)} />}
        </div>
    );
};

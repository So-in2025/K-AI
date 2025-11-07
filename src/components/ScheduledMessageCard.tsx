
import React, { useState, useEffect } from 'react';
import { MESSAGES } from '../constants.ts';
import { MessageCategory, IMessage } from '../types.ts';
import ttsService from '../services/ttsService.ts';

const getMessageCategory = (): MessageCategory => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return MessageCategory.Morning;
    if (hour >= 12 && hour < 18) return MessageCategory.Afternoon;
    if (hour >= 18 && hour < 22) return MessageCategory.Evening;
    return MessageCategory.Night;
};

const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);


export const ScheduledMessageCard: React.FC = () => {
    const [message, setMessage] = useState<IMessage | null>(null);

    useEffect(() => {
        const category = getMessageCategory();
        const categoryMessages = MESSAGES[category];
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const messageIndex = dayOfYear % categoryMessages.length;
        setMessage(categoryMessages[messageIndex]);
    }, []);

    const handlePlayMessage = () => {
        if (message) {
            ttsService.speak(`${message.title}. ${message.content}`);
        }
    }

    if (!message) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl shadow-lg h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">{message.title}</h2>
                <p className="text-slate-300">{message.content}</p>
            </div>
            <button 
                onClick={handlePlayMessage}
                className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition-colors mt-4 self-start"
                aria-label="Escuchar mensaje"
            >
                <SpeakerIcon />
                <span className="text-sm font-semibold">Escuchar</span>
            </button>
        </div>
    );
};

import React, { useMemo } from 'react';
import { EPIC_QUOTES } from '../constants.ts';
import { useUser } from '../contexts/UserContext.tsx';
import { TtsInfoButton } from './TtsInfoButton.tsx';

export const DailyQuoteCard: React.FC = () => {
    const { userData } = useUser();
    
    const quote = useMemo(() => {
        const userFocuses = userData?.onboardingData?.focuses || [];
        
        const relevantQuotes = EPIC_QUOTES.filter(q => 
            userFocuses.length === 0 || !q.tags || q.tags.some(tag => userFocuses.includes(tag))
        );
        
        const quotesToUse = relevantQuotes.length > 0 ? relevantQuotes : EPIC_QUOTES;
        
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const quoteIndex = dayOfYear % quotesToUse.length;
        
        return quotesToUse[quoteIndex];
    }, [userData]);

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full flex flex-col justify-center relative">
             <TtsInfoButton explanation="Cada día, esta tarjeta te ofrece una cita de grandes pensadores y filósofos, seleccionada para resonar con tu camino. Una pequeña dosis de sabiduría para inspirar tu jornada." />
            <blockquote className="text-center">
                <p className="text-lg italic text-slate-200">
                    "{quote.text}"
                </p>
                <footer className="mt-4 text-sm text-teal-400 font-semibold">
                    — {quote.author}
                </footer>
            </blockquote>
        </div>
    );
};
import React, { useState, useEffect, useCallback } from 'react';
import { EPIC_QUOTES } from '../constants';
import { TtsInfoButton } from './TtsInfoButton';
import ttsService from '../services/ttsService';
import { IQuote } from '../types';
import { useUser } from '../contexts/UserContext';

const QuoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" />
    </svg>
);

export const DailyQuoteCard: React.FC = () => {
  const { userData } = useUser();
  const [quote, setQuote] = useState<IQuote | null>(null);

  const getNewQuote = useCallback(() => {
    ttsService.stop();
    const userFocuses = userData?.onboardingData?.focuses || [];
    
    const relevantQuotes = EPIC_QUOTES.filter(q => q.tags && userFocuses.some(focus => q.tags?.includes(focus)));
    const genericQuotes = EPIC_QUOTES.filter(q => !q.tags || q.tags.length === 0);
    let quotePool = (relevantQuotes.length > 0 && Math.random() < 0.8) ? relevantQuotes : genericQuotes;
    if(quotePool.length === 0) quotePool = EPIC_QUOTES;

    let newQuote;
    do {
      newQuote = quotePool[Math.floor(Math.random() * quotePool.length)];
    } while (quote && newQuote.text === quote.text && quotePool.length > 1);
    
    setQuote(newQuote);
    
    if (newQuote) {
        ttsService.speak(`Cita de ${newQuote.author}. ${newQuote.text}`);
    }
  }, [quote, userData]);

  useEffect(() => {
    setQuote(EPIC_QUOTES[Math.floor(Math.random() * EPIC_QUOTES.length)]);
    return () => { ttsService.stop(); };
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white relative">
      <TtsInfoButton 
        explanation="Cada día, te ofrecemos una de las frases más poderosas de la historia, seleccionada para darte fuerza y perspectiva en tu camino." 
        className="text-white hover:text-indigo-200" 
      />
      <div className="flex items-center space-x-3 mb-4">
        <QuoteIcon />
        <h2 className="text-xl font-bold">Inspiración del Día</h2>
      </div>
      {!quote ? (
        <div className="h-24 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
      ) : (
        <div className="h-24 flex flex-col justify-center">
          <blockquote className="text-lg font-medium italic border-l-4 border-purple-300 pl-4">"{quote.text}"</blockquote>
          <p className="text-right text-sm text-purple-200 mt-2">- {quote.author}</p>
        </div>
      )}
      <button onClick={getNewQuote} className="text-sm mt-4 text-white opacity-75 hover:opacity-100 transition">Obtener otra cita</button>
    </div>
  );
};

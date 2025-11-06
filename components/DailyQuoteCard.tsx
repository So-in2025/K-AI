
import React, { useState, useEffect, useCallback } from 'react';
import { EPIC_QUOTES } from '../constants';
import { TtsInfoButton } from './TtsInfoButton';
import ttsService from '../services/ttsService';

const QuoteIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" />
    </svg>
);


export const DailyQuoteCard: React.FC = () => {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  const getNewQuote = useCallback(() => {
    ttsService.stop();
    
    let randomIndex;
    let newQuote;
    
    // Ensure we don't show the same quote twice in a row
    do {
      randomIndex = Math.floor(Math.random() * EPIC_QUOTES.length);
      newQuote = EPIC_QUOTES[randomIndex];
    } while (quote && newQuote.text === quote.text);
    
    setQuote(newQuote);
    
    if (newQuote) {
        const textToSpeak = `Cita de ${newQuote.author}. ${newQuote.text}`;
        ttsService.speak(textToSpeak);
    }
  }, [quote]);

  useEffect(() => {
    // On first mount, get a quote without checking for duplicates
    const firstQuoteIndex = Math.floor(Math.random() * EPIC_QUOTES.length);
    const firstQuote = EPIC_QUOTES[firstQuoteIndex];
    setQuote(firstQuote);
    
    return () => {
        ttsService.stop();
    };
  }, []); // Empty dependency array means it runs once on mount.


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
        <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="h-24 flex flex-col justify-center">
          <blockquote className="text-lg font-medium italic border-l-4 border-purple-300 pl-4">
            "{quote.text}"
          </blockquote>
          <p className="text-right text-sm text-purple-200 mt-2">- {quote.author}</p>
        </div>
      )}
      <button 
        onClick={getNewQuote} 
        className="text-sm mt-4 text-white opacity-75 hover:opacity-100 transition">
          Obtener otra cita
      </button>
    </div>
  );
};
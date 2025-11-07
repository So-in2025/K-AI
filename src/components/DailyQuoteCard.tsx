import React, { useState, useEffect, useCallback } from 'react';
import { EPIC_QUOTES } from '../constants';
import { TtsInfoButton } from './TtsInfoButton';
import ttsService from '../services/ttsService';
import { OnboardingData, IQuote } from '../types';

const QuoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" />
    </svg>
);

interface DailyQuoteCardProps {
    onboardingData: OnboardingData;
}

export const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({ onboardingData }) => {
  const [quote, setQuote] = useState<IQuote | null>(null);

  const getNewQuote = useCallback(() => {
    ttsService.stop();

    const userFocuses = onboardingData.focuses;
    
    // 1. Filtrar citas que coincidan con el enfoque del usuario
    const relevantQuotes = EPIC_QUOTES.filter(q => 
        q.tags && userFocuses.some(focus => q.tags?.includes(focus))
    );

    // 2. Filtrar citas genéricas (sin tags)
    const genericQuotes = EPIC_QUOTES.filter(q => !q.tags || q.tags.length === 0);

    let quotePool: IQuote[];

    // Dar prioridad a las citas relevantes. Si no hay, usar las genéricas.
    // Usar una probabilidad para mezclar algunas genéricas de vez en cuando.
    if (relevantQuotes.length > 0 && Math.random() < 0.8) { // 80% de probabilidad de obtener una cita relevante
        quotePool = relevantQuotes;
    } else {
        quotePool = genericQuotes;
    }

    if(quotePool.length === 0) { // Fallback si el pool primario está vacío
      quotePool = EPIC_QUOTES;
    }

    let randomIndex;
    let newQuote;
    
    // Asegurarse de no mostrar la misma cita dos veces seguidas
    do {
      randomIndex = Math.floor(Math.random() * quotePool.length);
      newQuote = quotePool[randomIndex];
    } while (quote && newQuote.text === quote.text && quotePool.length > 1);
    
    setQuote(newQuote);
    
    if (newQuote) {
        const textToSpeak = `Cita de ${newQuote.author}. ${newQuote.text}`;
        ttsService.speak(textToSpeak);
    }
  }, [quote, onboardingData]);

  useEffect(() => {
    // Al montar, obtener una cita inicial (puede ser cualquiera)
    const firstQuoteIndex = Math.floor(Math.random() * EPIC_QUOTES.length);
    const firstQuote = EPIC_QUOTES[firstQuoteIndex];
    setQuote(firstQuote);
    
    return () => {
        ttsService.stop();
    };
  }, []); // El array de dependencias vacío asegura que se ejecute una sola vez al montar.


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
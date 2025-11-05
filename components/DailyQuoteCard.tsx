import React, { useState, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { TtsInfoButton } from './TtsInfoButton';

const QuoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" />
    </svg>
);


export const DailyQuoteCard: React.FC = () => {
  const [quote, setQuote] = useState<string>('Cargando inspiración para ti...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchQuote = async () => {
    setIsLoading(true);
    const prompt = "Genera una cita motivacional corta y poderosa para alguien que se está recuperando de una adicción. Debe ser esperanzadora, enfocada en la fortaleza interior y no debe sonar como un robot. En español. No incluyas comillas al principio ni al final.";
    const response = await getGeminiResponse(prompt);
    setQuote(response);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white relative">
      <TtsInfoButton explanation="Cada día, Kai genera una cita inspiradora única para ti, diseñada para ofrecerte una dosis de fuerza y perspectiva en tu camino." className="text-white hover:text-indigo-200" />
      <div className="flex items-center space-x-3 mb-4">
        <QuoteIcon />
        <h2 className="text-xl font-bold">Inspiración del Día</h2>
      </div>
      {isLoading ? (
        <div className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <blockquote className="text-lg font-medium italic border-l-4 border-purple-300 pl-4 h-20 flex items-center">
          "{quote}"
        </blockquote>
      )}
      <button 
        onClick={fetchQuote} 
        disabled={isLoading}
        className="text-sm mt-4 text-white opacity-75 hover:opacity-100 transition disabled:opacity-50">
          Obtener otra cita
      </button>
    </div>
  );
};

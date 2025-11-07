import React from 'react';
import ttsService from '../services/ttsService';

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface TtsInfoButtonProps {
    explanation: string;
    className?: string;
}

export const TtsInfoButton: React.FC<TtsInfoButtonProps> = ({ explanation, className }) => {
    const handlePlayExplanation = (e: React.MouseEvent) => {
        e.stopPropagation();
        ttsService.speakSimple(explanation);
    };

    return (
        <button 
            onClick={handlePlayExplanation} 
            className={`absolute top-4 right-4 text-slate-400 hover:text-teal-400 transition-colors z-10 ${className}`} 
            aria-label="Escuchar explicación de la herramienta"
        >
            <InfoIcon />
        </button>
    );
};
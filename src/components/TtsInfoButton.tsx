import React, { useState } from 'react';

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const TtsInfoButton: React.FC<{ explanation: string }> = ({ explanation }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="absolute top-3 right-3 z-10">
            <button 
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                onClick={() => setShowInfo(s => !s)}
                className="text-slate-500 hover:text-teal-400 transition-colors"
                aria-label="Más información"
            >
                <InfoIcon />
            </button>
            {showInfo && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-3 shadow-lg z-20">
                    {explanation}
                </div>
            )}
        </div>
    );
};

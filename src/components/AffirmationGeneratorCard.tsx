import React from 'react';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6.343 17.657l-2.828 2.828m11.314-11.314l2.828-2.828M5 21v-4m-2 2h4m11.314 0l-2.828-2.828M19 3v4m2-2h-4m-4 16v-4m-2 2h4" />
    </svg>
);

export const AffirmationGeneratorCard: React.FC = () => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full">
            <div className="flex items-center space-x-3 mb-3">
                <SparklesIcon />
                <h2 className="text-xl font-bold text-slate-100">Generador de Afirmaciones</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Crea afirmaciones personalizadas con Kai. Próximamente.
            </p>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg flex items-center justify-center h-24">
                <p className="text-slate-300">Esta función está en desarrollo.</p>
            </div>
        </div>
    );
};

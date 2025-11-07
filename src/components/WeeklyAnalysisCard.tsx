import React from 'react';

const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

export const WeeklyAnalysisCard: React.FC = () => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full">
            <div className="flex items-center space-x-3 mb-3">
                <ClipboardListIcon />
                <h2 className="text-xl font-bold text-slate-100">Análisis Semanal</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Recibe un resumen de tu progreso y patrones de la semana. Próximamente.
            </p>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg flex items-center justify-center h-24">
                <p className="text-slate-300">Esta función está en desarrollo.</p>
            </div>
        </div>
    );
};

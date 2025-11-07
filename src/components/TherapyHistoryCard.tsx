import React from 'react';

const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

export const TherapyHistoryCard: React.FC = () => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full">
            <div className="flex items-center space-x-3 mb-3">
                <ArchiveIcon />
                <h2 className="text-xl font-bold text-slate-100">Historial de Terapia</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Revisa tus sesiones pasadas con Kai en Modo Terapeuta. Próximamente.
            </p>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg flex items-center justify-center h-24">
                <p className="text-slate-300">Esta función está en desarrollo.</p>
            </div>
        </div>
    );
};

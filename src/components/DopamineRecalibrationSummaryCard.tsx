import React from 'react';

const BrainCircuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 3v2m0 14v2m-7.071-2.929l1.414-1.414M17.657 6.343l1.414-1.414m-12.728 0l1.414 1.414M17.657 17.657l1.414 1.414M4 12H2m20 0h-2M12 7a5 5 0 100 10 5 5 0 000-10z" />
    </svg>
);

export const DopamineRecalibrationSummaryCard: React.FC = () => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full">
            <div className="flex items-center space-x-3 mb-3">
                <BrainCircuitIcon />
                <h2 className="text-xl font-bold text-slate-100">Recalibración de Dopamina</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Observa cómo estás cambiando tus fuentes de recompensa. Próximamente.
            </p>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg flex items-center justify-center h-24">
                <p className="text-slate-300">Esta función está en desarrollo.</p>
            </div>
        </div>
    );
};

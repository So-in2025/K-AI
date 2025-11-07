import React from 'react';

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.606 11.955 11.955 0 019 2.606 12.02 12.02 0 00-2.382-9.016z" />
    </svg>
);

export const GuardianModeCard: React.FC = () => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full">
            <div className="flex items-center space-x-3 mb-3">
                <ShieldIcon />
                <h2 className="text-xl font-bold text-slate-100">Modo Guardián</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Kai analiza tus recaídas para darte estrategias. Próximamente.
            </p>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg flex items-center justify-center h-24">
                <p className="text-slate-300">Esta función está en desarrollo.</p>
            </div>
        </div>
    );
};

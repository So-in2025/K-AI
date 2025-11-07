import React from 'react';

const VaultIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1m0 0v1m0-1c1.657 0 3-.895 3-2M9.401 9C9.138 8.402 9 7.742 9 7c0-1.657 1.343-3 3-3s3 1.343 3 3c0 .742-.138 1.402-.401 2M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);

export const FreedomVaultCard: React.FC = () => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full">
            <div className="flex items-center space-x-3 mb-3">
                <VaultIcon />
                <h2 className="text-xl font-bold text-slate-100">Bóveda de la Libertad</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Visualiza cómo tu esfuerzo se transforma en sueños. Próximamente.
            </p>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg flex items-center justify-center h-24">
                <p className="text-slate-300">Esta función está en desarrollo.</p>
            </div>
        </div>
    );
};

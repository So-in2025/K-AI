import React from 'react';

const PlantIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 8.32l-1.313-1.312a2.25 2.25 0 00-3.182 0l-1.313 1.312a2.25 2.25 0 000 3.182l1.313 1.312a2.25 2.25 0 003.182 0l1.313-1.312a2.25 2.25 0 000-3.182z" />
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 12c0-3.162-2.13-5.83-5-6.674M12 19.5c-3.162 0-5.83-2.13-6.674-5" />
    </svg>
);

export const InnerGardenCard: React.FC = () => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full">
            <div className="flex items-center space-x-3 mb-3">
                <PlantIcon />
                <h2 className="text-xl font-bold text-slate-100">Jardín Interior</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Mira cómo crece tu jardín con cada día de progreso. Próximamente.
            </p>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg flex items-center justify-center h-24">
                <p className="text-slate-300">Esta función está en desarrollo.</p>
            </div>
        </div>
    );
};

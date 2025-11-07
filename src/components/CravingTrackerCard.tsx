
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import { ICraving } from '../types.ts';
import { LogCravingModal } from './LogCravingModal.tsx';
import { TtsInfoButton } from './TtsInfoButton.tsx';

const BarChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
);

export const CravingTrackerCard: React.FC = () => {
    const { userData, updateUserData } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cravings = userData?.cravings || [];

    const handleLogCraving = (craving: Omit<ICraving, 'date'>) => {
        const newCraving = { ...craving, date: new Date().toISOString() };
        updateUserData({ cravings: [...cravings, newCraving] });
        setIsModalOpen(false);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative h-full flex flex-col">
            <TtsInfoButton explanation="Entender tus deseos es clave. Esta herramienta te ayuda a registrar cuándo sientes un 'craving', qué lo disparó y cómo lo afrontaste. Con el tiempo, Kai usará estos datos para mostrarte tus patrones." />
            <div className="flex items-center space-x-3 mb-3">
                <BarChartIcon />
                <h2 className="text-xl font-bold text-slate-100">Registro de Deseos</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Registra tus 'cravings' para entender sus patrones y detonantes.
            </p>

            <div className="flex-grow flex flex-col justify-center items-center bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-4xl font-bold text-white">{cravings.length}</p>
                <p className="text-sm text-slate-300">Deseos registrados</p>
            </div>
            
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
                Registrar un Deseo
            </button>

            {isModalOpen && <LogCravingModal onClose={() => setIsModalOpen(false)} onSave={handleLogCraving} />}
        </div>
    );
};
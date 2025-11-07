import React, { useState, useMemo } from 'react';
import { ICraving } from '../types';
import { LogCravingModal } from './LogCravingModal';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const WaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8s4-4 8 0 8 4 8 4-4-4-8 0-8 4-8 4zM4 14s4-4 8 0 8 4 8 4-4-4-8 0-8 4-8 4z" />
    </svg>
);


export const CravingTrackerCard: React.FC = () => {
    const { userData, logCraving } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cravings = userData?.cravings || [];

    const chartData = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }).reverse();
        const data = days.map(day => cravings.filter(c => c.date.startsWith(day)).length);
        const maxCraving = Math.max(...data, 1);
        return { 
            labels: days.map(d => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase()), 
            data, 
            maxCraving 
        };
    }, [cravings]);
    
    const handleLogSuccess = (craving: ICraving) => {
        logCraving(craving);
        setIsModalOpen(false);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="El seguimiento de antojos es una herramienta poderosa. Cada vez que registras un antojo, no estás fallando; estás recopilando datos valiosos sobre tus detonantes para entender mejor tus patrones." />
            <div className="flex items-center space-x-3 mb-3">
                <WaveIcon />
                <h2 className="text-xl font-bold text-slate-100">Seguimiento de Antojos</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Registra los antojos para entender tus patrones. Cada registro es una victoria.</p>

            <div className="h-32 flex items-end justify-around px-2 gap-2">
                {chartData.data.map((value, index) => (
                    <div key={index} className="flex flex-col items-center flex-1" title={`${value} antojo(s)`}>
                        <div className="w-4 bg-teal-500 rounded-t-sm" style={{ height: `${Math.max(2, (value / chartData.maxCraving) * 100)}%` }} />
                        <span className="text-xs text-slate-400 mt-1">{chartData.labels[index]}</span>
                    </div>
                ))}
            </div>
            <div className="border-t border-slate-700 my-4"></div>

            <button onClick={() => setIsModalOpen(true)} className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                Registrar un Antojo
            </button>

            {isModalOpen && <LogCravingModal onClose={() => setIsModalOpen(false)} onLogCraving={handleLogSuccess} />}
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import { IDopamineHit } from '../types';
import { DOPAMINE_ACTIVITIES } from '../constants';
import ttsService from '../services/ttsService';

const BrainCircuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v.01M12 15v.01" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface DopamineDietCardProps {
    hits: IDopamineHit[];
    onLogHit: (hit: IDopamineHit) => void;
}

const ProgressBar: React.FC<{ label: string; value: number; maxValue: number; }> = ({ label, value, maxValue }) => (
    <div className="w-full">
        <div className="flex justify-between mb-1 text-xs">
            <span className="font-medium text-slate-300">{label}</span>
            <span className="font-medium text-slate-400">{value}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${(value / maxValue) * 100}%` }}></div>
        </div>
    </div>
);

export const DopamineDietCard: React.FC<DopamineDietCardProps> = ({ hits, onLogHit }) => {
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLog = (activity: string) => {
        const newHit: IDopamineHit = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            activity,
        };
        onLogHit(newHit);
        setIsRegistering(false);
    };

    const weeklyChartData = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const hitsThisWeek = hits.filter(h => new Date(h.date) >= oneWeekAgo);

        if (hitsThisWeek.length === 0) return null;

        const activityCounts = hitsThisWeek.reduce((acc, hit) => {
            acc[hit.activity] = (acc[hit.activity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topActivities = Object.entries(activityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        const maxValue = topActivities.length > 0 ? topActivities[0][1] : 1;

        return { topActivities, maxValue };
    }, [hits]);

    const handlePlayExplanation = () => {
        ttsService.speak("Esta herramienta te ayuda a re-calibrar el sistema de recompensa de tu cerebro. El objetivo es entrenarte para reconocer y valorar las recompensas naturales, como hacer ejercicio o completar una tarea. Al registrar estas pequeñas victorias, debilitas la dependencia de los 'picos' artificiales del vicio y fortaleces las autopistas neuronales del bienestar sostenible.");
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 mb-3">
                    <BrainCircuitIcon />
                    <h2 className="text-xl font-bold text-slate-100">Re-calibrador de Dopamina</h2>
                </div>
                <button onClick={handlePlayExplanation} className="text-slate-400 hover:text-teal-400" aria-label="Explicación de la herramienta">
                    <InfoIcon />
                </button>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Entrena tu cerebro para encontrar recompensa en lo saludable. Registra una pequeña victoria o un placer natural.</p>
            
            {!isRegistering ? (
                <button 
                    onClick={() => setIsRegistering(true)}
                    className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg hover:bg-teal-600/30"
                >
                    Registrar Fuente de Bienestar
                </button>
            ) : (
                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-sm font-semibold mb-2 text-center text-slate-200">¿Qué actividad completaste?</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {DOPAMINE_ACTIVITIES.map(activity => (
                            <button 
                                key={activity}
                                onClick={() => handleLog(activity)}
                                className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors bg-slate-700 text-slate-300 border border-slate-600 hover:bg-teal-600 hover:text-white"
                            >
                            {activity}
                            </button>
                        ))}
                    </div>
                     <button onClick={() => setIsRegistering(false)} className="w-full text-xs text-slate-400 mt-3 text-center hover:underline">Cancelar</button>
                </div>
            )}
            
            {weeklyChartData && (
                <div className="mt-4 border-t border-slate-700 pt-3">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Resumen de Bienestar (Últimos 7 días)</h3>
                     <div className="space-y-2">
                        {weeklyChartData.topActivities.map(([label, value]) => (
                            <ProgressBar key={label} label={label} value={value} maxValue={weeklyChartData.maxValue} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

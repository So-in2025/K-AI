
import React, { useState } from 'react';
import { IDopamineHit } from '../types';
import { DOPAMINE_ACTIVITIES } from '../constants';

const BrainCircuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v.01M12 15v.01" />
    </svg>
);

interface DopamineDietCardProps {
    hits: IDopamineHit[];
    onLogHit: (hit: IDopamineHit) => void;
}

export const DopamineDietCard: React.FC<DopamineDietCardProps> = ({ hits, onLogHit }) => {
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

    const handleLog = (activity: string) => {
        const newHit: IDopamineHit = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            activity,
        };
        onLogHit(newHit);
        setSelectedActivity(null); // Reset after logging
    };
    
    const recentHits = hits.slice(0, 3);

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
                <BrainCircuitIcon />
                <h2 className="text-xl font-bold text-slate-100">Re-calibrador de Dopamina</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Entrena tu cerebro para encontrar recompensa en lo saludable. Registra una pequeña victoria o placer natural.</p>
            
            <div className="flex flex-wrap gap-2">
                 {DOPAMINE_ACTIVITIES.map(activity => (
                    <button 
                        key={activity}
                        onClick={() => handleLog(activity)}
                        className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors bg-slate-700 text-slate-300 border border-slate-600 hover:bg-teal-600 hover:text-white"
                    >
                       {activity}
                    </button>
                ))}
            </div>

            {recentHits.length > 0 && (
                <div className="mt-4 border-t border-slate-700 pt-3">
                    <h3 className="text-sm font-semibold text-slate-300">Actividad Reciente:</h3>
                     <ul className="list-disc list-inside text-sm text-slate-400 mt-2">
                        {recentHits.map(hit => (
                            <li key={hit.id}>
                                {hit.activity} - <span className="text-xs">{new Date(hit.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

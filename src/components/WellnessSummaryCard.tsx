

import React, { useMemo } from 'react';
import { IDopamineHit, IWellnessActivity } from '../types';
import { TtsInfoButton } from './TtsInfoButton';

const BrainCircuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v.01M12 15v.01" />
    </svg>
);

interface WellnessSummaryCardProps {
    dopamineHits: IDopamineHit[];
    wellnessLog: IWellnessActivity[];
}

const ProgressBar: React.FC<{ label: string; value: number; maxValue: number; colorClass: string }> = ({ label, value, maxValue, colorClass }) => (
    <div className="w-full">
        <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-slate-200">{label}</span>
            <span className="text-xs font-medium text-slate-400">{value}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${(value / maxValue) * 100}%` }}></div>
        </div>
    </div>
);

export const WellnessSummaryCard: React.FC<WellnessSummaryCardProps> = ({ dopamineHits, wellnessLog }) => {
    
    const analysis = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const allActivitiesThisWeek = [
            ...dopamineHits.map(h => ({ ...h, type: h.category })),
            ...wellnessLog.map(l => ({...l, type: l.category || 'General' }))
        ].filter(a => new Date(a.date) >= oneWeekAgo);


        if (allActivitiesThisWeek.length === 0) return null;

        const categoryCounts = allActivitiesThisWeek.reduce((acc, activity) => {
            const category = activity.type;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topCategories = Object.entries(categoryCounts)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 5);
        
        const maxCategoryValue = topCategories.length > 0 ? topCategories[0][1] : 1;

        return { topCategories, maxCategoryValue, total: allActivitiesThisWeek.length };
    }, [dopamineHits, wellnessLog]);
    
    const categoryColors: Record<string, string> = {
        'Breathing': 'bg-teal-500',
        'Meditation': 'bg-indigo-500',
        'Movement': 'bg-lime-500',
        'Shamanic Journey': 'bg-purple-500',
        'Gratitud': 'bg-yellow-500',
        'Logro': 'bg-orange-500',
        'Mindfulness': 'bg-sky-500',
        'Naturaleza': 'bg-green-500',
        'Reflexión': 'bg-pink-500',
        'Cuerpo': 'bg-red-500'
    };
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Este es tu Resumen de Bienestar. Analiza todas las prácticas que has completado en la última semana y te las muestra en un gráfico. Usa esta información para ver qué tipo de actividades (calma, cuerpo, rituales) te están nutriendo más y para que Kai pueda darte un apoyo más inteligente." />
            <div className="flex items-center space-x-3 mb-3">
                <BrainCircuitIcon />
                <h2 className="text-xl font-bold text-slate-100">Resumen de Bienestar</h2>
            </div>
            {!analysis ? (
                 <p className="text-slate-400 text-sm text-center italic mt-4">
                   Completa prácticas en el Santuario de Bienestar para ver aquí tus patrones de autocuidado.
                </p>
            ) : (
                 <>
                    <p className="text-slate-400 mb-4 text-sm">Tus principales prácticas de bienestar de la última semana. ¡Sigue así!</p>
                    <div className="space-y-3">
                        {analysis.topCategories.map(([label, value]) => (
                            <ProgressBar 
                                key={label} 
                                label={label} 
                                value={value} 
                                maxValue={analysis.maxCategoryValue} 
                                colorClass={categoryColors[label] || 'bg-gray-500'}
                            />
                        ))}
                    </div>
                 </>
            )}
        </div>
    );
};

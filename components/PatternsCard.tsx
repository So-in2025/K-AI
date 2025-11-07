import React, { useMemo } from 'react';
import { ICraving } from '../types';
import { TtsInfoButton } from './TtsInfoButton';

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);


interface PatternsCardProps {
    cravings: ICraving[];
    journalEntry: string;
    isSubscribed: boolean;
}

const ProgressBar: React.FC<{ label: string; value: number; maxValue: number; }> = ({ label, value, maxValue }) => (
    <div className="w-full">
        <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-slate-200">{label}</span>
            <span className="text-xs font-medium text-slate-400">{value}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${(value / maxValue) * 100}%` }}></div>
        </div>
    </div>
);


export const PatternsCard: React.FC<PatternsCardProps> = ({ cravings, journalEntry, isSubscribed }) => {
    
    const analysis = useMemo(() => {
        if (cravings.length < 3) return null;

        const triggerCounts = cravings.flatMap(c => c.triggers).reduce((acc, trigger) => {
            acc[trigger] = (acc[trigger] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topTriggers = Object.entries(triggerCounts)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 3);
        
        const strategyCounts = cravings.reduce((acc, c) => {
            acc[c.copingStrategy] = (acc[c.copingStrategy] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topStrategies = Object.entries(strategyCounts)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 3);
        
        const maxTriggerValue = topTriggers.length > 0 ? topTriggers[0][1] : 1;
        const maxStrategyValue = topStrategies.length > 0 ? topStrategies[0][1] : 1;

        return { topTriggers, topStrategies, maxTriggerValue, maxStrategyValue };
    }, [cravings]);
    
    const journalInsight = useMemo(() => {
        if (!analysis || analysis.topTriggers.length === 0 || !journalEntry) return null;
        const topTrigger = analysis.topTriggers[0][0].toLowerCase();
        if (journalEntry.toLowerCase().includes(topTrigger)) {
            return `He notado que tu diario menciona "${analysis.topTriggers[0][0]}", que también es tu detonante más común. Reconocer esta conexión es un gran paso.`;
        }
        return null;
    }, [analysis, journalEntry]);

    const CardContent = () => {
        if (!isSubscribed) {
            return (
                 <div className="absolute inset-0 bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                    <LockIcon />
                    <h3 className="text-lg font-semibold text-white mt-2">Análisis Automático de Patrones</h3>
                    <p className="text-slate-300 text-sm">Descubre tus detonantes y estrategias más efectivas. Disponible en KIA Plus.</p>
                </div>
            )
        }
        
        if (cravings.length < 3) {
            return (
                <p className="text-slate-400 text-sm text-center italic mt-4">
                   Registra al menos 3 antojos para que Kai pueda empezar a mostrarte tus patrones y ayudarte a entenderlos.
                </p>
            );
        }

        if (!analysis) return null;

        return (
            <>
                <p className="text-slate-400 mb-4 text-sm">Kai analiza tus registros para ayudarte a entender qué te impulsa y qué te fortalece.</p>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-md font-semibold text-slate-200 mb-2">Tus Detonantes Más Comunes</h3>
                        <div className="space-y-2">
                            {analysis.topTriggers.map(([label, value]) => (
                                <ProgressBar key={label} label={label} value={value} maxValue={analysis.maxTriggerValue} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-md font-semibold text-slate-200 mb-2">Tus Estrategias Más Efectivas</h3>
                         <div className="space-y-2">
                            {analysis.topStrategies.map(([label, value]) => (
                                 <ProgressBar key={label} label={label} value={value} maxValue={analysis.maxStrategyValue} />
                            ))}
                        </div>
                    </div>
                    {journalInsight && (
                        <div className="mt-4 bg-teal-900/50 border-l-4 border-teal-500 p-3 rounded-r-lg">
                            <p className="text-sm font-medium text-teal-300">{journalInsight}</p>
                        </div>
                    )}
                </div>
            </>
        );
    }


    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative min-h-[200px]">
             <TtsInfoButton explanation="El conocimiento es poder. Esta tarjeta es tu espejo. Analiza los datos de tus antojos registrados para mostrarte, de forma clara y visual, cuáles son tus detonantes más frecuentes y qué estrategias de afrontamiento te están funcionando mejor. Usa esta información para ser más proactivo." />
            <div>
                <div className="flex items-center space-x-3 mb-3">
                    <ChartIcon />
                    <h2 className="text-xl font-bold text-slate-100">Mis Patrones</h2>
                </div>
                <CardContent />
            </div>
        </div>
    );
};

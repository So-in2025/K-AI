import React, { useMemo } from 'react';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const ChartIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> );
const LockIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> );

const ProgressBar: React.FC<{ label: string; value: number; maxValue: number; }> = ({ label, value, maxValue }) => (
    <div>
        <div className="flex justify-between mb-1"><span className="text-xs">{label}</span><span className="text-xs">{value}</span></div>
        <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${(value / maxValue) * 100}%` }}></div></div>
    </div>
);

export const PatternsCard: React.FC = () => {
    const { userData } = useUser();
    const cravings = userData?.cravings || [];
    const journalEntry = userData?.journalEntry || '';
    const isSubscribed = userData?.isSubscribed || false;

    const analysis = useMemo(() => {
        if (cravings.length < 3) return null;
        const triggerCounts = cravings.flatMap(c => c.triggers).reduce((acc, t) => ({...acc, [t]: (acc[t] || 0) + 1 }), {} as Record<string, number>);
        const topTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        return { topTriggers, maxTriggerValue: topTriggers[0]?.[1] || 1 };
    }, [cravings]);
    
    const CardContent = () => {
        if (!isSubscribed) {
            return <div className="absolute inset-0 bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center p-4"><LockIcon /><h3 className="text-lg font-semibold mt-2">Análisis de Patrones</h3><p className="text-sm">Disponible en KIA Plus.</p></div>
        }
        if (cravings.length < 3 || !analysis) return <p className="text-slate-400 text-sm text-center italic mt-4">Registra al menos 3 antojos para ver tus patrones.</p>;
        return (
            <div className="space-y-4">
                <p className="text-slate-400 mb-4 text-sm">Kai analiza tus registros para ayudarte a entender qué te impulsa.</p>
                <div>
                    <h3 className="text-md font-semibold mb-2">Tus Detonantes Más Comunes</h3>
                    <div className="space-y-2">
                        {analysis.topTriggers.map(([label, value]) => <ProgressBar key={label} label={label} value={value} maxValue={analysis.maxTriggerValue} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative min-h-[200px]">
             <TtsInfoButton explanation="Esta tarjeta analiza los datos de tus antojos para mostrarte de forma clara cuáles son tus detonantes más frecuentes y qué estrategias te funcionan mejor." />
            <div className="flex items-center space-x-3 mb-3"><ChartIcon /><h2 className="text-xl font-bold text-slate-100">Mis Patrones</h2></div>
            <CardContent />
        </div>
    );
};

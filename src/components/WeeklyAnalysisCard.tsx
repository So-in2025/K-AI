import React, { useState, useMemo } from 'react';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const BrainIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06M3 10h.01M3 14h.01M12 3v.01M12 21v.01M7 4.99L7.01 5M7 19l-.01.01" /></svg> );

interface AnalysisData { celebration: string; pattern: string; connection: string; suggestion: string; }

export const WeeklyAnalysisCard: React.FC = () => {
    const { userData, daysSober, geminiService, checkAndConsumeUsage } = useUser();
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!userData || !geminiService) return null;

    const { cravings, journalEntry, wellnessLog, dopamineHits, userFocus, isSubscribed } = {
        cravings: userData.cravings || [],
        journalEntry: userData.journalEntry || '',
        wellnessLog: userData.wellnessLog || [],
        dopamineHits: userData.dopamineHits || [],
        userFocus: userData.onboardingData?.focuses || [],
        isSubscribed: userData.isSubscribed || false,
    };

    const canGenerateWithData = useMemo(() => { /* ... memo logic ... */ }, [cravings, daysSober, journalEntry, userFocus]);

    const handleGenerateAnalysis = async () => {
        if (!checkAndConsumeUsage('weekly_analysis')) return;
        setIsLoading(true);
        // ... prompt generation and API call logic ...
        try {
            const response = await geminiService.generateContent("...", undefined, true);
            setAnalysis(JSON.parse(response));
        } catch(e) { setError("Error al generar análisis"); }
        finally { setIsLoading(false); }
    };
    
    const remainingUses = isSubscribed ? -1 : (1 - (userData.usageTracker?.weekly_analysis?.count ?? 0));
    const canClickGenerate = canGenerateWithData && (isSubscribed || remainingUses > 0);

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Cada semana, Kai analiza todos tus datos: antojos, diario, actividades, etc., para darte un resumen inteligente, identificando fortalezas, patrones y sugerencias." />
            <div className="flex items-center space-x-3 mb-3"><BrainIcon /><h2 className="text-xl font-bold text-slate-100">Análisis Semanal con Kai</h2></div>
            <p className="text-slate-400 mb-4 text-sm">Obtén una perspectiva más profunda de tu progreso y patrones de la última semana.</p>
            {/* ... rendering logic based on state ... */}
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { ICraving, IWellnessActivity, UserFocus, IDopamineHit, UsageTracker, FeatureID } from '../types';
import { TtsInfoButton } from './TtsInfoButton';

// --- Icons for Analysis Sections ---
const CelebrationIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14l2-2 2 2m-4 5l2 2 2-2m-3 9l2 2 2-2" /></svg>);
const PatternIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const ConnectionIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>);
const SuggestionIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>);


const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06M3 10h.01M3 14h.01M12 3v.01M12 21v.01M7 4.99L7.01 5M7 19l-.01.01" />
    </svg>
);

interface WeeklyAnalysisCardProps {
    apiKey: string | null;
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    daysSober: number;
    userFocus: UserFocus[];
    isSubscribed: boolean;
    dopamineHits: IDopamineHit[];
    usageTracker: UsageTracker | null;
    checkAndConsumeUsage: (featureId: 'weekly_analysis') => boolean;
}

interface AnalysisData {
    celebration: string;
    pattern: string;
    connection: string;
    suggestion: string;
}

export const WeeklyAnalysisCard: React.FC<WeeklyAnalysisCardProps> = ({ apiKey, cravings, journalEntry, wellnessLog, daysSober, userFocus, isSubscribed, dopamineHits, usageTracker, checkAndConsumeUsage }) => {
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const canGenerateWithData = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentCravings = cravings.filter(c => new Date(c.date) >= oneWeekAgo);
        const hasAddictionData = userFocus.includes('addiction') && recentCravings.length > 0;
        return daysSober >= 7 && (hasAddictionData || journalEntry.length > 10);
    }, [cravings, daysSober, journalEntry, userFocus]);

    const handleGenerateAnalysis = async () => {
        if (!isSubscribed) {
            if (!checkAndConsumeUsage('weekly_analysis')) {
                return; // The button should be disabled, but this is a safeguard.
            }
        }
        setIsLoading(true);
        setAnalysis(null);
        setError('');

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const cravingsThisWeek = cravings.filter(c => new Date(c.date) >= oneWeekAgo);
        const wellnessThisWeek = wellnessLog.filter(w => new Date(w.date) >= oneWeekAgo);
        const dopamineThisWeek = dopamineHits.filter(h => new Date(h.date) >= oneWeekAgo);

        const cravingsSummary = cravingsThisWeek.map(c => `Día: ${new Date(c.date).toLocaleDateString()}, Intensidad: ${c.intensity}, Detonantes: ${c.triggers.join(', ')}`).join('; ');
        const wellnessSummary = wellnessThisWeek.length > 0 ? `${wellnessThisWeek.length} actividades, incluyendo ${wellnessThisWeek.map(w => w.exerciseName).join(', ')}` : "Ninguna actividad registrada.";
        const dopamineSummary = dopamineThisWeek.length > 0 ? `Registró ${dopamineThisWeek.length} fuentes de dopamina saludable.` : "No registró fuentes de dopamina saludable.";
        const focusText = userFocus.map(f => f === 'addiction' ? 'recuperación de adicción' : f === 'depression' ? 'gestión de depresión/ansiedad' : 'proceso de duelo').join(' y ');
        const dayLabel = userFocus.includes('addiction') ? 'sobrio' : 'de progreso';

        const prompt = `
            Eres Kai, un coach de bienestar. Analiza los datos de la última semana de un usuario en un camino de ${focusText}.
            DATOS:
            - Días ${dayLabel}: ${daysSober}
            - Antojos: ${cravingsSummary || "Ninguno"}
            - Bienestar: ${wellnessSummary}
            - Dopamina saludable: ${dopamineSummary}
            - Diario: "${journalEntry.substring(0, 250)}..."

            Genera un objeto JSON con 4 claves: 'celebration', 'pattern', 'connection', 'suggestion'.
            - celebration: Reconoce un logro/fortaleza de la semana.
            - pattern: Identifica el patrón más significativo.
            - connection: Conecta el diario (ej: comida, cansancio) con patrones de antojos/ánimo. Si no hay conexión, pon "No se encontró una conexión clara esta semana, lo cual también es un dato valioso.".
            - suggestion: Ofrece UNA sugerencia clara y accionable para la próxima semana.
            Sé conciso, empático y directo. Responde solo con el objeto JSON.
        `;

        try {
            const response = await getGeminiResponse(apiKey, prompt);
            const cleanedResponse = response.replace(/```json\n|```/g, '').trim();
            const parsedAnalysis: AnalysisData = JSON.parse(cleanedResponse);
            setAnalysis(parsedAnalysis);
        } catch (err) {
            setError('No se pudo generar el análisis. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const remainingUses = isSubscribed ? -1 : (1 - (usageTracker?.weekly_analysis?.count ?? 0));
    const canClickGenerate = canGenerateWithData && (isSubscribed || remainingUses > 0);

    const getButtonText = () => {
        if (!canGenerateWithData) return 'Se necesitan más datos (mín. 7 días)';
        if (isSubscribed) return 'Generar mi análisis semanal';
        return remainingUses > 0 ? `Generar análisis (te queda ${remainingUses} gratis)` : 'Análisis gratuito ya usado este mes';
    };


    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Esta es una de las herramientas más potentes de KIA Plus. Cada semana, Kai analiza todos tus datos: antojos, diario, actividades de bienestar y más, para darte un resumen inteligente. Identificará tu fortaleza principal, el patrón más relevante de la semana y te dará una sugerencia clara y personalizada para seguir avanzando." />
            <div className="flex items-center space-x-3 mb-3">
                <BrainIcon />
                <h2 className="text-xl font-bold text-slate-100">Análisis Semanal con Kai</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Obtén una perspectiva más profunda de tu progreso y patrones de la última semana.</p>
            
            {!analysis && !isLoading && (
                 <button
                    onClick={handleGenerateAnalysis}
                    disabled={!canClickGenerate}
                    className="w-full bg-teal-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {getButtonText()}
                </button>
            )}

            {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
            
            {isLoading && (
                 <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                    <p className="ml-4 text-slate-400">Kai está analizando tu progreso...</p>
                 </div>
            )}

            {analysis && !isLoading && (
                <div className="mt-4 bg-slate-700/50 p-4 rounded-lg space-y-4 text-slate-300">
                    <div>
                        <h4 className="font-semibold text-yellow-300 text-sm flex items-center"><CelebrationIcon />Celebración y Fortaleza</h4>
                        <p className="text-slate-300 text-sm pl-7">{analysis.celebration}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-teal-300 text-sm flex items-center"><PatternIcon />El Patrón Principal</h4>
                        <p className="text-slate-300 text-sm pl-7">{analysis.pattern}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-indigo-300 text-sm flex items-center"><ConnectionIcon />Conexión Holística</h4>
                        <p className="text-slate-300 text-sm pl-7">{analysis.connection}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-lime-300 text-sm flex items-center"><SuggestionIcon />Sugerencia para la Semana</h4>
                        <p className="text-slate-300 text-sm pl-7">{analysis.suggestion}</p>
                    </div>
                     <button
                        onClick={handleGenerateAnalysis}
                        disabled={!canClickGenerate}
                        className="text-sm text-teal-400 font-semibold hover:underline mt-4 disabled:text-slate-500 disabled:no-underline"
                    >
                        {canClickGenerate ? "Generar de nuevo" : getButtonText()}
                    </button>
                </div>
            )}
        </div>
    );
};
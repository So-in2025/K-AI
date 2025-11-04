import React, { useState, useMemo } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { ICraving, IWellnessActivity } from '../types';

// Using a simple markdown parser to convert **bold** and lists
const parseMarkdown = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\s*-\s*(.*)/g, '\n<li class="list-disc ml-4 mb-1">$1</li>');

    // Wrap list items in <ul>
    if (html.includes('<li>')) {
        html = html.replace(/<li/g, '<ul class="list-inside"><li').replace(/<\/li>(?!\s*<li)/, '</li></ul>');
    }
    return html.replace(/\n/g, '<br />');
};


const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06M3 10h.01M3 14h.01M12 3v.01M12 21v.01M7 4.99L7.01 5M7 19l-.01.01" />
    </svg>
);

interface WeeklyAnalysisCardProps {
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    daysSober: number;
}

export const WeeklyAnalysisCard: React.FC<WeeklyAnalysisCardProps> = ({ cravings, journalEntry, wellnessLog, daysSober }) => {
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const canGenerate = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentCravings = cravings.filter(c => new Date(c.date) >= oneWeekAgo);
        return daysSober >= 7 && recentCravings.length >= 1;
    }, [cravings, daysSober]);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');
        setError('');

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const cravingsThisWeek = cravings.filter(c => new Date(c.date) >= oneWeekAgo);
        const wellnessThisWeek = wellnessLog.filter(w => new Date(w.date) >= oneWeekAgo);

        const cravingsSummary = cravingsThisWeek.map(c => 
            `Día: ${new Date(c.date).toLocaleDateString()}, Intensidad: ${c.intensity}, Detonantes: ${c.triggers.join(', ')}`
        ).join('; ');

        const wellnessSummary = wellnessThisWeek.length > 0
            ? `${wellnessThisWeek.length} actividades, incluyendo ${wellnessThisWeek.map(w => w.exerciseName).join(', ')}`
            : "Ninguna actividad registrada.";

        const prompt = `
            Eres Kai, un coach de recuperación compasivo y analítico. Tu tarea es analizar los datos de la última semana de un usuario en recuperación y ofrecerle un resumen conciso y empoderador en español.

            DATOS DE LA ÚLTIMA SEMANA:
            - Días totales sobrio del usuario: ${daysSober}
            - Antojos registrados esta semana: ${cravingsThisWeek.length}
            - Detalles de antojos: ${cravingsSummary || "Ninguno"}
            - Ejercicios de bienestar completados: ${wellnessSummary}
            - Extracto del diario reciente: "${journalEntry.substring(0, 250)}..."

            TU RESPUESTA DEBE SEGUIR ESTA ESTRUCTURA (usa markdown con **negritas** y listas con -):

            1. **Celebración y Fortaleza**: Empieza reconociendo un logro o una fortaleza de la semana. Por ejemplo, "Felicidades por alcanzar ${daysSober} días..." o "He notado tu constancia con los ejercicios de bienestar...".
            2. **El Patrón Principal**: Identifica el patrón más significativo de la semana. Sé específico. Por ejemplo, "El patrón principal que observo esta semana es que el **estrés** parece ser un detonante clave, especialmente en las tardes."
            3. **Conexión Profunda**: Conecta dos áreas diferentes de datos si es posible. Por ejemplo, "Es interesante ver que en tu diario mencionas sentirte 'agotado' en los mismos días que registraste antojos intensos. Esto sugiere que el cansancio reduce tus defensas." Si no hay conexión clara, omite este punto.
            4. **Sugerencia para la Próxima Semana**: Ofrece UNA sugerencia clara y accionable. Por ejemplo, "Para la próxima semana, te sugiero enfocarte en una pequeña pausa de 5 minutos con una 'Respiración Cuadrada' para anticiparte a ese momento de estrés."

            Sé conciso, empático y directo. Tu objetivo es proporcionar claridad y una dirección, no abrumar. No uses un saludo inicial como "Hola". Empieza directamente con el análisis. Si no hay suficientes datos para un análisis profundo, informa al usuario amablemente que más datos ayudarán a generar mejores insights.
        `;

        try {
            const response = await getGeminiResponse(prompt);
            setAnalysis(response);
        } catch (err) {
            setError('No se pudo generar el análisis. Inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
                <BrainIcon />
                <h2 className="text-xl font-bold text-slate-100">Análisis Semanal con Kai</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Obtén una perspectiva más profunda de tu progreso y patrones de la última semana.</p>
            
            {!analysis && !isLoading && (
                 <button
                    onClick={handleGenerateAnalysis}
                    disabled={!canGenerate}
                    className="w-full bg-teal-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {canGenerate ? 'Generar mi análisis semanal' : 'Se necesitan más datos (mín. 7 días)'}
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
                <div className="mt-4 bg-slate-700/50 p-4 rounded-lg space-y-2 text-slate-300">
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis) }}></div>
                     <button
                        onClick={handleGenerateAnalysis}
                        className="text-sm text-teal-400 font-semibold hover:underline mt-4"
                    >
                        Generar de nuevo
                    </button>
                </div>
            )}
        </div>
    );
};
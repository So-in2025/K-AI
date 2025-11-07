
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { TtsInfoButton } from './TtsInfoButton';
import { ICraving } from '../types';

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const PatternsCard: React.FC = () => {
    const { userData, geminiService } = useUser();
    const [mainTrigger, setMainTrigger] = useState<string | null>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const analyzePatterns = async () => {
            if (!userData?.cravings || userData.cravings.length < 3) {
                return;
            }

            setIsLoading(true);

            const triggerCounts = userData.cravings.reduce((acc, craving) => {
                craving.triggers.forEach(trigger => {
                    acc[trigger] = (acc[trigger] || 0) + 1;
                });
                return acc;
            }, {} as Record<string, number>);

            const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]);
            
            if (sortedTriggers.length > 0) {
                const trigger = sortedTriggers[0][0];
                setMainTrigger(trigger);

                if (geminiService) {
                    const prompt = `Mi principal detonante de 'cravings' (deseos intensos) es "${trigger}". Basado en esto, dame una reflexión corta y poderosa (2-3 frases) que me ayude a entender por qué este detonante es común y una micro-sugerencia para afrontarlo de forma proactiva.`;
                    const systemInstruction = "Eres Kai, un compañero de IA empático y sabio. Tu tono es comprensivo y motivador.";
                    try {
                        const geminiInsight = await geminiService.generateContent(prompt, systemInstruction);
                        setInsight(geminiInsight);
                    } catch (error) {
                        console.error("Error generating insight:", error);
                        setInsight("No pude generar una reflexión en este momento, pero reconocer tu detonante ya es un gran paso.");
                    }
                }
            }
            setIsLoading(false);
        };

        analyzePatterns();
    }, [userData?.cravings, geminiService]);

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-slate-400 text-sm">Kai está analizando tus patrones...</p>;
        }

        if (!mainTrigger) {
            return <p className="text-slate-400 text-sm">Registra al menos 3 deseos en tus herramientas para que Kai pueda empezar a identificar patrones para ti.</p>;
        }

        return (
            <div>
                <p className="text-sm text-slate-300 mb-2">Tu principal detonante parece ser:</p>
                <p className="text-lg font-bold text-white text-center bg-slate-700/50 py-2 px-4 rounded-lg mb-4">{mainTrigger}</p>
                
                {insight && (
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                        <p className="text-xs text-teal-300 font-bold">Reflexión de Kai:</p>
                        <p className="text-sm text-slate-200 italic">"{insight}"</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative h-full">
            <TtsInfoButton explanation="Esta tarjeta es donde la magia de la introspección sucede. Kai analiza tus registros de deseos, estado de ánimo y pensamientos para encontrar patrones ocultos y te ofrece reflexiones para ayudarte a entenderte mejor." />
            <div className="flex items-center space-x-3 mb-3">
                <SearchIcon />
                <h2 className="text-xl font-bold text-slate-100">Descubriendo Patrones</h2>
            </div>
            {renderContent()}
        </div>
    );
};

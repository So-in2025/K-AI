
import React, { useState } from 'react';
import { useUser } from '/src/contexts/UserContext.tsx';
import { MusicPreferencesModal } from '/src/components/MusicPreferencesModal.tsx';
import { IMusicPreferences, ISongRecommendation } from '/src/types.ts';
import { TtsInfoButton } from '/src/components/TtsInfoButton.tsx';

const MusicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
    </svg>
);

export const SoundtrackCard: React.FC = () => {
    const { geminiService, userData, updateUserData, checkAndConsumeUsage } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<ISongRecommendation[]>([]);

    const handleGenerate = async (preferences: IMusicPreferences) => {
        if (!geminiService || !checkAndConsumeUsage('soundtrack', 1)) return;
        
        setIsLoading(true);
        setRecommendations([]);
        updateUserData({ musicPreferences: preferences });

        const prompt = `Basado en los siguientes gustos musicales, recomienda 3 canciones (con título y artista) que encajen con un estado de ánimo de introspección y sanación. Para cada canción, explica brevemente (1 frase) por qué la recomiendas.
        Géneros: ${preferences.genres.join(', ')}.
        Artistas similares: ${preferences.artists}.
        
        Formatea tu respuesta como un JSON array con objetos que tengan las claves "title", "artist", y "reason".`;

        try {
            const response = await geminiService.generateContent(prompt, "You are a music expert with a deep understanding of emotional resonance.", true);
            const parsedResponse = JSON.parse(response);
            setRecommendations(parsedResponse);
        } catch (error) {
            console.error("Error generating soundtrack:", error);
            alert("Hubo un error al generar tu soundtrack. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="La música es una poderosa herramienta de sanación. Comparte tus gustos y Kai creará una pequeña banda sonora para tu momento, con canciones seleccionadas para la introspección y la calma." />
            <div className="flex items-center space-x-3 mb-3">
                <MusicIcon />
                <h2 className="text-xl font-bold text-slate-100">Soundtrack para Sanar</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Genera 3 canciones recomendadas por IA para tu momento de introspección.
            </p>
            
            {isLoading && <div className="text-center text-slate-300">Generando tu soundtrack...</div>}

            {recommendations.length > 0 && (
                <div className="space-y-3 mt-4">
                    {recommendations.map((song, index) => (
                        <div key={index} className="bg-slate-700/50 p-3 rounded-lg">
                            <p className="font-bold text-slate-100">{song.title}</p>
                            <p className="text-sm text-slate-300">{song.artist}</p>
                            <p className="text-xs text-slate-400 italic mt-1">"{song.reason}"</p>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
                {recommendations.length > 0 ? 'Generar de Nuevo' : 'Generar Soundtrack'}
            </button>

            {isModalOpen && (
                <MusicPreferencesModal
                    initialPreferences={userData?.musicPreferences}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleGenerate}
                />
            )}
        </div>
    );
};
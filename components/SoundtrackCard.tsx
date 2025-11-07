import React, { useState, useEffect } from 'react';
import { OnboardingData, IMusicPreferences, ISongRecommendation, UserFocus, UsageTracker, FeatureID } from '../types';
import { MUSIC_PREFERENCES_KEY } from '../constants';
import { getGeminiResponse } from '../services/geminiService';
import { MusicPreferencesModal } from './MusicPreferencesModal';
import { TtsInfoButton } from './TtsInfoButton';
import ttsService from '../services/ttsService';

const MusicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
    </svg>
);

interface SoundtrackCardProps {
    apiKey: string | null;
    onboardingData: OnboardingData;
    isSubscribed: boolean;
    usageTracker: UsageTracker | null;
    checkAndConsumeUsage: (featureId: FeatureID, limit?: number) => boolean;
}

export const SoundtrackCard: React.FC<SoundtrackCardProps> = ({ apiKey, onboardingData, isSubscribed, usageTracker, checkAndConsumeUsage }) => {
    const [preferences, setPreferences] = useState<IMusicPreferences | null>(null);
    const [recommendations, setRecommendations] = useState<ISongRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedSongIndex, setExpandedSongIndex] = useState<number | null>(null);

    useEffect(() => {
        try {
            const storedPrefs = localStorage.getItem(MUSIC_PREFERENCES_KEY);
            if (storedPrefs) {
                setPreferences(JSON.parse(storedPrefs));
            }
        } catch (e) { console.error("Failed to load music preferences", e); }
    }, []);

    const handleSavePreferences = (prefs: IMusicPreferences) => {
        setPreferences(prefs);
        localStorage.setItem(MUSIC_PREFERENCES_KEY, JSON.stringify(prefs));
        setIsModalOpen(false);
        handleGenerate(prefs); // Generate immediately after saving
    };

    const handleGenerate = async (currentPrefs: IMusicPreferences | null) => {
        if (!currentPrefs) {
            setIsModalOpen(true);
            return;
        }

        if (!isSubscribed) {
            if (!checkAndConsumeUsage('soundtrack', 3)) {
                return;
            }
        }
        
        setIsLoading(true);
        setRecommendations([]);

        const focusMap: Record<UserFocus, string> = {
            addiction: 'superar una adicción',
            depression: 'gestionar depresión/ansiedad',
            grief: 'sanar una pérdida',
        };
        const focusText = onboardingData.focuses.map(f => focusMap[f]).join(' y ');

        const prompt = `
            Actúa como un musicoterapeuta empático. Un usuario está lidiando con '${focusText}'.
            Sus géneros musicales preferidos son: ${currentPrefs.genres.join(', ')}.
            Sus artistas favoritos son: ${currentPrefs.artists}.

            Genera una lista de 10 canciones para apoyar su estado emocional. Para cada canción, proporciona el título, el artista y una razón terapéutica de una frase (ej: por su letra sobre resiliencia, su melodía calmante, su energía para motivar).

            Responde únicamente con un array de objetos JSON con el formato:
            [
                {"title": "...", "artist": "...", "reason": "..."},
                ...
            ]
        `;

        try {
            const response = await getGeminiResponse(apiKey, prompt);
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                const parsedRecs = JSON.parse(jsonMatch[0]);
                if(Array.isArray(parsedRecs)) {
                    setRecommendations(parsedRecs);
                }
            }
        } catch (e) {
            console.error("Failed to generate soundtrack", e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleSongExplanation = (index: number) => {
        setExpandedSongIndex(prev => prev === index ? null : index);
    }

    const remainingUses = isSubscribed ? -1 : (3 - (usageTracker?.soundtrack?.count ?? 0));
    const canGenerate = isSubscribed || remainingUses > 0;

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="La música es una herramienta terapéutica poderosa. En esta sección, Kai actúa como tu musicoterapeuta personal. Basándose en tus gustos y tu enfoque de sanación, creará una 'Banda Sonora para Sanar' con 10 canciones. Cada una viene con una explicación de por qué fue elegida para ti, ya sea por su letra, su energía o su capacidad para calmar." />
            <div className="flex items-center space-x-3 mb-3">
                <MusicIcon />
                <h2 className="text-xl font-bold text-slate-100">Banda Sonora para Sanar</h2>
            </div>

            {!preferences ? (
                 <>
                    <p className="text-slate-400 mb-4 text-sm">Configura tus gustos para que Kai pueda crear una banda sonora personalizada para tu camino.</p>
                    <button onClick={() => setIsModalOpen(true)} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg hover:bg-teal-600/30">
                        Configurar mis gustos
                    </button>
                </>
            ) : isLoading ? (
                <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                    <p className="ml-3 text-slate-400">Kai está creando tu banda sonora...</p>
                </div>
            ) : recommendations.length > 0 ? (
                 <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {recommendations.map((song, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-slate-100">{song.title}</p>
                                    <p className="text-xs text-slate-400">{song.artist}</p>
                                </div>
                                <button onClick={() => toggleSongExplanation(index)} className="text-slate-500 hover:text-teal-400 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                            </div>
                            {expandedSongIndex === index && (
                                <div className="mt-2 border-t border-slate-600 pt-2">
                                    <p className="text-xs text-teal-300 italic">{song.reason}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    <button disabled={!canGenerate} onClick={() => handleGenerate(preferences)} className="w-full text-center text-sm text-teal-400 hover:underline mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                        {canGenerate ? 'Generar nueva lista' : 'Usos gratuitos agotados'}
                    </button>
                    {!isSubscribed && <p className="text-xs text-center text-slate-500 mt-2">Te quedan {remainingUses} usos gratuitos este mes.</p>}
                 </div>
            ) : (
                <>
                    <p className="text-slate-400 mb-4 text-sm">Tu banda sonora está lista para ser creada.</p>
                     <button disabled={!canGenerate} onClick={() => handleGenerate(preferences)} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg hover:bg-teal-600/30 disabled:opacity-50 disabled:cursor-not-allowed">
                        {canGenerate ? 'Generar mi Banda Sonora' : 'Usos gratuitos agotados'}
                    </button>
                    {!isSubscribed && <p className="text-xs text-center text-slate-500 mt-2">Te quedan {remainingUses} usos gratuitos este mes.</p>}
                    <button onClick={() => setIsModalOpen(true)} className="w-full text-center text-xs text-slate-400 hover:underline mt-2">
                        Editar gustos musicales
                    </button>
                </>
            )}

            {isModalOpen && <MusicPreferencesModal onClose={() => setIsModalOpen(false)} onSave={handleSavePreferences} initialPreferences={preferences} />}
        </div>
    );
};
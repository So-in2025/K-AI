import React, { useState, useEffect } from 'react';
import { IMusicPreferences, ISongRecommendation } from '../types';
import { MusicPreferencesModal } from './MusicPreferencesModal';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const MusicIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" /></svg> );

export const SoundtrackCard: React.FC = () => {
    const { userData, geminiService, updateUserData, checkAndConsumeUsage } = useUser();
    const [recommendations, setRecommendations] = useState<ISongRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!userData || !geminiService) return null;
    const preferences = userData.musicPreferences;

    const handleSavePreferences = (prefs: IMusicPreferences) => {
        updateUserData({ musicPreferences: prefs });
        setIsModalOpen(false);
        handleGenerate(prefs);
    };

    const handleGenerate = async (currentPrefs: IMusicPreferences | null) => {
        if (!currentPrefs) { setIsModalOpen(true); return; }
        if (!checkAndConsumeUsage('soundtrack', 3)) return;
        
        setIsLoading(true);
        setRecommendations([]);
        const focusText = userData.onboardingData?.focuses.join(' y ') || 'bienestar general';
        const prompt = `Actúa como un musicoterapeuta. Un usuario está lidiando con '${focusText}'. Sus gustos: ${currentPrefs.genres.join(', ')} y artistas: ${currentPrefs.artists}. Genera 10 canciones (título, artista, razón terapéutica). Responde únicamente con un array JSON.`;

        try {
            const response = await geminiService.generateContent(prompt, undefined, true);
            setRecommendations(JSON.parse(response));
        } catch (e) { console.error("Failed to generate soundtrack", e); }
        finally { setIsLoading(false); }
    };
    
    const remainingUses = userData.isSubscribed ? -1 : (3 - (userData.usageTracker?.soundtrack?.count ?? 0));
    const canGenerate = userData.isSubscribed || remainingUses > 0;

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Kai actúa como tu musicoterapeuta. Basándose en tus gustos y tu enfoque de sanación, creará una 'Banda Sonora para Sanar' con 10 canciones, cada una con una explicación de por qué fue elegida para ti." />
            <div className="flex items-center space-x-3 mb-3"><MusicIcon /><h2 className="text-xl font-bold text-slate-100">Banda Sonora para Sanar</h2></div>

            {!preferences ? (
                <button onClick={() => setIsModalOpen(true)} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg">Configurar mis gustos</button>
            ) : isLoading ? (
                <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div></div>
            ) : recommendations.length > 0 ? (
                 <div className="space-y-2 max-h-96 overflow-y-auto">
                    {recommendations.map((song, index) => <div key={index} className="bg-slate-700/50 rounded-lg p-3">...</div>)}
                    <button disabled={!canGenerate} onClick={() => handleGenerate(preferences)} className="w-full text-center text-sm text-teal-400 hover:underline mt-4 disabled:opacity-50">Generar nueva lista</button>
                 </div>
            ) : (
                <>
                    <button disabled={!canGenerate} onClick={() => handleGenerate(preferences)} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg disabled:opacity-50">{canGenerate ? 'Generar mi Banda Sonora' : 'Usos gratuitos agotados'}</button>
                    {!userData.isSubscribed && <p className="text-xs text-center text-slate-500 mt-2">Te quedan {remainingUses} usos gratuitos este mes.</p>}
                </>
            )}
            {isModalOpen && <MusicPreferencesModal onClose={() => setIsModalOpen(false)} onSave={handleSavePreferences} initialPreferences={preferences} />}
        </div>
    );
};

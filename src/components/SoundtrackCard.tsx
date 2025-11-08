import React, { useState } from 'react';
import { IMusicPreferences, ISongRecommendation } from '../types';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';
import { Type } from '@google/genai';
import { MUSIC_GENRES } from '../constants';

const MusicIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" /></svg> );
const YouTubeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg> );
const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => ( <div className="w-full bg-slate-700 rounded-full h-1.5 mb-4"><div className="bg-teal-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(current / total) * 100}%` }}/></div> );
const OptionButton: React.FC<{ label: string; isSelected: boolean; onClick: () => void; }> = ({ label, isSelected, onClick }) => ( <button onClick={onClick} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors border ${ isSelected ? 'bg-teal-500 text-white border-teal-500' : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600' }`}>{label}</button> );

const MOODS = ['Calmar Ansiedad', 'Encontrar Motivación', 'Procesar Tristeza', 'Celebrar Alegría'];
const ENERGIES = ['Muy Relajante', 'Calmada', 'Moderada', 'Energética'];

export const SoundtrackCard: React.FC = () => {
    const { userData, geminiService, updateUserData, checkAndConsumeUsage } = useUser();
    const [step, setStep] = useState<'idle' | 1 | 2 | 3 | 4 | 'results'>('idle');
    const [preferences, setPreferences] = useState<Partial<IMusicPreferences>>({});
    const [recommendations, setRecommendations] = useState<ISongRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    if (!userData || !geminiService) return null;

    const resetFlow = (startFrom: 'idle' | 1 = 'idle') => { setStep(startFrom); setPreferences({}); setRecommendations([]); setError(''); setIsLoading(false); };
    const handleNextStep = (data: Partial<IMusicPreferences>) => { setPreferences(prev => ({ ...prev, ...data })); setStep(prev => typeof prev === 'number' ? (prev + 1) as (2|3|4) : 1); };
    const handleBack = () => setStep(prev => typeof prev === 'number' && prev > 1 ? (prev - 1) as (1|2|3) : 'idle');

    const handleGenerate = async () => {
        if (!checkAndConsumeUsage('soundtrack', 3)) return;
        setIsLoading(true); setError('');
        
        const { mood, energy, instrumental, genres, artists } = preferences;
        const prompt = `Actúa como un musicoterapeuta empático. Basado en las siguientes preferencias, crea una 'Banda Sonora para Sanar' con 10 canciones. Para cada canción, proporciona título, artista y una breve razón terapéutica de por qué es adecuada. Preferencias del usuario: Intención/Ánimo: ${mood}, Nivel de Energía: ${energy}, Instrumental: ${instrumental === null ? 'Indiferente' : instrumental ? 'Sí' : 'No'}, Géneros: ${(genres || []).join(', ')}, Artistas similares: ${artists}. Responde ÚNICAMENTE con un array JSON válido que cumpla con el esquema proporcionado.`;
        
        try {
            const response = await geminiService.generateContent(prompt, undefined, { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, artist: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['title', 'artist', 'reason'] } });
            const parsed = JSON.parse(response);
            if (Array.isArray(parsed)) { setRecommendations(parsed); setStep('results'); updateUserData({ musicPreferences: preferences as IMusicPreferences }); } 
            else { setError("La respuesta de la IA no tuvo el formato esperado."); }
        } catch (e) { console.error(e); setError("Hubo un error al generar tu banda sonora."); } 
        finally { setIsLoading(false); }
    };

    const renderStepContent = () => {
        if (isLoading) return <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div></div>;
        if (error) return <p className="text-red-400 text-center">{error}</p>;
        
        switch (step) {
            case 1: return ( <div> <h4 className="font-semibold text-center mb-3">1/4: ¿Cuál es tu intención o estado de ánimo?</h4> <div className="flex flex-wrap gap-2 justify-center">{MOODS.map(m => <OptionButton key={m} label={m} isSelected={preferences.mood === m} onClick={() => handleNextStep({ mood: m })} />)}</div> </div> );
            case 2: return ( <div> <h4 className="font-semibold text-center mb-3">2/4: ¿Qué nivel de energía buscas?</h4> <div className="flex flex-wrap gap-2 justify-center">{ENERGIES.map(e => <OptionButton key={e} label={e} isSelected={preferences.energy === e} onClick={() => handleNextStep({ energy: e })} />)}</div> </div> );
            case 3: return ( <div> <h4 className="font-semibold text-center mb-3">3/4: ¿Prefieres música con o sin letra?</h4> <div className="flex flex-wrap gap-2 justify-center">{['Con Letra', 'Sin Letra', 'Me da igual'].map(i => <OptionButton key={i} label={i} isSelected={preferences.instrumental === (i === 'Con Letra' ? false : i === 'Sin Letra' ? true : null)} onClick={() => handleNextStep({ instrumental: i === 'Con Letra' ? false : i === 'Sin Letra' ? true : null })} />)}</div> </div> );
            case 4: return ( <div> <h4 className="font-semibold mb-3">4/4: Afina tus gustos</h4> <p className="text-sm text-slate-400 mb-2">Géneros (elige varios):</p> <div className="flex flex-wrap gap-2 mb-4">{MUSIC_GENRES.map(g => <OptionButton key={g} label={g} isSelected={(preferences.genres || []).includes(g)} onClick={() => setPreferences(p => ({ ...p, genres: (p.genres || []).includes(g) ? (p.genres || []).filter(gen => gen !== g) : [...(p.genres || []), g] }))} />)}</div> <p className="text-sm text-slate-400 mb-2">Artistas o bandas similares (separados por coma):</p> <input value={preferences.artists || ''} onChange={e => setPreferences(p => ({ ...p, artists: e.target.value }))} className="w-full p-2 bg-slate-700 rounded-md" /> <button onClick={handleGenerate} disabled={!(preferences.genres || []).length || !preferences.artists} className="w-full mt-4 bg-teal-600 text-white font-semibold py-2 rounded-lg disabled:bg-slate-500">Generar Banda Sonora</button> </div> );
            default: return null;
        }
    };
    
    const remainingUses = userData.isSubscribed ? -1 : (3 - (userData.usageTracker?.soundtrack?.count ?? 0));
    const canGenerate = userData.isSubscribed || remainingUses > 0;
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative min-h-[250px] flex flex-col">
            <TtsInfoButton explanation="Kai actúa como tu musicoterapeuta. Responde unas preguntas sobre tus preferencias y tu estado de ánimo, y creará una 'Banda Sonora para Sanar' con 10 canciones, cada una con un enlace a YouTube y una explicación de por qué fue elegida para ti." />
            <div className="flex items-center space-x-3 mb-3"><MusicIcon /><h2 className="text-xl font-bold text-slate-100">Banda Sonora para Sanar</h2></div>

            {step === 'idle' ? (
                <>
                    <p className="text-slate-400 mb-4 text-sm">Responde 4 preguntas rápidas para que Kai cree una playlist personalizada para tu momento actual.</p>
                    <button onClick={() => resetFlow(1)} disabled={!canGenerate} className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-slate-500">{canGenerate ? 'Crear mi Banda Sonora' : 'Usos gratuitos agotados'}</button>
                    {!userData.isSubscribed && <p className="text-xs text-center text-slate-500 mt-2">Te quedan {remainingUses} usos gratuitos este mes.</p>}
                </>
            ) : step === 'results' ? (
                 <div className="flex-grow flex flex-col justify-between">
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {recommendations.map((song, index) => (
                            <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-teal-300">{song.title}</p>
                                        <p className="text-sm text-slate-300">{song.artist}</p>
                                    </div>
                                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 p-1" title={`Buscar "${song.title}" en YouTube`}>
                                        <YouTubeIcon />
                                    </a>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 italic">Razón: {song.reason}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => resetFlow(1)} disabled={!canGenerate} className="w-full text-center text-sm text-teal-400 hover:underline mt-4 disabled:opacity-50">Crear otra lista</button>
                 </div>
            ) : (
                <div className="flex-grow flex flex-col justify-between">
                    <div>
                        <ProgressBar current={step} total={4} />
                        {renderStepContent()}
                    </div>
                    <button onClick={handleBack} className="text-sm text-slate-400 mt-4">Atrás</button>
                </div>
            )}
        </div>
    );
};
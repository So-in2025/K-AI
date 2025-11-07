import React, { useState } from 'react';
import { IThoughtLabEntry } from '../types';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const BeakerIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a4 4 0 00-5.656 0M11 6a3 3 0 013 3v1m-3-4a3 3 0 00-3 3v1m6 0a3 3 0 013 3v1M6 12a3 3 0 013-3h0a3 3 0 013 3v1m-6 0a3 3 0 003 3h0a3 3 0 003-3v-1m-3 4v6m3-6v6" /></svg> );

export const ThoughtLabCard: React.FC = () => {
    const { userData, geminiService, addThoughtLabEntry, checkAndConsumeUsage } = useUser();
    const [isCreating, setIsCreating] = useState(false);
    const [step, setStep] = useState(1);
    const [currentEntry, setCurrentEntry] = useState<Partial<IThoughtLabEntry>>({});
    const [isLoading, setIsLoading] = useState(false);

    if (!userData || !geminiService) return null;

    const resetState = () => { setIsCreating(false); setStep(1); setCurrentEntry({}); setIsLoading(false); };

    const handleStartSession = () => {
        if (!checkAndConsumeUsage('thought_lab', 3)) return;
        setIsCreating(true);
    };

    const handleNext = async () => {
        setIsLoading(true);
        if (step === 2) {
            const prompt = `Actúa como un terapeuta de TCC. Situación: "${currentEntry.situation}". Pensamiento: "${currentEntry.automaticThought}". Haz 2-3 preguntas socráticas cortas para cuestionar el pensamiento. Responde solo con las preguntas.`;
            const analysis = await geminiService.generateContent(prompt);
            setCurrentEntry(prev => ({ ...prev, kaiAnalysis: analysis }));
        }
        if (step === 4) {
            const prompt = `Usuario completó ejercicio TCC. Situación: "${currentEntry.situation}", Pensamiento Automático: "${currentEntry.automaticThought}", Pensamiento Alternativo: "${currentEntry.alternativeThought}". Escribe un breve párrafo de resumen y ánimo (2-3 frases).`;
            const summary = await geminiService.generateContent(prompt);
            setCurrentEntry(prev => ({...prev, kaiSummary: summary}));
        }
        setIsLoading(false);
        setStep(prev => prev + 1);
    };

    const handleSave = () => {
        const finalEntry: IThoughtLabEntry = { id: crypto.randomUUID(), date: new Date().toISOString(), situation: currentEntry.situation || '', automaticThought: currentEntry.automaticThought || '', kaiAnalysis: currentEntry.kaiAnalysis || '', alternativeThought: currentEntry.alternativeThought || '', kaiSummary: currentEntry.kaiSummary || '' };
        addThoughtLabEntry(finalEntry);
        resetState();
    };
    
    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-2">
                        <label className="text-sm">1. La Situación: ¿Qué ocurrió?</label>
                        <input type="text" value={currentEntry.situation || ''} onChange={e => setCurrentEntry(p => ({...p, situation: e.target.value}))} placeholder="Ej: Cometí un error en el trabajo" className="w-full p-2 bg-slate-700 rounded-md" />
                        <label className="text-sm">2. El Pensamiento Automático: ¿Qué te dijiste a ti mismo?</label>
                        <input type="text" value={currentEntry.automaticThought || ''} onChange={e => setCurrentEntry(p => ({...p, automaticThought: e.target.value}))} placeholder="Ej: 'Soy un inútil'" className="w-full p-2 bg-slate-700 rounded-md" />
                    </div>
                );
            case 2:
                return (
                    <div>
                        <p className="text-sm text-slate-400">Kai pregunta para reflexionar:</p>
                        <p className="italic text-teal-300 whitespace-pre-wrap">{currentEntry.kaiAnalysis}</p>
                    </div>
                );
            case 3:
                return (
                     <div className="space-y-2">
                        <label className="text-sm">3. El Pensamiento Alternativo: ¿Cuál es una forma más equilibrada de ver esto?</label>
                        <input type="text" value={currentEntry.alternativeThought || ''} onChange={e => setCurrentEntry(p => ({...p, alternativeThought: e.target.value}))} placeholder="Ej: 'Cometer errores es humano y una oportunidad para aprender'" className="w-full p-2 bg-slate-700 rounded-md" />
                    </div>
                );
            case 4:
                return (
                     <div>
                        <p className="text-sm text-slate-400">Resumen de Kai:</p>
                        <p className="italic text-teal-300">{currentEntry.kaiSummary}</p>
                    </div>
                );
            case 5:
                return <p>¡Pensamiento re-evaluado! Guárdalo para tu registro.</p>;
            default:
                return null;
        }
    };

    const remainingUses = userData.isSubscribed ? -1 : (3 - (userData.usageTracker?.thought_lab?.count ?? 0));
    const canStart = userData.isSubscribed || remainingUses > 0;
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Una herramienta de TCC. Te guía para identificar una situación, capturar el pensamiento automático, cuestionarlo con la ayuda de Kai, y crear una perspectiva más equilibrada." />
            <div className="flex items-center space-x-3 mb-3"><BeakerIcon /><h2 className="text-xl font-bold text-slate-100">Laboratorio de Pensamientos</h2></div>
            {!isCreating ? (
                <>
                    <p className="text-slate-400 mb-4 text-sm">Una herramienta de TCC para identificar y reformular pensamientos negativos.</p>
                    <button onClick={handleStartSession} disabled={!canStart} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 rounded-lg hover:bg-teal-600/30 disabled:opacity-50">{canStart ? 'Iniciar Nueva Sesión' : 'Usos gratuitos agotados'}</button>
                    {!userData.isSubscribed && <p className="text-xs text-center text-slate-500 mt-2">Te quedan {remainingUses} usos gratuitos este mes.</p>}
                </>
            ) : (
                <div>
                    {renderStepContent()}
                    <div className="flex justify-between mt-4">
                        <button onClick={resetState} className="text-sm">Cancelar</button>
                        {step < 5 ? ( <button onClick={handleNext} disabled={isLoading} className="bg-teal-600 font-semibold text-white px-4 py-1 rounded-lg disabled:bg-slate-500">{isLoading ? "..." : "Siguiente"}</button> ) : ( <button onClick={handleSave} className="bg-teal-600 font-semibold text-white px-4 py-1 rounded-lg">Guardar Sesión</button> )}
                    </div>
                </div>
            )}
        </div>
    );
};

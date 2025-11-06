

import React, { useState } from 'react';
import { IThoughtLabEntry } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import { TtsInfoButton } from './TtsInfoButton';

const BeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a4 4 0 00-5.656 0M11 6a3 3 0 013 3v1m-3-4a3 3 0 00-3 3v1m6 0a3 3 0 013 3v1M6 12a3 3 0 013-3h0a3 3 0 013 3v1m-6 0a3 3 0 003 3h0a3 3 0 003-3v-1m-3 4v6m3-6v6" />
    </svg>
);

interface ThoughtLabCardProps {
    entries: IThoughtLabEntry[];
    onAddEntry: (entry: IThoughtLabEntry) => void;
}

export const ThoughtLabCard: React.FC<ThoughtLabCardProps> = ({ entries, onAddEntry }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [step, setStep] = useState(1);
    const [currentEntry, setCurrentEntry] = useState<Partial<IThoughtLabEntry>>({});
    const [isLoading, setIsLoading] = useState(false);

    const resetState = () => {
        setIsCreating(false);
        setStep(1);
        setCurrentEntry({});
        setIsLoading(false);
    };

    const handleNext = async () => {
        if (step === 2) { // Moving to analysis
            setIsLoading(true);
            const prompt = `
                Actúa como un terapeuta de TCC compasivo. Un usuario está analizando un pensamiento automático. Su situación es: "${currentEntry.situation}". El pensamiento que tuvo fue: "${currentEntry.automaticThought}".
                Haz 2 o 3 preguntas socráticas, cortas y directas, para ayudarle a cuestionar la validez de este pensamiento. No des respuestas, solo preguntas que inviten a la reflexión.
                Ejemplos de preguntas: "¿Qué evidencia tienes de que ese pensamiento es 100% cierto?", "¿Hay otra forma de ver esta situación?", "¿Qué le dirías a un amigo que tuviera este mismo pensamiento?".
                Responde solo con las preguntas.
            `;
            const analysis = await getGeminiResponse(prompt);
            setCurrentEntry(prev => ({ ...prev, kaiAnalysis: analysis }));
            setIsLoading(false);
        }
        if (step === 4) { // Moving to summary
            setIsLoading(true);
            const prompt = `
                Un usuario acaba de completar un ejercicio de TCC.
                - Situación: "${currentEntry.situation}"
                - Pensamiento Automático: "${currentEntry.automaticThought}"
                - Pensamiento Alternativo: "${currentEntry.alternativeThought}"
                Escribe un breve párrafo de resumen y ánimo (2-3 frases) que valide su trabajo.
                Ejemplo: "Has hecho un trabajo increíble. Has identificado que [Situación] te lleva a pensar [Pensamiento Automático] y lo has transformado conscientemente en [Pensamiento Alternativo]. Este es un paso poderoso para re-cablear tu cerebro hacia una perspectiva más compasiva."
            `;
            const summary = await getGeminiResponse(prompt);
            setCurrentEntry(prev => ({...prev, kaiSummary: summary}));
            setIsLoading(false);
        }
        setStep(prev => prev + 1);
    };

    const handleSave = () => {
        const finalEntry: IThoughtLabEntry = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            situation: currentEntry.situation || '',
            automaticThought: currentEntry.automaticThought || '',
            kaiAnalysis: currentEntry.kaiAnalysis || '',
            alternativeThought: currentEntry.alternativeThought || '',
            kaiSummary: currentEntry.kaiSummary || '',
        };
        onAddEntry(finalEntry);
        resetState();
    };
    
    const renderStepContent = () => {
        switch(step) {
            case 1: return (
                <div>
                    <label className="text-sm font-semibold text-slate-300">Describe la situación</label>
                    <p className="text-xs text-slate-400 mb-2">¿Qué pasó? Sé objetivo, como una cámara de vídeo.</p>
                    <textarea value={currentEntry.situation || ''} onChange={e => setCurrentEntry(p => ({...p, situation: e.target.value}))} className="w-full p-2 bg-slate-700 rounded-md h-24" />
                </div>
            );
            case 2: return (
                <div>
                    <label className="text-sm font-semibold text-slate-300">¿Cuál fue tu primer pensamiento?</label>
                    <p className="text-xs text-slate-400 mb-2">Escribe el pensamiento automático que te vino a la mente, tal cual.</p>
                    <textarea value={currentEntry.automaticThought || ''} onChange={e => setCurrentEntry(p => ({...p, automaticThought: e.target.value}))} className="w-full p-2 bg-slate-700 rounded-md h-24" />
                </div>
            );
            case 3: return (
                <div>
                     <label className="text-sm font-semibold text-slate-300">Análisis con Kai</label>
                    <p className="text-xs text-slate-400 mb-2">Kai te hace estas preguntas para reflexionar:</p>
                    {isLoading ? <p>Analizando...</p> : <p className="text-teal-300 italic whitespace-pre-wrap">{currentEntry.kaiAnalysis}</p>}
                </div>
            );
            case 4: return (
                <div>
                    <label className="text-sm font-semibold text-slate-300">Crea un pensamiento alternativo</label>
                    <p className="text-xs text-slate-400 mb-2">Basado en tu reflexión, escribe una forma más equilibrada y compasiva de ver la situación.</p>
                    <textarea value={currentEntry.alternativeThought || ''} onChange={e => setCurrentEntry(p => ({...p, alternativeThought: e.target.value}))} className="w-full p-2 bg-slate-700 rounded-md h-24" />
                </div>
            );
            case 5: return (
                 <div>
                     <label className="text-sm font-semibold text-slate-300">Resumen de Kai</label>
                     <p className="text-xs text-slate-400 mb-2">Este es el resumen de tu trabajo:</p>
                     <p className="text-teal-300 italic whitespace-pre-wrap">{isLoading ? "Generando resumen..." : currentEntry.kaiSummary}</p>
                </div>
            );
        }
    };
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Bienvenido al Laboratorio de Pensamientos. Esta es una herramienta de Terapia Cognitivo Conductual, o TCC. Su objetivo es ayudarte a ser un observador de tu propia mente. Te guiará para identificar una situación, capturar el pensamiento automático que surgió, y luego, con la ayuda de Kai, cuestionar ese pensamiento. El paso final es crear una perspectiva más equilibrada y compasiva. Cada sesión es un entrenamiento para tu mente." />
            <div className="flex items-center space-x-3 mb-3">
                <BeakerIcon />
                <h2 className="text-xl font-bold text-slate-100">Laboratorio de Pensamientos</h2>
            </div>
            {!isCreating ? (
                <>
                    <p className="text-slate-400 mb-4 text-sm">Una herramienta de TCC para identificar y reformular pensamientos negativos. Cada sesión es un paso hacia la claridad mental.</p>
                    <button onClick={() => setIsCreating(true)} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg hover:bg-teal-600/30">
                        Iniciar Nueva Sesión
                    </button>
                    {entries.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-slate-300">Sesiones Recientes:</h3>
                            <p className="text-xs text-slate-500">{entries[0].situation?.substring(0, 50)}...</p>
                        </div>
                    )}
                </>
            ) : (
                <div>
                    {renderStepContent()}
                    <div className="flex justify-between mt-4">
                        <button onClick={resetState} className="text-sm text-slate-400">Cancelar</button>
                        {step < 5 ? (
                             <button onClick={handleNext} disabled={isLoading} className="bg-teal-600 font-semibold text-white px-4 py-1 rounded-lg disabled:bg-slate-500">
                                {isLoading ? "..." : "Siguiente"}
                            </button>
                        ) : (
                            <button onClick={handleSave} className="bg-teal-600 font-semibold text-white px-4 py-1 rounded-lg">Guardar Sesión</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
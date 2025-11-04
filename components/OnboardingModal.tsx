import React, { useState } from 'react';
import { UserFocus, USER_FOCUS_OPTIONS, OnboardingData } from '../types';
import { KiaIcon } from './KiaIcon';

interface OnboardingModalProps {
    onSave: (data: OnboardingData) => void;
}

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
    <div className="w-full bg-slate-700 rounded-full h-1.5 mb-6">
        <div 
            className="bg-teal-400 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${(current / total) * 100}%` }}
        ></div>
    </div>
);

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<Partial<OnboardingData>>({ focuses: [] });
    const [error, setError] = useState('');

    const totalSteps = 2 + (data.focuses?.length || 0) + 1; // Welcome + Focuses + (1 per focus) + Challenge

    const handleNext = () => {
        setError('');
        // Validation for current step
        if (step === 2 && data.focuses?.length === 0) {
            setError('Por favor, selecciona al menos un camino.');
            return;
        }
        if (step > 2 && step <= 2 + (data.focuses?.length || 0)) {
            // No specific validation for radio buttons as they are required
        }
        if (step === totalSteps && (!data.mainChallenge || data.mainChallenge.trim().length < 10)) {
             setError('Por favor, describe tu desafío con un poco más de detalle.');
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(prev => prev - 1);
    };
    
    const handleSave = () => {
        if (!data.mainChallenge || data.mainChallenge.trim().length < 10) {
            setError('Por favor, describe tu desafío con un poco más de detalle.');
            return;
        }
        onSave(data as OnboardingData);
    };

    const handleFocusToggle = (focus: UserFocus) => {
        setData(prev => {
            const newFocuses = prev.focuses?.includes(focus)
                ? prev.focuses.filter(f => f !== focus)
                : [...(prev.focuses || []), focus];
            return { ...prev, focuses: newFocuses };
        });
    };

    const renderStep = () => {
        if (step === 1) { // Welcome
            return (
                <div className="text-center">
                    <KiaIcon className="h-16 w-16 text-teal-400 mx-auto" />
                    <h2 className="text-3xl font-bold text-slate-100 mt-4 tracking-wider">Bienvenido a KIA</h2>
                    <div className="mt-2">
                        <p className="text-slate-300">Un espacio de apoyo basado en tres pilares:</p>
                        <p className="font-semibold text-teal-300">Kindness (Amabilidad), Introspection (Introspección), y Awareness (Conciencia).</p>
                    </div>
                    <p className="text-slate-400 mt-6">Para empezar, vamos a personalizar tu experiencia. Serán solo unas pocas preguntas.</p>
                </div>
            );
        }

        if (step === 2) { // Select Focuses
            return (
                 <div>
                    <h3 className="text-xl font-semibold text-center mb-4">¿En qué te gustaría enfocarte?</h3>
                    <p className="text-slate-400 text-center mb-6">Puedes elegir más de uno. Esto nos ayudará a personalizar el apoyo de Kai.</p>
                    <div className="space-y-3">
                        {(Object.keys(USER_FOCUS_OPTIONS) as UserFocus[]).map(focus => (
                            <label key={focus} className={`flex items-center p-4 bg-slate-700 rounded-lg cursor-pointer border-2 hover:border-teal-500 transition-colors ${data.focuses?.includes(focus) ? 'border-teal-500' : 'border-transparent'}`}>
                                <input
                                    type="checkbox"
                                    checked={data.focuses?.includes(focus)}
                                    onChange={() => handleFocusToggle(focus)}
                                    className="h-5 w-5 rounded text-teal-500 bg-slate-800 border-slate-600 focus:ring-teal-500"
                                />
                                <span className="ml-3 text-lg font-medium text-slate-200">{USER_FOCUS_OPTIONS[focus]}</span>
                            </label>
                        ))}
                    </div>
                </div>
            );
        }

        const focusIndex = step - 3;
        const currentFocus = data.focuses?.[focusIndex];

        if (currentFocus === 'addiction') {
             return <div>
                <h3 className="text-xl font-semibold mb-4">Sobre la Adicción</h3>
                 <div className="space-y-4">
                    <p>¿Con qué frecuencia ocurre el comportamiento?</p>
                    {['Diariamente', 'Varias veces por semana', 'Semanalmente', 'Ocasionalmente'].map(opt => (
                        <label key={opt} className="flex items-center"><input type="radio" name="addictionFrequency" value={opt} onChange={(e) => setData(d => ({...d, addictionFrequency: e.target.value}))} className="h-4 w-4 text-teal-500" /> <span className="ml-2">{opt}</span></label>
                    ))}
                    <p className="mt-4">¿Cuál es tu meta principal ahora mismo?</p>
                     {['Abstinencia total', 'Reducir el consumo', 'Entender mis detonantes', 'Aún no lo sé'].map(opt => (
                        <label key={opt} className="flex items-center"><input type="radio" name="addictionGoal" value={opt} onChange={(e) => setData(d => ({...d, addictionGoal: e.target.value}))} className="h-4 w-4 text-teal-500" /> <span className="ml-2">{opt}</span></label>
                    ))}
                </div>
             </div>
        }
        if (currentFocus === 'depression') {
             return <div>
                <h3 className="text-xl font-semibold mb-4">Sobre la Depresión/Ansiedad</h3>
                <div className="space-y-4">
                    <p>¿Cómo se manifiesta principalmente en ti?</p>
                    {['Falta de energía y motivación', 'Tristeza o vacío persistente', 'Preocupación constante e insomnio', 'Irritabilidad y frustración'].map(opt => (
                        <label key={opt} className="flex items-center"><input type="radio" name="depressionManifestation" value={opt} onChange={(e) => setData(d => ({...d, depressionManifestation: e.target.value}))} className="h-4 w-4 text-teal-500" /> <span className="ml-2">{opt}</span></label>
                    ))}
                </div>
             </div>
        }
        if (currentFocus === 'grief') {
             return <div>
                <h3 className="text-xl font-semibold mb-4">Sobre la Pérdida</h3>
                <div className="space-y-4">
                    <p>¿La pérdida es reciente?</p>
                    {['Sí, en los últimos meses', 'Ha pasado un tiempo, pero sigue doliendo', 'Es una pérdida antigua que ha resurgido'].map(opt => (
                        <label key={opt} className="flex items-center"><input type="radio" name="griefRecency" value={opt} onChange={(e) => setData(d => ({...d, griefRecency: e.target.value}))} className="h-4 w-4 text-teal-500" /> <span className="ml-2">{opt}</span></label>
                    ))}
                    <p className="mt-4">¿Cuál es el sentimiento más difícil para ti ahora?</p>
                     {['La soledad', 'La ira o la injusticia', 'La tristeza profunda', 'La culpa'].map(opt => (
                        <label key={opt} className="flex items-center"><input type="radio" name="griefFeeling" value={opt} onChange={(e) => setData(d => ({...d, griefFeeling: e.target.value}))} className="h-4 w-4 text-teal-500" /> <span className="ml-2">{opt}</span></label>
                    ))}
                </div>
             </div>
        }
        
        if (step === totalSteps) { // Final open question
            return (
                <div>
                    <h3 className="text-xl font-semibold text-center mb-4">Una última pregunta, y la más importante</h3>
                    <p className="text-slate-400 text-center mb-6">En tus propias palabras, ¿cuál es el mayor desafío que enfrentas ahora mismo?</p>
                    <textarea 
                        value={data.mainChallenge || ''}
                        onChange={(e) => setData(d => ({ ...d, mainChallenge: e.target.value }))}
                        placeholder="Puedes ser tan breve o detallado como quieras..."
                        className="w-full h-28 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            );
        }

        return null; // Should not happen
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg mx-auto animate-fade-in-up text-slate-200">
                <ProgressBar current={step} total={totalSteps} />
                
                <div className="min-h-[300px]">
                    {renderStep()}
                </div>

                {error && <p className="text-red-400 text-sm text-center mb-4 mt-2">{error}</p>}
                
                <div className="flex justify-between items-center mt-6">
                    {step > 1 ? (
                        <button onClick={handleBack} className="text-slate-400 font-semibold hover:text-white">Atrás</button>
                    ) : <div></div>}
                    
                    {step < totalSteps ? (
                         <button onClick={handleNext} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700">Siguiente</button>
                    ) : (
                         <button onClick={handleSave} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700">Finalizar</button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

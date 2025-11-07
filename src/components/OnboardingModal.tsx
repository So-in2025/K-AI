
import React, { useState } from 'react';
import { OnboardingData, UserFocus, USER_FOCUS_OPTIONS } from '/src/types.ts';

interface OnboardingModalProps {
  onSave: (data: OnboardingData) => void;
}

const STEPS = [
    { id: 'focus', title: '¿Cuál es tu enfoque principal?' },
    { id: 'details', title: 'Cuéntanos un poco más' },
    { id: 'challenge', title: 'Tu mayor desafío' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<Partial<OnboardingData>>({
        focuses: [],
    });

    const handleFocusToggle = (focus: UserFocus) => {
        setFormData(prev => {
            const newFocuses = prev.focuses?.includes(focus)
                ? prev.focuses.filter(f => f !== focus)
                : [...(prev.focuses || []), focus];
            return { ...prev, focuses: newFocuses };
        });
    };
    
    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            onSave(formData as OnboardingData);
        }
    };
    
    const isNextDisabled = () => {
        if (step === 0) return formData.focuses?.length === 0;
        if (step === 2) return !formData.mainChallenge?.trim();
        return false;
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-3">
                        <p className="text-slate-400 text-center">Selecciona una o más áreas en las que KIA te apoyará. Esto personalizará tu experiencia.</p>
                        {(Object.keys(USER_FOCUS_OPTIONS) as UserFocus[]).map(key => (
                            <button
                                key={key}
                                onClick={() => handleFocusToggle(key)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                    formData.focuses?.includes(key)
                                        ? 'bg-teal-500/20 border-teal-500 text-white'
                                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300'
                                }`}
                            >
                                {USER_FOCUS_OPTIONS[key]}
                            </button>
                        ))}
                    </div>
                );
            case 1:
                 return (
                    <div>
                        {formData.focuses?.includes('addiction') && (
                            <div className="mb-4">
                                <label className="block text-slate-300 mb-2">¿Con qué frecuencia luchas con tu adicción?</label>
                                <input type="text" onChange={e => setFormData(d => ({ ...d, addictionFrequency: e.target.value }))} className="w-full bg-slate-700 p-2 rounded" />
                            </div>
                        )}
                         {formData.focuses?.includes('depression') && (
                            <div className="mb-4">
                                <label className="block text-slate-300 mb-2">¿Qué te motiva a buscar ayuda para la depresión/ansiedad?</label>
                                <input type="text" onChange={e => setFormData(d => ({ ...d, depressionMotivation: e.target.value }))} className="w-full bg-slate-700 p-2 rounded" />
                            </div>
                        )}
                         {formData.focuses?.includes('grief') && (
                            <div className="mb-4">
                                <label className="block text-slate-300 mb-2">¿Cómo describirías el sentimiento principal de tu duelo?</label>
                                <input type="text" onChange={e => setFormData(d => ({ ...d, griefFeeling: e.target.value }))} className="w-full bg-slate-700 p-2 rounded" />
                            </div>
                        )}
                        {!formData.focuses || formData.focuses.length === 0 && <p>Vuelve al paso anterior para seleccionar un enfoque.</p>}
                    </div>
                );
            case 2:
                return (
                    <div>
                        <p className="text-slate-400 mb-2">En una frase, ¿cuál es el mayor desafío al que te enfrentas ahora mismo en tu camino?</p>
                        <textarea
                            value={formData.mainChallenge || ''}
                            onChange={(e) => setFormData(d => ({ ...d, mainChallenge: e.target.value }))}
                            className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ej: 'Sentirme solo por las noches', 'La falta de motivación para empezar el día'..."
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-center text-slate-100 mb-2">{STEPS[step].title}</h2>
                <div className="my-6">
                    {renderStepContent()}
                </div>
                <button
                    onClick={handleNext}
                    disabled={isNextDisabled()}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {step === STEPS.length - 1 ? 'Comenzar mi viaje con KIA' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
};
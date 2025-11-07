import React, { useState } from 'react';
import { ICraving, CravingIntensity } from '../types';
import { CRAVING_TRIGGERS, COPING_STRATEGIES } from '../constants';

interface LogCravingModalProps {
  onClose: () => void;
  onLogCraving: (craving: ICraving) => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const LogCravingModal: React.FC<LogCravingModalProps> = ({ onClose, onLogCraving }) => {
    const [intensity, setIntensity] = useState<CravingIntensity | null>(null);
    const [triggers, setTriggers] = useState<string[]>([]);
    const [copingStrategy, setCopingStrategy] = useState<string | null>(null);
    const [note, setNote] = useState('');

    const handleToggleTrigger = (trigger: string) => {
        setTriggers(prev => 
            prev.includes(trigger) 
                ? prev.filter(t => t !== trigger)
                : [...prev, trigger]
        );
    };

    const handleSubmit = () => {
        if (!intensity || triggers.length === 0 || !copingStrategy) {
            alert('Por favor, completa los campos de intensidad, detonantes y estrategia.');
            return;
        }

        const newCraving: ICraving = {
            date: new Date().toISOString(),
            intensity,
            triggers,
            copingStrategy,
            note
        };
        onLogCraving(newCraving);
    };

    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="mb-5">
            <h3 className="text-md font-semibold text-slate-300 mb-3">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {children}
            </div>
        </div>
    );
    
    const renderButton = (label: string, isSelected: boolean, onClick: () => void) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors border ${
                isSelected 
                ? 'bg-teal-500 text-white border-teal-500' 
                : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-teal-400">Registrar un Antojo</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>

                {renderSection('1. ¿Cuál fue la intensidad?', (
                    (['Leve', 'Moderado', 'Intenso'] as CravingIntensity[]).map(level => 
                        renderButton(level, intensity === level, () => setIntensity(level))
                    )
                ))}

                {renderSection('2. ¿Qué crees que lo detonó? (elige uno o más)', (
                    CRAVING_TRIGGERS.map(trigger => 
                        renderButton(trigger, triggers.includes(trigger), () => handleToggleTrigger(trigger))
                    )
                ))}
                
                {renderSection('3. ¿Qué estrategia usaste para superarlo?', (
                    COPING_STRATEGIES.map(strategy => 
                        renderButton(strategy, copingStrategy === strategy, () => setCopingStrategy(strategy))
                    )
                ))}
                
                <div className="mb-5">
                    <h3 className="text-md font-semibold text-slate-300 mb-2">4. Notas adicionales (opcional)</h3>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Cualquier detalle extra es útil..."
                        className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!intensity || triggers.length === 0 || !copingStrategy}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    Guardar Registro
                </button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
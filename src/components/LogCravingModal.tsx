
import React, { useState } from 'react';
import { CravingIntensity, ICraving } from '/src/types.ts';
import { CRAVING_TRIGGERS, COPING_STRATEGIES } from '/src/constants.ts';

interface LogCravingModalProps {
  onClose: () => void;
  onSave: (craving: Omit<ICraving, 'date'>) => void;
}

export const LogCravingModal: React.FC<LogCravingModalProps> = ({ onClose, onSave }) => {
    const [intensity, setIntensity] = useState<CravingIntensity>('Moderado');
    const [triggers, setTriggers] = useState<string[]>([]);
    const [copingStrategy, setCopingStrategy] = useState('');
    const [note, setNote] = useState('');

    const handleTriggerToggle = (trigger: string) => {
        setTriggers(prev => 
            prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
        );
    };

    const handleSave = () => {
        if (triggers.length > 0 && copingStrategy) {
            onSave({ intensity, triggers, copingStrategy, note });
        } else {
            alert('Por favor, selecciona al menos un detonante y una estrategia.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-slate-100 flex-shrink-0">Registrar un Deseo</h3>
                
                <div className="overflow-y-auto space-y-4 pr-2 -mr-2">
                    {/* Intensity */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Intensidad</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Leve', 'Moderado', 'Intenso'] as CravingIntensity[]).map(level => (
                                <button key={level} onClick={() => setIntensity(level)} className={`p-2 rounded-lg text-sm transition-colors ${intensity === level ? 'bg-teal-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Triggers */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Detonantes (puedes elegir varios)</label>
                        <div className="flex flex-wrap gap-2">
                            {CRAVING_TRIGGERS.map(trigger => (
                                <button key={trigger} onClick={() => handleTriggerToggle(trigger)} className={`px-3 py-1 rounded-full text-xs transition-colors ${triggers.includes(trigger) ? 'bg-teal-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {trigger}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Coping Strategy */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Estrategia de Afrontamiento</label>
                         <select value={copingStrategy} onChange={e => setCopingStrategy(e.target.value)} className="w-full bg-slate-700 p-2 rounded text-sm border border-slate-600">
                            <option value="">Selecciona una opción</option>
                            {COPING_STRATEGIES.map(strategy => <option key={strategy} value={strategy}>{strategy}</option>)}
                        </select>
                    </div>
                    
                    {/* Note */}
                    <div>
                         <label className="block text-sm font-medium text-slate-300 mb-2">Nota (Opcional)</label>
                         <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="¿Algo más que quieras añadir?" className="w-full h-20 bg-slate-700 p-2 rounded text-sm border border-slate-600"></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
                    <button onClick={onClose} className="text-slate-400 hover:text-white px-4 py-2 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">Guardar</button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.2s ease-out; }
            `}</style>
        </div>
    );
};
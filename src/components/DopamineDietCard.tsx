
import React, { useState } from 'react';
import { useUser } from '/src/contexts/UserContext.tsx';
import { IDopamineHit } from '/src/types.ts';
import { v4 as uuidv4 } from 'uuid';
import { TtsInfoButton } from '/src/components/TtsInfoButton.tsx';

const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 14.735c2.193-2.294 2.25-5.94.134-8.423C3.62 4.39 4.966 2 7.206 2c2.428 0 3.73 2.05 4.794 4.098 1.103 2.12.82 5.518-1.02 7.129-1.932 1.68-4.75 1.54-6.11.418zM19.129 14.735c-2.193-2.294-2.25-5.94-.134-8.423C20.38 4.39 19.034 2 16.794 2c-2.428 0-3.73 2.05-4.794 4.098-1.103 2.12-.82 5.518 1.02 7.129 1.932 1.68 4.75 1.54 6.11.418z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22v-3m-4.5-2.5a7.5 7.5 0 0115 0M4.5 16.5a7.5 7.5 0 0015 0" />
    </svg>
);

const LogDopamineHitModal: React.FC<{ onClose: () => void; onSave: (activity: string, category: string) => void }> = ({ onClose, onSave }) => {
    const [activity, setActivity] = useState('');
    const [category, setCategory] = useState('Saludable');
    
    const handleSave = () => {
        if (activity.trim()) {
            onSave(activity.trim(), category);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Registrar Actividad</h3>
                <input
                    type="text"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="Ej: 'Caminé 10 min al sol'"
                    className="w-full bg-slate-700 p-2 rounded mb-3"
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-700 p-2 rounded mb-4">
                    <option>Saludable</option>
                    <option>No Saludable</option>
                </select>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="text-slate-400">Cancelar</button>
                    <button onClick={handleSave} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg">Guardar</button>
                </div>
            </div>
        </div>
    );
};

export const DopamineDietCard: React.FC = () => {
    const { userData, updateUserData } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dopamineHits = userData?.dopamineHits || [];

    const handleSave = (activity: string, category: string) => {
        const newHit: IDopamineHit = {
            id: uuidv4(),
            date: new Date().toISOString(),
            activity,
            category,
        };
        updateUserData({ dopamineHits: [...dopamineHits, newHit] });
        setIsModalOpen(false);
    };
    
    const healthyHitsToday = dopamineHits.filter(h => {
        const hitDate = new Date(h.date);
        const today = new Date();
        return h.category === 'Saludable' && hitDate.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative h-full flex flex-col">
            <TtsInfoButton explanation="La dopamina es clave en la motivación y la adicción. Esta herramienta te ayuda a ser consciente de tus fuentes de dopamina, para que puedas reducir las no saludables y aumentar las que te nutren a largo plazo." />
            <div className="flex items-center space-x-3 mb-3">
                <BrainIcon />
                <h2 className="text-xl font-bold text-slate-100">Dieta de Dopamina</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Registra tus "golpes" de dopamina para entender tus patrones de recompensa.
            </p>
             <div className="flex-grow flex flex-col justify-center items-center bg-slate-700/50 rounded-lg p-4 mb-4">
                 <p className="text-4xl font-bold text-white">{healthyHitsToday}</p>
                 <p className="text-sm text-slate-300">Fuentes saludables hoy</p>
            </div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
                Registrar Actividad
            </button>
            {isModalOpen && <LogDopamineHitModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};
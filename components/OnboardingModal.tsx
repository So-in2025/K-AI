import React, { useState } from 'react';
import { UserFocus, USER_FOCUS_OPTIONS } from '../types';

interface OnboardingModalProps {
    onSave: (focuses: UserFocus[]) => void;
}

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
    const [selectedFocuses, setSelectedFocuses] = useState<UserFocus[]>([]);
    const [error, setError] = useState('');

    const handleToggleFocus = (focus: UserFocus) => {
        setSelectedFocuses(prev =>
            prev.includes(focus)
                ? prev.filter(f => f !== focus)
                : [...prev, focus]
        );
    };

    const handleSave = () => {
        if (selectedFocuses.length === 0) {
            setError('Por favor, selecciona al menos un camino para comenzar.');
            return;
        }
        setError('');
        onSave(selectedFocuses);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto animate-fade-in-up text-slate-200">
                <div className="flex flex-col items-center text-center mb-4">
                    <LeafIcon />
                    <h2 className="text-2xl font-bold text-slate-100 mt-2">Bienvenido a Camino Consciente</h2>
                    <p className="text-slate-400 mt-2">Para personalizar tu experiencia, por favor, cuéntanos en qué te gustaría enfocarte. Puedes elegir más de uno.</p>
                </div>
                
                <div className="space-y-3 my-6">
                    {(Object.keys(USER_FOCUS_OPTIONS) as UserFocus[]).map(focus => (
                        <label key={focus} className="flex items-center p-4 bg-slate-700 rounded-lg cursor-pointer border-2 border-transparent hover:border-teal-500 transition-colors">
                            <input
                                type="checkbox"
                                checked={selectedFocuses.includes(focus)}
                                onChange={() => handleToggleFocus(focus)}
                                className="h-5 w-5 rounded text-teal-500 bg-slate-800 border-slate-600 focus:ring-teal-500"
                            />
                            <span className="ml-3 text-lg font-medium text-slate-200">{USER_FOCUS_OPTIONS[focus]}</span>
                        </label>
                    ))}
                </div>

                {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                
                <button
                    onClick={handleSave}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Comenzar mi camino
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

import React from 'react';

interface TherapySessionModalProps {
  onClose: () => void;
}

export const TherapySessionModal: React.FC<TherapySessionModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">Modo Terapeuta</h3>
                <p className="text-slate-400 mb-6">
                    Esta función avanzada te permite tener conversaciones estructuradas con Kai, utilizando técnicas de diferentes corrientes terapéuticas. Estará disponible próximamente en KIA Plus.
                </p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg">
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

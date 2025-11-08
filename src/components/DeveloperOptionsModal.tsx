
import React from 'react';
import { useUser } from '../contexts/UserContext';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface DeveloperOptionsModalProps {
    onClose: () => void;
}

export const DeveloperOptionsModal: React.FC<DeveloperOptionsModalProps> = ({ onClose }) => {
    const { userData, updateUserData } = useUser();

    const handleResetDeveloperMode = () => {
        localStorage.removeItem('developerMode');
        alert('Modo desarrollador desactivado. La aplicación se recargará.');
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-yellow-500/50 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto animate-fade-in-up text-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-yellow-300">Opciones de Desarrollador</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-teal-300 mb-2">Información de Usuario</h3>
                        <div className="bg-slate-700 p-3 rounded-lg text-xs font-mono break-all">
                            <strong>UID:</strong> {userData?.uid || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-teal-300 mb-2">Simulaciones</h3>
                        <div className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                            <label htmlFor="premium-toggle" className="font-medium text-slate-200">Forzar KIA Plus</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="premium-toggle"
                                    className="sr-only peer"
                                    checked={!!userData?.isSubscribed}
                                    onChange={(e) => updateUserData({ isSubscribed: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-red-400 mb-2">Zona de Peligro</h3>
                        <button
                            onClick={handleResetDeveloperMode}
                            className="w-full bg-red-900/50 border border-red-500 text-red-300 font-semibold py-2 px-4 rounded-lg hover:bg-red-900"
                        >
                            Desactivar Modo Desarrollador
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-8 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors"
                >
                    Cerrar
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

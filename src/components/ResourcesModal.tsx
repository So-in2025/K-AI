
import React from 'react';
import { RESOURCES } from '../constants';
import { IResource } from '../types';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ResourcesModalProps {
    onClose: () => void;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg mx-auto animate-fade-in-up text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-100">Recursos de Ayuda Profesional</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
            </div>

            <p className="text-sm text-slate-400 mb-6">
                Recuerda que no estás solo. KIA es una herramienta de apoyo, pero no reemplaza la ayuda de un profesional cualificado. Usa estos recursos cuando necesites un apoyo más estructurado.
            </p>

            <div className="space-y-4">
                {RESOURCES.map((resource: IResource) => (
                    <div key={resource.id} className="bg-slate-700/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-teal-300">{resource.name}</h3>
                        <p className="text-sm text-slate-300 my-1">{resource.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                            {resource.phone && (
                                <a href={`tel:${resource.phone}`} className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded-md transition-colors">
                                    Llamar
                                </a>
                            )}
                            {resource.url && (
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal-400 hover:underline">
                                    Visitar sitio web
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onClose}
                className="w-full mt-6 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors"
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

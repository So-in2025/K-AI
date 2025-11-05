import React from 'react';
import { RESOURCES } from '../constants';
import { IResource } from '../types';
import { TtsInfoButton } from './TtsInfoButton';

const ResourceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);


export const ResourcesCard: React.FC = () => {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
      <TtsInfoButton explanation="Recuerda que no estás solo. Esta tarjeta contiene un directorio de organizaciones y líneas de ayuda profesionales. KIA es una herramienta de apoyo, pero no reemplaza la ayuda de un profesional cualificado. Usa estos recursos cuando necesites un apoyo más estructurado." />
      <div className="flex items-center space-x-3 mb-4">
        <ResourceIcon />
        <h2 className="text-xl font-bold text-slate-100">Recursos de Ayuda</h2>
      </div>
      <div className="space-y-4">
        {RESOURCES.map((resource: IResource) => (
          <div key={resource.id} className="border-b border-slate-700 pb-3 last:border-b-0">
            <h3 className="font-semibold text-slate-200">{resource.name}</h3>
            <p className="text-sm text-slate-400 mb-2">{resource.description}</p>
            <div className="flex items-center space-x-4">
              {resource.phone && (
                <a href={`tel:${resource.phone}`} className="text-sm text-teal-400 font-medium hover:underline">
                  Llamar
                </a>
              )}
              {resource.url && (
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-400 font-medium hover:underline">
                  Visitar web
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

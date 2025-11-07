
import React from 'react';
import { RESOURCES } from '/src/constants.ts';

const LifebuoyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const ResourcesCard: React.FC = () => {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <LifebuoyIcon />
        <h2 className="text-xl font-bold text-slate-100">Recursos de Ayuda</h2>
      </div>
      <p className="text-slate-400 mb-4 text-sm">
        No estás solo. Aquí tienes recursos profesionales que pueden ofrecerte apoyo adicional.
      </p>
      <ul className="space-y-3">
        {RESOURCES.map(resource => (
          <li key={resource.id} className="bg-slate-700/50 p-3 rounded-lg">
            <h3 className="font-semibold text-slate-200">{resource.name}</h3>
            <p className="text-xs text-slate-400 mb-2">{resource.description}</p>
            <div className="flex space-x-4">
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline text-sm font-medium"
                >
                  Visitar web
                </a>
              )}
              {resource.phone && (
                <a href={`tel:${resource.phone.replace(/\s/g, '')}`} className="text-teal-400 hover:underline text-sm font-medium">
                  Llamar: {resource.phone}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
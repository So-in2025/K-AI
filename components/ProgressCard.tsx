import React from 'react';
import { UserFocus } from '../types';

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

interface ProgressCardProps {
    startDate: Date | null;
    daysSober: number;
    onStartDate: () => void;
    onReset: () => void;
    userFocus: UserFocus[];
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ startDate, daysSober, onStartDate, onReset, userFocus }) => {
  const hasAddictionFocus = userFocus.includes('addiction');
  const buttonText = hasAddictionFocus ? 'Comenzar mi recuperación' : 'Comenzar mi camino';
  const dayLabel = hasAddictionFocus ? (daysSober === 1 ? 'Día de sobriedad' : 'Días de sobriedad') : (daysSober === 1 ? 'Día de progreso' : 'Días de progreso');

  if (!startDate) {
    return (
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center h-full">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Bienvenido a tu viaje</h2>
        <p className="text-slate-400 mb-4">Empezar es el paso más valiente. Estamos aquí para apoyarte.</p>
        <button
          onClick={onStartDate}
          className="bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6 rounded-2xl shadow-lg text-white h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <CalendarIcon />
          <h2 className="text-xl font-bold">Mi Progreso</h2>
        </div>
        <p className="text-5xl font-bold text-center">{daysSober}</p>
        <p className="text-center text-lg opacity-90">{dayLabel}</p>
        <p className="text-center text-xs opacity-70 mt-2">
            Iniciado el: {startDate.toLocaleDateString('es-ES')}
        </p>
      </div>
       <button 
        onClick={onReset} 
        className="mt-4 text-center w-full text-white text-xs opacity-70 hover:opacity-100 transition">
        Reiniciar progreso
      </button>
    </div>
  );
};
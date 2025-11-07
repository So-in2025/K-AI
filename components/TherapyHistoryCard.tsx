import React, { useState } from 'react';
import { ITherapySession, THERAPY_MODES } from '../types';

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const renderMarkdown = (text: string) => ({ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') });

interface TherapyHistoryCardProps {
    sessions: ITherapySession[];
    onDeleteHistory: () => void;
    isLocked: boolean;
}

export const TherapyHistoryCard: React.FC<TherapyHistoryCardProps> = ({ sessions, onDeleteHistory, isLocked }) => {
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

    if (isLocked) {
         return (
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative h-full">
                <div className="flex items-center space-x-3 mb-3">
                    <BookIcon />
                    <h2 className="text-xl font-bold text-slate-100">Historial de Sesiones</h2>
                </div>
                 <div className="absolute inset-0 bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                    <LockIcon />
                    <h3 className="text-lg font-semibold text-white mt-2">Revisa tus Sesiones Privadas</h3>
                    <p className="text-slate-300 text-sm">Accede al historial de tus sesiones de introspección para ver tu progreso. Disponible en KIA Plus.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
                <BookIcon />
                <h2 className="text-xl font-bold text-slate-100">Historial de Sesiones</h2>
            </div>
            
            {sessions && sessions.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sessions.map(session => (
                        <div key={session.id} className="bg-slate-700/50 rounded-lg p-3">
                            <button onClick={() => setExpandedSessionId(prev => prev === session.id ? null : session.id)} className="w-full text-left">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-teal-300">{THERAPY_MODES[session.mode].name}</p>
                                        <p className="text-xs text-slate-400">{new Date(session.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">{expandedSessionId === session.id ? 'Ocultar' : 'Ver más'}</span>
                                </div>
                                {expandedSessionId !== session.id && (
                                    <p className="text-xs text-slate-300 mt-2 truncate italic">
                                        Insight: {session.summary.insights.replace(/\**/g, '')}
                                    </p>
                                )}
                            </button>
                            {expandedSessionId === session.id && (
                                <div className="mt-3 border-t border-slate-600 pt-3 text-sm text-slate-300 space-y-2">
                                    <div>
                                        <h4 className="font-semibold text-slate-100">Insights Clave</h4>
                                        <div className="text-xs" dangerouslySetInnerHTML={renderMarkdown(session.summary.insights)} />
                                    </div>
                                     <div>
                                        <h4 className="font-semibold text-slate-100">Patrones Identificados</h4>
                                        <div className="text-xs" dangerouslySetInnerHTML={renderMarkdown(session.summary.patterns)} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-100">Accionable para la Semana</h4>
                                        <div className="text-xs" dangerouslySetInnerHTML={renderMarkdown(session.summary.actionable)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 text-sm text-center italic py-4">
                    Aún no has completado ninguna sesión privada.
                </p>
            )}

             {sessions && sessions.length > 0 && (
                <button onClick={onDeleteHistory} className="w-full text-center text-xs text-red-500 hover:underline mt-4">
                    Borrar todo el historial de sesiones
                </button>
            )}
        </div>
    );
}

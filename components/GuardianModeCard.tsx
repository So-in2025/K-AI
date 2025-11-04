
import React, { useState, useEffect } from 'react';
import { GuardianAnalysisResult, IGuardianAnalysis } from '../types';
import { UpgradeCard } from './UpgradeCard';

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944L12 22l9-1.056A12.02 12.02 0 0017.618 7.984z" />
    </svg>
);

const ConsentModal: React.FC<{ onAccept: () => void; onDecline: () => void; }> = ({ onAccept, onDecline }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-teal-400 mb-3">Aviso de Privacidad del Modo Guardián</h2>
            <p className="text-slate-300 text-sm mb-4">
                Al activar el "Modo Guardián", la aplicación usará el micrófono de tu dispositivo para escuchar y transcribir el audio ambiental de forma continua.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-400 space-y-2 mb-4">
                <li>La transcripción se procesará para generar un análisis de comportamiento SOLO para ti.</li>
                <li>El audio NO se almacena en ningún servidor.</li>
                <li>La transcripción se elimina después de generar tu análisis.</li>
            </ul>
            <p className="text-slate-300 text-sm mb-6">
                Esta función está diseñada para ser una herramienta de autoconocimiento. Úsala de manera responsable y consciente.
            </p>
            <div className="flex gap-4">
                <button onClick={onDecline} className="flex-1 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700">Cancelar</button>
                <button onClick={onAccept} className="flex-1 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">Entiendo y Acepto</button>
            </div>
        </div>
    </div>
);

interface GuardianModeCardProps {
    status: 'idle' | 'starting' | 'active' | 'stopping' | 'analyzing' | 'error';
    analysis: GuardianAnalysisResult | null;
    error: string | null;
    onStart: () => void;
    onStop: () => void;
}

const GUARDIAN_CONSENT_KEY = 'guardianConsentGiven';

export const GuardianModeCard: React.FC<GuardianModeCardProps> = ({ status, analysis, error, onStart, onStop }) => {
    const [showConsent, setShowConsent] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        if (analysis) {
            setShowAnalysis(true);
        }
    }, [analysis]);
    
    const handleStartClick = () => {
        const consentGiven = localStorage.getItem(GUARDIAN_CONSENT_KEY);
        if (consentGiven) {
            onStart();
        } else {
            setShowConsent(true);
        }
    };

    const handleAcceptConsent = () => {
        localStorage.setItem(GUARDIAN_CONSENT_KEY, 'true');
        setShowConsent(false);
        onStart();
    };
    
    const renderContent = () => {
        if (showAnalysis && analysis) {
            if ('isLocked' in analysis && analysis.isLocked) {
                 return (
                    <div>
                        <p className="text-slate-400 mb-4 text-sm text-center">Tu informe de análisis conductual está listo. Desbloquéalo para obtener una visión profunda de tus patrones y detonantes.</p>
                        <UpgradeCard />
                         <button 
                            onClick={() => setShowAnalysis(false)}
                            className="w-full mt-4 text-slate-400 text-xs hover:underline"
                         >
                            Quizás más tarde
                         </button>
                    </div>
                );
            }
            const analysisData = analysis as IGuardianAnalysis;
            const analysisItems = [
                { title: "Detonante Principal", content: analysisData.trigger },
                { title: "Presión Social Identificada", content: analysisData.socialPressure },
                { title: "Justificaciones o Pensamientos Permisivos", content: analysisData.justification },
                { title: "Punto de Inflexión", content: analysisData.turningPoint },
                { title: "Estrategia Sugerida para el Futuro", content: analysisData.escapeStrategy },
            ];
            return (
                <div>
                     <p className="text-slate-400 mb-4 text-sm">Aquí tienes un análisis de la situación para ayudarte a reflexionar. Usa estos insights para fortalecerte.</p>
                     <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg">
                        {analysisItems.map(item => (
                            <div key={item.title}>
                                <h4 className="font-semibold text-teal-400 text-sm">{item.title}</h4>
                                <p className="text-slate-300 text-sm">{item.content}</p>
                            </div>
                        ))}
                     </div>
                     <button 
                        onClick={() => setShowAnalysis(false)}
                        className="w-full mt-4 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700"
                     >
                        Entendido, gracias
                     </button>
                </div>
            );
        }

        switch (status) {
            case 'active':
            case 'stopping':
                 return (
                    <div className="text-center">
                        <p className="text-slate-300 mb-4 text-sm">Modo Guardián activo. Kai está escuchando...</p>
                        <div className="flex justify-center items-center mb-4">
                            <div className="relative h-16 w-16">
                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                                <div className="relative h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
                                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onStop}
                            disabled={status === 'stopping'}
                            className="w-full bg-red-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-800"
                        >
                            {status === 'stopping' ? 'Deteniendo...' : 'Detener y Analizar'}
                        </button>
                    </div>
                );
            case 'analyzing':
            case 'starting':
                 return (
                    <div className="h-40 flex items-center justify-center text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                        <p className="ml-4 text-slate-400">{status === 'starting' ? 'Iniciando micrófono...' : 'Kai está preparando tu análisis...'}</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <p className="text-red-500 mb-4 text-sm">{error || "Ocurrió un error desconocido."}</p>
                         <button
                            onClick={handleStartClick}
                            className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-3 px-5 rounded-lg hover:bg-teal-600/30 transition-colors"
                        >
                            Intentar de Nuevo
                        </button>
                    </div>
                 );
            case 'idle':
            default:
                return (
                     <>
                        <p className="text-slate-400 mb-4 text-sm">Activa este modo en situaciones de alto riesgo. Kai escuchará discretamente para ayudarte a analizar los detonantes después.</p>
                        <button
                            onClick={handleStartClick}
                            className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-3 px-5 rounded-lg hover:bg-teal-600/30 transition-colors"
                        >
                            Activar Modo Guardián
                        </button>
                    </>
                );
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            {showConsent && <ConsentModal onAccept={handleAcceptConsent} onDecline={() => setShowConsent(false)} />}
            <div className="flex items-center space-x-3 mb-3">
                <ShieldIcon />
                <h2 className="text-xl font-bold text-slate-100">Modo Guardián</h2>
            </div>
            {renderContent()}
        </div>
    );
};

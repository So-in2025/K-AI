import React, { useState, useEffect } from 'react';
import { IGuardianAnalysis, GuardianAnalysisResult } from '../types';
import { UpgradeCard } from './UpgradeCard';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const ShieldIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944L12 22l9-1.056A12.02 12.02 0 0017.618 7.984z" /></svg> );
const TriggerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const SocialPressureIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const JustificationIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const TurningPointIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const EscapeStrategyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 18h4a2 2 0 002-2v-5a2 2 0 00-2-2h-4v-1a2 2 0 00-2-2h-2a2 2 0 00-2 2v1H9a2 2 0 00-2 2v5a2 2 0 002 2h4" /></svg>);

const ConsentModal: React.FC<{ onAccept: () => void; onDecline: () => void; }> = ({ onAccept, onDecline }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-teal-400 mb-3">Aviso de Privacidad del Modo Guardián</h2>
            <p className="text-slate-300 text-sm mb-4">Al activar el "Modo Guardián", la aplicación usará el micrófono de tu dispositivo para escuchar y transcribir el audio ambiental.</p>
            <ul className="list-disc list-inside text-sm text-slate-400 space-y-2 mb-4">
                <li>La transcripción se procesará para generar un análisis SÓLO para ti.</li>
                <li>El audio NO se almacena.</li>
                <li>La transcripción se elimina después del análisis.</li>
            </ul>
            <div className="flex gap-4">
                <button onClick={onDecline} className="flex-1 bg-slate-600 font-semibold py-2 rounded-lg">Cancelar</button>
                <button onClick={onAccept} className="flex-1 bg-teal-600 text-white font-semibold py-2 rounded-lg">Acepto</button>
            </div>
        </div>
    </div>
);

const GUARDIAN_CONSENT_KEY = 'guardianConsentGiven';

export const GuardianModeCard: React.FC = () => {
    const { userData, guardianState, startGuardian, stopGuardian, updateGuardianConfig, checkAndConsumeUsage } = useUser();
    const { status, analysis, error } = guardianState;
    const [showConsent, setShowConsent] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [localTriggers, setLocalTriggers] = useState((userData?.guardianTriggerWords || []).join(', '));
    
    useEffect(() => { if (analysis) setShowAnalysis(true); }, [analysis]);
    useEffect(() => { setLocalTriggers((userData?.guardianTriggerWords || []).join(', ')); }, [userData?.guardianTriggerWords]);

    const handleStartClick = () => {
        if (localStorage.getItem(GUARDIAN_CONSENT_KEY)) {
            startGuardian();
        } else {
            setShowConsent(true);
        }
    };

    const handleAcceptConsent = () => {
        localStorage.setItem(GUARDIAN_CONSENT_KEY, 'true');
        setShowConsent(false);
        startGuardian();
    };

    const handleSaveConfig = () => {
        const words = localTriggers.split(',').map(w => w.trim()).filter(Boolean);
        updateGuardianConfig(words);
        setIsEditingConfig(false);
    }
    
    if (!userData) return null;
    const isSubscribed = userData.isSubscribed || false;
    const canUseGuardian = isSubscribed || (userData.usageTracker?.guardian?.count || 0) < 1;

    const renderConfig = () => (
        <div className="mt-4">
            <label className="text-sm text-slate-300">Palabras de Alerta (separadas por coma)</label>
            <input 
                type="text" 
                value={localTriggers}
                onChange={(e) => setLocalTriggers(e.target.value)}
                className="w-full p-2 bg-slate-700 rounded-md mt-1"
                placeholder="Ej: beber, consumir, recaída"
            />
            <div className="flex gap-2 mt-2">
                <button onClick={() => setIsEditingConfig(false)} className="flex-1 bg-slate-600 py-1 rounded-md text-sm">Cancelar</button>
                <button onClick={handleSaveConfig} className="flex-1 bg-teal-600 text-white py-1 rounded-md text-sm">Guardar</button>
            </div>
        </div>
    );

    const renderAnalysisContent = (analysisData: IGuardianAnalysis) => (
        <div className="space-y-3">
            <div className="flex items-start"><TriggerIcon /><p className="text-sm"><strong>Detonante:</strong> {analysisData.trigger}</p></div>
            <div className="flex items-start"><SocialPressureIcon /><p className="text-sm"><strong>Presión Social:</strong> {analysisData.socialPressure}</p></div>
            <div className="flex items-start"><JustificationIcon /><p className="text-sm"><strong>Justificación:</strong> {analysisData.justification}</p></div>
            <div className="flex items-start"><TurningPointIcon /><p className="text-sm"><strong>Punto de Inflexión:</strong> {analysisData.turningPoint}</p></div>
            <div className="flex items-start"><EscapeStrategyIcon /><p className="text-sm"><strong>Estrategia de Evitación:</strong> {analysisData.escapeStrategy}</p></div>
        </div>
    );

    const renderContent = () => {
        if (showAnalysis && analysis) {
            if ('isLocked' in analysis && analysis.isLocked) {
                 return <UpgradeCard />;
            }
            return (
                <div>
                    <p className="text-slate-400 mb-4 text-sm">Aquí tienes un análisis de la situación para ayudarte a reflexionar.</p>
                    {renderAnalysisContent(analysis as IGuardianAnalysis)}
                    <button onClick={() => setShowAnalysis(false)} className="w-full mt-4 bg-slate-600 text-white font-semibold py-2 rounded-lg">Entendido</button>
                </div>
            );
        }

        switch (status) {
            case 'active': return (
                <div className="text-center">
                    <p className="text-slate-300 mb-4 text-sm">Modo Guardián activo...</p>
                    <button onClick={stopGuardian} className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg">Detener y Analizar</button>
                </div>
            );
            case 'analyzing':
            case 'starting': return <div className="h-20 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div></div>;
            case 'error': return <p className="text-red-500">{error}</p>;
            default: return (
                 <>
                    <p className="text-slate-400 mb-4 text-sm">Activa este modo en situaciones de alto riesgo. Kai escuchará para ayudarte a analizar los detonantes después.</p>
                    <button onClick={handleStartClick} disabled={!canUseGuardian} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-3 rounded-lg disabled:opacity-50">Activar Modo Guardián</button>
                    {!isSubscribed && <p className="text-xs text-center text-slate-500 mt-2">Te queda {(1 - (userData.usageTracker?.guardian?.count || 0))} análisis gratuito este mes.</p>}
                 </>
            );
        }
    };

    return (
        <div className={`bg-slate-800 p-6 rounded-2xl shadow-lg relative ${status === 'active' ? 'ring-2 ring-red-500/50' : ''}`}>
            {showConsent && <ConsentModal onAccept={handleAcceptConsent} onDecline={() => setShowConsent(false)} />}
            <TtsInfoButton explanation="El Modo Guardián es una herramienta de autoconocimiento. Cuando lo activas, usa el micrófono para transcribir el ambiente. Después, Kai analiza la conversación para ayudarte a identificar detonantes, presión social y puntos de inflexión." />
            <div className="flex items-center space-x-3 mb-3">
                <ShieldIcon />
                <h2 className="text-xl font-bold text-slate-100">Modo Guardián</h2>
            </div>
            {renderContent()}
        </div>
    );
};

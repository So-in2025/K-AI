
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { ITrustCircleConfig } from '../types';
import { TtsInfoButton } from './TtsInfoButton';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" />
    </svg>
);

export const TrustCircleCard: React.FC = () => {
    const { userData, updateUserData } = useUser();
    const [config, setConfig] = useState<ITrustCircleConfig>(userData?.trustCircleConfig || {
        contactName: '',
        contactEmail: '',
        sendWeeklyReport: false,
        sendCravingAlerts: false,
    });
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        updateUserData({ trustCircleConfig: config });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleChange = (field: keyof ITrustCircleConfig, value: string | boolean) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="La recuperación es más fácil con apoyo. Aquí puedes designar a una persona de confianza para que reciba informes de tu progreso o alertas si necesitas ayuda. Es tu red de seguridad personal." />
            <div className="flex items-center space-x-3 mb-3">
                <UsersIcon />
                <h2 className="text-xl font-bold text-slate-100">Círculo de Confianza</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Configura un contacto para compartir tu progreso o enviar alertas.
            </p>
            
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Nombre del contacto"
                    value={config.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm"
                />
                <input
                    type="email"
                    placeholder="Email del contacto"
                    value={config.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm"
                />
                <label className="flex items-center space-x-2 text-sm text-slate-300">
                    <input type="checkbox" checked={config.sendWeeklyReport} onChange={(e) => handleChange('sendWeeklyReport', e.target.checked)} className="form-checkbox bg-slate-700 border-slate-600 text-teal-500" />
                    <span>Enviar reporte semanal</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-300">
                    <input type="checkbox" checked={config.sendCravingAlerts} onChange={(e) => handleChange('sendCravingAlerts', e.target.checked)} className="form-checkbox bg-slate-700 border-slate-600 text-teal-500" />
                    <span>Enviar alerta de SOS Craving</span>
                </label>
            </div>
            
            <div className="flex justify-end items-center mt-4">
                {isSaved && <p className="text-sm text-green-400 mr-4">Guardado.</p>}
                <button onClick={handleSave} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm">
                    Guardar Configuración
                </button>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { ITrustCircleConfig, ICraving, IWellnessActivity } from '../types';
import { TtsInfoButton } from './TtsInfoButton';

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197" />
    </svg>
);

interface TrustCircleCardProps {
    config: ITrustCircleConfig | null;
    onUpdateConfig: (config: ITrustCircleConfig) => void;
    cravings: ICraving[];
    daysSober: number;
    wellnessLog: IWellnessActivity[];
}

export const TrustCircleCard: React.FC<TrustCircleCardProps> = ({ config, onUpdateConfig, cravings, daysSober, wellnessLog }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<ITrustCircleConfig>(
        config || { contactName: '', contactEmail: '', sendWeeklyReport: true, sendCravingAlerts: false }
    );

    const handleSave = () => {
        onUpdateConfig(currentConfig);
        setIsEditing(false);
    };

    const generateWeeklyReport = () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const cravingsThisWeek = cravings.filter(c => new Date(c.date) >= oneWeekAgo);
        const wellnessThisWeek = wellnessLog.filter(w => new Date(w.date) >= oneWeekAgo);

        const subject = `Informe Semanal de Progreso en KIA`;
        let body = `Hola ${currentConfig.contactName},\n\nAquí tienes un resumen del progreso de esta semana:\n\n`;
        body += `Días de progreso: ${daysSober}\n`;
        body += `Antojos registrados esta semana: ${cravingsThisWeek.length}\n`;
        body += `Actividades de bienestar completadas: ${wellnessThisWeek.length}\n\n`;
        body += `Este informe se genera desde la app KIA como parte de un Círculo de Confianza, para mantenerte informado y poder ofrecer tu apoyo.\n\n`;
        body += `Un saludo,\nEl equipo de KIA`;
        
        return `mailto:${currentConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (!isEditing && !config) {
        return (
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
                <TtsInfoButton explanation="La sanación es más fuerte en comunidad. Esta herramienta te permite configurar a una persona de tu confianza para compartir tu progreso. Para proteger tu privacidad al máximo, KIA nunca enviará un correo automáticamente. En su lugar, preparará un borrador para que seas tú quien revise y envíe el informe desde tu propio email." />
                <div className="flex items-center space-x-3 mb-3">
                    <UsersIcon />
                    <h2 className="text-xl font-bold text-slate-100">Círculo de Confianza</h2>
                </div>
                <p className="text-slate-400 mb-4 text-sm">La recuperación es más fuerte en comunidad. Invita a alguien de confianza (terapeuta, familiar, amigo) para compartir tu progreso de forma segura.</p>
                <button onClick={() => setIsEditing(true)} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg hover:bg-teal-600/30">
                    Configurar mi Círculo
                </button>
            </div>
        );
    }
    
    return (
         <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="La sanación es más fuerte en comunidad. Esta herramienta te permite configurar a una persona de tu confianza para compartir tu progreso. Para proteger tu privacidad al máximo, KIA nunca enviará un correo automáticamente. En su lugar, preparará un borrador para que seas tú quien revise y envíe el informe desde tu propio email." />
            <div className="flex items-center space-x-3 mb-3">
                <UsersIcon />
                <h2 className="text-xl font-bold text-slate-100">Círculo de Confianza</h2>
            </div>
            {isEditing ? (
                 <div className="space-y-4">
                     <div>
                         <label className="text-sm font-semibold">Nombre del contacto</label>
                         <input type="text" value={currentConfig.contactName} onChange={e => setCurrentConfig(c => ({...c, contactName: e.target.value}))} className="w-full mt-1 p-2 bg-slate-700 rounded-md" />
                     </div>
                     <div>
                         <label className="text-sm font-semibold">Email del contacto</label>
                         <input type="email" value={currentConfig.contactEmail} onChange={e => setCurrentConfig(c => ({...c, contactEmail: e.target.value}))} className="w-full mt-1 p-2 bg-slate-700 rounded-md" />
                     </div>
                     <label className="flex items-center space-x-2"><input type="checkbox" checked={currentConfig.sendWeeklyReport} onChange={e => setCurrentConfig(c => ({...c, sendWeeklyReport: e.target.checked}))} className="h-4 w-4 text-teal-500" /> <span className="text-sm">Enviar informes semanales</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={currentConfig.sendCravingAlerts} disabled onChange={e => setCurrentConfig(c => ({...c, sendCravingAlerts: e.target.checked}))} className="h-4 w-4 text-teal-500" /> <span className="text-sm text-slate-500">Alertas de antojos intensos (próximamente)</span></label>
                     <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-600 font-semibold py-2 rounded-lg">Cancelar</button>
                        <button onClick={handleSave} className="flex-1 bg-teal-600 font-semibold text-white py-2 rounded-lg">Guardar</button>
                     </div>
                 </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-slate-400">Tu persona de confianza es <span className="font-semibold text-teal-300">{config?.contactName}</span>.</p>
                    <a href={generateWeeklyReport()} target="_blank" rel="noopener noreferrer" className="block text-center w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">
                        Enviar Informe Semanal Ahora
                    </a>
                    <button onClick={() => setIsEditing(true)} className="w-full text-xs text-slate-400 hover:underline">Editar configuración</button>
                </div>
            )}
         </div>
    );
};

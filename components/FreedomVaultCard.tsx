import React, { useState, useMemo } from 'react';
import { IFreedomVaultConfig } from '../types';
import { TtsInfoButton } from './TtsInfoButton';

const VaultIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

interface FreedomVaultCardProps {
    config: IFreedomVaultConfig | null;
    onUpdateConfig: (config: IFreedomVaultConfig) => void;
    daysSober: number;
}

export const FreedomVaultCard: React.FC<FreedomVaultCardProps> = ({ config, onUpdateConfig, daysSober }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<IFreedomVaultConfig>(
        config || { weeklySpending: 0, goalAmount: 1000, goalDescription: '' }
    );

    const handleSave = () => {
        onUpdateConfig(currentConfig);
        setIsEditing(false);
    };

    const moneyRecovered = useMemo(() => {
        if (!config || config.weeklySpending <= 0) return 0;
        const dailySpending = config.weeklySpending / 7;
        return dailySpending * daysSober;
    }, [config, daysSober]);
    
    const progressPercentage = useMemo(() => {
        if (!config || config.goalAmount <= 0) return 0;
        return Math.min(100, (moneyRecovered / config.goalAmount) * 100);
    }, [moneyRecovered, config]);
    
    const equivalentCoffees = useMemo(() => {
        // Assuming an average coffee price of 3 units of local currency
        const coffeePrice = 3; 
        if (moneyRecovered <= 0) return 0;
        return Math.floor(moneyRecovered / coffeePrice);
    }, [moneyRecovered]);

    if (!isEditing && !config) {
        return (
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
                <TtsInfoButton explanation="Esta herramienta es tu alquimista personal. Te ayuda a visualizar cómo tu esfuerzo de recuperación se transmuta en recursos tangibles. Al registrar lo que gastabas, cada día de progreso se convierte en dinero recuperado, acercándote a los sueños que el vicio te había alejado. Es la prueba de que estás convirtiendo tu pasado en tu futuro." />
                <div className="flex items-center space-x-3 mb-3">
                    <VaultIcon />
                    <h2 className="text-xl font-bold text-slate-100">Bóveda de la Libertad</h2>
                </div>
                <p className="text-slate-400 mb-4 text-sm">Transmuta tu recuperación en tus sueños. Calcula el dinero que estás recuperando y ponle un objetivo.</p>
                <button onClick={() => setIsEditing(true)} className="w-full bg-teal-600/20 border border-teal-500 text-teal-300 font-semibold py-2 px-4 rounded-lg hover:bg-teal-600/30">
                    Configurar mi Bóveda
                </button>
            </div>
        );
    }
    
    return (
         <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Esta herramienta es tu alquimista personal. Te ayuda a visualizar cómo tu esfuerzo de recuperación se transmuta en recursos tangibles. Al registrar lo que gastabas, cada día de progreso se convierte en dinero recuperado, acercándote a los sueños que el vicio te había alejado. Es la prueba de que estás convirtiendo tu pasado en tu futuro." />
            <div className="flex items-center space-x-3 mb-3">
                <VaultIcon />
                <h2 className="text-xl font-bold text-slate-100">Bóveda de la Libertad</h2>
            </div>
            {isEditing ? (
                 <div className="space-y-4">
                     <div>
                         <label className="text-sm font-semibold">Gasto semanal promedio (en tu moneda)</label>
                         <input type="number" value={currentConfig.weeklySpending} onChange={e => setCurrentConfig(c => ({...c, weeklySpending: Number(e.target.value)}))} className="w-full mt-1 p-2 bg-slate-700 rounded-md" />
                     </div>
                     <div>
                         <label className="text-sm font-semibold">Descripción de tu meta</label>
                         <input type="text" placeholder="Ej: Viaje, pagar deuda, un instrumento..." value={currentConfig.goalDescription} onChange={e => setCurrentConfig(c => ({...c, goalDescription: e.target.value}))} className="w-full mt-1 p-2 bg-slate-700 rounded-md" />
                     </div>
                      <div>
                         <label className="text-sm font-semibold">Costo de tu meta</label>
                         <input type="number" value={currentConfig.goalAmount} onChange={e => setCurrentConfig(c => ({...c, goalAmount: Number(e.target.value)}))} className="w-full mt-1 p-2 bg-slate-700 rounded-md" />
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-600 font-semibold py-2 rounded-lg">Cancelar</button>
                        <button onClick={handleSave} className="flex-1 bg-teal-600 font-semibold text-white py-2 rounded-lg">Guardar</button>
                     </div>
                 </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-center">
                        <span className="text-3xl font-bold text-green-400">${moneyRecovered.toFixed(2)}</span>
                        <span className="text-sm text-slate-400 block">Dinero Recuperado</span>
                    </p>
                    {equivalentCoffees > 0 && (
                        <p className="text-center text-xs text-green-300/70">
                            Equivalente a {equivalentCoffees} café{equivalentCoffees > 1 ? 's' : ''} que has invertido en ti.
                        </p>
                    )}
                    {config && config.goalAmount > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-center text-slate-200">Meta: {config.goalDescription}</p>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-center text-slate-400 mt-1">{progressPercentage.toFixed(1)}% completado</p>
                        </div>
                    )}
                    <button onClick={() => setIsEditing(true)} className="w-full text-xs text-slate-400 hover:underline pt-2">Editar configuración</button>
                </div>
            )}
         </div>
    );
};

import React, { useState, useMemo } from 'react';
import { ICraving } from '../types';
import { LogCravingModal } from './LogCravingModal';

const WaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8s4-4 8 0 8 4 8 4-4-4-8 0-8 4-8 4zM4 14s4-4 8 0 8 4 8 4-4-4-8 0-8 4-8 4z" />
    </svg>
);

interface CravingTrackerCardProps {
    cravings: ICraving[];
    onLogCraving: (craving: ICraving) => void;
}

export const CravingTrackerCard: React.FC<CravingTrackerCardProps> = ({ cravings, onLogCraving }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const chartData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const data: { day: string; count: number }[] = [];
        const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const dayOfWeek = dayLabels[date.getDay()];
            const label = i === 0 ? 'Hoy' : dayOfWeek;
            
            const count = cravings.filter(craving => {
                const cravingDate = new Date(craving.date);
                cravingDate.setHours(0, 0, 0, 0);
                return cravingDate.getTime() === date.getTime();
            }).length;

            data.push({ day: label, count });
        }
        return data;
    }, [cravings]);

    const maxCount = useMemo(() => {
        const counts = chartData.map(d => d.count);
        const max = Math.max(...counts);
        return max === 0 ? 1 : max;
    }, [chartData]);

    const totalLast7Days = useMemo(() => chartData.reduce((sum, day) => sum + day.count, 0), [chartData]);

    const isToday = (someDate: Date) => {
        const today = new Date();
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear();
    };

    const cravingsToday = cravings.filter(c => isToday(new Date(c.date))).length;
    
    const handleLogSuccess = (cravingData: ICraving) => {
        onLogCraving(cravingData);
        setIsModalOpen(false);
    };

    return (
        <>
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
                <WaveIcon />
                <h2 className="text-xl font-bold text-slate-100">Registro de Antojos</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Reconocer un antojo es un paso de poder. Regístralo para visualizar y entender tus patrones.</p>
            
            <div className="bg-slate-900 rounded-lg p-4 flex justify-around text-center mb-4">
                <div>
                    <p className="text-2xl font-bold text-teal-400">{cravingsToday}</p>
                    <p className="text-xs text-slate-400">Hoy</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-teal-400">{cravings.length}</p>
                    <p className="text-xs text-slate-400">Total</p>
                </div>
            </div>
            
            <div className="mt-6 mb-4">
                <h3 className="text-md font-semibold text-slate-200 mb-3 text-center">Antojos en la Última Semana</h3>
                {totalLast7Days > 0 ? (
                    <div className="flex justify-around items-end h-32 bg-slate-900/50 p-3 rounded-lg" aria-label="Gráfica de antojos de los últimos 7 días">
                        {chartData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center h-full justify-end w-1/7 text-center">
                                <span className="text-xs font-bold text-slate-300" aria-label={`${data.count} antojos`}>{data.count}</span>
                                <div 
                                    className="w-4 md:w-6 bg-teal-400 rounded-t-sm hover:bg-teal-500 transition-colors"
                                    style={{ height: `${(data.count / maxCount) * 80}%` }}
                                    title={`${data.count} antojo(s) el día ${data.day}`}
                                ></div>
                                <span className="text-xs text-slate-400 mt-1" aria-hidden="true">{data.day}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg">
                        ¡Felicidades! Ningún antojo registrado en los últimos 7 días.
                    </div>
                )}
            </div>
            
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-teal-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors mt-2"
            >
                Registrar Antojo
            </button>
        </div>
        {isModalOpen && (
            <LogCravingModal 
                onClose={() => setIsModalOpen(false)}
                onLogCraving={handleLogSuccess}
            />
        )}
        </>
    );
};
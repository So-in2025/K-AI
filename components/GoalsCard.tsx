import React from 'react';
import { IGoal, GoalType } from '../types';
import { TtsInfoButton } from './TtsInfoButton';

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
        <path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0" />
    </svg>
);

interface GoalsCardProps {
    goals: IGoal[];
    onGenerateGoal: (type: GoalType) => void;
    isLoading: boolean;
}

export const GoalsCard: React.FC<GoalsCardProps> = ({ goals, onGenerateGoal, isLoading }) => {
    const renderGoal = (type: GoalType) => {
        const goal = goals.find(g => g.type === type);
        const typeLabel = type === 'daily' ? 'Diaria' : type === 'weekly' ? 'Semanal' : 'Mensual';
        return (
            <div className="bg-slate-700/50 p-3 rounded-lg min-h-[60px]">
                <h4 className="font-semibold text-slate-200 capitalize">{typeLabel}</h4>
                {goal ? <p className="text-sm text-slate-300">{goal.content}</p> : <p className="text-sm text-slate-500 italic">Pide a Kai tu meta.</p>}
            </div>
        );
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Esta herramienta convierte tu progreso en un plan de acción. Kai analiza tus datos recientes para generar metas S.M.A.R.T.: específicas, medibles, alcanzables, relevantes y con un plazo. Usa estos objetivos para darte una dirección clara y enfocada cada día, semana y mes." />
            <div className="flex items-center space-x-3 mb-3">
                <TargetIcon />
                <h2 className="text-xl font-bold text-slate-100">Mis Metas con IA</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Pide a Kai que genere metas personalizadas basadas en tu progreso para darte un camino claro.</p>

            {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                    <p className="ml-3 text-slate-400">Kai está creando tus metas...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {renderGoal('daily')}
                    {renderGoal('weekly')}
                    {renderGoal('monthly')}
                </div>
            )}
            
            <div className="flex justify-between gap-2 mt-4">
                <button onClick={() => onGenerateGoal('daily')} disabled={isLoading} className="flex-1 bg-slate-700 text-slate-200 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-slate-600 transition disabled:opacity-50">Diaria</button>
                <button onClick={() => onGenerateGoal('weekly')} disabled={isLoading} className="flex-1 bg-slate-700 text-slate-200 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-slate-600 transition disabled:opacity-50">Semanal</button>
                <button onClick={() => onGenerateGoal('monthly')} disabled={isLoading} className="flex-1 bg-slate-700 text-slate-200 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-slate-600 transition disabled:opacity-50">Mensual</button>
            </div>
        </div>
    );
};

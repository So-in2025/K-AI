import React from 'react';
import { TtsInfoButton } from './TtsInfoButton';
import { useUser } from '../contexts/UserContext';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);


interface GardenStageProps {
    stage: number;
    points: number;
}

const GardenStage: React.FC<GardenStageProps> = ({ stage, points }) => {
    const stageInfo = [
        { name: "Semilla", points: 0, description: "Tu viaje apenas comienza." },
        { name: "Brote", points: 10, description: "Tu constancia está dando sus primeros frutos." },
        { name: "Planta Joven", points: 30, description: "Las primeras hojas muestran tu resiliencia." },
        { name: "Planta Fuerte", points: 70, description: "Has superado desafíos." },
        { name: "Primeras Flores", points: 150, description: "La belleza de tu esfuerzo." },
        { name: "Árbol Joven", points: 300, description: "Tus raíces son profundas." },
        { name: "Árbol Frondoso", points: 500, description: "Un testamento a tu crecimiento." },
    ];

    const currentStage = stageInfo[stage];
    const nextStage = stageInfo[stage + 1];
    const progressToNext = nextStage ? Math.round(((points - currentStage.points) / (nextStage.points - currentStage.points)) * 100) : 100;

    return (
        <div className="text-center">
            <h3 className="text-lg font-semibold text-white">{currentStage.name}</h3>
            <p className="text-xs text-slate-400 mb-2">{currentStage.description}</p>
            {nextStage && (
                <div className="px-4">
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progressToNext}%` }}></div></div>
                    <p className="text-xs text-slate-500">{nextStage.points - points} puntos para: {nextStage.name}</p>
                </div>
            )}
        </div>
    );
};

const GardenVisual: React.FC<{ stage: number }> = ({ stage }) => {
    // Stage 0: Seed, 1: Sprout, 2: Small Plant, 3: Bushy Plant, 4: Flower, 5: Small Tree, 6: Big Tree
    const stages = [
        <circle key="0" cx="12" cy="18" r="2" fill="#8B4513" />, // Seed
        <g key="1"><circle cx="12" cy="18" r="2" fill="#8B4513" /><path d="M12 18 v-4 a2 2 0 0 1 2 2 a2 2 0 0 1 -2 2" fill="#34D399" /></g>, // Sprout
        <g key="2"><path d="M12 18 v-6" stroke="#059669" strokeWidth="2"/><path d="M10 14 l2 -2 l2 2" stroke="#10B981" fill="none" strokeWidth="1.5"/><path d="M9 11 l3 -3 l3 3" stroke="#10B981" fill="none" strokeWidth="1.5"/></g>, // Small Plant
        <g key="3"><path d="M12 18 v-7" stroke="#047857" strokeWidth="2.5"/><path d="M8 15 a4 4 0 0 1 8 0 Z" fill="#10B981" /><path d="M7 12 a5 5 0 0 1 10 0 Z" fill="#34D399" /></g>, // Bushy Plant
        <g key="4"><path d="M12 18 v-7" stroke="#047857" strokeWidth="2.5"/><path d="M8 15 a4 4 0 0 1 8 0 Z" fill="#10B981" /><path d="M7 12 a5 5 0 0 1 10 0 Z" fill="#34D399" /><circle cx="12" cy="8" r="2" fill="#F472B6" /></g>, // Flower
        <g key="5"><rect x="11" y="10" width="2" height="8" fill="#8B4513" /><circle cx="12" cy="7" r="4" fill="#10B981" /></g>, // Small Tree
        <g key="6"><rect x="10.5" y="9" width="3" height="9" fill="#8B4513" /><circle cx="12" cy="6" r="6" fill="#10B981" /><circle cx="9" cy="7" r="4" fill="#34D399" /><circle cx="15" cy="7" r="4" fill="#34D399" /></g>, // Big Tree
    ];

    return (
        <div className="h-40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-32 h-32">
                {stages[Math.min(stage, stages.length - 1)]}
                <path d="M4 19 h16" stroke="#4A5568" strokeWidth="1" />
            </svg>
        </div>
    );
};

export const InnerGardenCard: React.FC = () => {
    const { userData, daysSober } = useUser();
    
    // Combine growth points from direct tracking and days sober for a consistent view
    const growthPoints = Math.max(userData?.gardenGrowthPoints || 0, daysSober);

    const getStage = (points: number): number => {
        if (points >= 500) return 6;
        if (points >= 300) return 5;
        if (points >= 150) return 4;
        if (points >= 70) return 3;
        if (points >= 30) return 2;
        if (points >= 10) return 1;
        return 0;
    };

    const currentStage = getStage(growthPoints);
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
             <TtsInfoButton explanation="Tu Jardín Interior es una metáfora visual de tu sanación. Ganas 'puntos de crecimiento' con cada día de progreso y cada actividad de bienestar. Observa cómo tu jardín evoluciona de una semilla a un árbol frondoso." />
             <div className="flex items-center space-x-3 mb-3">
                <SunIcon />
                <h2 className="text-xl font-bold text-slate-100">Mi Jardín Interior</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Este jardín crece contigo. Cada día de progreso y cada ejercicio completado lo hacen florecer.</p>

            <div className="bg-slate-900/50 rounded-lg p-4">
                <GardenVisual stage={currentStage} />
                <GardenStage stage={currentStage} points={growthPoints} />
            </div>
        </div>
    );
};

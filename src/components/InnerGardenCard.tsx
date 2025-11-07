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

const GardenVisual: React.FC<{ stage: number }> = ({ stage }) => { /* ... SVG visual remains the same ... */ };

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

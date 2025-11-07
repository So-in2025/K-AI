
import React from 'react';
import { TtsInfoButton } from './TtsInfoButton';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

interface InnerGardenCardProps {
    growthPoints: number;
}

const GardenStage: React.FC<{ stage: number; points: number }> = ({ stage, points }) => {
    const stageInfo = [
        { name: "Semilla", points: 0, description: "Tu viaje apenas comienza. Cada acción es una gota de agua para tu semilla." },
        { name: "Brote", points: 10, description: "¡Mira! Algo ha empezado a crecer. Tu constancia está dando sus primeros frutos." },
        { name: "Planta Joven", points: 30, description: "Tu jardín está tomando forma. Las primeras hojas muestran tu resiliencia." },
        { name: "Planta Fuerte", points: 70, description: "Tu planta es más fuerte, con un tallo robusto. Has superado desafíos." },
        { name: "Primeras Flores", points: 150, description: "La belleza de tu esfuerzo. Las primeras flores simbolizan tus logros." },
        { name: "Árbol Joven", points: 300, description: "Tus raíces son profundas. Estás construyendo una base sólida y duradera." },
        { name: "Árbol Frondoso", points: 500, description: "Tu jardín es un refugio. Ofrece sombra y serenidad, un testamento a tu crecimiento." },
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
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progressToNext}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500">
                        {nextStage.points - points} puntos para el siguiente nivel: {nextStage.name}
                    </p>
                </div>
            )}
        </div>
    );
};

const GardenVisual: React.FC<{ stage: number }> = ({ stage }) => {
    return (
        <div className="relative w-full h-48 flex items-end justify-center overflow-hidden">
            {/* Ground */}
            <svg viewBox="0 0 200 50" className="absolute bottom-0 w-full h-1/2">
                <path d="M0 50 C 50 20, 150 20, 200 50 Z" fill="#64748b" />
                <path d="M0 50 C 50 30, 150 30, 200 50 Z" fill="#475569" />
            </svg>

            {/* Stage visuals */}
            <div className="z-10 transition-all duration-1000">
                {/* Seed */}
                {stage === 0 && <div className="w-4 h-4 bg-yellow-900 rounded-full animate-pulse"></div>}
                
                {/* Sprout */}
                {stage >= 1 && (
                     <svg viewBox="0 0 20 30" className={`h-12 transition-opacity duration-1000 ${stage === 1 ? 'opacity-100' : 'opacity-50'}`}>
                        <path d="M10 30 C 15 20, 5 15, 10 0" stroke="#4ade80" fill="none" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                )}
                 
                 {/* Young Plant */}
                 {stage >= 2 && (
                     <svg viewBox="0 0 40 50" className={`h-24 absolute bottom-8 transition-opacity duration-1000 ${stage === 2 ? 'opacity-100' : 'opacity-50'}`}>
                         <path d="M20 50 C 25 30, 15 25, 20 0" stroke="#22c55e" fill="none" strokeWidth="3" strokeLinecap="round" />
                         <path d="M20 20 C 35 25, 30 10, 20 20" stroke="#22c55e" fill="#22c55e" />
                         <path d="M20 25 C 5 30, 10 15, 20 25" stroke="#22c55e" fill="#22c55e" />
                     </svg>
                 )}

                {/* Stronger Plant & Flowers */}
                 {stage >= 3 && (
                    <svg viewBox="0 0 60 80" className={`h-32 absolute bottom-8 transition-opacity duration-1000 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                        <path d="M30 80 C 40 50, 20 40, 30 0" stroke="#16a34a" fill="none" strokeWidth="4" strokeLinecap="round" />
                        <path d="M30 40 C 55 45, 50 20, 30 40" stroke="#16a34a" fill="#16a34a" />
                        <path d="M30 50 C 5 55, 10 30, 30 50" stroke="#16a34a" fill="#16a34a" />
                        {stage >= 4 && (
                            <>
                            <circle cx="50" cy="25" r="5" fill="#f472b6" className="animate-pulse" />
                            <circle cx="15" cy="35" r="4" fill="#a78bfa" className="animate-pulse animation-delay-300" />
                            </>
                        )}
                    </svg>
                 )}

                 {/* Tree */}
                 {stage >= 5 && (
                     <svg viewBox="0 0 100 120" className={`h-40 absolute bottom-8 transition-opacity duration-1000 ${stage >= 5 ? 'opacity-100' : 'opacity-0'}`}>
                         <rect x="45" y="50" width="10" height="70" fill="#78350f" />
                         <circle cx="50" cy="35" r="30" fill="#15803d" />
                         <circle cx="35" cy="45" r="20" fill="#16a34a" />
                          <circle cx="65" cy="45" r="20" fill="#16a34a" />
                          {stage >= 6 && (
                            <>
                            <circle cx="25" cy="20" r="15" fill="#15803d" />
                            <circle cx="75" cy="20" r="15" fill="#15803d" />
                            </>
                          )}
                     </svg>
                 )}
            </div>
        </div>
    );
};

export const InnerGardenCard: React.FC<InnerGardenCardProps> = ({ growthPoints }) => {
    
    const getStage = (points: number): number => {
        if (points >= 500) return 6; // Frondoso
        if (points >= 300) return 5; // Joven
        if (points >= 150) return 4; // Flores
        if (points >= 70) return 3; // Fuerte
        if (points >= 30) return 2; // Planta Joven
        if (points >= 10) return 1; // Brote
        return 0; // Semilla
    };

    const currentStage = getStage(growthPoints);
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
             <TtsInfoButton explanation="Tu Jardín Interior es una metáfora visual de tu sanación. Ganas 'puntos de crecimiento' con cada día de progreso y cada actividad de bienestar que completas. Observa cómo tu jardín evoluciona de una semilla a un árbol frondoso, un recordatorio tangible de tu dedicación y de la vida que estás cultivando." />
             <div className="flex items-center space-x-3 mb-3">
                <SunIcon />
                <h2 className="text-xl font-bold text-slate-100">Mi Jardín Interior</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Este jardín crece contigo. Cada día de progreso, cada ejercicio completado y cada reflexión en tu diario lo hacen florecer.</p>

            <div className="bg-slate-900/50 rounded-lg p-4">
                <GardenVisual stage={currentStage} />
                <GardenStage stage={currentStage} points={growthPoints} />
            </div>
        </div>
    );
};

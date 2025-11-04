
import React from 'react';

const IntrospectionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l-2.5 2.5" />
    </svg>
);


const AwarenessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);


const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06M3 10h.01M3 14h.01M12 3v.01M12 21v.01M7 4.99L7.01 5M7 19l-.01.01" />
    </svg>
);


export const UpgradeCard: React.FC = () => {
    const introspectionFeatures = [
        "Análisis del Modo Guardián",
        "Informes de Patrones Avanzados",
        "Análisis Semanales con Kai"
    ];

    const awarenessFeatures = [
        "Memoria a largo plazo de Kai",
        "Biblioteca completa de Meditaciones",
        "Generación de Metas Inteligentes"
    ];

    const handleUpgrade = () => {
        const activationCode = crypto.randomUUID();
        localStorage.setItem('activationCode', activationCode);
        
        // **IMPORTANTE**: Reemplaza 'TU_USUARIO_CAFECITO' con tu nombre de usuario real de Cafecito.
        const cafecitoUser = 'TU_USUARIO_CAFECITO'; 
        
        const cafecitoMessage = `Quiero activar KIA Plus. Mi código de activación es: ${activationCode}`;
        const cafecitoUrl = `https://cafecito.app/${cafecitoUser}?message=${encodeURIComponent(cafecitoMessage)}`;
        
        window.open(cafecitoUrl, '_blank');
    };

    return (
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl shadow-lg border border-teal-500/50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">Desbloquea KIA Plus</h2>
                <p className="text-slate-300 mt-2">Apoya este proyecto con una donación y profundiza en tu viaje con herramientas avanzadas.</p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Introspection Column */}
                <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg text-indigo-300 flex items-center mb-3">
                        <IntrospectionIcon />
                        <span className="ml-2">Introspección Profunda</span>
                    </h3>
                    <ul className="space-y-2 text-sm">
                        {introspectionFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center text-slate-200">
                                <svg className="h-4 w-4 mr-2 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Awareness Column */}
                <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg text-teal-300 flex items-center mb-3">
                        <AwarenessIcon />
                        <span className="ml-2">Conciencia Activa</span>
                    </h3>
                    <ul className="space-y-2 text-sm">
                        {awarenessFeatures.map((feature, index) => (
                             <li key={index} className="flex items-center text-slate-200">
                                <svg className="h-4 w-4 mr-2 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <button 
                onClick={handleUpgrade}
                className="w-full mt-6 bg-teal-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors shadow-lg flex items-center justify-center">
                <BrainIcon />
                <span className="ml-2">Actualizar Ahora con Cafecito</span>
            </button>
        </div>
    );
};

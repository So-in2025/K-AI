
import React, { useState, useEffect } from 'react';

const IntrospectionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l-2.5 2.5" />
    </svg>
);

const AwarenessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-300" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 13.94A8.5 8.5 0 014.06 4.06M4.06 13.94A8.5 8.5 0 0117.94 4.06M3 10h.01M3 14h.01M12 3v.01M12 21v.01M7 4.99L7.01 5M7 19l-.01.01" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PaymentModal: React.FC<{ activationCode: string; onClose: () => void; }> = ({ activationCode, onClose }) => {
    const kofiUser = 'soin520530';
    const kofiMessage = `Quiero activar KIA Plus. Mi código de activación es: ${activationCode}`;
    // CORRECTED: Using the official Ko-fi widget embed URL to prevent 404 errors.
    const embedUrl = `https://ko-fi.com/${kofiUser}/?hidefeed=true&widget=true&embed=true&preview=true&message=${encodeURIComponent(kofiMessage)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-100">Apoya a KIA</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>
                <div className="flex-grow">
                    <iframe 
                        src={embedUrl}
                        className="w-full h-full"
                        title="Apoya a KIA en Ko-fi"
                    />
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};


export const UpgradeCard: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activationCode, setActivationCode] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Using a threshold of 768px to determine mobile view
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
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
        const newActivationCode = crypto.randomUUID();
        localStorage.setItem('activationCode', newActivationCode);
        setActivationCode(newActivationCode);

        if (isMobile) {
            const kofiUser = 'soin520530'; 
            const kofiMessage = `Quiero activar KIA Plus. Mi código de activación es: ${newActivationCode}`;
            const kofiUrl = `https://ko-fi.com/${kofiUser}?&message=${encodeURIComponent(kofiMessage)}`;
            window.open(kofiUrl, '_blank');
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl shadow-lg border border-teal-500/50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">Tu Apoyo Sostiene Este Espacio Seguro</h2>
                    <p className="text-slate-300 mt-2 text-sm max-w-xl mx-auto">
                        KIA es un proyecto nacido del corazón, creado para ser un refugio y una herramienta de sanación gratuita. Mantener este espacio seguro, libre de anuncios y en constante mejora requiere dedicación y recursos. Tu donación nos ayuda directamente a cubrir los costos y a seguir desarrollando nuevas herramientas para todos.
                    </p>
                </div>
                
                 <div className="mt-6 text-center">
                    <p className="text-slate-200 font-semibold">Como agradecimiento, tu donación desbloquea las herramientas de KIA Plus:</p>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg text-indigo-300 flex items-center mb-3">
                            <IntrospectionIcon />
                            <span className="ml-2">Introspección Profunda</span>
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {introspectionFeatures.map((feature, index) => (
                                <li key={index} className="flex items-center text-slate-200">
                                    <svg className="h-4 w-4 mr-2 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg text-teal-300 flex items-center mb-3">
                            <AwarenessIcon />
                            <span className="ml-2">Conciencia Activa</span>
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {awarenessFeatures.map((feature, index) => (
                                 <li key={index} className="flex items-center text-slate-200">
                                    <svg className="h-4 w-4 mr-2 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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
                    <span className="ml-2">Apoyar la Misión de KIA con un Ko-fi</span>
                </button>
            </div>

            {isModalOpen && !isMobile && (
                <PaymentModal
                    activationCode={activationCode}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

import React, { useState, useEffect } from 'react';
import ttsService from '/src/services/ttsService.ts';

const SOSIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SensesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const groundingScript = [
  { text: "Respira profundo. Estoy aquí contigo. Vamos a anclarnos en el presente.", pause: 2000 },
  { text: "Usemos la técnica 5, 4, 3, 2, 1.", pause: 2000 },
  { text: "Primero, mira a tu alrededor y nombra en tu mente cinco cosas que puedas ver. Tómate tu tiempo.", pause: 8000 },
  { text: "Bien. Ahora, nombra cuatro cosas que puedas sentir. El contacto de tu ropa, la silla, tus pies en el suelo...", pause: 8000 },
  { text: "Excelente. Ahora, escucha con atención y nombra tres cosas que puedas oír.", pause: 8000 },
  { text: "Lo estás haciendo muy bien. Ahora, nombra dos cosas que puedas oler. Si no hueles nada, imagina el olor de algo que te guste.", pause: 8000 },
  { text: "Finalmente, nombra una cosa que puedas saborear. Puede ser tu propia boca, o un sorbo de agua.", pause: 6000 },
  { text: "Has completado el ejercicio. Estás anclado en el ahora. Estás a salvo. Este momento pasará.", pause: 1000 },
];


const SOSModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    
    useEffect(() => {
      ttsService.speakSequence(groundingScript);

      return () => {
        ttsService.stop();
      }
    }, []);

    const handleClose = () => {
        ttsService.stop();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-red-500">Ayuda Inmediata</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>
                
                <div className="space-y-4 text-slate-300">
                    <p>Respira profundo. Estás en un lugar seguro. Este sentimiento es temporal y tienes el poder para superarlo.</p>
                    
                     <div className="bg-slate-700/50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2 flex items-center text-slate-100"><SensesIcon />Técnica de Anclaje 5-4-3-2-1:</h3>
                        <p className="text-sm font-bold text-teal-300 mb-2">Kai te está guiando con su voz...</p>
                        <p className="text-sm">
                            <span className="font-medium">5</span> cosas que puedas ver. <br/>
                            <span className="font-medium">4</span> cosas que puedas tocar. <br/>
                            <span className="font-medium">3</span> cosas que puedas oír. <br/>
                            <span className="font-medium">2</span> cosas que puedas oler. <br/>
                            <span className="font-medium">1</span> cosa que puedas saborear.
                        </p>
                    </div>

                </div>
                <button onClick={handleClose} className="mt-6 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors">
                    Me siento mejor, gracias
                </button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export const SOSCard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-100">¿Necesitas ayuda ahora?</h2>
            <p className="text-slate-400">Presiona el botón si sientes un deseo intenso. No estás solo.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center bg-red-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105"
          >
            <SOSIcon />
            <span className="ml-2">SOS CRAVING</span>
          </button>
        </div>
      </div>
      {isModalOpen && <SOSModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};
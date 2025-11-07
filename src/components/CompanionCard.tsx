
import React from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import { KiaIcon } from './KiaIcon.tsx';
import ttsService from '../services/ttsService.ts';

export const CompanionCard: React.FC = () => {
    const { userData } = useUser();
    const lastMessage = userData?.kaiConversation?.[userData.kaiConversation.length - 1];
    const kaiLastResponse = userData?.kaiConversation?.filter(turn => turn.role === 'model').slice(-1)[0];

    const handlePlayResponse = () => {
        if (kaiLastResponse) {
            ttsService.speak(kaiLastResponse.text);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-4 mb-4">
                <div className="bg-teal-500/20 p-3 rounded-full">
                    <KiaIcon className="h-8 w-8 text-teal-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Kai, tu Compañero</h2>
                    <p className="text-sm text-slate-400">¿Cómo te sientes ahora?</p>
                </div>
            </div>
            {kaiLastResponse ? (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 italic line-clamp-3">
                        "{kaiLastResponse.text}"
                    </p>
                    <button 
                        onClick={handlePlayResponse} 
                        className="text-teal-400 hover:text-teal-300 text-xs font-semibold mt-2"
                        aria-label="Escuchar respuesta de Kai"
                    >
                        Escuchar
                    </button>
                </div>
            ) : (
                <p className="text-slate-400 text-sm">
                    Aún no has hablado con Kai. Él está aquí para escucharte sin juicios cuando lo necesites.
                </p>
            )}
            <p className="text-xs text-slate-500 mt-4 text-center">
                Ve a la pestaña de 'Kai' para una conversación completa.
            </p>
        </div>
    );
};
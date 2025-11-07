import React, { useState, useCallback } from 'react';
import { CompanionCard } from '../components/CompanionCard';
import { TherapySessionModal } from '../components/TherapySessionModal';
import { ITherapySession, IConversationTurn, FeatureID } from '../types';
import { useUser } from '../contexts/UserContext';

export const KaiView: React.FC = () => {
    // Fix: Use addConversationTurn and checkAndConsumeUsage from context
    const { userData, updateUserData, geminiService, addConversationTurn, checkAndConsumeUsage } = useUser();
    const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);
    
    const onRequestMemoryUpdate = useCallback(async () => {
        if (!geminiService || !userData || !userData.isSubscribed) return;

        const conversationHistory = userData.kaiConversation || [];
        const currentMemory = userData.kaiMemory || '';
        if (conversationHistory.length === 0) return;

        const recentConversation = conversationHistory.slice(-10).map(t => `${t.role}: ${t.text}`).join('\n');
        const prompt = `
            Eres un sistema de memoria. Tu tarea es analizar la memoria existente y la conversación reciente de un usuario, y luego generar una versión actualizada y concisa de la memoria. La memoria debe ser un resumen de los puntos clave, patrones, logros y desafíos del usuario, en no más de 150 palabras.
            
            MEMORIA EXISTENTE:
            "${currentMemory || 'No hay memoria previa.'}"

            CONVERSACIÓN RECIENTE (últimos 10 turnos):
            "${recentConversation}"

            Extrae los insights más importantes de la conversación reciente e intégralos en la memoria existente. Elimina detalles obsoletos o irrelevantes. La nueva memoria debe ser un párrafo coherente.

            NUEVA MEMORIA ACTUALIZADA:
        `;
        const newMemory = await geminiService.generateContent(prompt);
        updateUserData({ kaiMemory: newMemory });
        console.log("Kai's memory updated.");
    }, [geminiService, userData, updateUserData]);
    
    const onSaveTherapySession = useCallback((session: ITherapySession) => {
        const isTrialUsed = userData?.therapyTrialUsed || false;
        if (!userData?.isSubscribed && !isTrialUsed) {
            updateUserData({ therapyTrialUsed: true });
        }
        const updatedSessions = [session, ...(userData?.therapySessions || [])];
        const newPoints = (userData?.gardenGrowthPoints || 0) + 15;
        updateUserData({ therapySessions: updatedSessions, gardenGrowthPoints: newPoints });
        setIsTherapyModalOpen(false);
    }, [userData, updateUserData]);

    const onClearChat = useCallback(() => {
        if (window.confirm("¿Estás seguro de que quieres borrar todo el historial de esta conversación?")) {
            updateUserData({ kaiConversation: [] });
        }
    }, [updateUserData]);

    if (!userData || !userData.onboardingData) return null;

    return (
       <div className="flex flex-col">
            {/* Fix: Pass apiKey to CompanionCard and use addConversationTurn from context */}
            <CompanionCard 
                apiKey={userData.geminiApiKey || null}
                conversation={userData.kaiConversation || []}
                onNewTurn={addConversationTurn}
                onboardingData={userData.onboardingData}
                kaiMemory={userData.kaiMemory || ''}
                isSubscribed={userData.isSubscribed || false}
                onRequestMemoryUpdate={onRequestMemoryUpdate}
                onStartTherapySession={() => setIsTherapyModalOpen(true)}
                therapyTrialUsed={userData.therapyTrialUsed || false}
                usageTracker={userData.usageTracker || null}
                checkAndConsumeUsage={checkAndConsumeUsage}
                onClearChat={onClearChat}
            />
            {isTherapyModalOpen && (
                // Fix: Pass apiKey to TherapySessionModal
                <TherapySessionModal 
                    apiKey={userData.geminiApiKey || null}
                    isOpen={isTherapyModalOpen}
                    onClose={() => setIsTherapyModalOpen(false)}
                    onSaveSession={onSaveTherapySession}
                />
            )}
       </div>
    );
};

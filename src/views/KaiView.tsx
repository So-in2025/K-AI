import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { CompanionCard } from '../components/CompanionCard';
import { TherapySessionModal } from '../components/TherapySessionModal';

export const KaiView: React.FC = () => {
    const { userData, saveTherapySession } = useUser();
    const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);

    if (!userData) return null;

    return (
        <div className="h-full max-h-[calc(100vh-8rem)]">
            <CompanionCard 
                onStartTherapySession={() => setIsTherapyModalOpen(true)}
            />
            {isTherapyModalOpen && (
                <TherapySessionModal
                    isOpen={isTherapyModalOpen}
                    onClose={() => setIsTherapyModalOpen(false)}
                    onSaveSession={saveTherapySession}
                />
            )}
        </div>
    );
};


import React, { useState } from 'react';
import { CompanionCard } from '../components/CompanionCard';
import { TherapySessionModal } from '../components/TherapySessionModal';
import { useUser } from '../contexts/UserContext';
import { ITherapySession } from '../types';

// Fix: Removed KaiViewProps and component props, using useUser hook and local state instead.
export const KaiView: React.FC = () => {
    const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);
    const { saveTherapySession } = useUser();

    return (
       <div className="flex flex-col">
            {/* Fix: Removed unnecessary props. CompanionCard consumes context directly. */}
            <CompanionCard 
                onStartTherapySession={() => setIsTherapyModalOpen(true)}
            />
            {isTherapyModalOpen && (
                // Fix: Removed apiKey prop. TherapySessionModal consumes context directly.
                <TherapySessionModal 
                    isOpen={isTherapyModalOpen}
                    onClose={() => setIsTherapyModalOpen(false)}
                    onSaveSession={saveTherapySession}
                />
            )}
       </div>
    );
};

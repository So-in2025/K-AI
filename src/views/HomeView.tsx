
import React from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import { ProgressCard } from '../components/ProgressCard.tsx';
import { JournalCard } from '../components/JournalCard.tsx';
import { CompanionCard } from '../components/CompanionCard.tsx';
import { DopamineSanctuaryCard } from '../components/DopamineSanctuaryCard.tsx';
import { FreedomVaultCard } from '../components/FreedomVaultCard.tsx';
import { InnerGardenCard } from '../components/InnerGardenCard.tsx';
import { WellnessSummaryCard } from '../components/WellnessSummaryCard.tsx';
import { DailyQuoteCard } from '../components/DailyQuoteCard.tsx';
import { ScheduledMessageCard } from '../components/ScheduledMessageCard.tsx';
import { GoalsCard } from '../components/GoalsCard.tsx';
import { AffirmationGeneratorCard } from '../components/AffirmationGeneratorCard.tsx';
import { GuardianModeCard } from '../components/GuardianModeCard.tsx';

export const HomeView: React.FC = () => {
    const { userData, daysSober, updateUserData } = useUser();

    if (!userData) return null;

    const handleStartDate = () => {
        const today = new Date().toISOString();
        updateUserData({ startDate: today });
    };

    const handleResetProgress = () => {
        if (window.confirm('¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.')) {
            updateUserData({ startDate: new Date().toISOString() });
        }
    };

    const handleJournalSave = () => {
      // Kai memory update logic is handled by a separate cloud function or triggered elsewhere
      console.log('Journal saved, Kai will reflect on this.');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
           
            {/* Column 1 */}
            <div className="space-y-6">
                 {userData.onboardingData?.focuses.includes('addiction') && (
                     <ProgressCard
                        startDate={userData.startDate ? new Date(userData.startDate) : null}
                        daysSober={daysSober}
                        onStartDate={handleStartDate}
                        onReset={handleResetProgress}
                        userFocus={userData.onboardingData?.focuses || []}
                    />
                 )}
                <ScheduledMessageCard />
                <CompanionCard />
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
                <JournalCard
                    entry={userData.journalEntry || ''}
                    onEntryChange={(entry) => updateUserData({ journalEntry: entry })}
                    onSave={handleJournalSave}
                />
                 <DopamineSanctuaryCard />
                 <GuardianModeCard />
            </div>
            
            {/* Column 3 */}
            <div className="space-y-6">
                <DailyQuoteCard />
                <FreedomVaultCard />
                <WellnessSummaryCard />
            </div>

            {/* Column 4 */}
            <div className="space-y-6">
                <InnerGardenCard />
                <GoalsCard />
                <AffirmationGeneratorCard />
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};
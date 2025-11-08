
import React from 'react';
import { ProgressCard } from '../components/ProgressCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { WellnessSanctuaryCard } from '../components/WellnessSanctuaryCard';
import { GuardianModeCard } from '../components/GuardianModeCard';
import { MoodJournalCard } from '../components/MoodJournalCard';
import { useUser } from '../contexts/UserContext';


// Fix: Removed HomeViewProps and component props, using useUser hook instead for data.
export const HomeView: React.FC = () => {
    const { userData } = useUser();

    if (!userData || !userData.onboardingData) {
        return null;
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    {/* Fix: Removed props as ProgressCard consumes context directly. */}
                    <ProgressCard />
                </div>
                {userData.onboardingData.focuses.includes('addiction') && (
                    // Fix: Removed props as GuardianModeCard consumes context directly.
                     <GuardianModeCard />
                )}
                {/* Fix: Removed props as MoodJournalCard consumes context directly. */}
                <MoodJournalCard />
                <div className={userData.onboardingData.focuses.includes('addiction') ? "lg:col-span-2" : ""}>
                    {/* Fix: Removed props as DailyQuoteCard consumes context directly. */}
                    <DailyQuoteCard />
                </div>
                <div className="lg:col-span-2">
                    {/* Fix: Removed props as WellnessSanctuaryCard consumes context directly. */}
                    <WellnessSanctuaryCard />
                </div>
            </div>
        </>
    );
};

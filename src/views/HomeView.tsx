import React from 'react';
import { useUser } from '../contexts/UserContext';
import { ProgressCard } from '../components/ProgressCard';
import { JournalCard } from '../components/JournalCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { GuardianModeCard } from '../components/GuardianModeCard';
import { DopamineSanctuaryCard } from '../components/DopamineSanctuaryCard';
import { InnerGardenCard } from '../components/InnerGardenCard';
import { WellnessSummaryCard } from '../components/WellnessSummaryCard';
import { GoalsCard } from '../components/GoalsCard';

export const HomeView: React.FC = () => {
    const { userData } = useUser();

    if (!userData || !userData.onboardingData) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
           
            {/* Column 1 */}
            <div className="space-y-6">
                 {userData.onboardingData.focuses.includes('addiction') && (
                     <ProgressCard />
                 )}
                <DailyQuoteCard />
                <InnerGardenCard />
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
                <JournalCard />
                <GuardianModeCard />
            </div>
            
            {/* Column 3 */}
            <div className="space-y-6">
                <DopamineSanctuaryCard />
                <WellnessSummaryCard />
            </div>

            {/* Column 4 */}
            <div className="space-y-6">
                <GoalsCard />
                {/* Other cards can be placed here */}
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

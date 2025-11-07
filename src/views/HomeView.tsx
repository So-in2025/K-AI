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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
           
            {/* Main Content Area (3/5 width on large screens) */}
            <div className="lg:col-span-3 space-y-6">
                <JournalCard />
                <DopamineSanctuaryCard />
                <GuardianModeCard />
            </div>

            {/* Sidebar Area (2/5 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
                 {userData.onboardingData.focuses.includes('addiction') && (
                     <ProgressCard />
                 )}
                <DailyQuoteCard />
                <InnerGardenCard />
                <GoalsCard />
                <WellnessSummaryCard />
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

import React from 'react';
import { PatternsCard } from '../components/PatternsCard';
import { WeeklyAnalysisCard } from '../components/WeeklyAnalysisCard';
import { ResourcesCard } from '../components/ResourcesCard';
import { UpgradeCard } from '../components/UpgradeCard';
import { InnerGardenCard } from '../components/InnerGardenCard';
import { TrustCircleCard } from '../components/TrustCircleCard';
import { WellnessSummaryCard } from '../components/WellnessSummaryCard';
import { TherapyHistoryCard } from '../components/TherapyHistoryCard';
import { useUser } from '../contexts/UserContext';

// Fix: Removed ProgressViewProps and component props, using useUser hook instead for data.
export const ProgressView: React.FC = () => {
    const { userData, deleteTherapyHistory } = useUser();

    if (!userData || !userData.onboardingData) {
        return null;
    }

    const { isSubscribed, onboardingData, therapySessions } = userData;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {!isSubscribed && (
                    <div className="lg:col-span-3">
                        <UpgradeCard />
                    </div>
                )}
                
                <div className="lg:col-span-2 space-y-6">
                    {/* Fix: Removed props as InnerGardenCard consumes context directly. */}
                    <InnerGardenCard />
                    {/* Fix: Removed props as WellnessSummaryCard consumes context directly. */}
                    <WellnessSummaryCard />
                    {/* Fix: Removed props as WeeklyAnalysisCard consumes context directly. */}
                     <WeeklyAnalysisCard />
                </div>

                <div className="space-y-6">
                    <TherapyHistoryCard 
                        sessions={therapySessions || []}
                        onDeleteHistory={deleteTherapyHistory}
                        isLocked={!isSubscribed}
                    />
                    {/* Fix: Removed props as TrustCircleCard consumes context directly. */}
                    <TrustCircleCard />
                    {/* Fix: Removed props as PatternsCard consumes context directly. */}
                    {onboardingData.focuses.includes('addiction') && <PatternsCard />}
                    <ResourcesCard />
                </div>
            </div>
        </>
    );
};

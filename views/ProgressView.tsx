import React, { useCallback } from 'react';
import { PatternsCard } from '../components/PatternsCard';
import { WeeklyAnalysisCard } from '../components/WeeklyAnalysisCard';
import { ResourcesCard } from '../components/ResourcesCard';
import { UpgradeCard } from '../components/UpgradeCard';
import { InnerGardenCard } from '../components/InnerGardenCard';
import { TrustCircleCard } from '../components/TrustCircleCard';
import { WellnessSummaryCard } from '../components/WellnessSummaryCard';
import { TherapyHistoryCard } from '../components/TherapyHistoryCard';
import { useUser } from '../contexts/UserContext';


export const ProgressView: React.FC = () => {
    // Fix: Get all necessary data and handlers from the user context.
    const { userData, updateUserData, daysSober, checkAndConsumeUsage } = useUser();

    const handleDeleteTherapyHistory = useCallback(() => {
        if (window.confirm("¿Estás seguro de que quieres borrar todo tu historial de sesiones privadas? Esta acción es irreversible.")) {
            updateUserData({ therapySessions: [] });
        }
    }, [updateUserData]);

    if (!userData || !userData.onboardingData) return null;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {!(userData.isSubscribed) && (
                    <div className="lg:col-span-3">
                        <UpgradeCard />
                    </div>
                )}
                
                <div className="lg:col-span-2 space-y-6">
                    {/* Fix: Pass all required props */}
                    <InnerGardenCard growthPoints={userData.gardenGrowthPoints || 0} />
                    <WellnessSummaryCard 
                        dopamineHits={userData.dopamineHits || []}
                        wellnessLog={userData.wellnessLog || []}
                    />
                     <WeeklyAnalysisCard 
                        apiKey={userData.geminiApiKey || null}
                        cravings={userData.cravings || []}
                        journalEntry={userData.journalEntry || ''}
                        wellnessLog={userData.wellnessLog || []}
                        daysSober={daysSober}
                        userFocus={userData.onboardingData.focuses}
                        isSubscribed={userData.isSubscribed || false}
                        dopamineHits={userData.dopamineHits || []}
                        usageTracker={userData.usageTracker || null}
                        checkAndConsumeUsage={checkAndConsumeUsage}
                     />
                </div>

                <div className="space-y-6">
                    <TherapyHistoryCard 
                        sessions={userData.therapySessions || []}
                        onDeleteHistory={handleDeleteTherapyHistory}
                        isLocked={!userData.isSubscribed}
                    />
                    <TrustCircleCard 
                        config={userData.trustCircleConfig || null}
                        onUpdateConfig={(config) => updateUserData({ trustCircleConfig: config })}
                        cravings={userData.cravings || []}
                        daysSober={daysSober}
                        wellnessLog={userData.wellnessLog || []}
                    />
                    {userData.onboardingData.focuses.includes('addiction') && <PatternsCard 
                        cravings={userData.cravings || []}
                        journalEntry={userData.journalEntry || ''}
                        isSubscribed={userData.isSubscribed || false}
                    />}
                    <ResourcesCard />
                </div>
            </div>
        </>
    );
};

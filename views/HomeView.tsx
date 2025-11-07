import React, { useCallback } from 'react';
import { ProgressCard } from '../components/ProgressCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { WellnessSanctuaryCard } from '../components/WellnessSanctuaryCard';
import { GuardianModeCard } from '../components/GuardianModeCard';
import { MoodJournalCard } from '../components/MoodJournalCard';
import { useUser } from '../contexts/UserContext';
import { IWellnessActivity, IDopamineHit, IMoodJournal } from '../types';

export const HomeView: React.FC = () => {
    const { userData, updateUserData, daysSober } = useUser();

    // Memoized handlers to prevent re-renders
    const handleLogWellnessActivity = useCallback((activity: IWellnessActivity) => {
        const updatedLog = [activity, ...(userData?.wellnessLog || [])];
        updateUserData({ wellnessLog: updatedLog });
    }, [userData?.wellnessLog, updateUserData]);

    const handleLogDopamineHit = useCallback((hit: IDopamineHit) => {
        const updatedHits = [hit, ...(userData?.dopamineHits || []).slice(0, 19)];
        updateUserData({ dopamineHits: updatedHits });
    }, [userData?.dopamineHits, updateUserData]);

    const handleUpdateMoodJournal = useCallback((journal: IMoodJournal | null) => {
        updateUserData({ moodJournal: journal ?? undefined });
    }, [updateUserData]);

    const handleSetStartDate = useCallback(() => {
        const today = new Date().toISOString();
        updateUserData({ startDate: today });
    }, [updateUserData]);

    const handleResetProgress = useCallback(() => {
        if (window.confirm('¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.')) {
            updateUserData({ startDate: undefined });
        }
    }, [updateUserData]);


    if (!userData || !userData.onboardingData) {
        return null; // or a loading/error state
    }
    
    // Guardian mode is not part of the user data, so it needs its own state management
    // For now, this functionality is removed from HomeView to simplify the Firebase integration
    // It can be added back with its own state management hook.

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    {/* Fix: Pass all required props to ProgressCard */}
                    <ProgressCard 
                        startDate={userData.startDate ? new Date(userData.startDate) : null}
                        daysSober={daysSober}
                        onStartDate={handleSetStartDate}
                        onReset={handleResetProgress}
                        userFocus={userData.onboardingData.focuses}
                    />
                </div>
                {/* GuardianModeCard is temporarily removed as its state is complex and local */}
                <MoodJournalCard 
                    apiKey={userData.geminiApiKey || null}
                    moodJournal={userData.moodJournal || null}
                    onUpdateMoodJournal={handleUpdateMoodJournal}
                />
                <div className="lg:col-span-2">
                     <DailyQuoteCard onboardingData={userData.onboardingData} />
                </div>
                <div className="lg:col-span-2">
                    <WellnessSanctuaryCard 
                        onLogActivity={handleLogWellnessActivity}
                        onLogDopamineHit={handleLogDopamineHit}
                        isSubscribed={userData.isSubscribed || false}
                        onboardingData={userData.onboardingData}
                    />
                </div>
            </div>
        </>
    );
};

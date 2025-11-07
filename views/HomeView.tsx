import React from 'react';
import { ProgressCard } from '../components/ProgressCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { WellnessSanctuaryCard } from '../components/WellnessSanctuaryCard';
import { IWellnessActivity, UserFocus, OnboardingData, IDopamineHit, IMoodJournal, UsageTracker } from '../types';
import { GuardianModeCard } from '../components/GuardianModeCard';
import { MoodJournalCard } from '../components/MoodJournalCard';

// Define a type for the guardian state passed as a prop
type GuardianState = {
  status: 'idle' | 'starting' | 'active' | 'stopping' | 'analyzing' | 'error';
  analysis: any; // Simplified for prop drilling, consider a more specific type
  error: string | null;
  transcript: string;
}
interface HomeViewProps {
    apiKey: string | null;
    startDate: Date | null;
    daysSober: number;
    onStartDate: () => void;
    onReset: () => void;
    onLogWellnessActivity: (activity: IWellnessActivity) => void;
    onboardingData: OnboardingData;
    guardianState: GuardianState;
    onStartGuardian: () => void;
    onStopGuardian: () => void;
    dopamineHits: IDopamineHit[];
    onLogDopamineHit: (hit: IDopamineHit) => void;
    guardianTriggerWords: string[];
    onUpdateGuardianConfig: (words: string[]) => void;
    isSubscribed: boolean;
    moodJournal: IMoodJournal | null;
    onUpdateMoodJournal: (journal: IMoodJournal | null) => void;
    usageTracker: UsageTracker | null;
}

export const HomeView: React.FC<HomeViewProps> = (props) => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    <ProgressCard
                        startDate={props.startDate}
                        daysSober={props.daysSober}
                        onStartDate={props.onStartDate}
                        onReset={props.onReset}
                        userFocus={props.onboardingData.focuses}
                    />
                </div>
                {props.onboardingData.focuses.includes('addiction') && (
                     <GuardianModeCard 
                        status={props.guardianState.status}
                        analysis={props.guardianState.analysis}
                        error={props.guardianState.error}
                        onStart={props.onStartGuardian}
                        onStop={props.onStopGuardian}
                        triggerWords={props.guardianTriggerWords}
                        onUpdateConfig={props.onUpdateGuardianConfig}
                        isSubscribed={props.isSubscribed}
                        usageTracker={props.usageTracker}
                        apiKey={props.apiKey} 
                        transcript={props.guardianState.transcript}
                     />
                )}
                <MoodJournalCard 
                    apiKey={props.apiKey}
                    moodJournal={props.moodJournal}
                    onUpdateMoodJournal={props.onUpdateMoodJournal}
                />
                <div className={props.onboardingData.focuses.includes('addiction') ? "lg:col-span-2" : ""}>
                    <DailyQuoteCard onboardingData={props.onboardingData} />
                </div>
                <div className="lg:col-span-2">
                    <WellnessSanctuaryCard 
                        onLogActivity={props.onLogWellnessActivity}
                        onLogDopamineHit={props.onLogDopamineHit}
                        isSubscribed={props.isSubscribed}
                        onboardingData={props.onboardingData}
                    />
                </div>
            </div>
        </>
    );
};
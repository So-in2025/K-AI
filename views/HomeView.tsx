
import React from 'react';
import { ProgressCard } from '../components/ProgressCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { WellnessSanctuaryCard } from '../components/WellnessSanctuaryCard';
import { IWellnessActivity, UserFocus, OnboardingData } from '../types';
import { GuardianModeCard } from '../components/GuardianModeCard';

// Define a type for the guardian state passed as a prop
type GuardianState = {
  status: 'idle' | 'starting' | 'active' | 'stopping' | 'analyzing' | 'error';
  analysis: any; // Simplified for prop drilling, consider a more specific type
  error: string | null;
}
interface HomeViewProps {
    startDate: Date | null;
    daysSober: number;
    onStartDate: () => void;
    onReset: () => void;
    onLogWellnessActivity: (activity: IWellnessActivity) => void;
    onboardingData: OnboardingData;
    guardianState: GuardianState;
    onStartGuardian: () => void;
    onStopGuardian: () => void;
}

export const HomeView: React.FC<HomeViewProps> = (props) => {
    return (
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
                 />
            )}
            <DailyQuoteCard />
            <div className="lg:col-span-2">
                <WellnessSanctuaryCard onLogActivity={props.onLogWellnessActivity} />
            </div>
        </div>
    );
};


import React from 'react';
import { ProgressCard } from '../components/ProgressCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { BreathingExercisesCard } from '../components/BreathingExercisesCard';
import { IWellnessActivity, UserFocus } from '../types';
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
    userFocus: UserFocus[];
    guardianState: GuardianState;
    onStartGuardian: () => void;
    onStopGuardian: () => void;
}

export const HomeView: React.FC<HomeViewProps> = (props) => {
    return (
        <div className="space-y-6">
            <ProgressCard
                startDate={props.startDate}
                daysSober={props.daysSober}
                onStartDate={props.onStartDate}
                onReset={props.onReset}
                userFocus={props.userFocus}
            />
            {props.userFocus.includes('addiction') && (
                 <GuardianModeCard 
                    status={props.guardianState.status}
                    analysis={props.guardianState.analysis}
                    error={props.guardianState.error}
                    onStart={props.onStartGuardian}
                    onStop={props.onStopGuardian}
                 />
            )}
            <DailyQuoteCard />
            <BreathingExercisesCard onLogActivity={props.onLogWellnessActivity} />
        </div>
    );
};

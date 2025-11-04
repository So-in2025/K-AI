import React from 'react';
import { ProgressCard } from '../components/ProgressCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { BreathingExercisesCard } from '../components/BreathingExercisesCard';
import { IWellnessActivity, UserFocus, IGuardianAnalysis } from '../types';
import { GuardianModeCard } from '../components/GuardianModeCard';

interface HomeViewProps {
    startDate: Date | null;
    daysSober: number;
    onStartDate: () => void;
    onReset: () => void;
    onLogWellnessActivity: (activity: IWellnessActivity) => void;
    userFocus: UserFocus[];
    isGuardianActive: boolean;
    guardianAnalysis: IGuardianAnalysis | null;
    isGuardianLoading: boolean;
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
                    isActive={props.isGuardianActive}
                    analysis={props.guardianAnalysis}
                    isLoading={props.isGuardianLoading}
                    onStart={props.onStartGuardian}
                    onStop={props.onStopGuardian}
                 />
            )}
            <DailyQuoteCard />
            <BreathingExercisesCard onLogActivity={props.onLogWellnessActivity} />
        </div>
    );
};
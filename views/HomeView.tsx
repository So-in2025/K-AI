import React from 'react';
import { ProgressCard } from '../components/ProgressCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { BreathingExercisesCard } from '../components/BreathingExercisesCard';
import { IWellnessActivity } from '../types';

interface HomeViewProps {
    startDate: Date | null;
    daysSober: number;
    onStartDate: () => void;
    onReset: () => void;
    onLogWellnessActivity: (activity: IWellnessActivity) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ startDate, daysSober, onStartDate, onReset, onLogWellnessActivity }) => {
    return (
        <div className="space-y-6">
            <ProgressCard
                startDate={startDate}
                daysSober={daysSober}
                onStartDate={onStartDate}
                onReset={onReset}
            />
            <DailyQuoteCard />
            <BreathingExercisesCard onLogActivity={onLogWellnessActivity} />
        </div>
    );
};


import React from 'react';
import { PatternsCard } from '../components/PatternsCard';
import { WeeklyAnalysisCard } from '../components/WeeklyAnalysisCard';
import { ResourcesCard } from '../components/ResourcesCard';
import { ICraving, IWellnessActivity, OnboardingData } from '../types';
import { UpgradeCard } from '../components/UpgradeCard';

interface ProgressViewProps {
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    daysSober: number;
    onboardingData: OnboardingData;
    isSubscribed: boolean;
}

export const ProgressView: React.FC<ProgressViewProps> = (props) => {
    const { isSubscribed, onboardingData } = props;
    return (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {!isSubscribed && (
                <div className="lg:col-span-3">
                    <UpgradeCard />
                </div>
            )}
            
            <div className="lg:col-span-2 space-y-6">
                 <WeeklyAnalysisCard 
                    cravings={props.cravings}
                    journalEntry={props.journalEntry}
                    wellnessLog={props.wellnessLog}
                    daysSober={props.daysSober}
                    userFocus={onboardingData.focuses}
                    isLocked={!isSubscribed}
                />
            </div>

            <div className="space-y-6">
                {onboardingData.focuses.includes('addiction') && <PatternsCard cravings={props.cravings} journalEntry={props.journalEntry} isLocked={!isSubscribed} />}
                <ResourcesCard />
            </div>
       </div>
    );
};

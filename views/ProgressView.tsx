import React from 'react';
import { PatternsCard } from '../components/PatternsCard';
import { WeeklyAnalysisCard } from '../components/WeeklyAnalysisCard';
import { ResourcesCard } from '../components/ResourcesCard';
import { ICraving, IWellnessActivity, UserFocus } from '../types';

interface ProgressViewProps {
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    daysSober: number;
    userFocus: UserFocus[];
}

export const ProgressView: React.FC<ProgressViewProps> = (props) => {
    return (
       <div className="space-y-6">
            {props.userFocus.includes('addiction') && <PatternsCard cravings={props.cravings} journalEntry={props.journalEntry} />}
            <WeeklyAnalysisCard 
                cravings={props.cravings}
                journalEntry={props.journalEntry}
                wellnessLog={props.wellnessLog}
                daysSober={props.daysSober}
                userFocus={props.userFocus}
            />
            <ResourcesCard />
       </div>
    );
};

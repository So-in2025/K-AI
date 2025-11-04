import React from 'react';
import { PatternsCard } from '../components/PatternsCard';
import { WeeklyAnalysisCard } from '../components/WeeklyAnalysisCard';
import { ResourcesCard } from '../components/ResourcesCard';
import { ICraving, IWellnessActivity } from '../types';

interface ProgressViewProps {
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    daysSober: number;
}

export const ProgressView: React.FC<ProgressViewProps> = (props) => {
    return (
       <div className="space-y-6">
            <PatternsCard cravings={props.cravings} journalEntry={props.journalEntry} />
            <WeeklyAnalysisCard 
                cravings={props.cravings}
                journalEntry={props.journalEntry}
                wellnessLog={props.wellnessLog}
                daysSober={props.daysSober}
            />
            <ResourcesCard />
       </div>
    );
};

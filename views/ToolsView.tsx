
import React from 'react';
import { GoalsCard } from '../components/GoalsCard';
import { CravingTrackerCard } from '../components/CravingTrackerCard';
import { JournalCard } from '../components/JournalCard';
import { AffirmationGeneratorCard } from '../components/AffirmationGeneratorCard';
import { RemindersCard } from '../components/RemindersCard';
import { IGoal, GoalType, ICraving, IReminder } from '../types';


interface ToolsViewProps {
    goals: IGoal[];
    onGenerateGoal: (type: GoalType) => void;
    isGoalsLoading: boolean;
    cravings: ICraving[];
    onLogCraving: (craving: ICraving) => void;
    journalEntry: string;
    onJournalChange: (newEntry: string) => void;
    onJournalSave: () => void;
    reminders: IReminder[];
    onAddReminder: (text: string, time: string) => void;
    onDeleteReminder: (id: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = (props) => {
    return (
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
                <JournalCard entry={props.journalEntry} onEntryChange={props.onJournalChange} onSave={props.onJournalSave} />
                <AffirmationGeneratorCard />
            </div>
            <div className="space-y-6">
                <CravingTrackerCard cravings={props.cravings} onLogCraving={props.onLogCraving} />
                <GoalsCard goals={props.goals} onGenerateGoal={props.onGenerateGoal} isLoading={props.isGoalsLoading} />
                <RemindersCard 
                    reminders={props.reminders}
                    onAddReminder={props.onAddReminder}
                    onDeleteReminder={props.onDeleteReminder}
                />
            </div>
       </div>
    );
};


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
       <div className="space-y-6">
            <GoalsCard goals={props.goals} onGenerateGoal={props.onGenerateGoal} isLoading={props.isGoalsLoading} />
            <RemindersCard 
                reminders={props.reminders}
                onAddReminder={props.onAddReminder}
                onDeleteReminder={props.onDeleteReminder}
            />
            <CravingTrackerCard cravings={props.cravings} onLogCraving={props.onLogCraving} />
            <JournalCard entry={props.journalEntry} onEntryChange={props.onJournalChange} onSave={props.onJournalSave} />
            <AffirmationGeneratorCard />
       </div>
    );
};


import React from 'react';
import { GoalsCard } from '../components/GoalsCard';
import { CravingTrackerCard } from '../components/CravingTrackerCard';
import { JournalCard } from '../components/JournalCard';
import { AffirmationGeneratorCard } from '../components/AffirmationGeneratorCard';
import { RemindersCard } from '../components/RemindersCard';
import { ThoughtLabCard } from '../components/ThoughtLabCard';
import { HabitLoopCard } from '../components/HabitLoopCard';
import { IGoal, GoalType, ICraving, IReminder, IThoughtLabEntry, IHabitLoop } from '../types';


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
    thoughtLabEntries: IThoughtLabEntry[];
    onAddThoughtLabEntry: (entry: IThoughtLabEntry) => void;
    habitLoops: IHabitLoop[];
    onAddHabitLoop: (loop: IHabitLoop) => void;
    isSubscribed: boolean;
}

export const ToolsView: React.FC<ToolsViewProps> = (props) => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    <JournalCard entry={props.journalEntry} onEntryChange={props.onJournalChange} onSave={props.onJournalSave} />
                    <ThoughtLabCard 
                        entries={props.thoughtLabEntries}
                        onAddEntry={props.onAddThoughtLabEntry}
                        isLocked={!props.isSubscribed}
                    />
                    <HabitLoopCard
                        loops={props.habitLoops}
                        onAddLoop={props.onAddHabitLoop}
                        isLocked={!props.isSubscribed}
                    />
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
            <div className="h-24" />
        </>
    );
};


import React from 'react';
import { GoalsCard } from '../components/GoalsCard';
import { CravingTrackerCard } from '../components/CravingTrackerCard';
import { JournalCard } from '../components/JournalCard';
import { AffirmationGeneratorCard } from '../components/AffirmationGeneratorCard';
import { RemindersCard } from '../components/RemindersCard';
import { ThoughtLabCard } from '../components/ThoughtLabCard';
import { HabitLoopCard } from '../components/HabitLoopCard';
import { SoundtrackCard } from '../components/SoundtrackCard';

// Fix: Removed ToolsViewProps and component props, using context within child components.
export const ToolsView: React.FC = () => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    {/* Fix: Removed props as JournalCard consumes context directly. */}
                    <JournalCard />
                    {/* Fix: Removed props as ThoughtLabCard consumes context directly. */}
                    <ThoughtLabCard />
                    {/* Fix: Removed props as HabitLoopCard consumes context directly. */}
                    <HabitLoopCard />
                    {/* Fix: Removed props as AffirmationGeneratorCard consumes context directly. */}
                    <AffirmationGeneratorCard />
                </div>
                <div className="space-y-6">
                    {/* Fix: Removed props as CravingTrackerCard consumes context directly. */}
                    <CravingTrackerCard />
                    {/* Fix: Removed props as GoalsCard consumes context directly. */}
                    <GoalsCard />
                    {/* Fix: Removed props as RemindersCard consumes context directly. */}
                    <RemindersCard />
                    {/* Fix: Removed props as SoundtrackCard consumes context directly. */}
                    <SoundtrackCard />
                </div>
            </div>
        </>
    );
};

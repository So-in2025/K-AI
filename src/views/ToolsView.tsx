
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
                {/* Columna Izquierda: Herramientas de Registro y Planificación */}
                <div className="space-y-6">
                    <CravingTrackerCard />
                    <JournalCard />
                    <RemindersCard />
                    <AffirmationGeneratorCard />
                </div>
                {/* Columna Derecha: Herramientas Cognitivas y Creativas */}
                <div className="space-y-6">
                    <GoalsCard />
                    <ThoughtLabCard />
                    <HabitLoopCard />
                    <SoundtrackCard />
                </div>
            </div>
        </>
    );
};

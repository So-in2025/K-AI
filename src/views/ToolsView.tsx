
import React from 'react';
import { useUser } from '/src/contexts/UserContext.tsx';
import { DopamineDietCard } from '/src/components/DopamineDietCard.tsx';
import { ThoughtLabCard } from '/src/components/ThoughtLabCard.tsx';
import { TrustCircleCard } from '/src/components/TrustCircleCard.tsx';
import { HabitLoopCard } from '/src/components/HabitLoopCard.tsx';
import { BreathingExercisesCard } from '/src/components/BreathingExercisesCard.tsx';
import { MoodJournalCard } from '/src/components/MoodJournalCard.tsx';
import { SoundtrackCard } from '/src/components/SoundtrackCard.tsx';
import { RemindersCard } from '/src/components/RemindersCard.tsx';
import { ResourcesCard } from '/src/components/ResourcesCard.tsx';
import { CravingTrackerCard } from '/src/components/CravingTrackerCard.tsx';

export const ToolsView: React.FC = () => {
  const { userData } = useUser();

  if (!userData) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-100">Herramientas de Sanación</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BreathingExercisesCard />
        <MoodJournalCard />
        <ThoughtLabCard />
        {userData.onboardingData?.focuses.includes('addiction') && (
          <>
            <CravingTrackerCard />
            <DopamineDietCard />
            <HabitLoopCard />
          </>
        )}
        <SoundtrackCard />
        <RemindersCard />
        <TrustCircleCard />
        <ResourcesCard />
      </div>
    </div>
  );
};
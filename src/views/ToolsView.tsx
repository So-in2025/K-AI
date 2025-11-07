
import React from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import { DopamineDietCard } from '../components/DopamineDietCard.tsx';
import { ThoughtLabCard } from '../components/ThoughtLabCard.tsx';
import { TrustCircleCard } from '../components/TrustCircleCard.tsx';
import { HabitLoopCard } from '../components/HabitLoopCard.tsx';
import { BreathingExercisesCard } from '../components/BreathingExercisesCard.tsx';
import { MoodJournalCard } from '../components/MoodJournalCard.tsx';
import { SoundtrackCard } from '../components/SoundtrackCard.tsx';
import { RemindersCard } from '../components/RemindersCard.tsx';
import { ResourcesCard } from '../components/ResourcesCard.tsx';
import { CravingTrackerCard } from '../components/CravingTrackerCard.tsx';

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
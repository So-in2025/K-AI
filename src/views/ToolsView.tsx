
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { DopamineDietCard } from '../components/DopamineDietCard';
import { ThoughtLabCard } from '../components/ThoughtLabCard';
import { TrustCircleCard } from '../components/TrustCircleCard';
import { HabitLoopCard } from '../components/HabitLoopCard';
import { BreathingExercisesCard } from '../components/BreathingExercisesCard';
import { MoodJournalCard } from '../components/MoodJournalCard';
import { SoundtrackCard } from '../components/SoundtrackCard';
import { RemindersCard } from '../components/RemindersCard';
import { ResourcesCard } from '../components/ResourcesCard';
import { CravingTrackerCard } from '../components/CravingTrackerCard';

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

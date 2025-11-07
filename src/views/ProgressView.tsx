import React from 'react';
import { useUser } from '../contexts/UserContext';
import { PatternsCard } from '../components/PatternsCard';
import { TherapyHistoryCard } from '../components/TherapyHistoryCard';
import { WeeklyAnalysisCard } from '../components/WeeklyAnalysisCard';
import { UpgradeCard } from '../components/UpgradeCard';

export const ProgressView: React.FC = () => {
    const { userData, deleteTherapyHistory } = useUser();

    if (!userData) return null;

    const isSubscribed = userData.isSubscribed || false;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-100">Tu Progreso</h1>
            {!isSubscribed && (
                <UpgradeCard />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WeeklyAnalysisCard />
                <PatternsCard />
                {/* DopamineRecalibrationSummaryCard can be added here if needed */}
                <TherapyHistoryCard
                    sessions={userData.therapySessions || []}
                    onDeleteHistory={deleteTherapyHistory}
                    isLocked={!isSubscribed}
                />
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { useUser } from '/src/contexts/UserContext.tsx';
import { PatternsCard } from '/src/components/PatternsCard.tsx';
import { DopamineRecalibrationSummaryCard } from '/src/components/DopamineRecalibrationSummaryCard.tsx';
import { TherapyHistoryCard } from '/src/components/TherapyHistoryCard.tsx';
import { WeeklyAnalysisCard } from '/src/components/WeeklyAnalysisCard.tsx';
import { UpgradeCard } from '/src/components/UpgradeCard.tsx';
import { IGoal } from '/src/types.ts';

export const ProgressView: React.FC = () => {
    const { userData, updateUserData } = useUser();
    const isSubscribed = userData?.isSubscribed || false;

    const [newGoal, setNewGoal] = useState('');

    const handleAddGoal = () => {
        if (!newGoal.trim()) return;
        const goal: IGoal = { type: 'monthly', content: newGoal.trim() };
        const updatedGoals = [...(userData?.goals || []), goal];
        updateUserData({ goals: updatedGoals });
        setNewGoal('');
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-100">Tu Progreso</h1>
            {!isSubscribed && (
                <UpgradeCard />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WeeklyAnalysisCard />
                <PatternsCard />
                <DopamineRecalibrationSummaryCard />
                <TherapyHistoryCard />
            </div>
        </div>
    );
};
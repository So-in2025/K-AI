
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { PatternsCard } from '../components/PatternsCard';
import { DopamineRecalibrationSummaryCard } from '../components/DopamineRecalibrationSummaryCard';
import { TherapyHistoryCard } from '../components/TherapyHistoryCard';
import { WeeklyAnalysisCard } from '../components/WeeklyAnalysisCard';
import { UpgradeCard } from '../components/UpgradeCard';
import { IGoal } from '../types';

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

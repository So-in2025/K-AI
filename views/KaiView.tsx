import React from 'react';
import { CompanionCard } from '../components/CompanionCard';
import { ICraving, IConversationTurn, IWellnessActivity, IGoal, OnboardingData } from '../types';

interface KaiViewProps {
    daysSober: number;
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    conversation: IConversationTurn[];
    onNewTurn: (turn: IConversationTurn) => void;
    goals: IGoal[];
    onboardingData: OnboardingData;
}

export const KaiView: React.FC<KaiViewProps> = (props) => {
    return (
       <div className="h-full">
            <CompanionCard {...props} />
       </div>
    );
};
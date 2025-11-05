
import React from 'react';
import { CompanionCard } from '../components/CompanionCard';
import { ICraving, IConversationTurn, IWellnessActivity, IGoal, OnboardingData, IDopamineHit } from '../types';

interface KaiViewProps {
    daysSober: number;
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    conversation: IConversationTurn[];
    onNewTurn: (turn: IConversationTurn) => void;
    goals: IGoal[];
    onboardingData: OnboardingData;
    // FIX: Add missing properties to accept them from App.tsx and pass them down to CompanionCard.
    kaiMemory: string;
    isSubscribed: boolean;
    dopamineHits: IDopamineHit[];
}

export const KaiView: React.FC<KaiViewProps> = (props) => {
    return (
       <div className="h-full">
            <CompanionCard {...props} />
       </div>
    );
};

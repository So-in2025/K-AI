
import React from 'react';
import { CompanionCard } from '../components/CompanionCard';
import { ICraving, IConversationTurn, IWellnessActivity, IGoal, OnboardingData, IDopamineHit, IFreedomVaultConfig } from '../types';

interface KaiViewProps {
    daysSober: number;
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    conversation: IConversationTurn[];
    onNewTurn: (turn: IConversationTurn) => void;
    goals: IGoal[];
    onboardingData: OnboardingData;
    kaiMemory: string;
    isSubscribed: boolean;
    dopamineHits: IDopamineHit[];
    freedomVaultConfig: IFreedomVaultConfig | null;
}

export const KaiView: React.FC<KaiViewProps> = (props) => {
    return (
       // This container will now manage the chat layout, taking up the full available height.
       <div className="h-full flex flex-col">
            <CompanionCard {...props} />
       </div>
    );
};

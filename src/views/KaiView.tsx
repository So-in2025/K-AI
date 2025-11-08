import React from 'react';
import { CompanionCard } from '../components/CompanionCard';
import { TherapySessionModal } from '../components/TherapySessionModal';
import { IConversationTurn, OnboardingData, ITherapySession, UsageTracker, FeatureID } from '../types';

interface KaiViewProps {
    apiKey: string | null;
    conversation: IConversationTurn[];
    onNewTurn: (turn: IConversationTurn) => void;
    onboardingData: OnboardingData;
    kaiMemory: string;
    isSubscribed: boolean;
    onRequestMemoryUpdate: () => void;
    isTherapyModalOpen: boolean;
    onOpenTherapyModal: () => void;
    onCloseTherapyModal: () => void;
    onSaveTherapySession: (session: ITherapySession) => void;
    therapyTrialUsed: boolean;
    usageTracker: UsageTracker | null;
    checkAndConsumeUsage: (featureId: FeatureID) => boolean;
    onClearChat: () => void;
}

export const KaiView: React.FC<KaiViewProps> = (props) => {
    return (
       <div className="flex flex-col">
            <CompanionCard 
                apiKey={props.apiKey}
                conversation={props.conversation}
                onNewTurn={props.onNewTurn}
                onboardingData={props.onboardingData}
                kaiMemory={props.kaiMemory}
                isSubscribed={props.isSubscribed}
                onRequestMemoryUpdate={props.onRequestMemoryUpdate}
                onStartTherapySession={props.onOpenTherapyModal}
                therapyTrialUsed={props.therapyTrialUsed}
                usageTracker={props.usageTracker}
                checkAndConsumeUsage={props.checkAndConsumeUsage}
                onClearChat={props.onClearChat}
            />
            {props.isTherapyModalOpen && (
                <TherapySessionModal 
                    apiKey={props.apiKey}
                    isOpen={props.isTherapyModalOpen}
                    onClose={props.onCloseTherapyModal}
                    onSaveSession={props.onSaveTherapySession}
                />
            )}
       </div>
    );
};
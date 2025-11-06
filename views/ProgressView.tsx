
import React from 'react';
import { PatternsCard } from '../components/PatternsCard';
import { WeeklyAnalysisCard } from '../components/WeeklyAnalysisCard';
import { ResourcesCard } from '../components/ResourcesCard';
import { ICraving, IWellnessActivity, OnboardingData, ITrustCircleConfig, IDopamineHit } from '../types';
import { UpgradeCard } from '../components/UpgradeCard';
import { InnerGardenCard } from '../components/InnerGardenCard';
import { TrustCircleCard } from '../components/TrustCircleCard';
import { WellnessSummaryCard } from '../components/WellnessSummaryCard';


interface ProgressViewProps {
    cravings: ICraving[];
    journalEntry: string;
    wellnessLog: IWellnessActivity[];
    daysSober: number;
    onboardingData: OnboardingData;
    isSubscribed: boolean;
    gardenGrowthPoints: number;
    trustCircleConfig: ITrustCircleConfig | null;
    onUpdateTrustCircleConfig: (config: ITrustCircleConfig) => void;
    dopamineHits: IDopamineHit[];
}

export const ProgressView: React.FC<ProgressViewProps> = (props) => {
    const { isSubscribed, onboardingData } = props;
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {!isSubscribed && (
                    <div className="lg:col-span-3">
                        <UpgradeCard />
                    </div>
                )}
                
                <div className="lg:col-span-2 space-y-6">
                    <InnerGardenCard growthPoints={props.gardenGrowthPoints} />
                    <WellnessSummaryCard wellnessLog={props.wellnessLog} dopamineHits={props.dopamineHits} />
                     <WeeklyAnalysisCard 
                        cravings={props.cravings}
                        journalEntry={props.journalEntry}
                        wellnessLog={props.wellnessLog}
                        daysSober={props.daysSober}
                        userFocus={onboardingData.focuses}
                        isLocked={!isSubscribed}
                        dopamineHits={props.dopamineHits}
                    />
                </div>

                <div className="space-y-6">
                    <TrustCircleCard
                        config={props.trustCircleConfig}
                        onUpdateConfig={props.onUpdateTrustCircleConfig}
                        cravings={props.cravings}
                        daysSober={props.daysSober}
                        wellnessLog={props.wellnessLog}
                    />
                    {onboardingData.focuses.includes('addiction') && <PatternsCard cravings={props.cravings} journalEntry={props.journalEntry} isLocked={!isSubscribed} />}
                    <ResourcesCard />
                </div>
            </div>
            <div className="h-24" />
        </>
    );
};

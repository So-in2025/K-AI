import React, { useState, useEffect, useCallback } from 'react';
import { GoalsCard } from '../components/GoalsCard';
import { CravingTrackerCard } from '../components/CravingTrackerCard';
import { JournalCard } from '../components/JournalCard';
import { AffirmationGeneratorCard } from '../components/AffirmationGeneratorCard';
import { RemindersCard } from '../components/RemindersCard';
import { ThoughtLabCard } from '../components/ThoughtLabCard';
import { HabitLoopCard } from '../components/HabitLoopCard';
import { SoundtrackCard } from '../components/SoundtrackCard';
import { useUser } from '../contexts/UserContext';
import { IGoal, GoalType, IReminder, ICraving, IThoughtLabEntry, IHabitLoop } from '../types';

export const ToolsView: React.FC = () => {
    // Fix: Get all necessary data and functions from the user context.
    const { userData, updateUserData, addConversationTurn, checkAndConsumeUsage } = useUser();
    const [goals, setGoals] = useState<IGoal[]>(userData?.goals || []);
    const [isLoadingGoals, setIsLoadingGoals] = useState(false);

    useEffect(() => {
        if (userData?.goals) {
            setGoals(userData.goals);
        }
    }, [userData?.goals]);

    const handleGenerateGoal = useCallback(async (type: GoalType) => {
        if (!userData?.geminiApiKey || !userData.onboardingData) return;
        setIsLoadingGoals(true);

        const focusText = userData.onboardingData.focuses.join(', ');
        const prompt = `Basado en el enfoque de un usuario en ${focusText} y su progreso, genera una meta ${type} que sea S.M.A.R.T. (Específica, Medible, Alcanzable, Relevante, con Plazo). Sé conciso. Responde solo con el texto de la meta.`;
        
        // This requires direct call to gemini, cannot use the service from context as it's not provided in this view
        const geminiSvc = new (await import('../services/geminiService')).GeminiService(userData.geminiApiKey);
        const content = await geminiSvc.generateContent(prompt);
        
        const newGoal: IGoal = { type, content };
        const updatedGoals = [...goals.filter(g => g.type !== type), newGoal];
        setGoals(updatedGoals);
        updateUserData({ goals: updatedGoals }); 
        setIsLoadingGoals(false);
    }, [userData, updateUserData, goals]);

    const handleJournalSave = useCallback(() => {
        if (userData?.journalEntry) {
            const summary = userData.journalEntry.length > 150 ? `${userData.journalEntry.substring(0, 150)}...` : userData.journalEntry;
            addConversationTurn({
                role: 'user',
                text: `[ENTRADA DE DIARIO GUARDADA]\nAcabo de escribir en mi diario. Aquí tienes un resumen:\n"${summary}"`
            });
        }
    }, [userData?.journalEntry, addConversationTurn]);


    if (!userData || !userData.onboardingData) return null;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    {/* Fix: Pass all required props */}
                    <JournalCard 
                        entry={userData.journalEntry || ''}
                        onEntryChange={(newEntry) => updateUserData({ journalEntry: newEntry })}
                        onSave={handleJournalSave}
                    />
                    <ThoughtLabCard 
                        apiKey={userData.geminiApiKey || null}
                        entries={userData.thoughtLabEntries || []}
                        onAddEntry={(entry: IThoughtLabEntry) => updateUserData({ thoughtLabEntries: [entry, ...(userData.thoughtLabEntries || [])] })}
                        isSubscribed={userData.isSubscribed || false}
                        usageTracker={userData.usageTracker || null}
                        checkAndConsumeUsage={checkAndConsumeUsage}
                    />
                    <HabitLoopCard 
                        apiKey={userData.geminiApiKey || null}
                        loops={userData.habitLoops || []}
                        onAddLoop={(loop: IHabitLoop) => updateUserData({ habitLoops: [loop, ...(userData.habitLoops || [])] })}
                        isSubscribed={userData.isSubscribed || false}
                        usageTracker={userData.usageTracker || null}
                        checkAndConsumeUsage={checkAndConsumeUsage}
                    />
                    <AffirmationGeneratorCard 
                        apiKey={userData.geminiApiKey || null}
                        isSubscribed={userData.isSubscribed || false}
                        usageTracker={userData.usageTracker || null}
                        checkAndConsumeUsage={checkAndConsumeUsage}
                    />
                </div>
                <div className="space-y-6">
                    <CravingTrackerCard 
                        cravings={userData.cravings || []}
                        onLogCraving={(craving: ICraving) => updateUserData({ cravings: [craving, ...(userData.cravings || [])] })}
                    />
                    <GoalsCard 
                        goals={goals}
                        onGenerateGoal={handleGenerateGoal}
                        isLoading={isLoadingGoals}
                    />
                    <RemindersCard 
                        reminders={userData.reminders || []}
                        onAddReminder={(text: string, time: string) => {
                            const newReminder: IReminder = { id: crypto.randomUUID(), text, time };
                            updateUserData({ reminders: [...(userData.reminders || []), newReminder] });
                        }}
                        onDeleteReminder={(id: string) => updateUserData({ reminders: (userData.reminders || []).filter(r => r.id !== id) })}
                    />
                    <SoundtrackCard 
                        apiKey={userData.geminiApiKey || null}
                        onboardingData={userData.onboardingData}
                        isSubscribed={userData.isSubscribed || false}
                        usageTracker={userData.usageTracker || null}
                        checkAndConsumeUsage={checkAndConsumeUsage}
                        musicPreferences={userData.musicPreferences || null}
                        onUpdateMusicPreferences={(prefs) => updateUserData({ musicPreferences: prefs })}
                    />
                </div>
            </div>
        </>
    );
};

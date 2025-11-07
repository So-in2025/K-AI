import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { createUserProfileDocument, getUserProfile, updateUserProfile } from '../services/firestoreService';
import { GeminiService } from '../services/geminiService';
import { IConversationTurn, IUserProfile, FeatureID, UsageTracker } from '../types';

interface UserContextType {
    user: User | null;
    userData: IUserProfile | null;
    loading: boolean;
    geminiService: GeminiService | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserData: (data: Partial<IUserProfile>) => Promise<void>;
    daysSober: number;
    checkAndConsumeUsage: (featureId: FeatureID, limit?: number) => boolean;
    addConversationTurn: (turn: IConversationTurn) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<IUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const geminiService = useMemo(() => {
        if (userData?.geminiApiKey) {
            return new GeminiService(userData.geminiApiKey);
        }
        return null;
    }, [userData?.geminiApiKey]);

    const updateUserData = useCallback(async (data: Partial<IUserProfile>) => {
        if (user) {
            // Optimistic update
            setUserData(prev => prev ? { ...prev, ...data } : null);
            await updateUserProfile(user.uid, data);
        }
    }, [user]);
    
    const checkSubscriptionActivation = useCallback(async () => {
        const activationCode = localStorage.getItem('activationCode');
        if (activationCode && user && !userData?.isSubscribed) {
            console.log("Found activation code, attempting to verify...");
            try {
                const response = await fetch('/.netlify/functions/check-activation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: activationCode }),
                });

                if (response.ok) {
                    const { activated } = await response.json();
                    if (activated) {
                        console.log("Activation successful!");
                        await updateUserData({ isSubscribed: true });
                        localStorage.removeItem('activationCode');
                        alert("¡Felicidades! KIA Plus ha sido activado en tu cuenta.");
                    } else {
                        console.log("Activation code not valid or already used.");
                        // Optionally remove invalid code
                        // localStorage.removeItem('activationCode');
                    }
                }
            } catch (error) {
                console.error("Error checking subscription activation:", error);
            }
        }
    }, [user, userData?.isSubscribed, updateUserData]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
            setLoading(true);
            if (userAuth) {
                await createUserProfileDocument(userAuth);
                const profile = await getUserProfile(userAuth.uid);
                setUser(userAuth);
                setUserData(profile);
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && userData) {
            checkSubscriptionActivation();
        }
    }, [user, userData, checkSubscriptionActivation]);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error during sign-in:", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    };

    const daysSober = useMemo(() => {
        if (!userData?.startDate) return 0;
        const start = new Date(userData.startDate);
        const today = new Date();
        start.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - start.getTime();
        if (diffTime < 0) return 0;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    }, [userData?.startDate]);
    
    const addConversationTurn = useCallback((turn: IConversationTurn) => {
        const newConversation = [...(userData?.kaiConversation || []), turn];
        updateUserData({ kaiConversation: newConversation });
    }, [userData?.kaiConversation, updateUserData]);

    const checkAndConsumeUsage = useCallback((featureId: FeatureID, limit: number = 1): boolean => {
        if (userData?.isSubscribed) {
            return true;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const tracker: UsageTracker = userData?.usageTracker || {
            guardian: { count: 0, month: -1, year: 0 },
            weekly_analysis: { count: 0, month: -1, year: 0 },
            oracle: { count: 0, month: -1, year: 0 },
            thought_lab: { count: 0, month: -1, year: 0 },
            habit_architect: { count: 0, month: -1, year: 0 },
            affirmation_generator: { count: 0, month: -1, year: 0 },
            soundtrack: { count: 0, month: -1, year: 0 },
        };
        const featureUsage = tracker[featureId] || { count: 0, month: currentMonth, year: currentYear };
        
        if (featureUsage.year !== currentYear || featureUsage.month !== currentMonth) {
            featureUsage.count = 0;
            featureUsage.month = currentMonth;
            featureUsage.year = currentYear;
        }

        if (featureUsage.count < limit) {
            featureUsage.count += 1;
            const newTracker = { ...tracker, [featureId]: featureUsage };
            updateUserData({ usageTracker: newTracker });
            return true;
        } else {
            alert(`Has usado tu límite de ${limit} ${limit > 1 ? 'usos' : 'uso'} gratuito de esta herramienta este mes. Actualiza a KIA Plus para usos ilimitados.`);
            return false;
        }
    }, [userData, updateUserData]);


    const value = {
        user,
        userData,
        loading,
        geminiService,
        login,
        logout,
        updateUserData,
        daysSober,
        checkAndConsumeUsage,
        addConversationTurn,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { GeminiService } from '../services/geminiService.ts';
import { IConversationTurn, OnboardingData, IUserProfile } from '../types.ts';

// Usamos un subconjunto de IUserProfile para los datos locales, omitiendo campos de Firebase.
type LocalUserData = Omit<IUserProfile, 'uid' | 'email' | 'displayName' | 'photoURL' | 'createdAt' | 'isSubscribed' | 'usageTracker' | 'therapyTrialUsed'>;

const LOCAL_STORAGE_KEY = 'kiaUserData';

interface AppContextType {
    userData: LocalUserData | null;
    loading: boolean;
    geminiService: GeminiService | null;
    updateUserData: (data: Partial<LocalUserData>) => void;
    daysSober: number;
    addConversationTurn: (turn: IConversationTurn) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialData = (): LocalUserData | null => {
    try {
        const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error("Error al leer datos de localStorage", error);
        return null;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useState<LocalUserData | null>(getInitialData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    useEffect(() => {
        try {
            if (userData) {
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
            } else {
                window.localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        } catch (error) {
            console.error("Error al escribir datos en localStorage", error);
        }
    }, [userData]);

    const geminiService = useMemo(() => {
        if (userData?.geminiApiKey) {
            return new GeminiService(userData.geminiApiKey);
        }
        return null;
    }, [userData?.geminiApiKey]);

    const updateUserData = useCallback((data: Partial<LocalUserData>) => {
        setUserData(prev => ({ ...(prev || {} as LocalUserData), ...data }));
    }, []);
    
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

    const value = {
        userData,
        loading,
        geminiService,
        updateUserData,
        daysSober,
        addConversationTurn,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within a AppProvider');
    }
    return context;
};

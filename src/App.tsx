import React, { useState, useEffect } from 'react';
import { useUser } from './contexts/UserContext';
import { LoginView } from './views/LoginView';
import { OnboardingModal } from './components/OnboardingModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Header } from './components/Header';
import { SOSCard } from './components/SOSCard';
import { SettingsModal } from './components/SettingsModal';
import { NavigationBar, View } from './components/NavigationBar';
import { HomeView } from './views/HomeView';
import { KaiView } from './views/KaiView';
import { ToolsView } from './views/ToolsView';
import { ProgressView } from './views/ProgressView';
import { OnboardingData } from './types';

const App: React.FC = () => {
    const { user, userData, loading, updateUserData } = useUser();
    const [activeView, setActiveView] = useState<View>('home');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    // Automatically open API key modal if it's missing after login and onboarding
    useEffect(() => {
        if (userData && !userData.geminiApiKey) {
            setIsApiKeyModalOpen(true);
        }
    }, [userData]);

    const handleSaveOnboarding = (data: OnboardingData) => {
        updateUserData({ onboardingData: data });
    };

    const handleSaveApiKey = (key: string) => {
        updateUserData({ geminiApiKey: key });
        setIsApiKeyModalOpen(false);
    };

    const handleCloseApiKeyModal = () => {
        // Only allow closing if a key has been set
        if (userData?.geminiApiKey) {
            setIsApiKeyModalOpen(false);
        }
    }

    if (loading) {
        return (
            <div className="bg-slate-900 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (!user) {
        return <LoginView />;
    }

    // This state can happen briefly while the user profile is being created for the first time
    if (!userData) {
        return (
             <div className="bg-slate-900 min-h-screen flex items-center justify-center">
                <p>Cargando perfil...</p>
            </div>
        );
    }

    if (!userData.onboardingData) {
        return <OnboardingModal onSave={handleSaveOnboarding} />;
    }

    const renderView = () => {
        switch(activeView) {
            case 'home': return <HomeView />;
            case 'kai': return <KaiView />;
            case 'tools': return <ToolsView />;
            case 'progress': return <ProgressView />;
            default: return <HomeView />;
        }
    };
  
    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 flex flex-col h-screen">
            <Header onSettingsClick={() => setIsSettingsModalOpen(true)} />
            
            <main className="flex-grow overflow-y-auto max-w-screen-2xl w-full mx-auto p-4 md:p-6">
                {userData.onboardingData?.focuses.includes('addiction') && <SOSCard />}
                <div className="mt-6">
                    {renderView()}
                </div>
            </main>

            <NavigationBar activeView={activeView} setActiveView={setActiveView} />

            {isApiKeyModalOpen && <ApiKeyModal onClose={handleCloseApiKeyModal} onSave={handleSaveApiKey} />}
            {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />}
        </div>
    );
};

export default App;

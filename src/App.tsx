import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { SOSCard } from './components/SOSCard.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import { NavigationBar, View } from './components/NavigationBar.tsx';
import { HomeView } from './views/HomeView.tsx';
import { KaiView } from './views/KaiView.tsx';
import { ToolsView } from './views/ToolsView.tsx';
import { ProgressView } from './views/ProgressView.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { OnboardingData } from './types.ts';
import { useUser } from './contexts/UserContext.tsx';
import { LoginView } from './views/LoginView.tsx';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
    </div>
);

const App: React.FC = () => {
  const { user, userData, loading, updateUserData } = useUser();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');

  // Check for activation code on initial load
  useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const activationCode = urlParams.get('sck');
      if (activationCode) {
          localStorage.setItem('activationCode', activationCode);
          window.history.replaceState({}, document.title, window.location.pathname);
      }
  }, []);

  useEffect(() => {
    // This effect determines if the API key modal should be shown after login/onboarding
    if (!loading && user && userData?.onboardingData && !userData.geminiApiKey) {
        setIsApiKeyModalOpen(true);
    }
  }, [loading, user, userData]);

  const handleSaveOnboarding = (data: OnboardingData) => {
    updateUserData({ onboardingData: data });
  };
  
  const handleSaveApiKey = (apiKey: string) => {
    updateUserData({ geminiApiKey: apiKey });
    setIsApiKeyModalOpen(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
      return <LoginView />;
  }

  if (!userData?.onboardingData) {
    return <OnboardingModal onSave={handleSaveOnboarding} />;
  }
  
  // Show ApiKeyModal if onboarding is done but key is missing
  if (isApiKeyModalOpen) {
      return <ApiKeyModal onClose={() => setIsApiKeyModalOpen(false)} onSave={handleSaveApiKey} />;
  }
  
  const renderView = () => {
    switch(activeView) {
      case 'home':
        return <HomeView />;
      case 'kai':
        return <KaiView />;
      case 'tools':
        return <ToolsView />;
      case 'progress':
        return <ProgressView />;
      default:
        return <HomeView />;
    }
  }
  
  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 flex flex-col h-screen">
      <Header 
        onSettingsClick={() => setIsSettingsModalOpen(true)} 
      />
      
      <main className="flex-grow overflow-y-auto max-w-screen-2xl w-full mx-auto p-4 md:p-6">
        {userData.onboardingData.focuses.includes('addiction') && <SOSCard />}
        <div className="mt-6">
          {renderView()}
        </div>
      </main>

      <NavigationBar activeView={activeView} setActiveView={setActiveView} />

      {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
    </div>
  );
};

export default App;
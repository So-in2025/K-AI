
import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { SOSCard } from './components/SOSCard.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import { NavigationBar, View } from './components/NavigationBar.tsx';
import { HomeView } from './views/HomeView.tsx';
import { KaiView } from './views/KaiView.tsx';
import { ToolsView } from './views/ToolsView.tsx';
import { ProgressView } from './views/ProgressView.tsx';
import { LoginView } from './views/LoginView.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { useUser } from './contexts/UserContext.tsx';
import { OnboardingData } from './types';

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

  const handleSaveOnboarding = (data: OnboardingData) => {
    updateUserData({ onboardingData: data });
  };
  
  const handleSaveApiKey = (key: string) => {
    updateUserData({ geminiApiKey: key });
    setIsApiKeyModalOpen(false);
  };
  
  const handleNavigateToProgress = () => {
    setActiveView('progress');
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

  if (!userData.geminiApiKey) {
    return <ApiKeyModal onClose={() => { /* No-op, must save key */ }} onSave={handleSaveApiKey} />;
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
        onNavigateToProgress={handleNavigateToProgress}
      />
      
      <main className="flex-grow overflow-y-auto max-w-screen-2xl w-full mx-auto p-4 md:p-6">
        {userData.onboardingData.focuses.includes('addiction') && <SOSCard />}
        <div className="mt-6">
          {renderView()}
        </div>
      </main>

      <NavigationBar activeView={activeView} setActiveView={setActiveView} />

      {isApiKeyModalOpen && <ApiKeyModal onClose={() => setIsApiKeyModalOpen(false)} onSave={handleSaveApiKey} />}
      {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />}
    </div>
  );
};

export default App;
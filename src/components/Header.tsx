
import React, { useState, useRef } from 'react';
import { UserFocus, USER_FOCUS_OPTIONS, OnboardingData } from '../types';
import { KiaIcon } from './KiaIcon';
import { useUser } from '../contexts/UserContext';

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const HelpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


interface HeaderProps {
    onSettingsClick: () => void;
    onHelpClick: () => void;
}

const getTitle = (focuses: UserFocus[] = []): string => {
    if (focuses.length === 0) return 'Kindness, Introspection, Awareness';
    if (focuses.length === 1) return USER_FOCUS_OPTIONS[focuses[0]];
    
    const focusLabels = focuses.map(f => {
        switch(f) {
            case 'addiction': return 'Adicción';
            case 'depression': return 'Depresión';
            case 'grief': return 'Duelo';
            default: return '';
        }
    }).filter(Boolean);
    
    return `Afrontando ${focusLabels.join(' y ')}`;
}


export const Header: React.FC<HeaderProps> = ({ onSettingsClick, onHelpClick }) => {
  const { userData } = useUser();
  const title = getTitle(userData?.onboardingData?.focuses);
  const isSubscribed = userData?.isSubscribed || false;

  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<number | null>(null);

  const handleLogoTap = () => {
      if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
      }

      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);

      if (newTapCount >= 5) {
          localStorage.setItem('developerMode', 'true');
          alert('Modo desarrollador activado.');
          setTapCount(0);
      } else {
          tapTimeoutRef.current = window.setTimeout(() => {
              setTapCount(0);
          }, 2000); // Reset after 2 seconds if taps stop
      }
  };

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoTap}>
            <KiaIcon className="h-8 w-8 text-teal-400"/>
             <div>
                 <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-wider">
                  KIA
                </h1>
                <p className="text-xs text-teal-300 -mt-1">{title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {!isSubscribed && (
              <a 
                href="https://pay.hotmart.com/F102777841D?off=yx1yoozm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-yellow-300 hover:text-yellow-200 transition-colors mr-2"
              >
                Activar KIA Plus ✨
              </a>
            )}
            <button onClick={onHelpClick} className="text-slate-400 hover:text-teal-400 transition-colors p-2 rounded-full hover:bg-slate-800" aria-label="Ayuda y Recursos">
                <HelpIcon />
            </button>
            <button onClick={onSettingsClick} className="text-slate-400 hover:text-teal-400 transition-colors p-2 rounded-full hover:bg-slate-800" aria-label="Configuración">
                <SettingsIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

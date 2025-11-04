import React from 'react';
import { UserFocus, USER_FOCUS_OPTIONS } from '../types';
import { KiaIcon } from './KiaIcon';

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface HeaderProps {
    onSettingsClick: () => void;
    userFocus: UserFocus[];
}

const getTitle = (focuses: UserFocus[]): string => {
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


export const Header: React.FC<HeaderProps> = ({ onSettingsClick, userFocus }) => {
  const title = getTitle(userFocus);

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <KiaIcon className="h-8 w-8 text-teal-400"/>
             <div>
                 <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-wider">
                  KIA
                </h1>
                <p className="text-xs text-teal-300 -mt-1">{title}</p>
            </div>
          </div>
          <button onClick={onSettingsClick} className="text-slate-400 hover:text-teal-400 transition-colors p-2 rounded-full hover:bg-slate-800" aria-label="Configuración">
              <SettingsIcon />
          </button>
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { KiaIcon } from './KiaIcon';

// --- SVG Icons ---

const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const ToolsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.153-.186.296-.375.449-.572l2.496-3.03c.153-.186.296-.375.449-.572a2.652 2.652 0 000-3.749 2.652 2.652 0 00-3.749 0l-5.877 5.877m-3.749 3.749a2.652 2.652 0 000 3.749 2.652 2.652 0 003.749 0l5.877-5.877" />
  </svg>
);

const ProgressIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);


// --- Component ---

export type View = 'home' | 'kai' | 'tools' | 'progress';

interface NavigationBarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems = [
  { view: 'home', label: 'Inicio', Icon: HomeIcon },
  { view: 'kai', label: 'Kai', Icon: KiaIcon },
  { view: 'tools', label: 'Herramientas', Icon: ToolsIcon },
  { view: 'progress', label: 'Progreso', Icon: ProgressIcon },
] as const;

export const NavigationBar: React.FC<NavigationBarProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="bg-slate-800/70 backdrop-blur-sm border-t border-slate-700 sticky bottom-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-around h-16">
          {navItems.map(({ view, label, Icon }) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex flex-col items-center justify-center w-full transition-colors duration-200 p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${activeView === view ? 'text-teal-400' : 'text-slate-400 hover:text-teal-400 hover:bg-slate-700/50'}`}
              aria-current={activeView === view ? 'page' : undefined}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

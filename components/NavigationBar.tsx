import React from 'react';

export type View = 'home' | 'kai' | 'tools' | 'progress';

interface NavigationBarProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

// SVG Icons for the navigation bar
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const KaiIcon = ({ isActive }: { isActive: boolean }) => (
   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const ToolsIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ProgressIcon = ({ isActive }: { isActive: boolean }) => (
   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);


const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    const activeClass = isActive ? 'text-teal-400' : 'text-slate-400 hover:text-teal-300';
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 transition-colors ${activeClass}`}>
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

export const NavigationBar: React.FC<NavigationBarProps> = ({ activeView, setActiveView }) => {
    return (
        <nav className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 z-20 flex-shrink-0">
            <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-20 grid grid-cols-4 gap-4">
                <NavItem 
                    icon={<HomeIcon isActive={activeView === 'home'} />} 
                    label="Hoy"
                    isActive={activeView === 'home'}
                    onClick={() => setActiveView('home')}
                />
                <NavItem 
                    icon={<KaiIcon isActive={activeView === 'kai'} />} 
                    label="Kai"
                    isActive={activeView === 'kai'}
                    onClick={() => setActiveView('kai')}
                />
                <NavItem 
                    icon={<ToolsIcon isActive={activeView === 'tools'} />} 
                    label="Herramientas"
                    isActive={activeView === 'tools'}
                    onClick={() => setActiveView('tools')}
                />
                <NavItem 
                    icon={<ProgressIcon isActive={activeView === 'progress'} />} 
                    label="Progreso"
                    isActive={activeView === 'progress'}
                    onClick={() => setActiveView('progress')}
                />
            </div>
        </nav>
    );
};
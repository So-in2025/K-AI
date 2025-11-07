import React, { useEffect, useState } from 'react';

interface FireworksEffectProps {
    onComplete: () => void;
}

const NUM_PARTICLES = 150;
const DURATION = 3000; // 3 seconds

export const FireworksEffect: React.FC<FireworksEffectProps> = ({ onComplete }) => {
    const [particles, setParticles] = useState<React.CSSProperties[]>([]);

    useEffect(() => {
        const newParticles: React.CSSProperties[] = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            const angle = Math.random() * 360;
            const radius = Math.random() * 150 + 50;
            const x = Math.cos(angle * (Math.PI / 180)) * radius;
            const y = Math.sin(angle * (Math.PI / 180)) * radius;
            const hue = Math.random() * 50 + 150; // Teals, cyans, greens

            newParticles.push({
                '--x': `${x}px`,
                '--y': `${y}px`,
                '--hue': `${hue}`,
                '--delay': `${Math.random() * 0.5}s`,
                '--duration': `${Math.random() * 0.5 + 0.5}s`,
                '--size': `${Math.random() * 2 + 1}px`,
            } as React.CSSProperties);
        }
        setParticles(newParticles);

        const timer = setTimeout(onComplete, DURATION);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <style>{`
                @keyframes firework-explode {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--x), var(--y)) scale(0);
                        opacity: 0;
                    }
                }
                .firework-particle {
                    position: absolute;
                    width: var(--size);
                    height: var(--size);
                    background-color: hsl(var(--hue), 100%, 70%);
                    border-radius: 50%;
                    animation: firework-explode var(--duration) ease-out forwards;
                    animation-delay: var(--delay);
                }
            `}</style>
            <div className="relative">
                {particles.map((style, index) => (
                    <div key={index} className="firework-particle" style={style} />
                ))}
            </div>
        </div>
    );
};

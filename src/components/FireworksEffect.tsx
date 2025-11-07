import React, { useEffect, useRef } from 'react';

interface FireworksEffectProps {
    onComplete: () => void;
}

export const FireworksEffect: React.FC<FireworksEffectProps> = ({ onComplete }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const fireworksCount = 15;
        const duration = 3000; // 3 seconds

        for (let i = 0; i < fireworksCount; i++) {
            setTimeout(() => {
                createFirework(container);
            }, Math.random() * (duration - 1000));
        }

        const timeout = setTimeout(onComplete, duration);

        return () => clearTimeout(timeout);
    }, [onComplete]);

    const createFirework = (container: HTMLElement) => {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${Math.random() * 100}%`;
        
        const particleCount = 12;
        for(let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--angle', `${(360 / particleCount) * i}deg`);
            particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            firework.appendChild(particle);
        }
        
        container.appendChild(firework);

        setTimeout(() => {
            firework.remove();
        }, 1000); // Corresponds to animation duration
    };

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            <style>{`
                .firework {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    opacity: 0;
                    animation: fadeIn 0.1s ease-out forwards;
                }
                .particle {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    animation: explode 1s ease-out forwards;
                }
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
                @keyframes explode {
                    0% {
                        transform: rotate(var(--angle)) translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: rotate(var(--angle)) translateY(80px) scale(0);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

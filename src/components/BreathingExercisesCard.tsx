
import React, { useState, useEffect, useRef } from 'react';
import { BREATHING_EXERCISES } from '../constants.ts';
import { IExercise } from '../types.ts';
import ttsService from '../services/ttsService.ts';
import { useUser } from '../contexts/UserContext.tsx';

const LungsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.338 10.134A7.5 7.5 0 0112 4.5a7.5 7.5 0 016.662 5.634m-3.332 0a4.5 4.5 0 01-6.664 0M2 17.5a9.5 9.5 0 0115.826-7.366A9.5 9.5 0 0122 17.5H2z" />
    </svg>
);

const ExerciseModal: React.FC<{ exercise: IExercise; onClose: () => void, onLogActivity: (exerciseName: string, durationMinutes: number) => void; }> = ({ exercise, onClose, onLogActivity }) => {
    const [stepIndex, setStepIndex] = useState(-1);
    const [cycles, setCycles] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const totalDurationSeconds = useRef(0);

    // Fix: Robustly calculate current step, handling setup phase, looping, and initial state.
    const isSetupPhase = stepIndex >= 0 && stepIndex < (exercise.setup?.length || 0);
    const currentStepList = isSetupPhase ? exercise.setup! : exercise.steps;
    const currentStepIndexInList = isSetupPhase ? stepIndex : (stepIndex - (exercise.setup?.length || 0)) % exercise.steps.length;
    const currentStep = stepIndex >= 0 ? currentStepList[currentStepIndexInList] : null;

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            ttsService.stop();
        };
    }, []);

    const startExercise = () => {
        setIsRunning(true);
        setStepIndex(0);
        totalDurationSeconds.current = 0;
    };
    
    const stopExercise = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        ttsService.stop();
        if (totalDurationSeconds.current > 0) {
            onLogActivity(exercise.name, Math.ceil(totalDurationSeconds.current / 60));
        }
        onClose();
    };

    useEffect(() => {
        if (!isRunning || !currentStep) return;

        // Fix: Use type guards to correctly access properties on the union type for the current step.
        const duration = 'pause' in currentStep ? currentStep.pause : currentStep.duration;
        setTimeLeft(duration / 1000);
        
        // Fix: Use type guards to correctly access properties on the union type for the current step.
        const textToSpeak = 'text' in currentStep ? currentStep.text : (currentStep.instruction || currentStep.name);
        ttsService.speak(textToSpeak);

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            totalDurationSeconds.current += duration / 1000;
            
            setStepIndex(prev => {
                const nextStepIndex = prev + 1;
                const hasSetup = (exercise.setup?.length || 0) > 0;
                const nextIsSetup = hasSetup && nextStepIndex < (exercise.setup?.length || 0);
                
                if (!isSetupPhase && currentStepIndexInList === exercise.steps.length - 1) {
                    setCycles(c => c + 1);
                }
                
                return nextStepIndex;
            });
            
        }, duration);

        return () => clearTimeout(timeout);

    }, [stepIndex, isRunning]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-center">
                <h3 className="text-xl font-bold mb-2">{exercise.name}</h3>
                {!isRunning ? (
                    <>
                        <p className="text-slate-400 mb-6">{exercise.description}</p>
                        <div className="flex gap-4">
                             <button onClick={onClose} className="w-full bg-slate-600 py-2 rounded">Cerrar</button>
                             <button onClick={startExercise} className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg">Comenzar</button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        {/* Fix: Use type guards to correctly access properties on the union type for the current step. */}
                        <p className="text-2xl font-bold text-teal-400 mb-4">{currentStep && ('name' in currentStep ? currentStep.name : currentStep.text)}</p>
                        <div className="w-32 h-32 rounded-full border-4 border-teal-500 flex items-center justify-center mb-4">
                            <span className="text-4xl font-bold">{timeLeft > 0 ? timeLeft : 0}</span>
                        </div>
                        <p className="text-slate-300 mb-4">Ciclos: {cycles}</p>
                        <button onClick={stopExercise} className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">Terminar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const BreathingExercisesCard: React.FC = () => {
    const [selectedExercise, setSelectedExercise] = useState<IExercise | null>(null);
    const { updateUserData, userData } = useUser();

    const handleLogActivity = (exerciseName: string, durationMinutes: number) => {
        const newActivity = {
            date: new Date().toISOString(),
            exerciseName,
            durationMinutes,
            category: 'Breathing' as const
        };
        const updatedLog = [...(userData?.wellnessLog || []), newActivity];
        updateUserData({ wellnessLog: updatedLog });
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
                <LungsIcon />
                <h2 className="text-xl font-bold text-slate-100">Respiración Consciente</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Calma tu sistema nervioso en minutos. Elige un ejercicio para empezar.
            </p>
            <div className="space-y-2">
                {BREATHING_EXERCISES.map(ex => (
                    <button
                        key={ex.id}
                        onClick={() => setSelectedExercise(ex)}
                        className="w-full text-left bg-slate-700/50 p-3 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        <p className="font-semibold text-slate-200">{ex.name}</p>
                        <p className="text-xs text-slate-400">{ex.description}</p>
                    </button>
                ))}
            </div>
            {selectedExercise && <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} onLogActivity={handleLogActivity} />}
        </div>
    );
};
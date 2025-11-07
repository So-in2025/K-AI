
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import { IReminder } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import { TtsInfoButton } from './TtsInfoButton.tsx';

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const RemindersCard: React.FC = () => {
    const { userData, updateUserData } = useUser();
    const reminders = userData?.reminders || [];
    const [newReminderText, setNewReminderText] = useState('');
    const [newReminderTime, setNewReminderTime] = useState('12:00');

    const handleAddReminder = () => {
        if (!newReminderText.trim()) return;
        const newReminder: IReminder = {
            id: uuidv4(),
            text: newReminderText,
            time: newReminderTime,
        };
        updateUserData({ reminders: [...reminders, newReminder] });
        setNewReminderText('');
    };

    const handleDeleteReminder = (id: string) => {
        updateUserData({ reminders: reminders.filter(r => r.id !== id) });
    };
    
    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
            <TtsInfoButton explanation="Los pequeños hábitos construyen grandes cambios. Usa esta herramienta para crear recordatorios amables a lo largo de tu día: para respirar, beber agua, o simplemente hacer una pausa consciente." />
            <div className="flex items-center space-x-3 mb-3">
                <BellIcon />
                <h2 className="text-xl font-bold text-slate-100">Mis Recordatorios</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
                Crea anclas de conciencia a lo largo de tu día.
            </p>

            <div className="space-y-2 mb-4 max-h-24 overflow-y-auto pr-2">
                {reminders.length > 0 ? (
                    reminders.map(reminder => (
                        <div key={reminder.id} className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-slate-200 text-sm">{reminder.text}</p>
                                <p className="text-xs text-teal-400">{reminder.time}</p>
                            </div>
                            <button onClick={() => handleDeleteReminder(reminder.id)} className="text-slate-500 hover:text-red-500 text-xs">X</button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 text-center">No tienes recordatorios.</p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={newReminderText}
                    onChange={(e) => setNewReminderText(e.target.value)}
                    placeholder="Ej: 'Respirar 1 min'"
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm"
                />
                <input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm"
                />
                <button
                    onClick={handleAddReminder}
                    className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 text-sm"
                >
                    Añadir
                </button>
            </div>
        </div>
    );
};
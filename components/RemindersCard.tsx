
import React, { useState } from 'react';
import { IReminder } from '../types';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


interface RemindersCardProps {
    reminders: IReminder[];
    onAddReminder: (text: string, time: string) => void;
    onDeleteReminder: (id: string) => void;
}

export const RemindersCard: React.FC<RemindersCardProps> = ({ reminders, onAddReminder, onDeleteReminder }) => {
    const [text, setText] = useState('');
    const [time, setTime] = useState('');

    const handleAdd = () => {
        if (!text.trim() || !time) {
            alert('Por favor, escribe el recordatorio y selecciona una hora.');
            return;
        }
        onAddReminder(text, time);
        setText('');
        setTime('');
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
                <ClockIcon />
                <h2 className="text-xl font-bold text-slate-100">Mis Recordatorios</h2>
            </div>
            <p className="text-slate-400 mb-4 text-sm">Añade recordatorios para tareas importantes. Recibirás una notificación a la hora que elijas.</p>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Ej: Tomar medicamento"
                    className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="p-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <button
                    onClick={handleAdd}
                    className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Añadir
                </button>
            </div>

            <div className="space-y-2">
                {reminders.length > 0 ? (
                    reminders.map(reminder => (
                        <div key={reminder.id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-slate-200">{reminder.text}</p>
                                <p className="text-xs text-teal-400 font-mono">{reminder.time}</p>
                            </div>
                            <button 
                                onClick={() => onDeleteReminder(reminder.id)}
                                className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-slate-600 transition-colors"
                                aria-label="Eliminar recordatorio"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-sm text-slate-500 italic py-4">No tienes recordatorios activos.</p>
                )}
            </div>
        </div>
    );
};

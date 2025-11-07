import React, { useState } from 'react';
import { IMusicPreferences } from '../types';
import { MUSIC_GENRES } from '../constants';

interface MusicPreferencesModalProps {
  onClose: () => void;
  onSave: (preferences: IMusicPreferences) => void;
  initialPreferences: IMusicPreferences | null;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const MusicPreferencesModal: React.FC<MusicPreferencesModalProps> = ({ onClose, onSave, initialPreferences }) => {
    const [selectedGenres, setSelectedGenres] = useState<string[]>(initialPreferences?.genres || []);
    const [artists, setArtists] = useState(initialPreferences?.artists || '');

    const handleToggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const handleSubmit = () => {
        if (selectedGenres.length === 0 || !artists.trim()) {
            alert('Por favor, selecciona al menos un género y un artista.');
            return;
        }
        onSave({ genres: selectedGenres, artists });
    };

    const renderButton = (label: string, isSelected: boolean, onClick: () => void) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors border ${
                isSelected 
                ? 'bg-teal-500 text-white border-teal-500' 
                : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-teal-400">Tus Gustos Musicales</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>

                <div className="mb-5">
                    <h3 className="text-md font-semibold text-slate-300 mb-3">1. ¿Qué géneros musicales te gustan?</h3>
                    <div className="flex flex-wrap gap-2">
                        {MUSIC_GENRES.map(genre => 
                            renderButton(genre, selectedGenres.includes(genre), () => handleToggleGenre(genre))
                        )}
                    </div>
                </div>

                <div className="mb-5">
                    <h3 className="text-md font-semibold text-slate-300 mb-2">2. ¿Cuáles son tus artistas o bandas favoritas?</h3>
                    <p className="text-xs text-slate-400 mb-2">Escribe 2 o 3 nombres separados por comas.</p>
                    <input
                        value={artists}
                        onChange={(e) => setArtists(e.target.value)}
                        placeholder="Ej: Gustavo Cerati, The Beatles, Daft Punk..."
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={selectedGenres.length === 0 || !artists.trim()}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    Guardar y Crear Banda Sonora
                </button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
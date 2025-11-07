
import React, { useState } from 'react';
import { IMusicPreferences } from '/src/types.ts';
import { MUSIC_GENRES } from '/src/constants.ts';

interface MusicPreferencesModalProps {
    initialPreferences?: IMusicPreferences;
    onClose: () => void;
    onSave: (preferences: IMusicPreferences) => void;
}

export const MusicPreferencesModal: React.FC<MusicPreferencesModalProps> = ({ initialPreferences, onClose, onSave }) => {
    const [genres, setGenres] = useState<string[]>(initialPreferences?.genres || []);
    const [artists, setArtists] = useState(initialPreferences?.artists || '');

    const handleGenreToggle = (genre: string) => {
        setGenres(prev => 
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const handleSave = () => {
        if (genres.length > 0 || artists.trim()) {
            onSave({ genres, artists: artists.trim() });
            onClose();
        } else {
            alert("Por favor, selecciona al menos un género o escribe un artista.");
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">Tus Gustos Musicales</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Géneros (selecciona tus favoritos)</label>
                        <div className="flex flex-wrap gap-2">
                            {MUSIC_GENRES.map(genre => (
                                <button key={genre} onClick={() => handleGenreToggle(genre)} className={`px-3 py-1 rounded-full text-xs transition-colors ${genres.includes(genre) ? 'bg-teal-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Artistas o bandas similares</label>
                        <input type="text" value={artists} onChange={e => setArtists(e.target.value)} placeholder="Ej: Sigur Rós, Bon Iver, Brian Eno" className="w-full bg-slate-700 p-2 rounded border border-slate-600" />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="text-slate-400 hover:text-white px-4 py-2 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">Generar</button>
                </div>
            </div>
        </div>
    );
};
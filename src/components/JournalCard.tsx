

import React, { useState, useEffect, useCallback } from 'react';
import { JOURNAL_PROMPTS } from '/src/constants.ts';
import { TtsInfoButton } from '/src/components/TtsInfoButton.tsx';

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

type CategoryKey = keyof typeof JOURNAL_PROMPTS;

interface JournalCardProps {
    entry: string;
    onEntryChange: (newEntry: string) => void;
    onSave: () => void;
}

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export const JournalCard: React.FC<JournalCardProps> = ({ entry: initialEntry, onEntryChange, onSave }) => {
  const [localEntry, setLocalEntry] = useState(initialEntry);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const debouncedEntry = useDebounce(localEntry, 1500); // 1.5 seconds delay

  // Effect to call the parent's onEntryChange for auto-saving
  useEffect(() => {
    if (debouncedEntry !== initialEntry) {
      onEntryChange(debouncedEntry);
    }
  }, [debouncedEntry, initialEntry, onEntryChange]);

  // Sync local state if parent prop changes
  useEffect(() => {
    setLocalEntry(initialEntry);
  }, [initialEntry]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalEntry(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    onEntryChange(localEntry); // Ensure the latest version is saved immediately
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2 seconds
    onSave();
  };

  const handleAddPrompt = (prompt: string) => {
    const newEntry = localEntry.trim() ? `${localEntry.trim()}\n\n${prompt} ` : `${prompt} `;
    setLocalEntry(newEntry);
    const textarea = document.getElementById('journal-textarea') as HTMLTextAreaElement;
    if (textarea) {
        textarea.focus();
    }
    setSelectedCategory(null);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative">
        <TtsInfoButton explanation="El diario es tu espacio sagrado para la introspección. Escribir tus pensamientos te ayuda a procesar emociones y ganar claridad. Si no sabes por dónde empezar, usa una de las guías para inspirarte. Tu progreso se guarda automáticamente y, al presionar 'Guardar y Reflexionar', Kai recibirá un resumen de tu entrada para entenderte mejor." />
        <div className="flex items-center space-x-3 mb-3">
            <EditIcon/>
            <h2 className="text-xl font-bold text-slate-100">Mi Diario Personal</h2>
        </div>
        <p className="text-slate-400 mb-4 text-sm">Usa este espacio para escribir tus pensamientos. Si no sabes por dónde empezar, usa una de las guías. Tu progreso se guarda automáticamente.</p>
        
        <div className="mb-4">
            <div className="flex flex-wrap gap-2">
                {/* Fix: Replaced buggy Object.entries with Object.keys for improved type safety. */}
                {(Object.keys(JOURNAL_PROMPTS) as CategoryKey[]).map((key) => (
                    <button 
                        key={key}
                        onClick={() => setSelectedCategory(prev => prev === key ? null : key)}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${selectedCategory === key ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        {JOURNAL_PROMPTS[key].title}
                    </button>
                ))}
            </div>

            {selectedCategory && (
                <div className="mt-3 bg-slate-700/50 p-3 rounded-lg flex flex-col items-start gap-2">
                    {JOURNAL_PROMPTS[selectedCategory].prompts.map((prompt, index) => (
                        <button 
                            key={index}
                            onClick={() => handleAddPrompt(prompt)}
                            className="text-left text-sm text-teal-400 hover:underline"
                        >
                            {`"${prompt}"`}
                        </button>
                    ))}
                </div>
            )}
        </div>

      <textarea
        id="journal-textarea"
        value={localEntry}
        onChange={handleChange}
        placeholder="¿Cómo te sientes hoy?"
        className="w-full h-40 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-slate-200"
      />
      <div className="flex items-center justify-end mt-4">
        {isSaved && <p className="text-sm text-green-400 mr-4">Guardado.</p>}
        <button
          onClick={handleSave}
          className="bg-teal-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-400"
          disabled={!localEntry.trim()}
        >
          Guardar y Reflexionar con Kai
        </button>
      </div>
    </div>
  );
};

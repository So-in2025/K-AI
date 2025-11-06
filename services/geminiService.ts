import { GoogleGenAI } from "@google/genai";

const API_KEY_STORAGE_KEY = 'geminiApiKey';

// Helper function to get the API key from local or session storage
export const getApiKey = (): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || sessionStorage.getItem(API_KEY_STORAGE_KEY);
};

// Helper function to save the API key
export const saveApiKey = (key: string, forSession: boolean = false) => {
    if (forSession) {
        sessionStorage.setItem(API_KEY_STORAGE_KEY, key);
        localStorage.removeItem(API_KEY_STORAGE_KEY);
    } else {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
        sessionStorage.removeItem(API_KEY_STORAGE_KEY);
    }
};


export const getGeminiResponse = async (prompt: string, systemInstruction?: string): Promise<string> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return "Error: Parece que no tienes conexión a internet. Por favor, revisa tu conexión e inténtalo de nuevo.";
    }

    const apiKey = getApiKey();
    if (!apiKey) {
        return "Error: Tu API Key de Gemini no ha sido configurada. Por favor, ve a Configuración para añadirla.";
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...(systemInstruction && { systemInstruction }),
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('timed out') || errorMessage.includes('network')) {
             return "Error: La conexión con el servicio de IA tardó demasiado en responder. Por favor, revisa tu conexión a internet e inténtalo de nuevo.";
        }
        if (errorMessage.includes('API key not valid')) {
             return "Error: Tu API Key no es válida. Por favor, revisa que esté correcta en Configuración o genera una nueva.";
        }
        
        return "Hubo un error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde.";
    }
};

import { GoogleGenAI } from "@google/genai";

export const getApiKey = (): string | null => {
    return localStorage.getItem('geminiApiKey') || sessionStorage.getItem('geminiApiKey');
};

export const getGeminiResponse = async (prompt: string, systemInstruction?: string): Promise<string> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return "Error: Parece que no tienes conexión a internet. Por favor, revisa tu conexión e inténtalo de nuevo.";
    }

    const apiKey = getApiKey();
    if (!apiKey) {
        return "Error: La API Key de Gemini no ha sido configurada. Por favor, configúrala en los ajustes.";
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
        
        if (errorMessage.includes('API key not valid') || errorMessage.includes('permission')) {
             return "Error: Tu API Key no es válida o no tiene los permisos necesarios. Por favor, revísala en los ajustes o genera una nueva.";
        }
        if (errorMessage.includes('timed out') || errorMessage.includes('network')) {
             return "Error: La conexión con el servicio de IA tardó demasiado en responder. Por favor, revisa tu conexión a internet e inténtalo de nuevo.";
        }
        
        return "Hubo un error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde.";
    }
};
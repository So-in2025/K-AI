import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (prompt: string, systemInstruction?: string): Promise<string> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return "Error: Parece que no tienes conexión a internet. Por favor, revisa tu conexión e inténtalo de nuevo.";
    }

    // API Key is now handled by environment variables.
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured in process.env.API_KEY");
        return "Error: La API Key de Gemini no ha sido configurada en el entorno de la aplicación.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
             return "Error: La API Key configurada en el servidor no es válida. Por favor, contacta al administrador de la aplicación.";
        }
        
        return "Hubo un error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde.";
    }
};
import { GoogleGenAI } from "@google/genai";

export const getApiKey = (): string | null => {
    return localStorage.getItem('geminiApiKey') || sessionStorage.getItem('geminiApiKey');
};

export const getGeminiResponse = async (prompt: string, systemInstruction?: string): Promise<string> => {
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
        // Check for specific authentication error to guide the user
        if (error instanceof Error && error.message.includes('API key not valid')) {
             return "Error: Tu API Key no es válida. Por favor, revísala en los ajustes o genera una nueva.";
        }
        return "Hubo un error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde.";
    }
};
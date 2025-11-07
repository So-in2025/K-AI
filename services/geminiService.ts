import { GoogleGenAI } from "@google/genai";

export class GeminiService {
    private ai: GoogleGenAI | null = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            try {
                // Fix: Initialize GoogleGenAI with a named apiKey parameter as per the latest SDK guidelines.
                this.ai = new GoogleGenAI({ apiKey });
            } catch (error) {
                console.error("Error initializing GoogleGenAI:", error);
                this.ai = null;
            }
        }
    }

    public isConfigured(): boolean {
        return !!this.ai;
    }

    public async generateContent(prompt: string, systemInstruction?: string, isJson: boolean = false): Promise<string> {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return "Error: Parece que no tienes conexión a internet. Por favor, revisa tu conexión e inténtalo de nuevo.";
        }

        if (!this.ai) {
            return "Error: Tu API Key de Gemini no ha sido configurada. Por favor, ve a Configuración para añadirla.";
        }

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    ...(systemInstruction && { systemInstruction: systemInstruction }),
                    ...(isJson && { responseMimeType: "application/json" }),
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
                 return "Error: Tu API Key no es válida o no tiene los permisos necesarios. Por favor, revísala en los ajustes o genera una nueva.";
            }
            
            return "Hubo un error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde.";
        }
    }
}

// Fix: Add the missing getGeminiResponse function to resolve import errors in multiple components.
export const getGeminiResponse = async (apiKey: string | null, prompt: string, systemInstruction?: string, isJson: boolean = false): Promise<string> => {
    if (!apiKey) {
        return "Error: Tu API Key de Gemini no ha sido configurada. Por favor, ve a Configuración para añadirla.";
    }
    const service = new GeminiService(apiKey);
    if (!service.isConfigured()) {
        return "Error: Tu API Key de Gemini no ha sido configurada correctamente o es inválida. Por favor, ve a Configuración para añadirla.";
    }
    return service.generateContent(prompt, systemInstruction, isJson);
};
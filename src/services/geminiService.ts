import { GoogleGenAI } from "@google/genai";

export class GeminiService {
    private ai: GoogleGenAI | null = null;

    constructor(apiKey: string) {
        if (apiKey) {
            try {
                this.ai = new GoogleGenAI({ apiKey });
            } catch (error) {
                console.error("Error initializing GoogleGenAI with provided key:", error);
                this.ai = null;
            }
        } else {
            console.warn("Attempted to initialize GeminiService without an API key.");
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
            return "Error: Tu API Key de Gemini no ha sido configurada o no es válida. Por favor, ve a Configuración para añadirla o corregirla.";
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
            
            if (errorMessage.includes('API key not valid')) {
                 return "Error: La API Key de Gemini que proporcionaste no es válida. Por favor, revísala en Configuración.";
            }
            if (errorMessage.includes('timed out') || errorMessage.includes('network')) {
                 return "Error: La conexión con el servicio de IA tardó demasiado en responder. Por favor, revisa tu conexión a internet e inténtalo de nuevo.";
            }
            
            return "Hubo un error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde.";
        }
    }
}

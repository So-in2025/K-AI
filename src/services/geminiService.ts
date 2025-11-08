

import { GoogleGenAI, GenerateContentConfig, FunctionDeclaration } from "@google/genai";

export class GeminiService {
    private ai: GoogleGenAI | null = null;

    constructor(apiKey: string) {
        if (apiKey) {
            try {
                this.ai = new GoogleGenAI({ apiKey });
            } catch (error) {
                console.error("Error al inicializar GoogleGenAI con la clave proporcionada:", error);
                this.ai = null;
            }
        } else {
            console.warn("Se intentó inicializar GeminiService sin una clave de API.");
        }
    }

    public isConfigured(): boolean {
        return !!this.ai;
    }

    public async generateContent(prompt: string, systemInstruction?: string, schema?: any): Promise<string> {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return "Error: Parece que no tienes conexión a internet. Por favor, revisa tu conexión e inténtalo de nuevo.";
        }

        if (!this.ai) {
            return "Error: Tu API Key de Gemini no ha sido configurada o no es válida. Por favor, ve a Configuración para añadirla o corregirla.";
        }

        try {
            const config: GenerateContentConfig = {};
            if (systemInstruction) {
                config.systemInstruction = systemInstruction;
            }
            if (schema) {
                config.responseMimeType = "application/json";
                config.responseSchema = schema;
            }

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: config
            });
            return response.text;
        } catch (error) {
            console.error("Error al obtener datos de la API de Gemini:", error);
            
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

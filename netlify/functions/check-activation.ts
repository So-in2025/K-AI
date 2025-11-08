
import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
    if (req.method !== 'POST') {
        return new Response("Método no permitido", { status: 405 });
    }

    try {
        const { code } = await req.json();
        if (!code) {
            return new Response("Se requiere el código de activación.", { status: 400 });
        }

        const store = getStore("activation-codes");
        // Fix: Explicitly get the stored value as text to ensure correct type for comparison.
        const status = await store.get(code, { type: 'text' });

        if (status === "activated") {
            // Para prevenir la reutilización, eliminamos el código después de verificarlo.
            await store.delete(code);
            return new Response(JSON.stringify({ activated: true }), { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ activated: false }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error("Error al verificar el código de activación:", error);
        return new Response("Error Interno del Servidor", { status: 500 });
    }
};

import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response('Bad Request: Missing or invalid code', { status: 400 });
    }

    // Conectar a la misma "base de datos" que el webhook
    const store = getStore('activation-codes');
    
    // Buscar si el código existe y está activado
    // FIX: The `get` method from Netlify Blobs can return different types (like ArrayBuffer or Blob),
    // causing a type mismatch. Specify `type: 'text'` to ensure `status` is a string for the comparison below.
    const status = await store.get(code, { type: 'text' });

    const isActivated = status === 'activated';

    // Opcional: Si está activado, se puede eliminar para que no se pueda volver a usar.
    // if (isActivated) {
    //   await store.delete(code);
    // }

    return new Response(JSON.stringify({ activated: isActivated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error checking activation:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

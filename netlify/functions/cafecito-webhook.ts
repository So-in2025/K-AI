
import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Regex para encontrar un UUID en el mensaje de la donación
const UUID_REGEX = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;

export default async (req: Request, context: Context) => {
  // 1. Verificar que la petición sea de tipo POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 2. (Opcional pero recomendado) Verificar un secreto para asegurar que la petición viene de Cafecito
  const secret = process.env.CAFECITO_WEBHOOK_SECRET;
  const providedSecret = req.headers.get("X-Cafecito-Secret");
  if (secret && providedSecret !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  try {
    // 3. Leer el cuerpo de la notificación de Cafecito
    const payload = await req.json();
    const message = payload?.note || '';

    // 4. Extraer el código de activación (UUID) del mensaje
    const match = message.match(UUID_REGEX);
    if (!match || !match[0]) {
      console.log("Webhook recibido, pero no se encontró un código de activación en el mensaje.");
      return new Response("Activation code not found in message", { status: 200 });
    }
    const activationCode = match[0];
    
    // 5. Conectar a la "base de datos" (Netlify Blobs)
    // El nombre 'activation-codes' es el nombre de nuestro "cajón de almacenamiento"
    const store = getStore("activation-codes");

    // 6. Guardar el código como activado
    await store.set(activationCode, "activated");
    
    console.log(`Código de activación ${activationCode} ha sido verificado y almacenado.`);
    
    // 7. Responder a Cafecito con éxito
    return new Response(JSON.stringify({ success: true, code: activationCode }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error en el webhook de Cafecito:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};


import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Método no permitido", { status: 405 });
  }

  const hottok = req.headers.get("x-hotmart-hottok");
  const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET;

  if (!hottok || !webhookSecret) {
    console.warn("Cabeceras de seguridad del webhook faltantes (x-hotmart-hottok o secret).");
    return new Response("No autorizado: Faltan las cabeceras de seguridad.", { status: 401 });
  }

  if (hottok !== webhookSecret) {
    console.warn("Token de Hotmart (hottok) inválido. Discrepancia entre el token recibido y la variable de entorno.");
    return new Response("No autorizado: Token inválido.", { status: 401 });
  }

  try {
    const payload = await req.json();

    if (payload.event !== 'PURCHASE_APPROVED') {
      console.log(`Evento de Hotmart '${payload.event}' recibido. Ignorando.`);
      return new Response("Webhook procesado, evento no aprobado.", { status: 200 });
    }

    // LÓGICA MEJORADA Y ROBUSTA:
    // Hotmart puede enviar el código de activación en diferentes campos dependiendo del contexto.
    // Buscamos en los más comunes ('checkout_src' y 'sck') para asegurar compatibilidad.
    const activationCode = payload.data?.purchase?.checkout_src || payload.data?.purchase?.sck;

    if (!activationCode) {
      // Log detallado para depuración en caso de que Hotmart cambie el campo en el futuro.
      console.log("Webhook de Hotmart recibido, pero no se encontró el código de activación en 'checkout_src' o 'sck'. Payload completo:", JSON.stringify(payload));
      return new Response("Código de activación no encontrado en el payload.", { status: 200 });
    }
    
    const store = getStore("activation-codes");

    // Guardamos el código como activado
    await store.set(activationCode, "activated");
    
    console.log(`ÉXITO: El código de activación de Hotmart ${activationCode} ha sido verificado y almacenado.`);
    
    // Respondemos a Hotmart con éxito
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error al procesar el payload del webhook de Hotmart:", error);
    return new Response("Error Interno del Servidor", { status: 500 });
  }
};
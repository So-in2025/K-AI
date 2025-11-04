import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const hottok = req.headers.get("x-hotmart-hottok");
  const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET;

  if (!hottok || !webhookSecret) {
    console.warn("Webhook security headers missing (x-hotmart-hottok or secret).");
    return new Response("Unauthorized: Security headers missing.", { status: 401 });
  }

  if (hottok !== webhookSecret) {
    console.warn("Invalid Hotmart token (hottok). Mismatch between received token and environment variable.");
    return new Response("Unauthorized: Invalid token.", { status: 401 });
  }

  try {
    const payload = await req.json();

    if (payload.event !== 'PURCHASE_APPROVED') {
      console.log(`Hotmart event '${payload.event}' received. Ignoring.`);
      return new Response("Webhook processed, non-approved event.", { status: 200 });
    }

    // LÓGICA MEJORADA Y ROBUSTA:
    // Hotmart puede enviar el código de activación en diferentes campos dependiendo del contexto.
    // Buscamos en los más comunes ('checkout_src' y 'sck') para asegurar compatibilidad.
    const activationCode = payload.data?.purchase?.checkout_src || payload.data?.purchase?.sck;

    if (!activationCode) {
      // Log detallado para depuración en caso de que Hotmart cambie el campo en el futuro.
      console.log("Hotmart webhook received, but activation code not found in 'checkout_src' or 'sck'. Full payload:", JSON.stringify(payload));
      return new Response("Activation code not found in payload.", { status: 200 });
    }
    
    const store = getStore("activation-codes");

    // Guardamos el código como activado
    await store.set(activationCode, "activated");
    
    console.log(`SUCCESS: Hotmart activation code ${activationCode} has been verified and stored.`);
    
    // Respondemos a Hotmart con éxito
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error processing Hotmart webhook payload:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

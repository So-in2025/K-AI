
import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { createHmac } from 'crypto';

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const hotmartSignature = req.headers.get("x-hotmart-signature");
  const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET;

  if (!hotmartSignature || !webhookSecret) {
    console.warn("Webhook security headers missing.");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const rawBody = await req.text();
    
    // 1. Validar la firma de Hotmart para seguridad
    const expectedSignature = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (hotmartSignature !== expectedSignature) {
        console.warn("Invalid Hotmart signature.");
        return new Response("Unauthorized: Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // 2. Nos aseguramos de que sea un evento de compra aprobada
    if (payload.event !== 'PURCHASE_APPROVED') {
      console.log(`Hotmart event '${payload.event}' received. Ignoring.`);
      return new Response("Webhook processed, non-approved event.", { status: 200 });
    }

    // 3. Extraemos el código de activación que pasamos en el link de pago
    const activationCode = payload.data?.purchase?.checkout_src;

    if (!activationCode) {
      console.log("Hotmart webhook received, but no activation code (src) found.");
      return new Response("Activation code not found in payload.", { status: 200 });
    }
    
    // 4. Conectamos a nuestra base de datos de blobs
    const store = getStore("activation-codes");

    // 5. Guardamos el código como activado
    await store.set(activationCode, "activated");
    
    console.log(`Hotmart activation code ${activationCode} has been verified and stored.`);
    
    // 6. Respondemos a Hotmart con éxito
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error in Hotmart webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

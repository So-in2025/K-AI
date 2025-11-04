
// This function now handles webhooks from Ko-fi.com
import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const UUID_REGEX = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 1. Ko-fi sends data as application/x-www-form-urlencoded
    const formData = new URLSearchParams(await req.text());
    const dataString = formData.get("data");

    if (!dataString) {
      console.warn("Webhook received from Ko-fi, but no 'data' field found.");
      return new Response("Bad Request: Missing data", { status: 400 });
    }

    const payload = JSON.parse(dataString);

    // 2. Verify the request comes from Ko-fi using the verification token
    const verificationToken = process.env.KOFI_VERIFICATION_TOKEN;
    if (!verificationToken || payload.verification_token !== verificationToken) {
      console.warn("Unauthorized Ko-fi webhook attempt. Token mismatch.");
      return new Response("Unauthorized", { status: 401 });
    }
    
    // 3. Ensure it's a 'Donation' type of notification
    if (payload.type !== 'Donation') {
        console.log(`Ko-fi webhook received of type '${payload.type}'. Ignoring.`);
        return new Response("Webhook processed, non-donation type.", { status: 200 });
    }

    const message = payload.message || '';

    // 4. Extract the activation code (UUID) from the message
    const match = message.match(UUID_REGEX);
    if (!match || !match[0]) {
      console.log("Ko-fi webhook received, but no activation code found in the message.");
      return new Response("Activation code not found", { status: 200 });
    }
    const activationCode = match[0];
    
    // 5. Connect to the blob store
    const store = getStore("activation-codes");

    // 6. Save the code as activated
    await store.set(activationCode, "activated");
    
    console.log(`Ko-fi activation code ${activationCode} has been verified and stored.`);
    
    // 7. Respond to Ko-fi with success
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error in Ko-fi webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { code } = await req.json();
    if (!code) {
      return new Response("Activation code is required.", { status: 400 });
    }

    const store = getStore("activation-codes");
    const entry = await store.get(code);

    if (entry === "activated") {
      // One-time use: delete after successful check.
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
    console.error("Error processing activation check:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
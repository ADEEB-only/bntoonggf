const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TelegramLoginPayload {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramSessionUser {
  telegram_id: number;
  telegram_username?: string;
  telegram_name: string;
  photo_url?: string;
}

const MAX_AUTH_AGE_SECONDS = 60 * 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    if (action === "telegram") {
      return await handleTelegramLogin(req);
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Telegram auth error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleTelegramLogin(req: Request): Promise<Response> {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

  if (!botToken) {
    return new Response(
      JSON.stringify({ error: "Server configuration is incomplete" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const payload = (await req.json()) as TelegramLoginPayload;

  if (!payload?.id || !payload?.auth_date || !payload?.hash) {
    return new Response(
      JSON.stringify({ error: "Missing required Telegram fields" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - payload.auth_date > MAX_AUTH_AGE_SECONDS) {
    return new Response(
      JSON.stringify({ error: "Telegram auth data expired" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const isValid = await verifyTelegramLogin(payload, botToken);
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: "Telegram hash verification failed" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const user = toSessionUser(payload);
  return new Response(JSON.stringify({ success: true, user }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildCheckString(data: TelegramLoginPayload): string {
  return Object.entries(data)
    .filter(([key, value]) => key !== "hash" && value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

async function verifyTelegramLogin(
  data: TelegramLoginPayload,
  botToken: string
): Promise<boolean> {
  const checkString = buildCheckString(data);
  const encoder = new TextEncoder();
  const secret = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(botToken)
  );
  const key = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(checkString)
  );
  const digest = bufferToHex(signature);

  return timingSafeEqual(digest, data.hash);
}

function toSessionUser(payload: TelegramLoginPayload): TelegramSessionUser {
  return {
    telegram_id: payload.id,
    telegram_username: payload.username,
    telegram_name: [payload.first_name, payload.last_name]
      .filter(Boolean)
      .join(" "),
    photo_url: payload.photo_url,
  };
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

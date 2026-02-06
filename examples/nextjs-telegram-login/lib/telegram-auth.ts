import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface TelegramLoginPayload {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramSessionUser {
  telegram_id: number;
  telegram_username?: string;
  telegram_name: string;
  photo_url?: string;
}

const SESSION_COOKIE = "tg_session";

function buildCheckString(data: TelegramLoginPayload): string {
  return Object.entries(data)
    .filter(([key]) => key !== "hash" && typeof key === "string")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export function verifyTelegramLogin(data: TelegramLoginPayload, botToken: string): boolean {
  const checkString = buildCheckString(data);
  const secret = createHash("sha256").update(botToken).digest();
  const digest = createHmac("sha256", secret).update(checkString).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(data.hash, "hex"));
  } catch {
    return false;
  }
}

export function toSessionUser(payload: TelegramLoginPayload): TelegramSessionUser {
  return {
    telegram_id: payload.id,
    telegram_username: payload.username,
    telegram_name: [payload.first_name, payload.last_name].filter(Boolean).join(" "),
    photo_url: payload.photo_url,
  };
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionCookie(user: TelegramSessionUser, secret: string): string {
  const payload = {
    user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };

  const encoded = b64url(JSON.stringify(payload));
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export function parseSessionCookie(token: string | undefined, secret: string): TelegramSessionUser | null {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded, secret);
  try {
    if (!timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(fromB64url(encoded)) as {
      user: TelegramSessionUser;
      exp: number;
    };
    if (!payload?.user || !payload.exp) return null;
    if (Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload.user;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

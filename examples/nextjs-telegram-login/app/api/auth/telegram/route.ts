import { NextResponse } from "next/server";
import {
  createSessionCookie,
  getSessionCookieName,
  TelegramLoginPayload,
  toSessionUser,
  verifyTelegramLogin,
} from "@/lib/telegram-auth";

const MAX_AUTH_AGE_SECONDS = 60 * 5;

export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const sessionSecret = process.env.TELEGRAM_SESSION_SECRET;

  if (!botToken || !sessionSecret) {
    return NextResponse.json({ error: "Server configuration is incomplete" }, { status: 500 });
  }

  const payload = (await req.json()) as TelegramLoginPayload;

  if (!payload?.id || !payload?.auth_date || !payload?.hash) {
    return NextResponse.json({ error: "Missing required Telegram fields" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - payload.auth_date > MAX_AUTH_AGE_SECONDS) {
    return NextResponse.json({ error: "Telegram auth data expired" }, { status: 401 });
  }

  if (!verifyTelegramLogin(payload, botToken)) {
    return NextResponse.json({ error: "Telegram hash verification failed" }, { status: 401 });
  }

  const user = toSessionUser(payload);
  const session = createSessionCookie(user, sessionSecret);

  const res = NextResponse.json({ success: true, user });
  res.cookies.set({
    name: getSessionCookieName(),
    value: session,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

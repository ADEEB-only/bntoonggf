import { NextResponse } from "next/server";
import { getSessionCookieName, parseSessionCookie } from "@/lib/telegram-auth";

export async function GET(req: Request) {
  const secret = process.env.TELEGRAM_SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server configuration is incomplete" }, { status: 500 });
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${getSessionCookieName()}=`))
    ?.slice(`${getSessionCookieName()}=`.length);

  const user = parseSessionCookie(sessionCookie, secret);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}

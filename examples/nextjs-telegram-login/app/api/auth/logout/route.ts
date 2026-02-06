import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/telegram-auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

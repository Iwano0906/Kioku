import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { createSessionToken, verifyPassword, SESSION_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const env = await getEnv();

  if (!password || !verifyPassword(password, env.APP_PASSWORD)) {
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

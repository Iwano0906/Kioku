import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getEnv } from "./cloudflare";

export const SESSION_COOKIE_NAME = "kioku_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
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

export function verifyPassword(input: string, appPassword: string): boolean {
  if (input.length !== appPassword.length) return false;
  return timingSafeEqual(input, appPassword);
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await hmacHex(secret, String(expiresAt));
  return `${expiresAt}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token) return false;
  const [expiresAtStr, signature] = token.split(".");
  if (!expiresAtStr || !signature) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = await hmacHex(secret, expiresAtStr);
  return timingSafeEqual(expected, signature);
}

/** Server Component / Route Handler向け: 現在のリクエストがログイン済みか判定する */
export async function isAuthenticated(): Promise<boolean> {
  const env = await getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token, env.SESSION_SECRET);
}

/** Server Componentのページ先頭で呼び出し、未ログインなら/loginへリダイレクトする */
export async function requireAuthPage(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }
}

/** API Route Handlerの先頭で呼び出し、未ログインなら401レスポンスを返す */
export async function requireAuthApi(): Promise<NextResponse | null> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  return null;
}

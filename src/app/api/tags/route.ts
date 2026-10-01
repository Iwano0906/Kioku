import { NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { requireAuthApi } from "@/lib/auth";
import { listTags } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const unauthorized = await requireAuthApi();
  if (unauthorized) return unauthorized;

  const env = await getEnv();
  const tags = await listTags(env.DB);
  return NextResponse.json({ tags });
}

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

export interface CloudflareEnv {
  DB: D1Database;
  PHOTOS_BUCKET: R2Bucket;
  APP_PASSWORD: string;
  SESSION_SECRET: string;
}

export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as unknown as CloudflareEnv;
}

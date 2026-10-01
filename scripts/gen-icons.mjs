import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const normal = readFileSync(new URL("./icon-source.svg", import.meta.url));
const maskable = readFileSync(new URL("./icon-source-maskable.svg", import.meta.url));

const outDir = new URL("../public/icons/", import.meta.url);
const out = (name) => fileURLToPath(new URL(name, outDir));

await sharp(normal).resize(192, 192).png().toFile(out("icon-192.png"));
await sharp(normal).resize(512, 512).png().toFile(out("icon-512.png"));
await sharp(maskable).resize(512, 512).png().toFile(out("icon-512-maskable.png"));
await sharp(normal).resize(180, 180).png().toFile(out("apple-touch-icon.png"));

console.log("icons generated");

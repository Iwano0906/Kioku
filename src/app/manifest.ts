import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kioku - 旅の写真アルバム",
    short_name: "Kioku",
    description: "旅先の写真をレトロな雰囲気で残すアルバム",
    start_url: "/",
    display: "standalone",
    background_color: "#f2e8d5",
    theme_color: "#c1440e",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import type { Metadata, Viewport } from "next";
import { Kaisei_Decol, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const kaisei = Kaisei_Decol({
  variable: "--font-kaisei",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zenmaru",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kioku",
  description: "旅先の写真をレトロな雰囲気で残すアルバム",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kioku",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c1440e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${kaisei.variable} ${zenMaru.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

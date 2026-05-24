import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "节拍律动 - Rhythm Game",
  description: "🎵 一款网页音游！用 A/S/D/F 键或触屏跟随节拍击打音符，支持多首曲目和三种难度。A web rhythm game with keyboard & touch controls!",
  keywords: ["rhythm game", "音游", "music game", "beat game", "Next.js", "TypeScript"],
  authors: [{ name: "Z.ai" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "节拍律动 - Rhythm Game 🎵",
    description: "跟随节拍击打音符！支持键盘和触屏操作，三种难度挑战。",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "节拍律动 - Rhythm Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "节拍律动 - Rhythm Game 🎵",
    description: "跟随节拍击打音符！支持键盘和触屏操作，三种难度挑战。",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <style>{`touch-action: manipulation;`}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

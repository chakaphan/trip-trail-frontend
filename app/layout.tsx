import type { Metadata } from "next";
import { Prompt, Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyNatureJourney - บันทึกทริปธรรมชาติของคุณ",
  description: "แพลตฟอร์มสำหรับบันทึกและแชร์ประสบการณ์ท่องเที่ยวธรรมชาติ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${prompt.variable} ${inter.variable} antialiased`}
      >
        {children}
        <BottomNav />
      </body>
    </html>
  );
}

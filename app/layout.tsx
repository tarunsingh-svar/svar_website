import type { Metadata } from "next";
import { Red_Hat_Display, Red_Hat_Text } from "next/font/google";
import "./globals.css";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const redHatText = Red_Hat_Text({
  variable: "--font-red-hat-text",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://svar.ai"),
  title: "SVAR AI — Speak Once. Use It Everywhere.",
  description:
    "Turn meetings, conversations, lectures and ideas into transcripts, summaries, action items and ready-to-share content — in seconds.",
  openGraph: {
    title: "SVAR AI — Speak Once. Use It Everywhere.",
    description:
      "Turn meetings, conversations, lectures and ideas into transcripts, summaries, action items and ready-to-share content — in seconds.",
    siteName: "SVAR AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${redHatDisplay.variable} ${redHatText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

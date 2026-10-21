import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Vertex Capital — брокерская платформа",
  description: "Демонстрационный брокерский сайт на Next.js",
  openGraph: {
    title: "Vertex Capital — брокерская платформа",
    description: "Демонстрационный брокерский сайт на Next.js",
    images: ["/trade-preview.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vertex Capital — брокерская платформа",
    description: "Демонстрационный брокерский сайт на Next.js",
    images: ["/trade-preview.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

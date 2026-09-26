import type { Metadata, Viewport } from "next";
import { Archivo, Chivo_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  variable: "--font-chivo-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cykoai.com"),
  title: {
    default: "Cykoai — Forward Deployed AI & Cybersecurity Consulting",
    template: "%s — Cykoai",
  },
  description:
    "Cykoai is a forward deployed AI and cybersecurity consulting firm helping enterprises adopt disruptive technology with confidence — AI strategy, security, architecture, and transformation.",
  keywords: [
    "AI consulting",
    "cybersecurity consulting",
    "enterprise AI",
    "digital transformation",
    "AI strategy",
    "forward deployed engineering",
  ],
  openGraph: {
    title: "Cykoai — Forward Deployed AI & Cybersecurity Consulting",
    description:
      "We help organizations stop reacting to technological change and start shaping it.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B1527",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${chivoMono.variable} h-full`}
    >
      <body className="min-h-full bg-white text-windsor antialiased">
        <SmoothScroll>
          <Navbar />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}

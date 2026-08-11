import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/layout/CustomCursor";
import NoiseOverlay from "@/components/layout/NoiseOverlay";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Runs before hydration so there's no flash of the wrong theme on load.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("cykoai-theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-void text-ink antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <SmoothScroll>
          <NoiseOverlay />
          <CustomCursor />
          <Navbar />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}

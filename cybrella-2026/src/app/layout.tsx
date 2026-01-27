// Root Layout - /src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import localFont from 'next/font/local'
import SmoothScroll from "@/components/SmoothScroll";
import RippleWrapper from "@/components/RippleWrapper";

const horizon = localFont({
  src: './fonts/Horizon_Regular.otf',
  display: 'swap',
  variable: '--font-horizon',
})

const montserrat = Montserrat({ subsets: ["latin"], display: 'swap', variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: "Cybrella Fest '26",
  description: "Institute Esports Festival",
};

// Global Architecture Overlay
function GlobalBlueprint() {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* The Constant Dot Grid */}
      <div className="absolute inset-0 blueprint-grid" />

      {/* Moving Scan Line (Thinner and subtler for the dot grid) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-red-600/5 animate-scan shadow-[0_0_10px_rgba(220,38,38,0.3)]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.05)_100%)]" />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${horizon.variable} font-sans antialiased`}>
        <GlobalBlueprint />
          <DataProvider>
          <SmoothScroll>
            <div className="relative">
              {/* Cinematic Noise Overlay */}
              <div className="fixed inset-0 z-[999] pointer-events-none opacity-[0.03] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
              </div>
              {children}
            </div>
          </SmoothScroll>
        </DataProvider>
      </body>
    </html>
  );
}
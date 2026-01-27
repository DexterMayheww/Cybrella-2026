// Footer - /src/components/Footer.tsx

"use client";

import React from "react";
import { Zap, Github, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black pt-20 pb-10 overflow-hidden">
      {/* Background Large Text */}
      <div className="absolute left-0 bottom-0 select-none opacity-[0.03] pointer-events-none">
        <h1 className="text-[15vw] font-black leading-none text-white truncate">CYBER.FEST</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-cyan-500 rounded flex items-center justify-center">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white tracking-widest">CYBRELLA.</span>
            </div>
            <p className="text-gray-500 text-sm font-mono">
              // TERMINAL_ID: 884-X <br />
              EST. 2026. THE FUTURE OF ESPORTS.
            </p>
          </div>

          {/* Links Columns */}
          {["Platform", "Community", "Legal"].map((col, i) => (
            <div key={i} className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase tracking-widest text-sm border-l-2 border-purple-500 pl-3">
                {col}
              </h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400 font-mono">
                {["Overview", "Features", "Roadmap"].map(link => (
                  <Link key={link} href="#" className="interactive hover:text-cyan-400 hover:translate-x-2 transition-all duration-300">
                    {`> ${link}`}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-500 font-mono">SYSTEM ONLINE</span>
          </div>

          <p className="text-gray-600 text-xs font-mono">
            © 2026 CYBRELLA INSTITUTE. ALL RIGHTS RESERVED.
          </p>

          <div className="flex gap-4">
            {[Twitter, Instagram, Github].map((Icon, i) => (
              <a key={i} href="#" className="interactive text-gray-400 hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
// src/components/animations/WireframeWrapper.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function WireframeWrapper({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1200); // Simulate "Constructing"
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative group">
      <AnimatePresence>
        {!isLoaded && (
          <motion.svg
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100" preserveAspectRatio="none"
          >
            <motion.rect
              x="2" y="2" width="96" height="96"
              fill="none" stroke="#22d3ee" strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0.5] }}
              transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
            />
            <path d="M0 0 L10 10 M90 90 L100 100" stroke="#22d3ee" strokeWidth="0.2" />
          </motion.svg>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={isLoaded ? { opacity: 1, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
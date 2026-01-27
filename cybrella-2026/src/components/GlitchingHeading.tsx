"use client";
import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~";

export default function GlitchHeading({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const ref = useRef(null);
  
  // 1. Set once: false so it triggers every time
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isInView) {
      let iteration = 0;
      interval = setInterval(() => {
        setDisplay(
          text
            .split("")
            .map((char, index) => {
              if (index < iteration) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 20);
    } else {
      // 2. Optional: Reset text to a scrambled state or empty when it leaves view
      // This ensures that when it scrolls back in, the animation starts from scratch
      setDisplay(text.split("").map(() => chars[Math.floor(Math.random() * chars.length)]).join(""));
    }

    return () => clearInterval(interval);
  }, [isInView, text]);

  return <h2 ref={ref} className={className}>{display}</h2>;
}
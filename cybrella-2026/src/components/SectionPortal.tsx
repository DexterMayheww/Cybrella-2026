"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SectionPortal({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const clipPath = useTransform(
    scrollYProgress,
    [0.1, 0.4],
    ["circle(0% at 50% 50%)", "circle(100% at 50% 50%)"]
  );

  const moshX = useTransform(scrollYProgress, [0.1, 0.2, 0.3], [0, 100, 0]);
const moshSkew = useTransform(scrollYProgress, [0.1, 0.2, 0.3], [0, 20, 0]);
  return (

// Apply to the wrapper:
<motion.div 
  style={{ 
    clipPath, 
    skewX: moshSkew,
    x: moshX,
    filter: useTransform(scrollYProgress, [0.1, 0.2], ["inline-block", "hue-rotate(90deg)"])
  }} 
  className="relative bg-brand-dark-olive transition-all"
>
  {children}
</motion.div>
  );
}
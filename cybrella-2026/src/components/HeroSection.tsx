// Hero Section - /src/components/HeroSection.tsx

"use client";

import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TiltWrapper from "./animations/TiltWrapper";
import Image from "next/image";
import { MagneticParticles } from "./MagneticParticles";
import { useData } from "@/context/DataContext";

const CyberButton = ({ children, variant = "primary" }: { children: React.ReactNode, variant?: "primary" | "secondary" }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number; isIdle?: boolean }[]>([]);
    const [isHovered, setIsHovered] = useState(false);

    // Magnetic values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    // --- IDLE ANIMATION LOGIC ---
    useEffect(() => {
        const spawnIdleRipple = () => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;

            // Spawn from the center of the button
            const rippleX = rect.width / 2;
            const rippleY = rect.height / 2;

            const id = Date.now();
            setRipples((prev) => [...prev, { x: rippleX, y: rippleY, id, isIdle: true }]);

            setTimeout(() => {
                setRipples((prev) => prev.filter(r => r.id !== id));
            }, 2000); // Idle ripples can last slightly longer for a "pulse" feel
        };

        const interval = setInterval(spawnIdleRipple, 3000); // Trigger every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;

        const rippleX = e.clientX - rect.left;
        const rippleY = e.clientY - rect.top;

        const id = Date.now() + 1; // offset to avoid ID collision
        setRipples((prev) => [...prev, { x: rippleX, y: rippleY, id }]);

        setTimeout(() => {
            setRipples((prev) => prev.filter(r => r.id !== id));
        }, 1000);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        setIsHovered(true);
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            x.set((e.clientX - (rect.left + rect.width / 2)) * 0.4);
            y.set((e.clientY - (rect.top + rect.height / 2)) * 0.4);
        }
    };

    return (
        <div className="relative">
            <TiltWrapper>
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* --- SHAPE RIPPLES --- */}
                    <AnimatePresence>
                        {ripples.map((ripple) => (
                            <motion.div
                                key={ripple.id}
                                initial={{ scale: 1, opacity: 0.7, skewX: -20 }}
                                animate={{
                                    scale: ripple.isIdle ? [1, 1.5] : 1.6,
                                    opacity: 0
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: ripple.isIdle ? 1.5 : 0.6,
                                    ease: "easeOut"
                                }}
                                // This matches the exact skew and shape of the button background
                                className="absolute inset-0 border-2 border-cyan-400 pointer-events-none transform skew-x-[-20deg] z-0"
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <motion.button
                    ref={ref}
                    data-magnetic="true"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => {
                        setIsHovered(false);
                        x.set(0);
                        y.set(0);
                    }}
                    onClick={handleClick}
                    whileTap={{ scale: 0.95 }}
                    style={{ x: springX, y: springY }}
                    className="interactive group relative px-8 py-4 font-bold z-10"
                    initial={{ scale: 1 }}
                    animate={{ scale: 0.95 }}
                    transition={{
                        duration: 0.7,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                >
                    {/* Background Shape */}
                    <div className={`absolute inset-0 transform skew-x-[-20deg] border transition-all duration-300 
                        ${variant === 'primary'
                            ? 'bg-cyan-500 border-cyan-500 group-hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                            : 'bg-transparent border-white/30 group-hover:border-cyan-400 group-hover:bg-cyan-950/30'
                        }`}
                    />

                    {/* Text Content */}
                    <div className={`relative flex items-center gap-2 transition-colors duration-300 ${variant === 'primary' ? 'text-black' : 'text-white group-hover:text-cyan-400'}`}>
                        {children}
                    </div>

                    {/* Decorative Corners */}
                    <div className="absolute top-0 right-0 p-1">
                        <div className={`h-2 w-2 bg-white/50 transition-all duration-300 ${variant === 'primary' ? 'group-hover:bg-black' : 'group-hover:bg-cyan-400'}`} />
                    </div>
                    <div className="absolute bottom-0 left-0 p-1">
                        <div className={`h-2 w-2 bg-white/50 transition-all duration-300 ${variant === 'primary' ? 'group-hover:bg-black' : 'group-hover:bg-cyan-400'}`} />
                    </div>
                </motion.button>
            </TiltWrapper>
        </div>
    );
};

function useMousePosition() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // We use the raw pixel values; your useTransform will map them to the shadow ranges
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return { mouseX, mouseY };
}

export default function HeroSection() {
    const { heroVideoUrl } = useData();
    const { scrollY } = useScroll();

    // 1. Text Zoom Effect
    // As we scroll 0 -> 1000px, scale the text from 1 to 100 (creating the "fly through" effect)
    const textScale = useTransform(scrollY, [0, 1500], [1, 100]);
    const zoomTextScale = useTransform(scrollY, [0, 100, 1000], [1, 0.3, 1]);

    // 2. Opacity / Transparency
    // The text starts visible and fades out just as we are "passing through" it
    const textOpacity = useTransform(scrollY, [0, 700], [1, 0]);
    const imageOpacity = useTransform(scrollY, [0, 100], [1, 0]);
    const backgroundTextOpacity = useTransform(scrollY, [0, 50, 300, 350, 800], [0, 0, 0.5, 0.7, 1]);

    const titleY = useTransform(scrollY, [0, 1000], [0, -150]);
    const backgroundTitleY = useTransform(scrollY, [1300, 1500], [0, -100]);
    const contentY = useTransform(scrollY, [1300, 1600], [0, -250]);

    // 3. Move other content out of the way
    const contentOpacity = useTransform(scrollY, [1500, 1600], [1, 0]);
    const subTextOpacity = useTransform(scrollY, [0, 100, 1000, 1400, 1700], [1, 0, 1, 0.7, 0.3]);
    const darkOverlayOpacity = useTransform(scrollY, [0, 600], [0, 1]);

    // Effect 3: Point-Light Shadow Math
    const { mouseX, mouseY } = useMousePosition(); // Assume a hook or prop for mouse pos
    const shadowX = useTransform(mouseX, [0, 2000], [100, -100]);
    const shadowY = useTransform(mouseY, [0, 1000], [100, -100]);
    const shadowBlur = useTransform(mouseX, [0, 2000], [10, 25]);

    const characterRef = useRef<HTMLDivElement>(null);
    const characterRotation = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!characterRef.current) return;
            const rect = characterRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height + 30;

            // Calculate angle and add offset if the image isn't pointing right (0deg) by default
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
            characterRotation.set(angle);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [characterRotation]);

    return (
        <section className="relative h-[270vh] w-full">
            <MagneticParticles />
            {/* Sticky container to keep content visible while scrolling */}
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">

                <div className="relative z-10 text-center w-full h-fit">
                    {/* ZOOMING TEXT SECTION */}
                    <motion.div
                        className="flex flex-col items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            style={{
                                scale: zoomTextScale
                            }}
                            className="absolute top-[35%] inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-cyan-400 backdrop-blur-md mb-6"
                        >
                            INSTITUTE ESPORTS FESTIVAL 2026
                        </motion.div>
                        <video key={heroVideoUrl} autoPlay loop muted playsInline className="h-full w-full object-cover">
                            <source src={heroVideoUrl} type="video/mp4" />
                        </video>
                        <motion.div style={{ opacity: darkOverlayOpacity }} className="absolute inset-0 bg-black/40" />
                        <motion.div style={{ opacity: darkOverlayOpacity }} className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#000_100%)]" />

                        {/* Zooming Cybrella Text */}
                        <motion.h1
                            style={{
                                y: titleY,
                                mixBlendMode: "multiply",
                                textShadow: useMotionTemplate`${shadowX}px ${shadowY}px ${shadowBlur}px rgba(34, 211, 238, 0.5)`,
                                color: "",
                                WebkitTextStroke: "4px rgba(255, 255, 255, 0.8)",
                                scale: textScale,
                                opacity: textOpacity,
                                // Focus zoom on the middle letters
                                transformOrigin: "49% 48%"
                            }}
                            className="absolute top-0 left-0 flex justify-center items-center bg-black h-full w-full font-horizon text-6xl md:text-9xl font-black text-white"
                        >
                            CYB<span style={{ WebkitTextStroke: "4px var(--color-brand-vivid-green)" }}>RE</span>LLA
                        </motion.h1>

                        {/* Image that follows text */}
                        <motion.div
                            ref={characterRef}
                            style={{
                                rotate: characterRotation,
                                transformOrigin: "center center",
                                opacity: imageOpacity
                            }}
                            className="absolute top-[150px] left-[100px] -translate-1/2 h-full w-full scale-[0.2] z-20 pointer-events-none"
                        >
                            <Image
                                src="/parallax/yi_sun_shin.avif"
                                alt="Character"
                                className="h-full w-full object-contain"
                                width={1000}
                                height={1000}
                            />
                        </motion.div>

                        {/* Inner Cybrella Text */}
                        <motion.h1
                            style={{
                                y: backgroundTitleY,
                                WebkitTextStroke: "4px rgba(255, 255, 255, 0.8)",
                                scale: zoomTextScale,
                                opacity: backgroundTextOpacity,
                            }}
                            className="absolute top-1/2 left-1/2 -translate-1/2 flex justify-center items-center font-horizon text-6xl md:text-9xl font-black text-white"
                        >
                            CYB<span style={{ color: "var(--color-brand-vivid-green)" }}>RE</span><span style={{ color: "var(--color-brand-crimson-red)" }}>LLA</span>
                        </motion.h1>
                    </motion.div>

                    {/* SUB-CONTENT (Fades away quickly) */}
                    <motion.div
                        style={{ opacity: subTextOpacity, y: contentY, scale: zoomTextScale }}
                        className="absolute top-[65%] left-1/2 -translate-1/2 mt-10"
                    >
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg md:text-xl mb-10 font-mono">
                            Cybrella is the flagship technology fest of NIELIT, born
                            from the institute&apos;s vision to transform theoretical
                            learning into real world technological mastery.
                        </p>

                        <div className="flex flex-col md:flex-row gap-20 justify-center items-center">
                            <CyberButton variant="primary">
                                Start Game <ChevronRight className="w-5 h-5" />
                            </CyberButton>
                            <CyberButton variant="secondary">
                                Watch Trailer
                            </CyberButton>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: contentOpacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] uppercase">Scroll to Enter</span>
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ChevronDown className="w-6 h-6 text-white/50" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Spacer to allow for scrolling room */}
            <div className="h-screen" />
        </section>
    );
}
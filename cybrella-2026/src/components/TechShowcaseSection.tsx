// src/components/TechShowcaseSection.tsx
"use client";

import React, { useRef } from "react";
import InteractiveTerminal from "./InteractiveTerminal";
import { Cpu, Network, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import GlitchHeading from "./GlitchingHeading";
import TiltWrapper from "./animations/TiltWrapper";
import WireframeWrapper from "./animations/WireframeWrapper";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
} as const;

export default function TechShowcaseSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "start start"] // Tracks from when the section enters bottom to when it hits top
    });

    // Growth Transforms
    const scale = useTransform(scrollYProgress, [0, 0.8], [0.4, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
    const translateY = useTransform(scrollYProgress, [0, 1], [100, 0]);
    const xLeft = useTransform(scrollYProgress, [0, 1], [0, -500]);
    const xRight = useTransform(scrollYProgress, [0, 1], [-1000, 0]);



    return (
        <motion.section
            ref={containerRef}
            style={{ scale, opacity, y: translateY }}
            className="relative py-24 bg-brand-dark-olive overflow-hidden z-20 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]"
        >
            {/* 1. Horizontal Parallax Background */}
            <motion.div style={{ x: xLeft }} className="absolute top-20 left-0 text-[20rem] font-black text-black/5 whitespace-nowrap pointer-events-none">
                DISCIPLINE ARCHITECTURE EVOLUTION
            </motion.div>

            {/* 2. Kinetic Ticker Tape */}
            <div className="absolute top-0 w-full overflow-hidden border-y border-white/5 py-2 bg-black/20">
                <motion.div style={{ x: xRight }} className="flex gap-20 whitespace-nowrap font-mono text-cyan-400/30 text-xs">
                    {[...Array(10)].map((_, i) => (
                        <span key={i}>CYBRELLA // ARENA // 2026 // SYSTEM_VER_3.0 // UPLINK_STABLE</span>
                    ))}
                </motion.div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <GlitchHeading text="SOCIETAL ARCHITECTURE" className="text-white font-horizon text-7xl mb-12" />

                <div className="grid lg:grid-cols-2 gap-20">
                    {/* 3. Glassmorphism Wrapper for Terminal */}
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-xl blur-2xl opacity-100 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-10 order-2 lg:order-1">
                            <div className="space-y-6">
                                <h3 className="text-3xl font-black uppercase tracking-tight leading-tight border-l-4 border-red-600 pl-6">
                                    Beyond Gameplay. <br />
                                    Mastering Discipline.
                                </h3>
                                <p className="text-brand-pure-white text-lg leading-relaxed max-w-xl">
                                    Conceptualized as a student led initiative, Cybrella brings
                                    together
                                    <span className="font-bold text-brand-vivid-green"> meticulously curated technical competitions </span>
                                    such as Game Jam, competitive coding, and other skill
                                    intensive events that test precision, problem solving, and
                                    innovation. By blending high energy technical battles
                                    with thoughtful intellectual engagement, the fest
                                    highlights the institute’s advanced infrastructure, faculty
                                    mentorship, and growing industry alignment. Cybrella
                                    stands as a testament to NIELIT’s role as a hub of
                                    technological excellence, empowering students to lead,
                                    adapt, and innovate in the digital age.
                                </p>
                            </div>

                            {/* Feature List - Institutionalized styling */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <TiltWrapper>
                                    <WireframeWrapper>
                                        <motion.div variants={itemVariants} className="bg-white border-4 border-black p-8 group hover:-translate-y-2 transition-transform">
                                            <div className="flex justify-between items-start mb-10">
                                                <Cpu className="w-10 h-10 text-brand-crimson-red" />
                                                <span className="font-mono text-[10px] text-black">MOD_01</span>
                                            </div>
                                            <h3 className="font-black text-brand-crimson-red text-2xl uppercase mb-2">Digital Literacy</h3>
                                            <p className="text-black text-sm leading-relaxed">Systematic mastery of competitive frameworks and logic.</p>
                                        </motion.div>
                                    </WireframeWrapper>
                                </TiltWrapper>

                                <TiltWrapper>
                                    <WireframeWrapper>
                                        <motion.div variants={itemVariants} className="bg-black text-white border-4 border-black p-8 group hover:-translate-y-2 transition-transform">
                                            <div className="flex justify-between items-start mb-10">
                                                <ShieldCheck className="w-10 h-10 text-brand-vivid-green" />
                                                <span className="font-mono text-[10px] text-white">MOD_02</span>
                                            </div>
                                            <h3 className="font-black text-brand-vivid-green text-2xl uppercase mb-2">Social Impact</h3>
                                            <p className="text-white text-sm leading-relaxed">Engineering a responsible gaming culture for 2026.</p>
                                        </motion.div>
                                    </WireframeWrapper>
                                </TiltWrapper>
                            </motion.div>

                            <div className="pt-2">
                                <div className="flex items-center gap-2 font-mono text-[12px] font-bold text-gray-400 mb-3 tracking-[0.2em]">
                                    TYPE IN THE TERMINAL!
                                </div>
                                <code className="block bg-black text-brand-vivid-green p-5 rounded-sm border-l-[6px] border-green-500 shadow-2xl">
                                    CYBRELLA
                                </code>
                            </div>
                        </div>
                    </div>
                    <div className="relative backdrop-blur-2xl bg-white/5 border border-white/10 p-2 rounded-sm shadow-2xl">
                        <InteractiveTerminal />
                    </div>
                </div>

            </div>
        </motion.section>
    );
}
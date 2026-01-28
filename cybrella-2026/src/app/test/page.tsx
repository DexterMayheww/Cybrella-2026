'use client'

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * ARCHITECTURAL NOTE:
 * We use useMotionValue for raw mouse coordinates to avoid 
 * React state re-render bottlenecks on every mouse move.
 */

const PopOutCard = () => {
	const cardRef = useRef<HTMLDivElement>(null);

	// Motion values for mouse position
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Smooth spring physics for the "heavy" feel
	const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
	const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

	// Map mouse position to rotation (Max 15 degrees)
	const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
	const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

	// Character Pop-out (Translates on Z-axis and moves slightly up)
	const characterZ = useTransform(mouseYSpring, [-0.5, 0.5], ["20px", "-20px"]);
	const characterScale = useSpring(1, { stiffness: 200, damping: 20 });

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();

		// Calculate normalized mouse position (-0.5 to 0.5)
		const width = rect.width;
		const height = rect.height;
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		x.set(mouseX / width - 0.5);
		y.set(mouseY / height - 0.5);
	};

	const handleMouseEnter = () => characterScale.set(1.1);
	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
		characterScale.set(1);
	};

	return (
		<div className="flex h-screen w-full items-center justify-center bg-[#050505] p-10">
			{/* 3D Perspective Wrapper */}
			<div
				style={{ perspective: "1200px" }}
				className="relative flex items-center justify-center"
			>
				<motion.div
					ref={cardRef}
					onMouseMove={handleMouseMove}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					style={{
						rotateX,
						rotateY,
						transformStyle: "preserve-3d",
					}}
					className="relative h-[500px] w-[350px] rounded-[24px] bg-[#1a1a1a] shadow-2xl transition-shadow duration-500 hover:shadow-[0_0_50px_rgba(0,180,255,0.2)]"
				>
					{/* LAYER 1: The Frame/Background */}
					<div className="absolute inset-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0a0a]">
						{/* Background Texture/Image */}
						<div
							className="absolute inset-0 opacity-40 grayscale-[0.5]"
							style={{
								backgroundImage: `url('/parallax/1_kagura.avif')`,
								backgroundSize: 'cover'
							}}
						/>

						{/* Ambient Light Glow */}
						<motion.div
							style={{
								translateX: useTransform(mouseXSpring, [-0.5, 0.5], ["-20%", "20%"]),
								translateY: useTransform(mouseYSpring, [-0.5, 0.5], ["-20%", "20%"]),
							}}
							className="absolute -inset-20 bg-gradient-to-tr from-cyan-500/20 via-transparent to-purple-500/20 blur-3xl"
						/>
					</div>

					{/* LAYER 2: Floating UI Elements (Z-Translated) */}
					<motion.div
						style={{ translateZ: "140px" }}
						className="absolute top-6 left-6 z-30"
					>
						<div className="bg-black/40 px-3 py-1 backdrop-blur-md border border-cyan-500/50">
							<span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400">GAMING</span>
						</div>
					</motion.div>

					<motion.div
						style={{ translateZ: "30px" }}
						className="absolute top-7 right-6 z-30"
					>
						<span className="text-[12px] font-mono text-white/30">2026-02-26</span>
					</motion.div>

					{/* LAYER 3: THE HERO (The Pop-Out Effect) */}
					{/* Note: This sits ABOVE the frame and scales/translates independently */}
					<motion.div
						style={{
							translateZ: "80px", // High Z-index translation
							scale: characterScale,
							y: characterZ, // Moves slightly up as user tilts down
						}}
						className="absolute inset-0 z-20 pointer-events-none flex items-end justify-center"
					>
						<img
							// src="/parallax/7_ling.avif"
							src="poster.avif"
							alt="Character"
							className="h-[100%] z-20 w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
						/>
					</motion.div>

					{/* LAYER 4: Bottom Text */}
<motion.div 
  style={{ 
    translateZ: "180px", // Higher than the character's 140px
    transformStyle: "preserve-3d" 
  }}
  className="absolute bottom-10 w-full text-center z-50" // High z-index for safety
>
  <h2 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
    FC 2026
  </h2>
</motion.div>

					{/* Sub-frame border for extra depth */}
					<div className="absolute inset-3 rounded-[18px] border border-white/5 pointer-events-none" />
				</motion.div>
			</div>
		</div>
	);
};

export default PopOutCard;
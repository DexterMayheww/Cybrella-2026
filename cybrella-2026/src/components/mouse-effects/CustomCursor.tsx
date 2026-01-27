// Custom Cursor - /src/components/mouse-effects/CustomCursor.tsx

"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
	const [isHovered, setIsHovered] = useState(false);
	const [isClicked, setIsClicked] = useState(false);
	const [isSmallHover, setIsSmallHover] = useState(false);

	// 1. Track Raw Mouse Position
	const mouseX = useMotionValue(-100);
	const mouseY = useMotionValue(-100);

	

	// 2. Physics Configuration
	// The "Main" cursor (fast response)
	const springConfigMain = { damping: 25, stiffness: 700, mass: 0.5 };

	// The "Trail" elements (slower response to create drag)
	// We use slightly different springs for a 'snake' effect
	const springConfigTrail = { damping: 20, stiffness: 200, mass: 0.8 };



	const [magnetTarget, setMagnetTarget] = useState<DOMRect | null>(null);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const magneticElement = target.closest('[data-magnetic="true"]');

			if (magneticElement) {
				const rect = magneticElement.getBoundingClientRect();
				setMagnetTarget(rect);
				// Snap raw mouse values to center of element slightly
				mouseX.set(rect.left + rect.width / 2 + (e.clientX - (rect.left + rect.width / 2)) * 0.2);
				mouseY.set(rect.top + rect.height / 2 + (e.clientY - (rect.top + rect.height / 2)) * 0.2);
			} else {
				setMagnetTarget(null);
				mouseX.set(e.clientX);
				mouseY.set(e.clientY);
			}
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);


	const smoothX = useSpring(mouseX, springConfigMain);
	const smoothY = useSpring(mouseY, springConfigMain);
	useEffect(() => {
		const manageMouseMove = (e: MouseEvent) => {
			mouseX.set(e.clientX);
			mouseY.set(e.clientY);
		};

		const handleMouseOver = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			const isZoneSmall = target.closest('nav') || target.closest('footer');

			const isInteractive =
				target.tagName === "BUTTON" ||
				target.tagName === "A" ||
				target.tagName === "INPUT" ||
				target.closest("button") ||
				target.closest("a") ||
				target.closest(".interactive");

			setIsHovered(!!isInteractive);

			setIsSmallHover(!!isInteractive && !!isZoneSmall);
		};

		const handleMouseDown = () => setIsClicked(true);
		const handleMouseUp = () => setIsClicked(false);

		window.addEventListener("mousemove", manageMouseMove);
		window.addEventListener("mouseover", handleMouseOver);
		window.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mouseup", handleMouseUp);

		document.body.style.cursor = "none";

		return () => {
			window.removeEventListener("mousemove", manageMouseMove);
			window.removeEventListener("mouseover", handleMouseOver);
			window.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "auto";
		};
	}, [mouseX, mouseY]);

	return (
		<>
			{/* --- TRAIL EFFECT --- */}
			{/* We render a few dots that follow the mouse with different delays */}
			{[...Array(5)].map((_, i) => (
				<TrailDot
					key={i}
					index={i}
					mouseX={mouseX}
					mouseY={mouseY}
				/>
			))}

			{/* --- MAIN CURSOR (Scope) --- */}
			<motion.div
				className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
				style={{
					x: smoothX,
					y: smoothY,
					translateX: "-50%",
					translateY: "-50%",
				}}
				animate={{
					scale: isClicked
						? 0.8
						: isSmallHover
							? 1.75   // Smaller scale for Nav/Footer (approx 48px)
							: isHovered
								? 2.5 // Large scale for Body (approx 80px)
								: 1,
					opacity: 1,
				}}
				transition={{ duration: 0.2 }}
			>
				<div
					className={`rounded-full border transition-all duration-300 ${isHovered
						? isSmallHover
							? "h-10 w-10 bg-white border-transparent opacity-80" // Smaller circle
							: "h-12 w-12 bg-white border-transparent opacity-80" // Original large circle
						: "h-8 w-8 border-cyan-400/50 bg-transparent"
						}`}
				>
					{!isHovered && (
						<>
							<div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-400/30 -translate-y-1/2" />
							<div className="absolute left-1/2 top-0 h-full w-[1px] bg-cyan-400/30 -translate-x-1/2" />
						</>
					)}
				</div>
			</motion.div>

			{/* --- CENTER DOT (The actual click point) --- */}
			<motion.div
				className="fixed top-0 left-0 z-[9999] pointer-events-none"
				style={{
					x: mouseX, // Raw output for instant feel on the dot
					y: mouseY,
					translateX: "-50%",
					translateY: "-50%",
				}}
			>
				<div className={`h-1 w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan] ${isHovered ? 'opacity-0' : 'opacity-100'}`} />
			</motion.div>
		</>
	);
}

// Sub-component for individual trail dots to manage their own springs
const TrailDot = ({ mouseX, mouseY, index }: { mouseX: any, mouseY: any, index: number }) => {
	// We increase delay (damping/mass) slightly for each subsequent dot
	const smoothOptions = {
		damping: 20 + (index * 5),
		stiffness: 250 - (index * 20),
		mass: 0.5 + (index * 0.1),
	};

	const x = useSpring(mouseX, smoothOptions);
	const y = useSpring(mouseY, smoothOptions);

	return (
		<motion.div
			className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full bg-cyan-500"
			style={{ x, y, translateX: "-50%", translateY: "-50%" }}
			initial={{ opacity: 0, scale: 0 }}
			animate={{
				opacity: 0.4 - (index * 0.08), // Fade out further back
				scale: 1 - (index * 0.15), // Get smaller further back
				width: 12, // Base size
				height: 12,
			}}
		/>
	);
};
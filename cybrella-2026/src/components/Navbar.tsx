// Navbar - /src/components/Navbar.tsx

// Navbar Component - /src/components/Navbar.tsx

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, Terminal, Globe, Cpu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// --- Helper: Scramble Text Effect ---
const ScrambleText = ({ text, isHovered }: { text: string; isHovered: boolean }) => {
	const [display, setDisplay] = useState(text);
	const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~";

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isHovered) {
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
				iteration += 1 / 2; // Speed of scramble
			}, 30);
		} else {
			setDisplay(text);
		}
		return () => clearInterval(interval);
	}, [isHovered, text]);

	return <span className="font-mono uppercase tracking-widest">{display}</span>;
};

// --- Helper: Nav Item ---
const NavItem = ({
	label,
	href,
	isActive,
	setActive
}: {
	label: string;
	href: string;
	isActive: boolean;
	setActive: (l: string | null) => void
}) => {
	return (
		<Link
			href={href}
			className="interactive relative px-6 py-3 flex flex-col items-center justify-center group"
			onMouseEnter={() => setActive(label)}
		>
			{/* Top Bracket */}
			<div className={`absolute top-0 w-full flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
				<span className="h-[2px] w-2 bg-cyan-400"></span>
				<span className="h-[2px] w-2 bg-cyan-400"></span>
			</div>

			<div className={`relative z-10 text-sm font-bold transition-colors duration-300 ${isActive ? "text-cyan-400" : "text-gray-400 group-hover:text-white"}`}>
				<ScrambleText text={label} isHovered={isActive} />
			</div>

			{/* Bottom Glow (Active Indicator) */}
			{isActive && (
				<motion.div
					layoutId="nav-scanner"
					className="absolute bottom-0 h-[2px] w-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
					transition={{ type: "spring", stiffness: 300, damping: 30 }}
				/>
			)}

			{/* Background Hover Mesh */}
			<div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 clip-path-slant" />
		</Link>
	);
};

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [activeHover, setActiveHover] = useState<string | null>(null);
	const [scrolled, setScrolled] = useState(false);

	// Handle Scroll Transparency
	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navLinks = ["Home", "Events", "Schedule", "Sponsors", "Admin"];

	return (
		<>
			<motion.nav
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.8, ease: "circOut" }}
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-brand-dark-olive/90 backdrop-blur-xl border-b border-white/10" : "bg-transparent border-b border-transparent"
					}`}
			>
				{/* Top Decorative System Bar */}
				<div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent" />

				<div className="max-w-7xl mx-auto px-6">
					<div className="flex items-center justify-between h-20">

						{/* LEFT: Logo Area */}
						<div className="flex items-center gap-6">
							<Link href="/" className="interactive group flex items-center gap-3">
								<div className="relative h-10 w-10 overflow-hidden border border-cyan-500/30 bg-brand-dark-olive/50 p-1 group-hover:border-cyan-400 transition-colors">
									<div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
									<Image
										src="/abc.png"
										alt="Cybrella Logo"
										width={100}
										height={100}
										className="h-full w-full text-cyan-400" />

									{/* Tiny corner markers */}
									<div className="absolute top-0 left-0 h-1 w-1 bg-white" />
									<div className="absolute bottom-0 right-0 h-1 w-1 bg-white" />
								</div>

								<div className="flex flex-col">
									<span className="font-horizon text-xl font-black tracking-tighter text-white leading-none">
										CYBRELLA<span className="text-cyan-400">.</span>
									</span>
									<span className="text-[12px] text-gray-500 font-mono tracking-widest group-hover:text-cyan-400 transition-colors">
										SYS.VER.3.0
									</span>
								</div>
							</Link>

							{/* Decorative Vertical Line */}
							<div className="hidden lg:block h-8 w-[1px] bg-white/10 rotate-12" />

							{/* System Stats (Decorative) */}
							<div className="hidden xl:flex gap-4 text-[10px] font-mono text-gray-600">
								<div className="flex items-center gap-1">
									<Globe className="h-3 w-3" />
									<span>REGION: ASIA</span>
								</div>
								<div className="flex items-center gap-1">
									<Cpu className="h-3 w-3" />
									<span>MEM: 64TB</span>
								</div>
							</div>
						</div>

						{/* CENTER: Navigation Links */}
						<div
							className="hidden md:flex items-center gap-1"
							onMouseLeave={() => setActiveHover(null)}
						>
							{navLinks.map((link) => (
								<NavItem
									key={link}
									label={link}
									href={`${link.toLowerCase()}`}
									isActive={activeHover === link}
									setActive={setActiveHover}
								/>
							))}
						</div>

						{/* RIGHT: CTA & Mobile */}
						<div className="flex items-center gap-6">
							<button className="interactive group relative px-6 py-2 overflow-hidden border border-white/20 hover:border-cyan-400 transition-colors">
								<div className="absolute inset-0 bg-cyan-950/50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
								<span className="relative font-mono text-sm font-bold text-white group-hover:text-cyan-400 tracking-wider">
									JOIN_SERVER
								</span>
								{/* Tech Corners */}
								<div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/40 group-hover:border-cyan-400 transition-colors" />
								<div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/40 group-hover:border-cyan-400 transition-colors" />
							</button>

							<button
								onClick={() => setIsOpen(!isOpen)}
								className="interactive md:hidden text-white hover:text-cyan-400 transition-colors"
							>
								{isOpen ? <X /> : <Menu />}
							</button>
						</div>

					</div>
				</div>

				{/* Bottom Decorative Rail */}
				<div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5 overflow-hidden">
					<motion.div
						animate={{ x: ["-100%", "100%"] }}
						transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
						className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
					/>
				</div>
			</motion.nav>

			{/* Mobile Menu Overlay (Terminal Style) */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, x: "100%" }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: "100%" }}
						transition={{ type: "spring", damping: 20 }}
						className="fixed inset-0 z-40 bg-brand-dark-olive/95 backdrop-blur-xl border-l border-white/10 md:hidden flex flex-col"
					>
						<div className="p-8 mt-20 font-mono">
							<div className="mb-8 text-xs text-gray-500 border-b border-gray-800 pb-2">
								SYSTEM_NAVIGATION_INIT
							</div>
							<div className="flex flex-col gap-6">
								{navLinks.map((item, i) => (
									<motion.div
										key={item}
										initial={{ x: 50, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										transition={{ delay: i * 0.1 }}
									>
										<Link
											href="#"
											className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white hover:from-cyan-400 hover:to-blue-500"
											onClick={() => setIsOpen(false)}
										>
											0{i + 1}. {item}
										</Link>
									</motion.div>
								))}
							</div>

							<div className="mt-12 p-4 bg-white/5 border border-white/10 rounded">
								<div className="flex items-center gap-2 text-cyan-400 mb-2">
									<Terminal className="h-4 w-4" />
									<span className="text-xs font-bold">STATUS REPORT</span>
								</div>
								<p className="text-xs text-gray-400 leading-relaxed">
									&gt; Connection established.<br />
									&gt; User ID identified.<br />
									&gt; Ready to deploy.
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
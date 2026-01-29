"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Award, Zap, Medal } from "lucide-react";

export interface Tier {
	id: string;
	name: string;
	order: number;
}

export interface SponsorData {
	id: string;
	name: string;
	tier: string;
	logoUrl?: string;
}

interface TierVisual {
	color: string;
	border: string;
	icon: React.ElementType;
	bg: string;
	glow: string;
}

const DEFAULT_TIER_STYLE: TierVisual = {
	color: "text-purple-400",
	border: "border-purple-500/20",
	icon: ShieldCheck,
	bg: "bg-purple-500/5",
	glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]"
};

const TIER_VISUALS: Record<string, TierVisual> = {
	PLATINUM: {
		color: "text-cyan-400",
		border: "border-cyan-400/30",
		icon: ShieldCheck,
		bg: "bg-cyan-500/5",
		glow: "shadow-[0_0_30px_rgba(34,211,238,0.2)]"
	},
	GOLD: {
		color: "text-yellow-500",
		border: "border-yellow-500/30",
		icon: Award,
		bg: "bg-yellow-500/5",
		glow: "shadow-[0_0_25px_rgba(234,179,8,0.15)]"
	},
	SILVER: {
		color: "text-slate-300",
		border: "border-slate-400/20",
		icon: Zap,
		bg: "bg-slate-400/5",
		glow: "shadow-[0_0_20px_rgba(148,163,184,0.1)]"
	},
	BRONZE: {
		color: "text-[#CD7F32]",
		border: "border-[#CD7F32]/20",
		icon: Medal,
		bg: "bg-[#CD7F32]/5",
		glow: "shadow-[0_0_15px_rgba(205,127,50,0.1)]"
	},
};

export default function SponsorsSection({
	initialSponsors,
	initialTiers
}: {
	initialSponsors: SponsorData[],
	initialTiers: Tier[]
}) {
	// Sort tiers by order
	const sortedTiers = [...initialTiers].sort((a, b) => a.order - b.order);

	return (
		<section className="py-24 border-t border-white/5 bg-black/40 overflow-hidden relative" id="sponsors">
			<div className="absolute inset-0 bg-size-[60px_60px] bg-grid-white/[0.02]" />
			<div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

			<div className="max-w-7xl mx-auto px-6 relative z-10">
				<div className="text-center mb-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="inline-block"
					>
						<h2 className="text-sm font-mono text-cyan-400 uppercase tracking-[0.5em] mb-4">
							Strategic_Partners
						</h2>
						<div className="h-px w-full bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />
					</motion.div>
				</div>

				<div className="space-y-20">
					{sortedTiers.map((tier) => {
						const tierSponsors = initialSponsors.filter(s => s.tier === tier.name);
						if (tierSponsors.length === 0) return null;

						const Visual = TIER_VISUALS[tier.name.toUpperCase()] || DEFAULT_TIER_STYLE;
						const Icon = Visual.icon;

						return (
							<div key={tier.id} className="space-y-10">
								{/* Tier Title Bar */}
								<div className="flex items-center gap-6">
									<div className={`p-2 rounded border ${Visual.border} ${Visual.bg} ${Visual.glow}`}>
										<Icon className={`w-5 h-5 ${Visual.color}`} />
									</div>
									<h3 className={`text-xl font-horizon tracking-widest ${Visual.color} uppercase`}>
										{tier.name} TIER
									</h3>
									<div className={`h-px flex-1 bg-linear-to-r ${Visual.color.replace('text', 'from')}/20 to-transparent`} />
								</div>

								{/* Sponsors Grid */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-12">
									{tierSponsors.map((sponsor) => (
										<SponsorCard key={sponsor.id} sponsor={sponsor} Visual={Visual} />
									))}
								</div>
							</div>
						);
					})}
				</div>

				{initialSponsors.length === 0 && (
					<div className="text-center py-20 border border-white/5 bg-white/5 rounded-2xl backdrop-blur-md">
						<p className="font-mono text-gray-500 text-sm tracking-widest uppercase">
							Establishing_Secure_Links... // no_active_nodes_found
						</p>
					</div>
				)}
			</div>

			<style jsx>{`
                .bg-scanline {
                    background: linear-gradient(
                        to bottom,
                        transparent,
                        rgba(255, 255, 255, 0.05) 50%,
                        transparent
                    );
                    background-size: 100% 4px;
                }
            `}</style>
		</section>
	);
}

function SponsorCard({ sponsor, Visual }: { sponsor: SponsorData, Visual: TierVisual }) {
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseXSpring = useSpring(x);
	const mouseYSpring = useSpring(y);

	const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
	const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const xPct = mouseX / width - 0.5;
		const yPct = mouseY / height - 0.5;

		x.set(xPct);
		y.set(yPct);
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	const shineBackground = useTransform(
		[mouseXSpring, mouseYSpring],
		([mx, my]: number[]) => `radial-gradient(circle at ${(mx + 0.5) * 100}% ${(my + 0.5) * 100}%, rgba(255,255,255,0.15) 0%, transparent 80%)`
	);

	return (
		<div className="flex flex-col items-center group/card w-full" style={{ perspective: "1000px" }}>
			<motion.div
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				style={{
					rotateX,
					rotateY,
					transformStyle: "preserve-3d",
				}}
				whileHover={{ scale: 1.05 }}
				className={`relative aspect-square w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center backdrop-blur-sm transition-colors duration-500 hover:border-white/30 hover:bg-white/10 ${Visual.glow.replace('shadow-', 'shadow-2xl shadow-')}`}
			>
				{/* Shine Effect */}
				<motion.div
					style={{
						background: shineBackground,
						transform: "translateZ(1px)"
					}}
					className="absolute inset-0 pointer-events-none"
				/>

				{/* Decorative Elements */}
				<div className="absolute top-0 right-0 p-2 opacity-0 group-hover/card:opacity-100 transition-opacity" style={{ transform: "translateZ(20px)" }}>
					<div className={`w-1.5 h-1.5 rounded-full ${Visual.color.replace('text', 'bg')}`} />
				</div>

				<div className="relative w-full h-full flex items-center justify-center" style={{ transform: "translateZ(30px)" }}>
					{sponsor.logoUrl ? (
						<Image
							src={sponsor.logoUrl}
							alt={sponsor.name}
							fill
							className="object-cover opacity-70 group-hover/card:opacity-100 transition-all duration-500 grayscale group-hover/card:grayscale-0 brightness-125 group-hover/card:brightness-100 drop-shadow-2xl"
							unoptimized
						/>
					) : (
						<span className="text-xl font-mono text-white/40 group-hover/card:text-white transition-colors duration-300 uppercase tracking-tighter">
							{sponsor.name}
						</span>
					)}
				</div>

				{/* Scanline Effect on Hover */}
				<div className="absolute inset-0 bg-scanline pointer-events-none opacity-0 group-hover/card:opacity-10 transition-opacity" />
			</motion.div>

			<motion.div
				className="mt-6 text-center overflow-hidden w-full"
				initial={{ opacity: 0, y: 10 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
			>
				<span
					className="interactive text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-white/10 hover:bg-white/40 transition-all duration-700 cursor-default uppercase leading-none block py-2"
					style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)" }}
				>
					{sponsor.name}
				</span>
			</motion.div>
		</div>
	);
}

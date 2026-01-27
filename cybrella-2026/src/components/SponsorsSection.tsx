// Sponsors Section - /src/components/SponsorsSection.tsx

"use client";

import { motion } from "framer-motion";

interface SponsorData {
	id: string;
	name: string;
	tier: string;
}

export default function SponsorsSection({ initialSponsors }: { initialSponsors: SponsorData[] }) {
	// Duplicate the list for the infinite marquee effect
	const displaySponsors = [...initialSponsors, ...initialSponsors];

	return (
		<section className="py-20 border-t border-white/10 bg-gray-900 overflow-hidden relative" id="sponsors">
			<div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

			<div className="max-w-7xl mx-auto px-6 mb-12 text-center">
				<h2 className="text-2xl font-mono text-gray-500 uppercase tracking-widest">
					Powering the Future
				</h2>
			</div>

			<div className="flex relative overflow-hidden">
				{displaySponsors.length > 0 ? (
					<motion.div
						animate={{ x: ["0%", "-50%"] }}
						transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
						className="flex gap-20 whitespace-nowrap"
					>
						{displaySponsors.map((sponsor, idx) => (
							<span
								key={`${sponsor.id}-${idx}`}
								className="interactive text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-white/10 hover:bg-white/40 transition-colors cursor-default uppercase"
								style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)" }}
							>
								{sponsor.name}
							</span>
						))}
					</motion.div>
				) : (
					<div className="w-full text-center font-mono text-gray-800 text-xs">
						NO_SPONSORS_IN_SECTOR_VIRTUAL
					</div>
				)}
			</div>
		</section>
	);
}
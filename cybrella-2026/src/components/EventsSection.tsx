// Events Section - /src/components/EventsSection.tsx

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import TiltWrapper from "./animations/TiltWrapper";
import { EventData } from "@/types/events";

const EventCard = ({ event, index }: { event: EventData; index: number }) => {
	const slug = event.slug || event.title.toLowerCase().replace(/ /g, "-");

	return (
		<TiltWrapper>
			<Link href={`/events/${slug}`} className="block h-full w-full">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
					className="group relative h-[450px] w-full overflow-hidden border border-white/10 bg-gray-900 rounded-lg interactive cursor-pointer"
				>
					{/* 1. Atmospheric Background Blur (Glow effect) */}
					<div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700">
						<Image
							src={event.posterUrl}
							alt={event.title}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="object-cover blur-2xl scale-150 saturate-200"
							unoptimized={process.env.NODE_ENV === 'development'}
						/>
					</div>

					{/* 2. Main Poster Image with Pop Effect */}
					<div className="absolute inset-0 z-0 overflow-hidden">

						<Image
							src={event.posterUrl}
							alt={event.title}
							fill
							className="object-cover transition-all duration-700 ease-out 
						group-hover:scale-110 group-hover:rotate-2 group-hover:saturate-150
						filter brightness-75 group-hover:brightness-100"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							unoptimized={process.env.NODE_ENV === 'development'}
						/>
						{/* Gradient Overlay for Text Readability */}
						<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />
					</div>

					{/* 3. Content Layer */}
					<div className="relative h-full p-6 flex flex-col justify-between z-10 pointer-events-none">

						{/* Top Badges */}
						<div className="flex justify-between items-start pointer-events-auto">
							<span className="bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-mono text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
								{event.category}
							</span>
							<div className="flex flex-col items-end">
								<span className="text-white font-black text-xl tracking-tighter leading-none">{event.date.split("-")[2] || "00"}</span>
								<span className="text-xs text-gray-400 font-mono uppercase">{event.date.split("-")[1] || "XXX"}</span>
							</div>
						</div>

						{/* Bottom Text */}
						<div className="pointer-events-auto">
							<h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter transform translate-y-0 transition-transform duration-300 group-hover:-translate-y-2 drop-shadow-lg leading-[0.9]">
								{event.title}
							</h3>

							<div className="overflow-hidden">
								<p className="text-cyan-200/80 text-sm font-mono transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-100 flex items-center gap-2">
									INITIATE_PROTOCOL <span className="animate-pulse">_</span>
								</p>
							</div>
						</div>
					</div>

					{/* 4. Hover Border / Line Effect */}
					<div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/50 transition-colors duration-300 rounded-lg pointer-events-none" />
					<div className="absolute bottom-0 left-0 h-1 w-full bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
				</motion.div>
			</Link>
		</TiltWrapper>
	);
};

export default function EventsSection({ initialEvents }: { initialEvents: EventData[] }) {
	return (
		<section className="relative py-24 px-6 bg-black z-10" id="events">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-end mb-16">
					<div>
						<h2 className="text-5xl font-bold text-white tracking-tighter mb-4">
							MAIN <span className="text-cyan-400">EVENTS</span>
						</h2>
						<div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-purple-600"></div>
					</div>
					<p className="text-gray-400 max-w-sm text-right mt-6 md:mt-0 font-mono text-xs">
						JOIN_THE_LEAGUE <br />
						DATABASE_STATUS: CONNECTED // {initialEvents.length} ACTIVE_NODES
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{initialEvents.map((event, idx) => (
						<EventCard key={event.id} event={event} index={idx} />
					))}
				</div>

				{initialEvents.length === 0 && (
					<div className="h-64 border border-dashed border-white/10 flex items-center justify-center font-mono text-gray-600 uppercase tracking-widest text-sm">
						Waiting_for_deployment_data...
					</div>
				)}
			</div>
		</section>
	);
}
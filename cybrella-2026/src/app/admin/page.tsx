// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

import SponsorManager from "@/components/admin/SponsorManager";
import EventManager from "@/components/admin/EventManager";
import {
	LogOut, Terminal, Loader2,
	Cpu, Users, Calendar,
	Settings, Activity, LayoutDashboard,
	ShieldCheck
} from "lucide-react";
import RegistrationManager from "@/components/admin/RegistrationManager";
import SystemSettingsManager from "@/components/admin/SystemSettingsManager";
import { ToastProvider } from '../../components/admin/SystemToast';

type AdminSector = "EVENTS" | "SPONSORS" | "REGISTRATIONS" | "SYSTEM";

export default function AdminDashboard() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [activeSector, setActiveSector] = useState<AdminSector>("EVENTS");

	// PROTECT THE ROUTE
	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (!user) {
				router.push("/login");
			} else {
				setLoading(false);
			}
		});
		return () => unsubscribe();
	}, [router]);

	const handleLogout = async () => {
		await signOut(auth);
		router.push("/login");
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono tracking-tighter">
				<Loader2 className="w-10 h-10 animate-spin mb-4" />
				<span className="animate-pulse">DECRYPTING_ADMIN_PRIVILEGES...</span>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#050505] text-white font-montserrat overflow-hidden flex flex-col">
			{/* Background Tech Mesh */}
			<div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
			<div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#0c4a6e30_0%,transparent_70%)] pointer-events-none" />

			{/* TOP SYSTEM BAR */}
			<header className="relative z-50 h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
				<div className="flex items-center gap-4">
					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
							<h1 className="font-horizon text-xl tracking-widest">CYBRELLA<span className="text-cyan-400">_OS</span></h1>
						</div>
						<span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] -mt-1">
							Admin_Uplink_v3.0.26 // Secure_Node
						</span>
					</div>
				</div>

				<div className="flex items-center gap-6">
					<div className="hidden md:flex items-center gap-4 text-[11px] font-mono text-gray-500 border-x border-white/10 px-6">
						<div className="flex items-center gap-2">
							<Activity className="w-4 h-4 text-cyan-500" />
							<span>LATENCY: 14MS</span>
						</div>
						<div className="flex items-center gap-2">
							<Cpu className="w-4 h-4 text-purple-500" />
							<span>LOAD: 12%</span>
						</div>
					</div>

					<button
						onClick={handleLogout}
						className="group flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
					>
						TERMINATE <LogOut className="w-4 h-4" />
					</button>
				</div>
			</header>

			<div className="flex flex-1 overflow-hidden">
				{/* SIDEBAR NAVIGATION */}
				<aside className="w-24 md:w-72 border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col p-4 z-40 flex-shrink-0">
					<div className="space-y-2 flex-1 overflow-y-auto">
						<NavButton
							active={activeSector === "EVENTS"}
							onClick={() => setActiveSector("EVENTS")}
							icon={Calendar}
							label="Event_Orchestrator"
							shortcut="F1"
						/>
						<NavButton
							active={activeSector === "SPONSORS"}
							onClick={() => setActiveSector("SPONSORS")}
							icon={Users}
							label="Sponsor_Registry"
							shortcut="F2"
						/>
						<NavButton
							active={activeSector === "SYSTEM"}
							onClick={() => setActiveSector("SYSTEM")}
							icon={Settings}
							label="System_Settings"
							shortcut="F3"
						/>
						<NavButton
							active={activeSector === "REGISTRATIONS"}
							onClick={() => setActiveSector("REGISTRATIONS")}
							icon={ShieldCheck}
							label="Enlistment_Records"
							shortcut="F4"
						/>
					</div>

					<div className="p-4 border-t border-white/10 mt-auto">
						<div className="flex items-center gap-3 opacity-40 grayscale">
							<LayoutDashboard className="w-6 h-6" />
							<span className="hidden md:block text-[11px] font-mono">BACK_TO_SITE</span>
						</div>
					</div>
				</aside>

				{/* MAIN COMMAND AREA */}
				<main className="flex-1 overflow-y-auto relative p-6 md:p-12 scroll-smooth">
					<div className="max-w-7xl mx-auto pb-20">
						{/* Sector Header */}
						<header className="mb-10">
							<motion.div
								key={activeSector}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								className="flex items-center gap-3 mb-2"
							>
								<Terminal className="w-5 h-5 text-cyan-400" />
								<span className="text-sm font-mono text-cyan-400/60 uppercase tracking-widest">
									root / {activeSector.toLowerCase()} / control_panel
								</span>
							</motion.div>
							<h2 className="text-6xl font-black font-horizon uppercase tracking-tighter">
								{activeSector === "EVENTS" && "EVENT_ARENA_MGMT"}
								{activeSector === "SPONSORS" && "STRATEGIC_PARTNERS"}
								{activeSector === "SYSTEM" && "CORE_SYSTEM_OS"}
							</h2>
							<div className="h-1.5 w-48 bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent mt-6" />
						</header>

						{/* Dynamic Content Switching */}
						<AnimatePresence mode="wait">
							{activeSector === "EVENTS" && (
								<motion.div
									key="events"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3 }}
								>
									<EventManager />
								</motion.div>
							)}
							{activeSector === "SPONSORS" && (
								<motion.div
									key="sponsors"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3 }}
								>
									<SponsorManager />
								</motion.div>
							)}
							{activeSector === "SYSTEM" && (
								<motion.div
									key="system"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3 }}
								>
									<SystemSettingsManager />
								</motion.div>
							)}
							{activeSector === "REGISTRATIONS" && (
								<motion.div
									key="registrations"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
								>
									<ToastProvider>
										<RegistrationManager />
									</ToastProvider>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</main>
			</div>
		</div>
	);
}

// Sub-component for Navigation Buttons
function NavButton({ active, onClick, icon: Icon, label, shortcut }: any) {
	return (
		<button
			onClick={onClick}
			className={`
        w-full flex items-center gap-4 p-3 rounded transition-all group relative
        ${active ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}
      `}
		>
			{active && (
				<motion.div
					layoutId="sidebar-active"
					className="absolute left-0 w-1 h-2/3 bg-cyan-500 rounded-r-full"
				/>
			)}
			<Icon className={`w-6 h-6 ${active ? 'animate-pulse' : ''}`} />
			<div className="hidden md:flex flex-1 items-center justify-between overflow-hidden">
				<span className="text-xs font-bold uppercase tracking-widest truncate">{label}</span>
				<span className="text-[10px] font-mono opacity-30">[{shortcut}]</span>
			</div>
		</button>
	);
}
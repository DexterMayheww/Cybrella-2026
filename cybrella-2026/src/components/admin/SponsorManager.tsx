// src/components/admin/SponsorManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, ShieldCheck, Award, Zap, Medal, Save, Edit2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase"; // FIREBASE IMPORT
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";

// You might need to move this type to a shared file or keep it here
export type SponsorTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE";
export interface Sponsor {
	id: string;
	name: string;
	tier: SponsorTier;
}

const TIER_CONFIG: Record<SponsorTier, { color: string, border: string, icon: any, bg: string }> = {
	PLATINUM: { color: "text-cyan-400", border: "border-cyan-400/50", icon: ShieldCheck, bg: "bg-cyan-500/5" },
	GOLD: { color: "text-yellow-500", border: "border-yellow-500/50", icon: Award, bg: "bg-yellow-500/5" },
	SILVER: { color: "text-slate-400", border: "border-slate-400/50", icon: Zap, bg: "bg-slate-400/5" },
	BRONZE: { color: "text-orange-700", border: "border-orange-700/50", icon: Medal, bg: "bg-orange-700/5" },
};

export default function SponsorManager() {
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [loading, setLoading] = useState(true);

	const [newName, setNewName] = useState("");
	const [newTier, setNewTier] = useState<SponsorTier>("SILVER");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editBuffer, setEditBuffer] = useState<Sponsor | null>(null);

	// 1. FETCH REAL-TIME DATA
	useEffect(() => {
		// Attempt to order by 'createdAt' if you add that field, otherwise defaults
		const q = query(collection(db, "sponsors"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const data = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			})) as Sponsor[];
			setSponsors(data);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	// 2. ACTIONS
	const addSponsor = async () => {
		if (!newName) return;
		try {
			await addDoc(collection(db, "sponsors"), {
				name: newName,
				tier: newTier,
				createdAt: new Date().toISOString()
			});
			setNewName("");
		} catch (e) {
			console.error("Error adding:", e);
			alert("PERMISSION_DENIED: Check Firestore Rules");
		}
	};

	const saveEdit = async () => {
		if (!editBuffer || !editingId) return;
		try {
			const ref = doc(db, "sponsors", editingId);
			await updateDoc(ref, {
				name: editBuffer.name,
				tier: editBuffer.tier
			});
			setEditingId(null);
			setEditBuffer(null);
		} catch (e) {
			console.error("Error updating:", e);
		}
	};

	const deleteSponsor = async (id: string) => {
		if (!confirm("CONFIRM DELETION?")) return;
		try {
			await deleteDoc(doc(db, "sponsors", id));
		} catch (e) {
			console.error("Error deleting:", e);
		}
	};

	const startEdit = (sponsor: Sponsor) => {
		setEditingId(sponsor.id);
		setEditBuffer({ ...sponsor });
	};


	if (loading) return <div className="p-12 text-center text-sm font-mono text-gray-500 animate-pulse uppercase tracking-widest">Establishing_Secure_Link...</div>;

	return (
		<div className="space-y-8">
			{/* Registration Form */}
			<div className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md relative overflow-hidden group">
				<div className="absolute top-0 right-0 p-4 opacity-10"><Plus className="w-16 h-16" /></div>
				<h3 className="text-xs font-mono text-cyan-400 tracking-[0.3em] uppercase mb-6">New_Entry_Protocol</h3>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
					<div className="md:col-span-5">
						<input
							type="text"
							placeholder="SPONSOR_NAME"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							className="w-full bg-black/40 border border-white/20 p-4 text-white font-mono text-base focus:border-cyan-400 outline-none transition-all rounded"
						/>
					</div>

					<div className="md:col-span-4 relative">
						<select
							value={newTier}
							onChange={(e) => setNewTier(e.target.value as SponsorTier)}
							className="w-full bg-black/40 border border-white/20 p-4 pr-10 text-white font-mono text-base focus:border-cyan-400 outline-none transition-all appearance-none rounded cursor-pointer"
						>
							<option value="PLATINUM" className="bg-zinc-900">PLATINUM TIER</option>
							<option value="GOLD" className="bg-zinc-900">GOLD TIER</option>
							<option value="SILVER" className="bg-zinc-900">SILVER TIER</option>
							<option value="BRONZE" className="bg-zinc-900">BRONZE TIER</option>
						</select>
						{/* Arrow Icon */}
						<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/50">
							<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>

					<button
						onClick={addSponsor}
						className="md:col-span-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-tighter transition-all flex items-center justify-center gap-3 rounded shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] py-4"
					>
						INITIALIZE <Plus className="w-5 h-5" />
					</button>
				</div>
			</div>

			{/* List */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<AnimatePresence mode="popLayout">
					{sponsors.map((s) => {
						const isEditing = editingId === s.id;
						const Config = TIER_CONFIG[isEditing ? (editBuffer?.tier as SponsorTier) : s.tier];
						const Icon = Config.icon;

						return (
							<motion.div
								layout
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								key={s.id}
								className={`group p-6 border ${Config.border} ${Config.bg} rounded flex items-center justify-between transition-all duration-300 relative shadow-xl backdrop-blur-sm`}
							>
								<div className="flex items-center gap-4 flex-1">
									<div className={`${Config.color} p-3 bg-black/40 rounded-sm ring-1 ring-white/5`}>
										<Icon className="w-6 h-6" />
									</div>

									{isEditing ? (
										<div className="flex flex-col gap-2 flex-1 mr-4">
											<input
												className="bg-black/60 border border-cyan-400/50 p-2 text-base font-mono text-white outline-none rounded"
												value={editBuffer?.name || ""}
												onChange={(e) => setEditBuffer(prev => prev ? { ...prev, name: e.target.value } : null)}
												autoFocus
											/>
											<select
												className="bg-black/60 border border-cyan-400/50 p-2 text-xs font-mono text-cyan-400 outline-none rounded"
												value={editBuffer?.tier}
												onChange={(e) => setEditBuffer(prev => prev ? { ...prev, tier: e.target.value as SponsorTier } : null)}
											>
												<option value="PLATINUM">PLATINUM</option>
												<option value="GOLD">GOLD</option>
												<option value="SILVER">SILVER</option>
												<option value="BRONZE">BRONZE</option>
											</select>
										</div>
									) : (
										<div className="flex flex-col gap-1">
											<h4 className="text-xl text-white font-black font-horizon tracking-tight uppercase group-hover:text-cyan-400 transition-colors">
												{s.name}
											</h4>
											<p className={`text-xs font-mono ${Config.color} tracking-[0.2em] font-bold`}>
												{s.tier} TIER
											</p>
										</div>
									)}
								</div>

								<div className="flex items-center gap-2">
									{isEditing ? (
										<>
											<button onClick={saveEdit} className="p-2 text-green-400 hover:bg-green-400/10 rounded transition-colors">
												<Save className="w-4 h-4" />
											</button>
											<button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-white/5 rounded transition-colors">
												<X className="w-4 h-4" />
											</button>
										</>
									) : (
										<>
											<button onClick={() => startEdit(s)} className="p-3 text-white/30 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100 bg-white/5 rounded">
												<Edit2 className="w-5 h-5" />
											</button>
											<button onClick={() => deleteSponsor(s.id)} className="p-3 text-white/30 hover:text-red-500 transition-colors bg-white/5 rounded">
												<Trash2 className="w-5 h-5" />
											</button>
										</>
									)}
								</div>
								<div className={`absolute left-0 top-0 bottom-0 w-[2px] ${Config.color.replace('text-', 'bg-')}`} />
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ShieldCheck, Award, Zap, Medal, Edit2, X, UploadCloud, Layers, ChevronDown, Activity, GripVertical } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, writeBatch } from "firebase/firestore";
import SystemConfirm from "./SystemConfirm";
import { useToast, ToastProvider } from "./SystemToast";

export interface Tier {
    id: string;
    name: string;
    color: string;
    order: number;
}

export interface Sponsor {
    id: string;
    name: string;
    tier: string; // Changed from Tier object to string
    logoUrl?: string;
}

interface TierVisual {
    color: string;
    border: string;
    icon: React.ElementType;
    bg: string;
}

const DEFAULT_TIER_STYLE: TierVisual = { color: "text-purple-400", border: "border-purple-400/50", icon: ShieldCheck, bg: "bg-purple-500/5" };

const TIER_VISUALS: Record<string, TierVisual> = {
    PLATINUM: { color: "text-cyan-400", border: "border-cyan-400/50", icon: ShieldCheck, bg: "bg-cyan-500/5" },
    GOLD: { color: "text-yellow-500", border: "border-yellow-500/50", icon: Award, bg: "bg-yellow-500/5" },
    SILVER: { color: "text-slate-400", border: "border-slate-400/50", icon: Zap, bg: "bg-slate-400/5" },
    BRONZE: { color: "text-orange-700", border: "border-orange-700/50", icon: Medal, bg: "bg-orange-700/5" },
};

function SponsorManagerContent() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const [newName, setNewName] = useState("");
    const [newTier, setNewTier] = useState<string>("");
    const [newLogoUrl, setNewLogoUrl] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [tiers, setTiers] = useState<Tier[]>([]);
    const [newTierName, setNewTierName] = useState("");

    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: "WARNING" | "DANGER";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: "WARNING"
    });

    const showNotify = (message: string, type: "SUCCESS" | "ERROR" | "INFO" = "INFO") => {
        showToast(message, type === "INFO" ? "SYSTEM" : type);
    };

    useEffect(() => {
        const unsubscribeTiers = onSnapshot(query(collection(db, "sponsor_tiers")), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tier[];
            const sorted = data.sort((a, b) => a.order - b.order);
            setTiers(sorted);
            if (sorted.length > 0 && !newTier) setNewTier(sorted[0].name);
        });

        const q = query(collection(db, "sponsors"));
        const unsubscribeSponsors = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Sponsor[];
            setSponsors(data);
            setLoading(false);
        });

        return () => {
            unsubscribeTiers();
            unsubscribeSponsors();
        };
    }, [newTier]);

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const body = new FormData();
            body.append("photo", file);

            const baseUrl = process.env.NEXT_PUBLIC_FILE_SERVER_URL?.replace(/\/$/, "");
            const res = await fetch(`${baseUrl}/upload?folder=sponsors`, {
                method: "POST",
                body: body
            });

            if (!res.ok) throw new Error("UPLOAD_FAILED");
            const data = await res.json();

            setNewLogoUrl(data.url);
            showNotify("ASSET_UPLOADED", "SUCCESS");
        } catch (e) {
            console.error(e);
            showNotify("UPLOAD_ERROR: Check File Server Connection", "ERROR");
        } finally {
            setIsUploading(false);
        }
    };

    const handleExecuteDeployment = async () => {
        if (!newName || !newTier) {
            showNotify("MISSING_CRITICAL_DATA", "ERROR");
            return;
        }
        try {
            if (editingId) {
                const ref = doc(db, "sponsors", editingId);
                await updateDoc(ref, {
                    name: newName,
                    tier: newTier,
                    logoUrl: newLogoUrl || ""
                });
                showNotify("SPONSOR_DATA_SYNCHRONIZED", "SUCCESS");
            } else {
                await addDoc(collection(db, "sponsors"), {
                    name: newName,
                    tier: newTier,
                    logoUrl: newLogoUrl,
                    createdAt: new Date().toISOString()
                });
                showNotify("SPONSOR_ENTRY_INITIALIZED", "SUCCESS");
            }
            resetForm();
        } catch (e: unknown) {
            console.error("Error saving:", e);
            showNotify(e instanceof Error ? e.message : "An unknown error occurred", "ERROR");
        }
    };

    const resetForm = () => {
        setNewName("");
        setNewTier(tiers[0]?.name || "");
        setNewLogoUrl("");
        setEditingId(null);
    };

    const handleDeleteSponsor = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "DELETE_SPONSOR?",
            message: "protocol_initiated: delete_sponsor_sequence // confirm_action.",
            type: "DANGER",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, "sponsors", id));
                    showNotify("SPONSOR_ENTRY_SCRUBBED", "SUCCESS");
                } catch (e: unknown) {
                    showNotify(e instanceof Error ? e.message : "An unknown error occurred", "ERROR");
                }
            }
        });
    };

    const addTier = async () => {
        if (!newTierName) return;
        try {
            await addDoc(collection(db, "sponsor_tiers"), {
                name: newTierName.toUpperCase(),
                order: tiers.length,
                color: "text-cyan-400"
            });
            setNewTierName("");
            showNotify("TIER_HIERARCHY_EXTENDED", "SUCCESS");
        } catch (e: unknown) {
            showNotify(e instanceof Error ? e.message : "An unknown error occurred", "ERROR");
        }
    };

    const deleteTier = (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "DELETE_TIER?",
            message: "confirm_tier_deletion // potentially_impacts_linked_sponsors.",
            type: "DANGER",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, "sponsor_tiers", id));
                    showNotify("TIER_REMOVED", "SUCCESS");
                } catch (e: unknown) {
                    showNotify(e instanceof Error ? e.message : "An unknown error occurred", "ERROR");
                }
            }
        });
    };

    const handleReorderTiers = async (newOrder: Tier[]) => {
        setTiers(newOrder); // Optimistic UI update
        try {
            const batch = writeBatch(db);
            newOrder.forEach((t, index) => {
                const ref = doc(db, "sponsor_tiers", t.id);
                batch.update(ref, { order: index });
            });
            await batch.commit();
            showNotify("TIER_SEQUENCE_SYNCHRONIZED", "SUCCESS");
        } catch (e: unknown) {
            console.error("Sync error:", e);
            showNotify("DATABASE_SYNC_FAILURE", "ERROR");
        }
    };

    const startEdit = (sponsor: Sponsor) => {
        setEditingId(sponsor.id);
        setNewName(sponsor.name);
        setNewTier(sponsor.tier);
        setNewLogoUrl(sponsor.logoUrl || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <div className="p-12 text-center text-sm font-mono text-gray-500 animate-pulse uppercase tracking-widest">Establishing_Secure_Link...</div>;

    return (
        <div className="space-y-8">
            {/* TIER ARCHITECT */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <h3 className="text-[10px] font-mono text-purple-400 tracking-[0.3em] uppercase">Tier_Hierarchy_Config</h3>
                </div>
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="NEW_TIER_NAME..."
                        value={newTierName}
                        onChange={(e) => setNewTierName(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 p-3 text-sm font-mono text-white outline-none focus:border-purple-500 transition-all rounded"
                    />
                    <button onClick={addTier} className="bg-purple-600 text-white px-6 py-2 font-black text-[10px] hover:bg-purple-500 transition-all rounded">
                        ADD_TIER
                    </button>
                </div>
                <Reorder.Group
                    axis="x"
                    values={tiers}
                    onReorder={handleReorderTiers}
                    className="flex flex-wrap gap-2"
                >
                    {tiers.map(t => (
                        <Reorder.Item
                            key={t.id}
                            value={t}
                            className="px-3 py-1 border border-white/10 bg-white/5 rounded-full flex items-center gap-2 text-[10px] font-mono cursor-grab active:cursor-grabbing select-none group/tier"
                        >
                            <GripVertical className="w-3 h-3 text-white/20 group-hover/tier:text-cyan-400 transition-colors" />
                            <span className="text-cyan-400">#</span> {t.name}
                            <button onClick={() => deleteTier(t.id)} className="hover:text-red-500 transition-colors ml-1"><X className="w-3 h-3" /></button>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            {/* Registration Form */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-mono text-cyan-400 tracking-[0.3em] uppercase">New_Entry_Protocol</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Logo Uploader Square */}
                    <div className="md:col-span-2">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square bg-black/40 border border-dashed border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-all overflow-hidden relative"
                        >
                            {newLogoUrl ? (
                                <Image src={newLogoUrl} alt="Preview" fill className="object-contain p-2" unoptimized />
                            ) : (
                                <>
                                    <UploadCloud className={`w-6 h-6 mb-2 ${isUploading ? 'animate-bounce' : 'text-white/20'}`} />
                                    <span className="text-[8px] font-mono text-white/40 uppercase">Logo_Asset</span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="SPONSOR_NAME"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-black/40 border border-white/20 p-2 px-4 text-white font-mono text-base focus:border-cyan-400 outline-none transition-all rounded"
                        />
                        <div className="relative group flex ">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                                <Layers className="w-4 h-4" />
                            </div>
                            <select
                                value={newTier}
                                onChange={(e) => setNewTier(e.target.value)}
                                className="w-full bg-black/40 border border-white/20 p-4 pl-12 text-white font-mono text-base focus:border-cyan-400 outline-none appearance-none transition-all rounded cursor-pointer"
                            >
                                {tiers.map(t => (
                                    <option key={t.id} value={t.name} className="bg-zinc-900">{t.name} TIER</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-white/20">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="md:col-span-2 flex gap-4">
                            <button
                                onClick={handleExecuteDeployment}
                                className={`flex-1 ${editingId ? "bg-purple-600 hover:bg-purple-500" : "bg-cyan-500 hover:bg-cyan-400"} text-black font-black text-sm uppercase transition-all flex items-center justify-center gap-3 rounded py-4`}
                            >
                                {editingId ? "UPDATE_SPONSOR" : "INITIALIZE"} <Plus className={`w-5 h-5 ${editingId ? "rotate-45" : ""}`} />
                            </button>
                            {editingId && (
                                <button
                                    onClick={resetForm}
                                    className="px-8 bg-black/40 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all font-mono text-[10px] uppercase tracking-widest rounded"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {sponsors.map((s) => {
                        const currentTierName = s.tier;

                        const Config = TIER_VISUALS[currentTierName] || DEFAULT_TIER_STYLE;
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
                                    {/* Visual Logo/Icon Block */}
                                    <div className="relative w-16 h-16 bg-black/60 rounded flex items-center justify-center overflow-hidden border border-white/5 shrink-0">
                                        {s.logoUrl ? (
                                            <Image
                                                src={s.logoUrl}
                                                alt="Sponsor Logo"
                                                fill
                                                className="object-contain p-2"
                                                unoptimized
                                            />
                                        ) : (
                                            <Icon className={`w-6 h-6 ${Config.color} opacity-40`} />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-xl text-white font-black tracking-tight uppercase group-hover:text-cyan-400 transition-colors">
                                            {s.name}
                                        </h4>
                                        <p className={`text-xs font-mono ${Config.color} tracking-[0.2em] font-bold`}>
                                            {s.tier} TIER
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => startEdit(s)} className="p-3 text-white/30 hover:text-brand-vivid-green transition-colors opacity-100 bg-white/5 rounded"><Edit2 className="w-5 h-5" /></button>
                                    <button
                                        onClick={() => handleDeleteSponsor(s.id)}
                                        className="p-3 text-white/30 hover:text-red-500 transition-colors bg-white/5 rounded"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* SYSTEM COMPONENTS */}
            <SystemConfirm
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
            />
        </div>
    );
}

export default function SponsorManager() {
    return (
        <ToastProvider>
            <SponsorManagerContent />
        </ToastProvider>
    );
}

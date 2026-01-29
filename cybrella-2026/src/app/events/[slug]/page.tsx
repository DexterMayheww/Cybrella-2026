"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    MapPin,
    IndianRupee,
    Share2,
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    QrCode,
    Trophy
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { EventData } from "@/types/events";

export default function EventPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvent = async () => {
            if (!slug) return;
            try {
                // 1. Try finding by slug
                const q = query(
                    collection(db, "events"),
                    where("slug", "==", slug)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setEvent({ id: doc.id, ...doc.data() } as EventData);
                    return;
                }

                // 2. Fallback: Try finding by ID
                const docRef = doc(db, "events", slug as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() } as EventData);
                } else {
                    setError("EVENT_NOT_FOUND");
                }

            } catch (err) {
                console.error(err);
                setError("DATA_FETCH_FAILURE");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs tracking-[0.2em] animate-pulse">
                INITIALIZING_EVENT_PROTOCOL...
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h1 className="text-xl font-mono font-black tracking-widest text-red-500">
                    {error === "EVENT_NOT_FOUND" ? "404 // EVENT_TERMINATED" : "SYSTEM_FAILURE"}
                </h1>
                <button
                    onClick={() => router.back()}
                    className="mt-8 text-xs font-mono border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all"
                >
                    RETURN_TO_BASE
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
            {/* BACKGROUND_AMBIENCE */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[10s]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[7s]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 container mx-auto px-4 py-8 md:py-20 max-w-7xl"
            >
                {/* HEADS_UP_DISPLAY */}
                <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-xs font-mono text-white/50 hover:text-cyan-400 mb-12 transition-colors uppercase tracking-widest"
                >
                    <div className="p-2 border border-white/10 rounded group-hover:border-cyan-400/50 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span>Back_To_Sector</span>
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

                    {/* VISUAL_DATA_COLUMN */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative aspect-[3/4] w-full bg-white/5 rounded-lg overflow-hidden border border-white/10 group"
                        >
                            {event.posterUrl ? (
                                <Image
                                    src={event.posterUrl}
                                    alt={event.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    unoptimized
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center font-mono text-white/20 text-xs">NO_SIGNAL</div>
                            )}

                            {/* OVERLAY_GLITCH */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            {event.gallery?.slice(0, 4).map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="aspect-square bg-white/5 rounded border border-white/10 overflow-hidden relative"
                                >
                                    <Image src={img} alt="" fill className="object-cover hover:scale-110 transition-transform duration-500" unoptimized />
                                </motion.div>
                            ))}
                        </div>
                        {/* NEW_REGISTRATION_CTA_MODULE */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="relative group p-[1px] bg-gradient-to-b from-cyan-500/50 to-transparent rounded-lg"
                        >
                            <div className="bg-black/40 backdrop-blur-md p-6 rounded-lg border border-white/5 space-y-4">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <div>
                                        <p className="font-mono text-[10px] text-cyan-400 tracking-[0.2em] uppercase">Status</p>
                                        <p className="font-mono text-xs text-white">RECRUITMENT_OPEN</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-[10px] text-gray-500 tracking-[0.2em] uppercase">Capacity</p>
                                        <p className="font-mono text-xs text-white">LIMITED_SLOTS</p>
                                    </div>
                                </div>
                                
                                <Link
                                    href="/register"
                                    className="block w-full group/btn relative overflow-hidden bg-cyan-500 py-4 text-center"
                                >
                                    <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10 font-black font-mono text-xs tracking-[0.3em] text-black uppercase transition-colors duration-300">
                                        Initiate_Registration
                                    </span>
                                </Link>
                                
                                <p className="text-[9px] font-mono text-gray-600 text-center leading-tight uppercase">
                                    By clicking you agree to the terminal_user_agreement and mission_protocols.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* INFORMATION_DATA_COLUMN */}
                    <div className="lg:col-span-7 space-y-12">

                        {/* HEADER_MODULE */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center gap-4 text-cyan-400 font-mono text-xs tracking-widest uppercase"
                            >
                                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded">
                                    Sector: {event.category}
                                </span>
                                {event.price === 0 ? (
                                    <span className="text-green-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> FREE_ACCESS
                                    </span>
                                ) : (
                                    <span className="text-purple-400 flex items-center gap-1">
                                        <IndianRupee className="w-3 h-3" /> {event.price} ENTRY_FEE
                                    </span>
                                )}
                            </motion.div>

                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-black font-horizon uppercase tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500"
                            >
                                {event.title}
                            </motion.h1>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-400 text-lg leading-relaxed max-w-2xl border-l-2 border-white/10 pl-6"
                            >
                                {event.description}
                            </motion.p>
                        </div>

                        {/* DATA_POINTS_GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard icon={Calendar} label="DATE_LOG" value={event.date} delay={0.3} />
                            <InfoCard icon={IndianRupee} label="CREDITS_REQUIRED" value={event.price ? `₹${event.price}` : "FREE"} delay={0.4} />
                            {event.prizePool && (
                                <div className="md:col-span-2">
                                    <InfoCard icon={Trophy} label="EXPECTED_REWARDS" value={event.prizePool} delay={0.45} />
                                </div>
                            )}
                        </div>

                        {/* PROTOCOLS_MODULE (RULES) */}
                        {event.rules && event.rules.length > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-6 bg-white/5 p-8 rounded-lg border border-white/10"
                            >
                                <h3 className="font-mono text-xs text-red-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Mission_Protocols
                                </h3>
                                <ul className="space-y-3">
                                    {event.rules.map((rule, i) => (
                                        <li key={i} className="flex gap-4 text-sm text-gray-300 font-mono">
                                            <span className="text-white/20 select-none">{(i + 1).toString().padStart(2, '0')}</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* PRIZE_POOL_MEGA_DISPLAY */}
                        {event.prizePool && (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="relative group p-1 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 opacity-20 group-hover:opacity-40 transition-opacity blur-xl" />
                                <div className="relative bg-black rounded-xl p-8 md:p-12 overflow-hidden">
                                    {/* Abstract background graphics */}
                                    <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                                    <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl" />

                                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="p-4 bg-white/5 rounded-full border border-white/10 mb-2"
                                        >
                                            <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                                        </motion.div>

                                        <h3 className="font-mono text-xs text-fuchsia-400 tracking-[0.4em] uppercase">Prize_Pool_Authorized</h3>

                                        <div className="space-y-2">
                                            <h2 className="text-4xl md:text-6xl font-black font-horizon uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-cyan-200 drop-shadow-sm">
                                                {event.prizePool}
                                            </h2>
                                            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 via-white to-cyan-500 mx-auto rounded-full" />
                                        </div>

                                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-4">
                                            {"// Rewards_Calculation: Based_on_participation_thresholds //"}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function InfoCard({ icon: Icon, label, value, delay }: { icon: any, label: string, value: string, delay: number }) {
    return (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay }}
            className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded hover:bg-white/10 transition-colors"
        >
            <div className="p-3 bg-white/5 rounded text-cyan-400">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</p>
                <p className="text-white font-bold">{value}</p>
            </div>
        </motion.div>
    );
}

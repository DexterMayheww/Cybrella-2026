"use client";

import { useState, useEffect } from "react";
import {
    Search, CheckCircle, XCircle,
    Smartphone, Mail, Image as ImageIcon,
    Trash2, Download,
    Activity,
    Filter,
    Database,
    ExternalLink,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
    collection, onSnapshot, query, orderBy,
    doc, updateDoc, deleteDoc
} from "firebase/firestore";
import Image from "next/image";

import Portal from "../Portal";
import { deleteRegistrationAction, forceSyncAllToSheets, updateRegistrationStatusAction } from "@/app/actions";
import { useToast } from "./SystemToast";
import SystemConfirm from "./SystemConfirm";

interface Registration {
    id: string;
    name: string;
    email: string;
    phone: string;
    eventTitle: string;
    upiRef: string;
    paymentScreenshot: string;
    status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
    enlistedAt: any;
}

export default function RegistrationManager() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterEvent, setFilterEvent] = useState("ALL");
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isImgLoading, setIsImgLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        const q = query(collection(db, "master_registrations"), orderBy("enlistedAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setRegistrations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Registration)));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const availableEvents = Array.from(
        new Set(registrations.map((r) => r.eventTitle))
    ).filter(Boolean).sort();

    // State for Confirmations
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        onConfirm: () => void;
        title: string;
        message: string;
        type: "DANGER" | "WARNING";
    }>({
        isOpen: false,
        onConfirm: () => { },
        title: "",
        message: "",
        type: "WARNING"
    });

    // Update Functions
    const updateStatus = async (reg: Registration, newStatus: string) => {
        showToast(`SYNCING_STATUS: ${newStatus}...`, "SYSTEM");
        const res = await updateRegistrationStatusAction(reg.id, newStatus, reg.eventTitle);
        if (res.success) showToast("ENLISTMENT_STATUS_UPDATED", "SUCCESS");
        else showToast(res.error, "ERROR");
    };

    const deleteEntry = (reg: Registration) => {
        setConfirmModal({
            isOpen: true,
            title: "TERMINATE_RECORD",
            message: `You are about to permanently delete the registration for [${reg.name}]. This action will also affect Google Sheets.`,
            type: "DANGER",
            onConfirm: async () => {
                showToast("TERMINATING_RECORD...", "SYSTEM");
                const res = await deleteRegistrationAction(reg.id, reg.eventTitle);
                if (res.success) showToast("RECORD_DELETED", "SUCCESS");
            }
        });
    };

    const handleForceSync = () => {
        setConfirmModal({
            isOpen: true,
            title: "REBUILD_LEDGER",
            message: "This will overwrite all current Google Sheets data with Firestore data. Are you sure?",
            type: "WARNING",
            onConfirm: async () => {
                setIsSyncing(true);
                showToast("REBUILDING_LEDGER...", "SYSTEM");
                const res = await forceSyncAllToSheets();
                setIsSyncing(false);
                if (res.success) showToast(`${res.count}_RECORDS_SYNCED`, "SUCCESS");
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const filtered = registrations.filter(r => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = r.name?.toLowerCase().includes(searchLower) ||
            r.upiRef?.includes(searchTerm) ||
            r.email?.toLowerCase().includes(searchLower);

        const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
        const matchesEvent = filterEvent === "ALL" || r.eventTitle === filterEvent; // NEW FILTER LOGIC

        return matchesSearch && matchesStatus && matchesEvent;
    });


    if (loading) return <div className="p-20 text-center font-mono animate-pulse text-cyan-500">SYNCHRONIZING_ENLISTMENT_DATA...</div>;

    return (
        <div className="space-y-6">
            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 border border-white/10 rounded-sm backdrop-blur-md">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        className="w-full bg-black border border-white/10 p-4 pl-12 text-sm font-mono text-white outline-none focus:border-cyan-500 transition-all"
                        placeholder="SEARCH_BY_NAME_OR_UPI_HASH..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* NEW EVENT FILTER */}
                    <div className="relative group">
                        <select
                            className="bg-black border border-white/10 p-4 text-xs font-mono text-purple-400 outline-none appearance-none cursor-pointer px-10 min-w-[200px] hover:border-purple-500/50 transition-all"
                            value={filterEvent}
                            onChange={(e) => setFilterEvent(e.target.value)}
                        >
                            <option value="ALL">ALL_SECTORS</option>
                            {availableEvents.map(evt => (
                                <option key={evt} value={evt}>{evt.toUpperCase()}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-500 pointer-events-none" />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-500 pointer-events-none" />
                    </div>

                    {/* STATUS FILTER */}
                    <div className="relative group">
                        <select
                            className="bg-black border border-white/10 p-4 text-xs font-mono text-cyan-400 outline-none appearance-none cursor-pointer px-10 min-w-[200px] hover:border-cyan-500/50 transition-all"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">ALL_STATUSES</option>
                            <option value="PENDING_VERIFICATION">PENDING</option>
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="REJECTED">REJECTED</option>
                        </select>
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-500 pointer-events-none" />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-500 pointer-events-none" />
                    </div>

                    <a
                        href="https://docs.google.com/spreadsheets/d/10XZuRMXiUGeYNf8dCYh-xzYftqX47Xs4NGYaL_RIR6w"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-600/20 border border-green-500/50 px-6 py-2 text-xs font-mono text-green-400 hover:bg-green-600 hover:text-white transition-all rounded-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        OPEN_LIVE_LEDGER
                    </a>

                    <button
                        onClick={handleForceSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/50 px-6 py-2 text-xs font-mono text-purple-400 hover:bg-purple-600 hover:text-white transition-all rounded-sm disabled:opacity-50"
                    >
                        <Database className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? "REBUILDING_LEDGER..." : "FORCE_RESYNC_ALL"}
                    </button>
                    <SystemConfirm
                        {...confirmModal}
                        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    />
                </div>
            </div>

            {/* TRANSMISSION LOG TABLE */}
            <div className="border border-white/10 rounded-sm overflow-x-auto bg-black/40 backdrop-blur-xl">
                <table className="w-full text-left font-mono text-sm min-w-[900px]">
                    <thead className="bg-white/5 text-gray-400 uppercase tracking-widest border-b border-white/10">
                        <tr>
                            <th className="p-5 font-black">Operative_Identity</th>
                            <th className="p-5 font-black">Target_Sector</th>
                            <th className="p-5 font-black">UPI_Reference</th>
                            <th className="p-5 font-black">Evidence</th>
                            <th className="p-5 font-black">Status</th>
                            <th className="p-5 font-black text-right">Direct_Commands</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.map((reg) => (
                            <motion.tr
                                key={reg.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-white/5 transition-colors group"
                            >
                                <td className="p-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-white font-black text-lg tracking-tight">{reg.name}</span>
                                        <span className="text-gray-300 text-sm flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" /> {reg.email}
                                        </span>
                                        <span className="text-cyan-300/90 text-sm flex items-center gap-1.5">
                                            <Smartphone className="w-3.5 h-3.5" /> {reg.phone}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="px-3 py-1.5 border border-purple-500/30 text-purple-400 bg-purple-500/5 text-center rounded-sm font-black">
                                        {reg.eventTitle}
                                    </div>
                                </td>
                                <td className="p-5 text-gray-300 text-base font-black">
                                    {reg.upiRef || "NULL_HASH"}
                                </td>
                                <td className="p-5">
                                    <button
                                        onClick={() => setSelectedImg(reg.paymentScreenshot)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-cyan-500 hover:text-cyan-400 transition-all group/btn"
                                    >
                                        <ImageIcon className="w-4 h-4 group-hover/btn:animate-pulse" />
                                        <span>INSPECT</span>
                                    </button>
                                </td>
                                <td className="p-5">
                                    <StatusBadge status={reg.status} />
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => updateStatus(reg, "VERIFIED")}
                                            className="p-3 hover:bg-cyan-500 hover:text-black border border-white/10 transition-all rounded shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                            title="VERIFY_ENLISTMENT"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => updateStatus(reg, "REJECTED")}
                                            className="p-3 hover:bg-red-500 hover:text-white border border-white/10 transition-all rounded shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                            title="REJECT_SIGNAL"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteEntry(reg)}
                                            className="p-3 hover:bg-white hover:text-black border border-white/10 transition-all rounded"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-20 text-center font-mono text-gray-600 uppercase text-xs tracking-[0.3em]">
                        NO_RECORDS_MATCH_QUERY
                    </div>
                )}
            </div>

            {/* EVIDENCE INSPECTION MODAL */}
            {/* EVIDENCE INSPECTION PORTAL */}
            <Portal>
                <AnimatePresence>
                    {selectedImg && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 md:p-20"
                            onClick={() => {
                                setSelectedImg(null);
                                setIsImgLoading(true); // Reset loading state for next open
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative max-w-4xl w-full flex flex-col items-center gap-4"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="w-full flex justify-between items-center font-mono text-[10px] text-cyan-400">
                                    <span className="flex items-center gap-2">
                                        {isImgLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-cyan-500 animate-pulse rounded-full" />
                                                DECRYPTING_EVIDENCE_STREAM...
                                            </span>
                                        ) : (
                                            "[ INSPECTION_READY ]"
                                        )}
                                    </span>
                                    <button onClick={() => setSelectedImg(null)} className="hover:text-white transition-colors">CLOSE [X]</button>
                                </div>

                                <div className="relative border border-white/20 p-1 bg-white/5 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[300px] min-w-[300px] flex items-center justify-center">
                                    {/* THE LOADING OVERLAY */}
                                    {isImgLoading && (
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
                                            <div className="relative w-24 h-24">
                                                {/* Rotating Ring */}
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full"
                                                />
                                                {/* Scanning Line */}
                                                <motion.div
                                                    animate={{ y: [0, 90, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                    className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_15px_cyan] z-20"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[10px] font-mono text-cyan-400 animate-pulse">SCANNING</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Image
                                        src={selectedImg}
                                        onLoad={() => setIsImgLoading(false)}
                                        className={`w-7xl object-contain transition-all duration-700 ${isImgLoading ? "opacity-0 scale-95 blur-xl" : "opacity-100 scale-100 blur-0"
                                            }`}
                                        alt="Transaction Screenshot"
                                        width={2000}
                                        height={2000}
                                        unoptimized={process.env.NODE_ENV === 'development'}
                                    />
                                </div>

                                {!isImgLoading && (
                                    <motion.a
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        href={selectedImg}
                                        download
                                        target="_blank"
                                        className="px-6 py-2 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-400 transition-all"
                                    >
                                        DOWNLOAD_ASSET <Download className="w-3 h-3" />
                                    </motion.a>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Portal>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const safeStatus = status || "UNKNOWN";
    const config = {
        PENDING_VERIFICATION: "border-amber-500/50 text-amber-500 bg-amber-500/5",
        VERIFIED: "border-cyan-500/50 text-cyan-500 bg-cyan-500/5",
        REJECTED: "border-red-500/50 text-red-500 bg-red-500/5",
        UNKNOWN: "border-gray-500/50 text-gray-500 bg-gray-500/5"
    }[safeStatus] || "border-gray-500/50 text-gray-500 bg-gray-500/5";

    return (
        <span className={`px-3 py-1.5 border text-[11px] font-black tracking-[0.1em] uppercase rounded-sm inline-flex items-center gap-2 ${config}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${safeStatus === 'PENDING_VERIFICATION' ? 'animate-pulse' : ''}`} />
            {safeStatus.replace("_", " ")}
        </span>
    );
}
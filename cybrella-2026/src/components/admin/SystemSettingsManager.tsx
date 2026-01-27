// src/components/admin/SystemSettingsManager.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import {
    Settings,
    Video,
    UploadCloud,
    Trash2,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    MonitorPlay,
    Library
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/context/DataContext";

interface VideoUploaderProps {
    label: string;
    onUrl: (url: string) => void;
    preview: string;
    onDelete: () => void;
}

const VideoUploader = ({ label, onUrl, preview, onDelete }: VideoUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [library, setLibrary] = useState<string[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    const baseUrl = (process.env.NEXT_PUBLIC_FILE_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");

    const fetchLibrary = async () => {
        setIsLoadingLibrary(true);
        try {
            const res = await fetch(`${baseUrl}/files?folder=videos`);
            const data = await res.json();
            setLibrary(data.files || []);
        } catch (e) {
            console.error("Library fetch failed", e);
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    useEffect(() => {
        fetchLibrary();
    }, []);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith("video/")) {
            alert("Please upload a valid video file.");
            return;
        }
        if (file.size > 50 * 1024 * 1024) { // 50MB
            alert("File too large. Max 50MB.");
            return;
        }
        setSelectedFile(file);
        setLocalPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadProgress(10);

        try {
            const body = new FormData();
            body.append("photo", selectedFile);

            setUploadProgress(30);
            // Explicitly ensuring folder=videos is sent
            const res = await fetch(`${baseUrl}/upload?folder=videos`, {
                method: "POST",
                body: body
            });

            if (!res.ok) throw new Error("UPLOAD_FAILED");

            setUploadProgress(80);
            const data = await res.json();
            onUrl(data.url);

            // Success cleanup
            setSelectedFile(null);
            setLocalPreview(null);
            setUploadProgress(100);
            fetchLibrary(); // Refresh library

            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);
        } catch (e) {
            console.error(e);
            alert("UPLOAD_ERROR: CHECK_FILE_SERVER_STATUS");
            setIsUploading(false);
        }
    };

    const displayUrl = localPreview || preview;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-cyan-400 tracking-[0.3em] uppercase flex items-center gap-2">
                    <Video className="w-3 h-3" /> {label}
                </label>
                <div className="flex gap-4">
                    {preview && !selectedFile && (
                        <span className="text-[9px] font-mono text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> LIVE_ON_SERVER
                        </span>
                    )}
                    {selectedFile && (
                        <span className="text-[9px] font-mono text-amber-500 flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> PENDING_UPLOAD
                        </span>
                    )}
                </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="relative group h-[300px] w-full bg-black border border-white/10 rounded-lg overflow-hidden flex items-center justify-center transition-all shadow-inner">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                {displayUrl ? (
                    <div className="relative w-full h-full">
                        <video
                            key={displayUrl}
                            src={displayUrl}
                            className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-20' : 'opacity-80'}`}
                            muted
                            loop
                            autoPlay
                        />

                        {isUploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
                                <RefreshCw className="w-12 h-12 animate-spin text-cyan-500" />
                                <span className="text-[10px] font-mono text-cyan-400 tracking-widest">TRANSMITTING... {uploadProgress}%</span>
                                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
                                </div>
                            </div>
                        )}

                        {!isUploading && !selectedFile && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-[10px] uppercase tracking-widest rounded backdrop-blur-md"
                                >
                                    Change_Source
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex flex-col items-center gap-4 text-white/20 group-hover:text-cyan-400 transition-all"
                    >
                        <UploadCloud className="w-16 h-16 stroke-[1px]" />
                        <div className="text-center">
                            <span className="block text-[11px] font-mono uppercase tracking-[0.2em] mb-1">
                                Select_Cinema_Module
                            </span>
                            <span className="text-[9px] font-mono text-gray-600">MP4_WEBM_SUPPORTED // MAX_50MB</span>
                        </div>
                    </button>
                )}
            </div>

            {/* ACTION BUTTONS (Below Video) */}
            <div className="flex flex-wrap gap-4">
                {selectedFile ? (
                    <>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-cyan-500 text-black font-black text-[12px] uppercase tracking-widest hover:bg-cyan-400 transition-all rounded shadow-[0_0_20px_#22d3ee40]"
                        >
                            <UploadCloud className="w-4 h-4" /> Finalize_Upload_Sequence
                        </button>
                        <button
                            onClick={() => { setSelectedFile(null); setLocalPreview(null); }}
                            className="px-6 py-4 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded"
                        >
                            Abort
                        </button>
                    </>
                ) : displayUrl ? (
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded"
                    >
                        <Trash2 className="w-3 h-3" /> Reset_to_Default
                    </button>
                ) : null}
            </div>

            {/* VIDEO LIBRARY */}
            <div className="mt-12 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Library className="w-3 h-3" /> Previous_Deployments_Library
                    </h4>
                    <button onClick={fetchLibrary} className="text-gray-500 hover:text-cyan-400 transition-colors">
                        <RefreshCw className={`w-3 h-3 ${isLoadingLibrary ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {library.map((url, i) => (
                            <motion.div
                                key={url}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`group relative aspect-video bg-black border rounded cursor-pointer overflow-hidden transition-all
                                    ${preview === url ? 'border-cyan-500 shadow-[0_0_10px_#22d3ee20]' : 'border-white/5 hover:border-white/20'}
                                `}
                                onClick={() => onUrl(url)}
                            >
                                <video src={url} className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity" muted onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                                {preview === url && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle2 className="w-4 h-4 text-cyan-500 bg-black rounded-full shadow-lg" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40">
                                    <span className="text-[8px] font-mono text-white bg-black/80 px-2 py-1 rounded border border-white/10">SELECT_MODULE</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {!isLoadingLibrary && library.length === 0 && (
                        <div className="col-span-full py-10 border border-dashed border-white/5 rounded text-center text-[10px] font-mono text-gray-700 uppercase tracking-widest">
                            No_Library_Modules_Found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function SystemSettingsManager() {
    const { heroVideoUrl, setHeroVideoUrl } = useData();

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            <section className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl">
                <header className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            <Settings className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black font-horizon tracking-widest uppercase">Hero_Visual_Config</h3>
                            <span className="text-[9px] font-mono text-gray-500 uppercase">Core_Identity_Settings</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-mono text-green-500 uppercase tracking-tighter">System_Sync_Active</span>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    <div className="p-6 border border-white/10 bg-black/40 rounded-lg space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 mt-1 shrink-0">
                                <AlertCircle className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[12px] font-bold text-white uppercase tracking-tight mb-1">Structural_Integrity_Notice</h4>
                                <p className="text-[11px] font-mono text-gray-500 leading-relaxed max-w-2xl">
                                    The background video is the primary visual anchor for the <span className="text-cyan-500">CYBRELLA</span> interface.
                                    Ensure uploads are high-bitrate for desktop clarity while maintaining web-optimized file sizes.
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-white/10 w-full" />

                        <VideoUploader
                            label="HERO_BACKGROUND_MODULE"
                            preview={heroVideoUrl}
                            onUrl={(url) => setHeroVideoUrl(url)}
                            onDelete={() => setHeroVideoUrl("/Ananta 1St Half.mp4")}
                        />
                    </div>
                </div>

                <footer className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-gray-600 uppercase tracking-[0.2em]">
                    <span>Secure_Hash: OS_INIT_v3.0.26_SYNC_OK</span>
                    <span>Last_Sync: {new Date().toLocaleTimeString()}</span>
                </footer>
            </section>
        </div>
    );
}

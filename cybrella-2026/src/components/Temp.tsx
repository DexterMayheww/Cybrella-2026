// src/app/register/page.tsx
"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, MapPin, Phone, Mail, Globe, ShieldCheck,
    Cpu, Gamepad2, Palette, Upload, ChevronRight, Activity, Terminal
} from "lucide-react";
import Image from "next/image";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/mouse-effects/CustomCursor";
import CursorHighlight from "@/components/mouse-effects/CursorHighlight";
import GlitchHeading from "@/components/GlitchingHeading";

// --- Types & Constants ---
type EventCategory = "TECHNICAL" | "NON_TECHNICAL" | "GAMING";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const EVENTS = {
    TECHNICAL: [
        { id: "cc", label: "Competitive Coding", price: 200 },
        { id: "cd", label: "Code Debugging", price: 150 },
        { id: "gj", label: "Game Jam", price: 300 },
        { id: "ctf_w", label: "CTF: Web Capture", price: 250 },
        { id: "ctf_g", label: "CTF: Game Capture", price: 250 },
        { id: "rr", label: "Robo Race", price: 500 },
        { id: "tm", label: "Typing Master", price: 100 },
    ],
    NON_TECHNICAL: [
        { id: "p1", label: "Painting: Classes 5-10", price: 100 },
        { id: "p2", label: "Painting: Classes 11+", price: 150 },
        { id: "cs", label: "Cosplay", price: 200 },
        { id: "sf", label: "Short Film", price: 300 },
    ],
    GAMING: [
        { id: "bgmi", label: "BGMI", price: 400 },
        { id: "ml", label: "MOBA Legends", price: 400 },
        { id: "tk8", label: "Tekken 8", price: 200 },
        { id: "fc26", label: "FC 2026", price: 200 },
    ]
};

// --- Styled Components ---
const InputField = ({ label, icon: Icon, ...props }: any) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2">
            <Icon className="w-3 h-3" /> {label}
        </label>
        <input
            {...props}
            className="w-full bg-black/40 border border-white/10 p-4 text-white font-mono focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 outline-none transition-all rounded-sm placeholder:text-white/30"
        />
    </div>
);

const RadioCard = ({ id, label, selected, onChange, name }: any) => (
    <label className={`
    relative flex items-center justify-between p-4 border cursor-pointer transition-all duration-300
    ${selected === id
            ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            : "bg-white/5 border-white/10 hover:border-white/30"}
  `}>
        <input
            type="radio"
            name={name}
            value={id}
            className="hidden"
            onChange={() => onChange(id)}
        />
        <span className={`text-sm font-bold tracking-tight uppercase ${selected === id ? "text-cyan-400" : "text-white/60"}`}>
            {label}
        </span>
        {selected === id && <motion.div layoutId="radio-check" className="w-2 h-2 bg-cyan-400 rounded-full" />}
    </label>
);

export default function RegistrationPage() {
    const [formData, setFormData] = useState({
        name: "", address: "", phone: "", email: "", state: "Manipur",
        event: "", category: "TECHNICAL" as EventCategory
    });
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setScreenshot(url);
        }
    };

    // Helper to get selected event details
    const selectedEvent = EVENTS[formData.category].find(e => e.id === formData.event);
    const currentPrice = selectedEvent ? selectedEvent.price : 0;

    return (
        <div className="bg-brand-dark-olive min-h-screen text-white selection:bg-cyan-500/30">
            <CustomCursor />
            <CursorHighlight />
            <Navbar />

            <main className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <header className="mb-16 border-l-4 border-cyan-500 pl-8">
                        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-4">
                            <Terminal className="w-4 h-4 animate-pulse" />
                            <span>SYSTEM_GATEWAY // UPLINK_ESTABLISHED</span>
                        </div>
                        <GlitchHeading
                            text="ENLISTMENT_PORTAL"
                            className="text-6xl md:text-7xl font-horizon font-black tracking-tighter"
                        />
                        <p className="text-white/50 font-mono mt-4 max-w-xl text-sm leading-relaxed">
                            Complete the verification process to secure your sector deployment.
                            All transmission data is encrypted under NIELIT security protocols.
                        </p>
                    </header>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Left: Enlistment Form */}
                        <div className="lg:col-span-8 space-y-12">

                            {/* Personal Data */}
                            <section className="bg-black/20 backdrop-blur-xl border border-white/5 p-8 rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-8xl">01</div>
                                <h3 className="text-sm font-mono text-cyan-400 mb-8 flex items-center gap-2">
                                    <User className="w-4 h-4" /> [SECTION_01] // IDENTITY_VERIFICATION
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <InputField
                                        label="OPERATIVE_NAME"
                                        icon={User}
                                        placeholder="Full Legal Name"
                                        onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <InputField
                                        label="COMMS_UPLINK (EMAIL)"
                                        icon={Mail}
                                        type="email"
                                        placeholder="agent@domain.com"
                                        onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <InputField
                                        label="SIGNAL_REACH (PHONE)"
                                        icon={Phone}
                                        placeholder="+91 XXXX-XXXXXX"
                                        onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2">
                                            <Globe className="w-3 h-3" /> SECTOR (STATE)
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={formData.state}
                                                className="w-full bg-black/40 border border-white/10 p-4 text-white font-mono text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 outline-none rounded-sm appearance-none cursor-pointer transition-all hover:bg-white/5"
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            >
                                                {INDIAN_STATES.map(s => (
                                                    <option key={s} value={s} className="bg-zinc-900 text-white">
                                                        {s.toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                            {/* Custom Dropdown Arrow */}
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400/50 group-hover:text-cyan-400 transition-colors">
                                                <ChevronRight className="w-4 h-4 rotate-90" />
                                            </div>
                                        </div>
                                        {/* Decorative corner element */}
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-cyan-500/50" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputField
                                            label="GEOSPATIAL_COORDINATES (ADDRESS)"
                                            icon={MapPin}
                                            placeholder="Street, City, Pin Code"
                                            onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                                        />

                                    </div>
                                </div>
                            </section>

                            {/* Sector Classification (Events) */}
                            <section className="bg-black/20 backdrop-blur-xl border border-white/5 p-8 rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-8xl">02</div>
                                <h3 className="text-sm font-mono text-cyan-400 mb-8 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> [SECTION_02] // SECTOR_CLASSIFICATION
                                </h3>

                                <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-sm border border-white/10 w-fit">
                                    {(["TECHNICAL", "NON_TECHNICAL", "GAMING"] as EventCategory[]).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFormData({ ...formData, category: cat, event: "" })}
                                            className={`px-4 py-2 text-[12px] font-black tracking-widest transition-all ${formData.category === cat ? "bg-cyan-500 text-black" : "text-white/40 hover:text-white"}`}
                                        >
                                            {cat.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {EVENTS[formData.category].map(evt => (
                                        <RadioCard
                                            key={evt.id}
                                            id={evt.id}
                                            label={evt.label}
                                            name="event-selection"
                                            selected={formData.event}
                                            onChange={(id: string) => setFormData({ ...formData, event: id })}
                                        />
                                    ))}
                                </div>
                                {/* Decorative corner element */}
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-cyan-500/50" />
                            </section>
                        </div>

                        {/* Right: Payment & Status */}
                        <aside className="lg:col-span-4 space-y-6">
                            <div className="sticky top-32 space-y-6">

                                {/* Payment Proof Upload */}
                                <div className="bg-black/20 border border-white/5 p-6 rounded-sm">
                                    <h3 className="text-[10px] font-mono text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4" /> Transaction_Hash
                                    </h3>

                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="screenshot"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="screenshot"
                                            className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-sm p-8 cursor-pointer hover:border-cyan-500/50 transition-colors bg-white/5"
                                        >
                                            {screenshot ? (
                                                <div className="relative w-full aspect-video">
                                                    <Image src={screenshot} alt="Proof" className="w-full h-full object-cover rounded opacity-50" width={100} height={100} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[10px] font-mono bg-black/80 px-2 py-1 border border-cyan-500">REPLACE_ASSET</span>
                                                    </div>
                                                    {/* Scanline animation for the image */}
                                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                        <motion.div
                                                            animate={{ y: ["-100%", "100%"] }}
                                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                            className="w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_cyan] opacity-50"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-white/20 mb-2 group-hover:text-cyan-400 transition-colors" />
                                                    <span className="text-[10px] font-mono text-white/40 group-hover:text-white">UPLOAD_PAYMENT_SCREENSHOT</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-4 leading-relaxed">
                                        ACCEPTED_FORMATS: PNG, JPG, WEBP // MAX_SIZE: 5MB
                                    </p>
                                </div>

                                {/* Final Action */}
                                <div className="p-6 border-t-4 border-cyan-500 bg-black/40">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <span className="text-[10px] font-mono text-white/30 block mb-1">TOTAL_FEES</span>
                                            <span className="text-3xl font-black text-white">
                                                ₹{currentPrice.toLocaleString('en-IN')}.00
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-green-500">
                                            {formData.event ? "READY_FOR_UPLINK" : "AWAITING_SELECTION"}
                                        </span>
                                    </div>

                                    <button
                                        disabled={isSubmitting || !formData.event}
                                        className={`
            w-full py-5 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
            ${formData.event
                                                ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                                                : "bg-white/5 text-white/20 cursor-not-allowed"}
        `}
                                    >
                                        EXECUTE_ENLISTMENT <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <p className="text-[9px] text-white/40 mt-4 text-center italic">
                                        * By clicking you agree to system protocols and ethical guidelines.
                                    </p>
                                </div>

                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
// src/app/register/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, MapPin, Phone, Mail, Globe, ShieldCheck,
    Upload, ChevronRight, Activity, Terminal,
    LinkIcon,
    QrCode,
    AlertTriangle,
    CheckCircle2,
    X
} from "lucide-react";
import Image from "next/image";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Ensure storage is exported from your config

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/mouse-effects/CustomCursor";
import CursorHighlight from "@/components/mouse-effects/CursorHighlight";
import GlitchHeading from "@/components/GlitchingHeading";
import { syncNewRegistration } from "../actions";

// --- Types & Constants ---
// --- Types & Constants ---
interface Category {
    id: string;
    name: string;
    order: number;
}

import { EventData } from "@/types/events";
import { QueryDocumentSnapshot, SnapshotOptions, DocumentData } from "firebase/firestore";

const responsiveStyles = (
    <style jsx global>{`
        @media (max-width: 1024px) {
            /* 1. Reset high top padding for mobile headers */
            main.relative.z-10 {
                padding-top: 6rem !important;
                padding-bottom: 4rem !important;
            }

            /* 2. Scale down the massive 'Enlistment Portal' text for small screens */
            .font-horizon.text-6xl {
                font-size: 2.5rem !important;
                line-height: 1 !important;
            }

            /* 3. Adjust the 'Aside' (Payment) section so it doesn't float over content */
            aside .sticky {
                position: relative !important;
                top: 0 !important;
                margin-top: 2rem;
            }

            /* 4. Shrink the massive decorative numbers (01, 1.5, 02) to prevent overlap */
            .opacity-5.text-8xl {
                font-size: 4rem !important;
                top: -10px !important;
                right: 10px !important;
            }

            /* 5. Optimize the payment method buttons for touch targets */
            .h-14 {
                height: auto !important;
                flex-direction: column;
            }
            .h-14 button {
                width: 100% !important;
                padding: 1rem 0 !important;
                flex: none !important;
            }
        }

        @media (max-width: 640px) {
            /* 6. Fix horizontal padding on ultra-small devices */
            main {
                padding-left: 1.25rem !important;
                padding-right: 1.25rem !important;
            }

            /* 7. Stack the academic level buttons for better tap accuracy */
            .flex.gap-2.p-1.bg-white\/5 {
                flex-direction: column;
            }

            /* 8. Ensure the Confirmation Modal fits within small screens */
            .max-w-md.w-full.bg-zinc-900 {
                margin: 1rem;
                padding: 1.5rem !important;
            }
        }
    `}</style>
);

const eventConverter = {
    toFirestore(event: EventData): DocumentData {
        const { id, ...data } = event;
        return data;
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): EventData {
        const data = snapshot.data(options)!;
        return {
            id: snapshot.id,
            title: data.title,
            slug: data.slug || "",
            category: data.category,
            date: data.date,
            posterUrl: data.posterUrl,
            description: data.description || "",
            rules: data.rules || [],
            gallery: data.gallery || [],
            price: data.price,
            upiLink: data.upiLink,
            qrCodeUrl: data.qrCodeUrl,
            order: data.order ?? 0 // Consistent defaulting with Admin
        };
    },
};

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// --- Styled Components ---
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.ElementType;
}

const InputField = ({ label, icon: Icon, ...props }: InputFieldProps) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2">
            <Icon className="w-3 h-3" />
            {label} <span className="text-red-500 text-xs">*</span>
        </label>
        <input
            {...props}
            className="w-full bg-black/40 border border-white/10 p-4 text-white font-mono focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 outline-none transition-all rounded-sm placeholder:text-white/30"
        />
    </div>
);

interface RadioCardProps {
    id: string;
    label: string;
    selected: string;
    onChange: (id: string) => void;
    name: string;
}

const RadioCard = ({ id, label, selected, onChange, name }: RadioCardProps) => {
    const isChecked = selected === id;

    return (
        <label className={`
            relative flex items-center justify-between p-4 border cursor-pointer transition-all duration-300
            ${isChecked
                ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "bg-white/5 border-white/10 hover:border-white/30"}
        `}>
            <input
                type="radio"
                name={name}
                value={id}
                checked={isChecked}
                className="hidden"
                onChange={() => onChange(id)}
            />
            <span className={`text-sm font-bold tracking-tight uppercase ${isChecked ? "text-cyan-400" : "text-white/60"}`}>
                {label}
            </span>
            {isChecked && (
                <motion.div
                    layoutId="radio-check"
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                />
            )}
        </label>
    );
};

export default function RegistrationPage() {
    // 1. ALL STATE AT THE TOP
    const [formData, setFormData] = useState({
        name: "", address: "", phone: "", email: "", state: "Manipur",
        event: "", category: "", upiRef: "",
        age: "", grade: "", schoolName: "", className: "", collegeName: "", semester: "", course: "", pastCourse: ""
    });

    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [idCardPreview, setIdCardPreview] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [dbEvents, setDbEvents] = useState<EventData[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<"LINK" | "QR">("LINK");
    const [notification, setNotification] = useState<{ message: string; type: "ERROR" | "SUCCESS" } | null>(null);

    // 2. FETCH DATA EFFECT
    useEffect(() => {
        // Fetch Categories with strict ordering
        const unsubC = onSnapshot(collection(db, "categories"), (s) => {
            const cats = s.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    name: data.name,
                    order: typeof data.order === 'number' ? data.order : 999
                };
            }) as Category[];

            // Sort by order ASC
            cats.sort((a, b) => a.order - b.order);
            setCategories(cats);

            if (cats.length > 0) {
                setFormData(f => ({ ...f, category: f.category || cats[0].name }));
            }
        });

        // Fetch Events using the Converter to ensure parity with Admin
        const unsubE = onSnapshot(
            collection(db, "events").withConverter(eventConverter),
            (s) => {
                const events = s.docs.map(d => d.data());
                // Strictly sort by the converted order field
                events.sort((a, b) => a.order - b.order);
                setDbEvents(events);
                setLoading(false);
            }
        );

        return () => { unsubC(); unsubE(); };
    }, []);

    // 3. COMPUTED VALUES
    const filteredEvents = dbEvents.filter(e =>
        e.category.toUpperCase().trim() === formData.category.toUpperCase().trim()
    );
    const selectedEvent = dbEvents.find(e => e.id === formData.event);
    const currentPrice = selectedEvent?.price || 0;

    const isFormValid =
        formData.name.trim().length >= 3 &&
        formData.address.trim().length >= 5 &&
        /^\S+@\S+\.\S+$/.test(formData.email) &&
        formData.phone.length === 10 &&
        formData.event !== "" &&
        formData.upiRef.length === 12 &&
        screenshot !== null &&
        // NEW REQUIRED FIELDS
        formData.age !== "" &&
        parseInt(formData.age) >= 10 &&
        parseInt(formData.age) <= 100 &&
        formData.grade !== "" &&
        idCardFile !== null;

    // 4. HANDLERS
    const showNotify = (message: string, type: "ERROR" | "SUCCESS" = "ERROR") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setScreenshot(URL.createObjectURL(file));
        }
    };

    const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIdCardFile(file);
            setIdCardPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!formData.name) return showNotify("ENLISTMENT_DENIED: NAME_REQUIRED", "ERROR");
        if (formData.name.length < 3) return showNotify("ENILISTMENT_DENIED: NAME TOO SHORT", "ERROR");
        if (formData.address.length < 5) return showNotify("GEOSPATIAL_ERROR: ADDRESS TOO SHORT", "ERROR");
        if (!emailRegex.test(formData.email)) return showNotify("SIGNAL_ERROR: INVALID_EMAIL_FORMAT", "ERROR");
        if (formData.phone.length !== 10) return showNotify("SIGNAL_ERROR: PHONE_MUST_BE_10_DIGITS", "ERROR");
        if (formData.upiRef.length !== 12) return showNotify("HASH_ERROR: UPI_REF_MUST_BE_12_DIGITS", "ERROR");
        if (!formData.event) return showNotify("SECTOR_ERROR: NO_EVENT_SELECTED", "ERROR");
        if (!screenshot) return showNotify("TRANSMISSION_ERROR: MISSING_PAYMENT_PROOF", "ERROR");

        // NEW REQUIRED FIELD VALIDATIONS
        if (!formData.age) return showNotify("CHRONO_ERROR: AGE_VERIFICATION_REQUIRED", "ERROR");
        const age = parseInt(formData.age);
        if (age < 10 || age > 100) return showNotify("CHRONO_ERROR: AGE_OUT_OF_VALID_RANGE", "ERROR");
        if (!formData.grade) return showNotify("LEVEL_ERROR: ACADEMIC_CLASSIFICATION_REQUIRED", "ERROR");
        if (!idCardFile) return showNotify("AUTHENTICATION_ERROR: IDENTIFICATION_ASSET_REQUIRED", "ERROR");

        setShowConfirmModal(true);
    };

    const processTransmission = async () => {
        if (!isFormValid || !imageFile) {
            showNotify("TERMINAL_ERROR: MISSING_CRITICAL_CREDENTIALS", "ERROR");
            return;
        }

        setShowConfirmModal(false);
        setIsSubmitting(true);

        try {
            const body = new FormData();
            body.append("photo", imageFile);
            const baseUrl = process.env.NEXT_PUBLIC_FILE_SERVER_URL?.replace(/\/$/, "");
            const uploadRes = await fetch(`${baseUrl}/upload?folder=payment_proofs`, {
                method: "POST",
                body: body
            });

            if (!uploadRes.ok) throw new Error("FILE_SERVER_REJECTED_UPLOAD");
            const uploadData = await uploadRes.json();
            const screenshotUrl = uploadData.url;

            let idCardUrl = "";
            if (idCardFile) {
                const idBody = new FormData();
                idBody.append("photo", idCardFile);
                const idUploadRes = await fetch(`${baseUrl}/upload?folder=identification`, {
                    method: "POST",
                    body: idBody
                });
                if (idUploadRes.ok) {
                    const idData = await idUploadRes.json();
                    idCardUrl = idData.url;
                }
            }

            const transmissionPayload = {
                ...formData,
                phone: `+91${formData.phone}`,
                paymentScreenshot: screenshotUrl,
                idCardUrl: idCardUrl,
                eventTitle: selectedEvent?.title || "UNKNOWN_EVENT",
            };

            const res = await syncNewRegistration(transmissionPayload);
            if (res.success) {
                showNotify("ENLISTMENT_TRANSMITTED_SUCCESSFULLY", "SUCCESS");
                setFormData({
                    name: "", address: "", phone: "", email: "",
                    state: "Manipur", event: "", category: categories[0]?.name || "", upiRef: "",
                    age: "", grade: "", schoolName: "", className: "", collegeName: "", semester: "", course: "", pastCourse: ""
                });
                setScreenshot(null);
                setImageFile(null);
                setIdCardPreview(null);
                setIdCardFile(null);
            } else {
                throw new Error(res.error);
            }
        } catch (error: unknown) {
            const err = error as Error;
            console.error("Transmission Error:", err);
            showNotify(`UPLINK_FAILURE: ${err.message.toUpperCase()}`, "ERROR");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-cyan-500">UPLINKING_REGISTRATION_SERVER...</div>;

    return (
        <div className="bg-brand-dark-olive min-h-screen text-white selection:bg-cyan-500/30">
            {responsiveStyles}
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
                            text="ENLISTMENT PORTAL"
                            className="text-3xl md:text-7xl flex flex-wrap font-horizon font-black tracking-tighter"
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
                            <section className="bg-black/20 border border-white/5 p-8 rounded-sm relative overflow-hidden">
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
                                        type="email" // Built-in email validation
                                        placeholder="agent@domain.com"
                                        required
                                        value={formData.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
                                    />
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2">
                                            <Phone className="w-3 h-3" /> SIGNAL_REACH (PHONE) <span className="text-red-500 text-xs">*</span>
                                        </label>

                                        <div className="flex items-center bg-black/40 border border-white/10 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/30 transition-all rounded-sm overflow-hidden">
                                            {/* Fixed Prefix */}
                                            <div className="px-4 py-4 border-r border-white/10 bg-white/5 text-cyan-400 font-mono text-sm select-none">
                                                +91
                                            </div>

                                            {/* Actual Input */}
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                placeholder="XXXXXXXXXX"
                                                value={formData.phone}
                                                className="w-full bg-transparent p-4 text-white font-mono outline-none placeholder:text-white/20"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    let val = e.target.value.replace(/\D/g, ''); // Strip non-digits

                                                    // Logic: If user pastes a number starting with 91, and it's 12 digits total, strip the 91
                                                    if (val.startsWith('91') && val.length > 10) {
                                                        val = val.substring(2);
                                                    }

                                                    // Limit to 10 digits
                                                    if (val.length <= 10) {
                                                        setFormData({ ...formData, phone: val });
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2">
                                            <Globe className="w-3 h-3" /> SECTOR (STATE) <span className="text-red-500 text-xs">*</span>
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
                                    </div>
                                    <InputField
                                        label="GEOSPATIAL_COORDINATES (ADDRESS)"
                                        icon={MapPin}
                                        placeholder="Street, City, Pin Code"
                                        onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-cyan-500/50" />
                            </section>

                            {/* Academic & Identity Credentials */}
                            <section className="bg-black/20 border border-white/5 p-8 rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-8xl">1.5</div>
                                <h3 className="text-sm font-mono text-cyan-400 mb-8 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> [SECTION_1.5] // ACADEMIC_CREDENTIALS
                                </h3>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2">
                                            <Activity className="w-3 h-3" /> CHRONO_AGE (AGE) <span className="text-red-500 text-xs">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Years"
                                            value={formData.age}
                                            aria-required="true"
                                            min="10"
                                            max="100"
                                            className="w-full bg-black/40 border border-white/10 p-4 text-white font-mono focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 outline-none transition-all rounded-sm placeholder:text-white/30"
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2">
                                            <Terminal className="w-3 h-3" /> ACADEMIC_LEVEL <span className="text-red-500 text-xs">*</span>
                                        </label>
                                        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-sm" role="radiogroup" aria-required="true">
                                            {["SCHOOL", "COLLEGE", "GRADUATE"].map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={formData.grade === level}
                                                    onClick={() => setFormData(prev => ({ ...prev, grade: level }))}
                                                    className={`flex-1 py-3 text-[10px] font-black tracking-widest transition-all ${formData.grade === level ? "bg-cyan-500 text-black" : "text-white/40 hover:text-white"}`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {formData.grade === "SCHOOL" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid md:grid-cols-2 gap-6 mb-8"
                                        >
                                            <InputField
                                                label="CLASS / GRADE"
                                                icon={Terminal}
                                                placeholder="e.g. 10th Standard"
                                                value={formData.className}
                                                onChange={(e: any) => setFormData({ ...formData, className: e.target.value })}
                                            />
                                            <InputField
                                                label="INSTITUTION (SCHOOL)"
                                                icon={Globe}
                                                placeholder="School Name"
                                                value={formData.schoolName}
                                                onChange={(e: any) => setFormData({ ...formData, schoolName: e.target.value })}
                                            />
                                        </motion.div>
                                    )}

                                    {formData.grade === "COLLEGE" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-6 mb-8"
                                        >
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <InputField
                                                    label="SEMESTER / YEAR"
                                                    icon={Terminal}
                                                    placeholder="e.g. 4th Sem"
                                                    value={formData.semester}
                                                    onChange={(e: any) => setFormData({ ...formData, semester: e.target.value })}
                                                />
                                                <InputField
                                                    label="CURRENT_COURSE"
                                                    icon={Activity}
                                                    placeholder="e.g. B.Tech CSE"
                                                    value={formData.course}
                                                    onChange={(e: any) => setFormData({ ...formData, course: e.target.value })}
                                                />
                                            </div>
                                            <InputField
                                                label="INSTITUTION (COLLEGE)"
                                                icon={Globe}
                                                placeholder="College Name"
                                                value={formData.collegeName}
                                                onChange={(e: any) => setFormData({ ...formData, collegeName: e.target.value })}
                                            />
                                        </motion.div>
                                    )}

                                    {formData.grade === "GRADUATE" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-8"
                                        >
                                            <InputField
                                                label="HISTORICAL_COURSE (PAST COURSE)"
                                                icon={Activity}
                                                placeholder="What course did you take?"
                                                value={formData.pastCourse}
                                                onChange={(e: any) => setFormData({ ...formData, pastCourse: e.target.value })}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2 uppercase">
                                        <Upload className="w-3 h-3" /> IDENTIFICATION_ASSET (AADHAR CARD) <span className="text-red-500 text-xs">*</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="id-card"
                                            className="hidden"
                                            accept="image/*"
                                            aria-required="true"
                                            onChange={handleIdCardChange}
                                        />
                                        <label
                                            htmlFor="id-card"
                                            className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-sm p-12 cursor-pointer hover:border-cyan-500/50 transition-all bg-white/5"
                                        >
                                            {idCardPreview ? (
                                                <div className="relative w-full max-w-sm aspect-[1.6/1]">
                                                    <Image
                                                        src={idCardPreview}
                                                        alt="ID Card"
                                                        className="w-full h-full object-cover rounded opacity-80"
                                                        width={400}
                                                        height={250}
                                                        unoptimized={process.env.NODE_ENV === 'development'}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[10px] font-mono bg-black/90 px-3 py-1.5 border border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                                            SWAP_IDENTIFICATION
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-12 h-12 text-white/10 mx-auto mb-4 group-hover:text-cyan-400 transition-colors" />
                                                    <span className="text-[10px] font-mono text-white/40 block">UPLOAD_IDENTITY_DOCUMENT</span>
                                                    <span className="text-[9px] font-mono text-white/20 mt-2 block uppercase tracking-tighter">Required // PNG, JPG preferred</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Sector Classification (Events) */}
                            <section className="bg-black/20 border border-white/5 p-8 rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-8xl">02</div>
                                <h3 className="text-sm font-mono text-cyan-400 mb-8 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> [SECTION_02] // SECTOR_CLASSIFICATION <span className="text-red-500 text-xs">*</span>
                                </h3>
                                <div className="flex flex-wrap gap-4 mb-8 p-1 bg-white/5 rounded-sm border border-white/10 w-fit">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            // Use functional update to prevent stale state
                                            onClick={() => setFormData(prev => ({ ...prev, category: cat.name, event: "" }))}
                                            className={`px-4 py-2 text-[12px] font-black tracking-widest transition-all ${formData.category === cat.name ? "bg-cyan-500 text-black" : "text-white/40 hover:text-white"}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {filteredEvents.map(evt => (
                                        <RadioCard
                                            key={evt.id}
                                            id={evt.id}
                                            label={evt.title}
                                            name="event-selector"
                                            selected={formData.event}
                                            // Use functional update here too
                                            onChange={(id: string) => setFormData(prev => ({ ...prev, event: id }))}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right: Payment & Status */}
                        <aside className="lg:col-span-4 space-y-6">
                            <div className="sticky top-32 space-y-6">

                                {/* 1. PAYMENT PROOF SECTION (TRX HASH) */}
                                <div className="bg-black/20 border border-white/5 p-6 rounded-sm backdrop-blur-md">
                                    <h3 className="text-[10px] font-mono text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4" /> Transaction_Hash <span className="text-red-500 text-xs">*</span>
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
                                            className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-sm p-8 cursor-pointer hover:border-cyan-500/50 transition-all bg-white/5"
                                        >
                                            {screenshot ? (
                                                <div className="relative w-full aspect-video">
                                                    <Image
                                                        src={screenshot}
                                                        alt="Proof"
                                                        className="w-full h-full object-cover rounded opacity-60"
                                                        width={400}
                                                        height={225}
                                                        unoptimized={process.env.NODE_ENV === 'development'}

                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[10px] font-mono bg-black/90 px-3 py-1.5 border border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                                            REPLACE_ASSET
                                                        </span>
                                                    </div>
                                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                        <motion.div
                                                            animate={{ y: ["-100%", "100%"] }}
                                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                            className="w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_cyan] opacity-30"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-white/20 mb-2 group-hover:text-cyan-400 transition-colors" />
                                                    <span className="text-[10px] font-mono text-white/40 group-hover:text-white uppercase tracking-tighter text-center">
                                                        Upload_Payment_Screenshot
                                                    </span>
                                                </>
                                            )}
                                        </label>
                                        {/* NEW: UPI Reference Number Input */}
                                        <div className="bg-black/20 border border-white/5 p-6 rounded-sm backdrop-blur-md mb-4">
                                            <label className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] flex items-center gap-2 mb-3 uppercase">
                                                <ShieldCheck className="w-3 h-3" /> UPI_REFERENCE_NUMBER <span className="text-red-500 text-xs">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="12-Digit Ref No. (e.g. 4023...)"
                                                value={formData.upiRef}
                                                className="w-full bg-black/40 border border-white/10 p-3 text-white font-mono focus:border-cyan-400 outline-none transition-all rounded-sm text-xs placeholder:text-white/20"
                                                // Only allow numbers, max 12 digits
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 12) setFormData({ ...formData, upiRef: val });
                                                }}
                                            />
                                            <p className="text-[11px] text-white/40 mt-2 font-mono">
                                                * MANDATORY: Paste the 12-digit number from your payment app.
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-white/30 mt-4 leading-relaxed font-mono uppercase tracking-tighter">
                                        ACCEPTED_FORMATS: PNG, JPG, WEBP // MAX_SIZE: 5MB
                                    </p>
                                </div>

                                {/* 2. TOTAL FEES & KINETIC PAYMENT SELECTION */}
                                <div className="border-t-4 border-cyan-500 bg-black/40 rounded-b-sm overflow-hidden">
                                    <div className="p-6 space-y-6">
                                        {/* Header: Amount & Status */}
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-[10px] font-mono text-white/30 block mb-1 tracking-widest">TOTAL_FEES</span>
                                                <span className="text-5xl font-black text-white tracking-tighter">
                                                    ₹{currentPrice.toLocaleString('en-IN')}.00
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-mono font-bold tracking-tighter px-2 py-0.5 rounded-sm ${formData.event ? "text-green-500 bg-green-500/10 border border-green-500/20" : "text-white/20"}`}>
                                                    {formData.event ? "READY_FOR_UPLINK" : "AWAITING_SELECTION"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Kinetic 70/30 Payment Mode Selection */}
                                        <div className="flex gap-2 h-14">
                                            <motion.button
                                                animate={{ flex: paymentMethod === "LINK" ? 0.7 : 0.3 }}
                                                onClick={() => setPaymentMethod("LINK")}
                                                className={`relative overflow-hidden border font-mono text-[10px] uppercase flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === "LINK"
                                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                                    : "border-white/10 text-white/40 hover:bg-white/5"
                                                    }`}
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                                {paymentMethod === "LINK" && <span className="font-bold tracking-tighter text-[12px]">GPay_Uplink</span>}
                                            </motion.button>

                                            <motion.button
                                                animate={{ flex: paymentMethod === "QR" ? 0.7 : 0.3 }}
                                                onClick={() => setPaymentMethod("QR")}
                                                className={`relative overflow-hidden border font-mono text-[10px] uppercase flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === "QR"
                                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                                    : "border-white/10 text-white/40 hover:bg-white/5"
                                                    }`}
                                            >
                                                <QrCode className="w-4 h-4" />
                                                {paymentMethod === "QR" && <span className="font-bold tracking-tighter text-[12px]">Scan_QR</span>}
                                            </motion.button>
                                        </div>

                                        {/* Selection Result: QR or Link Button */}
                                        <AnimatePresence mode="wait">
                                            {selectedEvent ? (
                                                <motion.div
                                                    key={paymentMethod}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="bg-white/5 border border-white/10 p-2 rounded-sm"
                                                >
                                                    {paymentMethod === "LINK" ? (
                                                        <a
                                                            href={selectedEvent.upiLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="w-full py-4 bg-white/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-cyan-500 hover:text-black transition-all group"
                                                        >
                                                            PAY_VIA_UPI_LINK <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        </a>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            {selectedEvent.qrCodeUrl ? (
                                                                <div className="p-2 bg-white rounded-sm shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                                                    <Image
                                                                        src={selectedEvent.qrCodeUrl}
                                                                        alt="QR Code"
                                                                        width={200}
                                                                        height={200}
                                                                        className="brightness-90 contrast-125 w-full"
                                                                        unoptimized={process.env.NODE_ENV === 'development'}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-mono text-red-500 animate-pulse">QR_DATA_NULL // CONTACT_ADMIN</span>
                                                            )}
                                                            <span className="text-[12px] text-white/40 mt-2">Please scan the QR Code above to pay</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="h-24 border border-dashed border-white/10 flex items-center justify-center">
                                                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Pending_Selection</span>
                                                </div>
                                            )}
                                        </AnimatePresence>

                                        {/* Final Execution Button */}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting} // Disable while submitting
                                            className={`w-full py-5 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 ${isFormValid && !isSubmitting
                                                ? "bg-cyan-500 text-black shadow-[0_0_40px_rgba(6,182,212,0.6)] border-cyan-400 cursor-pointer hover:scale-[1.02] active:scale-95"
                                                : "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed opacity-50"
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <Activity className="w-5 h-5 animate-spin" /> TRANSMITTING...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    EXECUTE_ENLISTMENT <ChevronRight className="w-5 h-5" />
                                                </span>
                                            )}
                                        </button>

                                        <p className="text-[9px] text-white/40 mt-4 text-center italic leading-tight font-mono">
                                            * BY CLICKING YOU AGREE TO SYSTEM PROTOCOLS <br /> AND ETHICAL DEPLOYMENT GUIDELINES.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            {/* CUSTOM SYSTEM NOTIFICATION POPUP */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 right-10 z-100 min-w-[320px]"
                    >
                        <div className={`relative p-1 rounded-sm overflow-hidden border ${notification.type === "SUCCESS" ? "border-cyan-500 bg-cyan-500/10" : "border-red-500 bg-red-500/10"}`}>
                            <div className="bg-black p-4 flex items-start gap-4">
                                <div className={notification.type === "SUCCESS" ? "text-cyan-400" : "text-red-500"}>
                                    {notification.type === "SUCCESS" ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-mono text-[10px] text-gray-300 tracking-widest uppercase mb-1">System_Log // {notification.type}</h4>
                                    <p className="font-bold text-sm uppercase text-white leading-tight">{notification.message}</p>
                                </div>
                                <button onClick={() => setNotification(null)} className="text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
            {/* CONFIRMATION OVERLAY */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-150 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="max-w-md w-full bg-zinc-900 border border-red-500/50 p-8 relative overflow-hidden"
                        >
                            {/* Decorative scanning line */}
                            <div className="absolute inset-0 pointer-events-none opacity-10">
                                <motion.div
                                    animate={{ y: ["0%", "100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-full h-1 bg-red-500 shadow-[0_0_15px_red]"
                                />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-red-500 mb-6 font-mono text-sm animate-pulse">
                                    <AlertTriangle className="w-6 h-6" />
                                    <span className="tracking-[0.3em] font-black uppercase">Final_Verification</span>
                                </div>

                                <h2 className="text-2xl font-horizon text-white mb-4">SURE TO CONTINUE?</h2>

                                <div className="space-y-4 mb-8">
                                    <p className="text-sm text-white/60 font-mono leading-relaxed">
                                        You are about to transmit personal data to the <span className="text-cyan-400">[{selectedEvent?.title}]</span> sector.
                                        This action is permanent and cannot be retracted once written to the blockchain.
                                    </p>

                                    <div className="bg-black/50 p-4 border-l-2 border-cyan-500 font-mono">
                                        <div className="text-[10px] text-white/40 uppercase">Target_Sector</div>
                                        <div className="text-sm text-cyan-400 font-bold">{selectedEvent?.title}</div>
                                        <div className="text-[10px] text-white/40 uppercase mt-2">Transmitting_As</div>
                                        <div className="text-sm text-white">{formData.name}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="py-3 border border-white/10 text-white/40 font-mono text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                                    >
                                        [ CANCEL ]
                                    </button>
                                    <button
                                        onClick={processTransmission}
                                        className="py-3 bg-red-600 text-white font-mono text-xs font-black uppercase tracking-widest hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                                    >
                                        EXECUTE_UPLINK
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
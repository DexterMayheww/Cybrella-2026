// src/components/admin/EventManager.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Calendar, Layers, Plus, Trash2, Image as ImageIcon,
    Hash, Globe, Activity,
    IndianRupee,
    LinkIcon,
    Edit2,
    UploadCloud,
    RefreshCw,
    X,
    GripVertical,
    FileText,
    List
} from "lucide-react";
import { AnimatePresence, Reorder } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
    QueryDocumentSnapshot,
    SnapshotOptions,
    DocumentData,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    writeBatch
} from "firebase/firestore";
import { EventData } from "@/types/events";
import SystemConfirm from "./SystemConfirm";
import { useToast, ToastProvider } from "./SystemToast";

interface Category {
    id: string;
    name: string;
    order: number;
}

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
            order: data.order ?? 0
        };
    },
};

interface InputFieldProps {
    label: string;
    icon?: React.ElementType;
    type?: string;
    value: string | number;
    onChange: (v: string) => void;
    placeholder?: string;
    isTextArea?: boolean;
}

const InputField = ({ label, icon: Icon, type = "text", isTextArea = false, ...props }: InputFieldProps) => (
    <div className="space-y-2">
        <label className="text-sm font-mono text-gray-400 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />} {label}
        </label>
        {isTextArea ? (
            <textarea
                className="w-full bg-black/40 border border-white/10 p-4 text-base font-mono outline-none focus:border-purple-500 transition-all [color-scheme:dark] min-h-[120px]"
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                placeholder={props.placeholder}
            />
        ) : (
            <input
                type={type}
                className="w-full bg-black/40 border border-white/10 p-4 text-base font-mono outline-none focus:border-purple-500 transition-all [color-scheme:dark]"
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                onClick={(e) => type === "date" && e.currentTarget.showPicker?.()}
                placeholder={props.placeholder}
            />
        )}
    </div>
);

interface AssetUploaderProps {
    label: string;
    onFile?: (file: File) => void;
    preview?: string;
    onDelete?: () => void;
    // Multi-upload props
    isMulti?: boolean;
    gallery?: string[];
    onGalleryUpload?: (file: File) => void;
    onDeleteGalleryItem?: (index: number) => void;
}

const AssetUploader = ({ label, onFile, preview, onDelete, isMulti = false, gallery = [], onGalleryUpload, onDeleteGalleryItem }: AssetUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (isMulti && onGalleryUpload) {
                onGalleryUpload(e.target.files[0]);
            } else if (onFile) {
                onFile(e.target.files[0]);
            }
        }
        // Reset input value to allow same file selection again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-2">
            <label className="text-sm text-gray-300 uppercase tracking-widest font-mono">{label}</label>

            {!isMulti ? (
                // SINGLE UPLOAD
                <div className="relative group h-48 w-full bg-black/40 border border-dashed border-white/10 overflow-hidden flex items-center justify-center transition-all hover:border-cyan-500/50">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {preview ? (
                        <>
                            <Image
                                src={preview}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                                alt="Preview"
                                width={200}
                                height={200}
                                unoptimized={process.env.NODE_ENV === 'development'}
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 backdrop-blur-xs bg-black/10">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/10 hover:bg-purple-500 text-white border border-white/10 transition-all rounded">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button onClick={onDelete} className="p-2 bg-white/10 hover:bg-red-500 text-white border border-white/10 transition-all rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 text-white/20 group-hover:text-cyan-400 transition-colors">
                            <UploadCloud className="w-8 h-8 stroke-[1.5px]" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Upload_Asset</span>
                        </button>
                    )}
                </div>
            ) : (
                // MULTI UPLOAD
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery.map((url, idx) => (
                        <div
                            key={idx}
                            className="relative h-24 bg-black/40 border border-white/10 overflow-hidden group"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <Image
                                src={url}
                                alt={`Gallery ${idx}`}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-all"
                                width={100}
                                height={100}
                                unoptimized={process.env.NODE_ENV === 'development'}
                            />
                            {hoveredIndex === idx && (
                                <button
                                    onClick={() => onDeleteGalleryItem && onDeleteGalleryItem(idx)}
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 text-red-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 bg-black/20 border border-dashed border-white/10 flex items-center justify-center text-white/20 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                    >
                        <Plus className="w-6 h-6" />
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </button>
                </div>
            )}
        </div>
    );
};

function EventManagerContent() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCatName, setNewCatName] = useState("");

    // Form State with new fields
    const [form, setForm] = useState<Omit<EventData, "id" | "order">>({
        title: "",
        slug: "",
        category: "",
        date: "",
        posterUrl: "",
        description: "",
        rules: [],
        gallery: [],
        price: 0,
        upiLink: "",
        qrCodeUrl: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newRule, setNewRule] = useState("");

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

    // Auto-generate slug from title
    useEffect(() => {
        if (!editingId && form.title) {
            const autoSlug = form.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
                .replace(/^-+|-+$/g, ""); // Trim hyphens
            setForm(prev => ({ ...prev, slug: autoSlug }));
        }
    }, [form.title, editingId]);

    useEffect(() => {
        const unsubC = onSnapshot(collection(db, "categories"), (snapshot) => {
            const cats = snapshot.docs.map(doc => ({
                id: doc.id,
                order: 9999,
                ...doc.data()
            })) as Category[];
            cats.sort((a, b) => a.order - b.order);
            setCategories(cats);
            if (cats.length > 0 && !form.category) setForm(f => ({ ...f, category: cats[0].name }));
        });

        const q = collection(db, "events").withConverter(eventConverter);
        const unsubE = onSnapshot(q, (snapshot) => {
            const eventList = snapshot.docs.map(doc => doc.data());
            eventList.sort((a, b) => a.order - b.order);
            setEvents(eventList);
            setLoading(false);
        });

        return () => { unsubC(); unsubE(); };
    }, [form.category]); // Re-run if default category needs setting? logic slightly flawed but ok for now

    // HANDLERS

    const handleAddCategory = async () => {
        if (!newCatName) return;
        try {
            await addDoc(collection(db, "categories"), {
                name: newCatName.toUpperCase(),
                createdAt: new Date().toISOString(),
                order: categories.length
            });
            setNewCatName("");
            showNotify("SECTOR_INITIALIZED", "SUCCESS");
        } catch (e: any) {
            showNotify(e.message, "ERROR");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "TERMINATE_SECTOR?",
            message: "confirm_sector_deletion // action_is_irreversible.",
            type: "DANGER",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, "categories", id));
                    showNotify("SECTOR_TERMINATED", "SUCCESS");
                } catch (e: any) {
                    showNotify(`ERROR: ${e.message}`, "ERROR");
                }
            }
        });
    };

    const handleExecuteDeployment = async () => {
        if (!form.title || !form.category || !form.slug) {
            showNotify("MISSING_CRITICAL_DATA", "ERROR");
            return;
        }
        setIsSubmitting(true);
        try {
            const eventPayload = {
                ...form,
                order: editingId ? (events.find(e => e.id === editingId)?.order ?? 0) : events.length
            };

            if (editingId) {
                const eventRef = doc(db, "events", editingId);
                await updateDoc(eventRef, eventPayload);
                setEditingId(null);
                showNotify("DATABASE_ENTRY_UPDATED", "SUCCESS");
            } else {
                await addDoc(collection(db, "events"), {
                    ...eventPayload,
                    createdAt: new Date().toISOString()
                });
                showNotify("DEPLOYMENT_SUCCESSFUL", "SUCCESS");
            }
            resetForm();
        } catch (e: any) {
            showNotify(e.message, "ERROR");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            slug: "",
            category: categories[0]?.name || "",
            date: "",
            posterUrl: "",
            description: "",
            rules: [],
            gallery: [],
            price: 0,
            upiLink: "",
            qrCodeUrl: ""
        });

        setEditingId(null);
        setNewRule("");
        setNewCatName("");

        const consoleElement = document.querySelector('.Deployment_Console');
        if (consoleElement) {
            consoleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleUpload = async (file: File, field: "posterUrl" | "qrCodeUrl" | "gallery") => {
        if (file.size > 5000000) {
            showNotify("FILE_TOO_LARGE // LIMIT: 5MB", "ERROR");
            return;
        }

        try {
            const targetFolder = field === "posterUrl" ? "posters" : field === "qrCodeUrl" ? "qr_codes" : "gallery";
            const body = new FormData();
            body.append("photo", file);

            const baseUrl = process.env.NEXT_PUBLIC_FILE_SERVER_URL?.replace(/\/$/, "");
            const res = await fetch(`${baseUrl}/upload?folder=${targetFolder}`, {
                method: "POST",
                body: body
            });

            if (!res.ok) throw new Error("UPLOAD_FAILED");
            const data = await res.json();

            if (field === "gallery") {
                setForm(prev => ({ ...prev, gallery: [...prev.gallery, data.url] }));
            } else {
                setForm(prev => ({ ...prev, [field]: data.url }));
            }
            showNotify("ASSET_UPLOADED", "SUCCESS");
        } catch (e) {
            console.error(e);
            showNotify("UPLOAD_ERROR", "ERROR");
        }
    };

    const clearAsset = (field: "posterUrl" | "qrCodeUrl") => {
        setForm({ ...form, [field]: "" });
    };

    const deleteGalleryItem = (index: number) => {
        setForm(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    // Rules Logic
    const addRule = () => {
        if (!newRule.trim()) return;
        setForm(prev => ({ ...prev, rules: [...prev.rules, newRule] }));
        setNewRule("");
    };

    const removeRule = (index: number) => {
        setForm(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    const deleteEvent = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "DELETE_DEPLOYMENT?",
            message: "protocol_initiated: delete_event_sequence // confirm_action.",
            type: "DANGER",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, "events", id));
                    showNotify("DEPLOYMENT_SCRUBBED", "SUCCESS");
                } catch (e: any) {
                    showNotify(e.message, "ERROR");
                }
            }
        });
    };

    // Drag & Drop Reordering Logic (omitted generic implementation for brevity if unchanged, but keeping key parts)
    // Using simple reorder logic from before
    const handleReorderEvents = async (newCategoryOrder: EventData[], categoryName: string) => {
        // 1. Create a map of the new order for the specific category being changed
        const updatedEvents = [...events];

        // 2. Identify all events NOT in this category
        const otherEvents = updatedEvents.filter(e => e.category !== categoryName);

        // 3. Combine: Other events + the newly ordered category events
        // We maintain the relative order of other categories
        const combinedEvents = [...otherEvents, ...newCategoryOrder];

        // 4. Sort the combined list by category order first, then internal sequence
        // This ensures the database 'order' field reflects the visual UI perfectly
        const finalSequence = combinedEvents.sort((a, b) => {
            const catA = categories.find(c => c.name === a.category);
            const catB = categories.find(c => c.name === b.category);
            const catOrderA = catA?.order ?? 999;
            const catOrderB = catB?.order ?? 999;

            if (catOrderA !== catOrderB) return catOrderA - catOrderB;

            // If same category, use their index within the newCategoryOrder if applicable
            if (a.category === categoryName && b.category === categoryName) {
                return newCategoryOrder.indexOf(a) - newCategoryOrder.indexOf(b);
            }
            return (a.order ?? 0) - (b.order ?? 0);
        });

        // 5. Update local state
        setEvents([...finalSequence]);

        // 6. Batch update Firestore
        try {
            const batch = writeBatch(db);
            finalSequence.forEach((event, index) => {
                const eventRef = doc(db, "events", event.id);
                batch.update(eventRef, { order: index });
            });
            await batch.commit();
            showNotify("EVENT_SEQUENCE_SYNCHRONIZED", "SUCCESS");
        } catch (e: any) {
            showNotify(`DATABASE_SYNC_FAILURE: ${e.message}`, "ERROR");
        }
    };

    const handleReorderCategories = async (newOrder: Category[]) => {
        setCategories(newOrder); // Optimistic UI update

        try {
            const batch = writeBatch(db);
            newOrder.forEach((cat, index) => {
                const categoryRef = doc(db, "categories", cat.id);
                batch.update(categoryRef, { order: index });
            });

            await batch.commit();
            showNotify("SECTOR_SEQUENCE_SYNCHRONIZED", "SUCCESS");
        } catch (e: any) {
            showNotify(`SYNC_ERROR: ${e.message}`, "ERROR");
        }
    };


    if (loading) return <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">ESTABLISHING_UPLINK...</div>;

    return (
        <div className="space-y-8">
            {/* CATEGORY ARCHITECT */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-md mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-[10px] font-mono text-cyan-400 tracking-[0.3em] uppercase">Sector_Architecture</h3>
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        className="flex-1 bg-black/40 border border-white/10 p-4 text-sm font-mono text-white outline-none focus:border-cyan-500 transition-all"
                        placeholder="NEW_SECTOR_IDENTIFIER..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                    />
                    <button
                        onClick={handleAddCategory}
                        className="bg-cyan-500 text-black px-8 py-3 font-black text-xs hover:bg-cyan-400 transition-all"
                    >
                        INITIALIZE_SECTOR
                    </button>
                </div>
                {/* Reorder Categories Group */}
                <Reorder.Group
                    axis="x"
                    values={categories}
                    onReorder={handleReorderCategories}
                    className="flex flex-wrap gap-2 mt-4"
                >
                    {categories.map(c => (
                        <Reorder.Item
                            key={c.id}
                            value={c}
                            className="text-[11px] font-mono border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 flex items-center gap-2 group cursor-grab active:cursor-grabbing select-none"
                        >
                            <GripVertical className="w-4 h-4 text-cyan-500/40 group-hover:text-cyan-500 transition-colors" />
                            {c.name}
                            <Trash2
                                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                                onClick={() => handleDeleteCategory(c.id)}
                            />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            {/* DEPLOYMENT CONSOLE */}
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-md">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xs font-mono text-purple-400 tracking-[0.3em] uppercase">Deployment_Console</h3>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Basic Info */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="EVENT_TITLE" value={form.title} onChange={(v) => setForm({ ...form, title: v })} icon={Hash} />

                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <InputField label="URL_SLUG" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} icon={Globe} />
                            </div>
                            <button
                                onClick={() => {
                                    if (!form.title) return;
                                    const autoSlug = form.title
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]+/g, "-")
                                        .replace(/^-+|-+$/g, "");
                                    setForm(prev => ({ ...prev, slug: autoSlug }));
                                }}
                                className="mb-[1px] p-[13px] bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all rounded"
                                title="Regenerate Slug from Title"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="md:col-span-2">
                        <InputField label="MISSION_BRIEF (DESCRIPTION)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} isTextArea icon={FileText} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-mono text-gray-400 flex items-center gap-2"><Layers className="w-4 h-4" /> SECTOR_CLASSIFICATION</label>
                        <select
                            className="w-full bg-black/40 border border-white/10 p-4 text-white font-mono text-base focus:border-purple-500 outline-none appearance-none cursor-pointer"
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c.id} value={c.name} className="bg-zinc-900">{c.name}</option>)}
                        </select>
                    </div>

                    <InputField label="TEMPORAL_MARKER" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} icon={Calendar} />

                    {/* Payment Info */}
                    <InputField label="REGISTRATION_FEE (INR)" icon={IndianRupee} type="number" value={form.price || 0} onChange={(v) => setForm({ ...form, price: Number(v) })} />
                    <InputField label="UPI_DEEP_LINK" icon={LinkIcon} value={form.upiLink || ""} onChange={(v) => setForm({ ...form, upiLink: v })} placeholder="upi://pay?pa=..." />


                    {/* RULES ENGINE */}
                    <div className="md:col-span-2 space-y-4 border border-white/10 p-4 rounded bg-black/20">
                        <label className="text-sm font-mono text-cyan-400 flex items-center gap-2 tracking-widest uppercase">
                            <List className="w-4 h-4" /> PROTOCOLS & RULES
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-black border border-white/10 p-3 font-mono text-sm focus:border-cyan-500 outline-none"
                                placeholder="ADD_NEW_PROTOCOL..."
                                value={newRule}
                                onChange={(e) => setNewRule(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addRule()}
                            />
                            <button onClick={addRule} className="bg-cyan-500/20 text-cyan-500 px-4 hover:bg-cyan-500 hover:text-black transition-all">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <ul className="space-y-2">
                            {form.rules.map((rule, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5 text-sm font-mono text-gray-300">
                                    <span className="truncate flex-1 mr-4">{idx + 1}. {rule}</span>
                                    <button onClick={() => removeRule(idx)} className="text-red-500 hover:bg-red-500/20 p-1 rounded transition-colors"><X className="w-4 h-4" /></button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ASSETS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
                        <AssetUploader
                            label="PRIMARY_POSTER"
                            onFile={(f) => handleUpload(f, 'posterUrl')}
                            preview={form.posterUrl}
                            onDelete={() => clearAsset('posterUrl')}
                        />
                        <AssetUploader
                            label="PAYMENT_QR_CODE"
                            onFile={(f) => handleUpload(f, 'qrCodeUrl')}
                            preview={form.qrCodeUrl}
                            onDelete={() => clearAsset('qrCodeUrl')}
                        />
                    </div>

                    {/* GALLERY */}
                    <div className="md:col-span-2">
                        <AssetUploader
                            label="GALLERY_MODULE (MULTI-UPLOAD)"
                            isMulti
                            gallery={form.gallery}
                            onGalleryUpload={(f) => handleUpload(f, 'gallery')}
                            onDeleteGalleryItem={deleteGalleryItem}
                        />
                    </div>

                    {/* SUBMIT */}
                    <div className="md:col-span-2 flex gap-4 mt-4">
                        <button
                            onClick={handleExecuteDeployment}
                            disabled={isSubmitting}
                            className={`flex-1 font-black py-5 flex items-center justify-center gap-2 uppercase tracking-tighter transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] ${editingId ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-purple-600 text-white hover:bg-purple-500"
                                }`}
                        >
                            {isSubmitting ? "TRANSMITTING..." : editingId ? "UPDATE_DEPLOYMENT" : "EXECUTE_DEPLOYMENT"}
                            <Plus className={`w-6 h-6 ${editingId ? "rotate-45" : ""}`} />
                        </button>

                        {editingId && (
                            <button
                                onClick={resetForm}
                                className="px-8 bg-red-500/10 border border-red-500/50 text-red-500 font-mono text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                            >
                                CANCEL_EDIT
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* EVENT LISTING */}
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-md">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-sm font-mono text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                        <Globe className="w-5 h-5" /> Live_Operations
                    </h3>
                    <span className="text-[11px] font-mono text-gray-500 tracking-tighter">TOTAL_ACTIVE: {events.length}</span>
                </div>

                <div className="p-4 space-y-12">
                    {categories.map((cat) => {
                        const categoryEvents = events.filter(e => e.category === cat.name);
                        if (categoryEvents.length === 0) return null;

                        return (
                            <div key={cat.id} className="space-y-4">
                                <div className="flex items-center gap-4 px-2">
                                    <h4 className="text-xs font-mono text-cyan-500/50 uppercase tracking-[0.3em] font-black">
                                        Sector_{cat.name}
                                    </h4>
                                    <div className="h-px flex-1 bg-cyan-500/10" />
                                </div>

                                {/* REORDER LIST */}
                                <Reorder.Group
                                    axis="y"
                                    values={categoryEvents}
                                    onReorder={(newOrder) => handleReorderEvents(newOrder, cat.name)}
                                    className="divide-y divide-white/5 border-x border-white/5 bg-black/20"
                                >
                                    <AnimatePresence initial={false}>
                                        {categoryEvents.map((event) => (
                                            <Reorder.Item
                                                key={event.id}
                                                value={event}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="group flex flex-col md:flex-row items-center justify-between p-4 hover:bg-white/5 transition-colors gap-4 cursor-grab active:cursor-grabbing select-none"
                                            >
                                                <div className="flex items-center gap-8 w-full">
                                                    <GripVertical className="w-5 h-5 text-white/10 group-hover:text-cyan-500 transition-colors shrink-0" />

                                                    <div className="w-20 h-20 bg-gray-900 border border-white/10 rounded overflow-hidden shrink-0 relative">
                                                        {event.posterUrl ? (
                                                            <Image
                                                                src={event.posterUrl}
                                                                alt=""
                                                                className="object-cover w-full h-full opacity-50 group-hover:opacity-100 transition-opacity"
                                                                width={100}
                                                                height={100}
                                                                unoptimized={process.env.NODE_ENV === 'development'}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white/10">
                                                                <ImageIcon className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-lg text-white font-black font-horizon tracking-tight uppercase group-hover:text-cyan-400 transition-colors">
                                                                {event.title}
                                                            </h4>
                                                            <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">/{event.slug}</span>
                                                        </div>
                                                        <div className="flex gap-6 mt-2 text-xs text-gray-500 font-mono">
                                                            <span className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4" /> {event.date}
                                                            </span>
                                                            <span className="flex items-center gap-2 text-cyan-400">
                                                                <IndianRupee className="w-4 h-4" /> {event.price}
                                                            </span>
                                                            <span className="flex items-center gap-2 text-purple-400">
                                                                <List className="w-4 h-4" /> {event.rules?.length || 0} RULES
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(event.id);
                                                            setForm({ ...event }); // Now matches EventData shape
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="p-2 border border-white/10 text-gray-500 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => deleteEvent(event.id)}
                                                        className="p-2 border border-white/10 text-gray-500 hover:text-red-500 hover:border-red-500/50 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </AnimatePresence>
                                </Reorder.Group>
                            </div>
                        );
                    })}

                    {events.length === 0 && (
                        <div className="p-12 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                            No_Active_Deployments_Found
                        </div>
                    )}
                </div>
            </div>
            {/* SYSTEM CONFIRM MODAL */}
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

export default function EventManager() {
    return (
        <ToastProvider>
            <EventManagerContent />
        </ToastProvider>
    );
}
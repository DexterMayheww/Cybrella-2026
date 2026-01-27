"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ShieldAlert, X } from "lucide-react";
import Portal from "../Portal";

interface SystemConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    type?: "DANGER" | "WARNING";
}

export default function SystemConfirm({ 
    isOpen, onClose, onConfirm, title, message, 
    confirmText = "EXECUTE", type = "WARNING" 
}: SystemConfirmProps) {
    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-md w-full bg-zinc-900 border-2 border-white/10 relative overflow-hidden"
                        >
                            {/* Scanning Line */}
                            <div className="absolute inset-0 pointer-events-none opacity-10">
                                <motion.div 
                                    animate={{ y: ["0%", "100%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className={`w-full h-1 ${type === 'DANGER' ? 'bg-red-500' : 'bg-cyan-500'} shadow-[0_0_15px]`}
                                />
                            </div>

                            <div className="p-8 relative z-10">
                                <div className={`flex items-center gap-3 mb-6 font-mono text-sm ${type === 'DANGER' ? 'text-red-500' : 'text-cyan-400'}`}>
                                    {type === 'DANGER' ? <ShieldAlert className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                    <span className="tracking-[0.3em] font-black uppercase">{title}</span>
                                </div>

                                <p className="text-sm text-white/60 font-mono leading-relaxed mb-8">
                                    {message}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={onClose}
                                        className="py-3 border border-white/10 text-white/40 font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                                    >
                                        [ ABORT_COMMAND ]
                                    </button>
                                    <button 
                                        onClick={() => { onConfirm(); onClose(); }}
                                        className={`py-3 font-mono text-[10px] font-black uppercase tracking-widest transition-all ${
                                            type === 'DANGER' 
                                            ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                                            : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                                        }`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal>
    );
}
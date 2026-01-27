"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2, AlertTriangle, X } from "lucide-react";

type ToastType = "SUCCESS" | "ERROR" | "SYSTEM";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "SYSTEM") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast }: { toast: Toast }) => {
    const colors = {
        SUCCESS: "border-cyan-500 bg-cyan-500/10 text-cyan-400",
        ERROR: "border-red-500 bg-red-500/10 text-red-500",
        SYSTEM: "border-purple-500 bg-purple-500/10 text-purple-400",
    };

    const Icons = {
        SUCCESS: CheckCircle2,
        ERROR: AlertTriangle,
        SYSTEM: Terminal,
    };

    const Icon = Icons[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto min-w-[300px] border-l-4 p-4 shadow-2xl backdrop-blur-md ${colors[toast.type]}`}
        >
            <div className="flex items-start gap-4">
                <Icon className="w-5 h-5 shrink-0" />
                <div className="flex-1">
                    <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1">
                        System_Log // {toast.type}
                    </p>
                    <p className="font-mono text-xs font-bold uppercase">{toast.message}</p>
                </div>
            </div>
            {/* Scanning line animation */}
            <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[1px] bg-white/30"
            />
        </motion.div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};
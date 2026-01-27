// src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react"; // Added Eye icons
import { motion } from "framer-motion";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth"; 
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/admin");
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  // Centralized error handling for Cyberpunk theme
  const handleAuthError = (err: any) => {
    console.error(err);
    if (err.code === "auth/invalid-credential") {
      setError("ACCESS_DENIED // INVALID_CREDENTIALS");
    } else if (err.code === "auth/too-many-requests") {
      setError("SYSTEM_LOCKDOWN // TOO_MANY_ATTEMPTS");
    } else if (err.code === "auth/popup-closed-by-user") {
      setError("AUTH_CANCELLED // POPUP_CLOSED");
    } else {
      setError(`ERROR_CODE: ${err.code}`);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Lock className="text-black" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tighter">ADMIN_GATEWAY</h1>
        <p className="text-gray-500 text-center font-mono text-xs mb-8">SECURE CONNECTION REQUIRED</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-2">OPERATOR_EMAIL</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/20 p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono rounded"
              placeholder="admin@cybrella.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-2">ACCESS_KEY</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/20 p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono rounded pr-12"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-mono flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <div className="space-y-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded transition-all flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(8,145,178,0.4)]"
            >
              {loading ? "AUTHENTICATING..." : "INITIATE_SESSION"} 
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-900 px-2 text-gray-500 font-mono">OR_EXTERNAL_AUTH</span></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-transparent border border-white/20 hover:border-white/40 text-white font-mono text-xs py-3 rounded transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              USE_GOOGLE_IDENTITY
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
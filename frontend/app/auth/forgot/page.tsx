"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMail, FiCpu, FiAlertTriangle, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { RiRadarLine } from "react-icons/ri";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Security email address is required to locate credentials.");
      return;
    }

    setIsLoading(true);

    // Simulate recovery token dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 select-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl glass-panel border border-cyber-cyan/20 p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden"
      >
        {/* Top colored accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyber-blue via-cyber-cyan to-cyber-purple" />

        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors uppercase font-mono font-bold"
          >
            <FiArrowLeft />
            <span>Portal Login</span>
          </Link>
        </div>

        {/* Logo Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-cyber-blue/10 border border-cyber-cyan/40 text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <RiRadarLine className="text-2xl animate-spin [animation-duration:10s]" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider text-white">
              Recover Access
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">
              PASSWORD TOKEN DISPATCH
            </p>
          </div>
        </div>

        {/* Errors Warning */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 mb-5 rounded-lg bg-cyber-critical/10 border border-cyber-critical/20 text-xs text-cyber-critical flex items-start gap-2.5"
          >
            <FiAlertTriangle className="shrink-0 mt-0.5 text-sm animate-pulse" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Success State */}
        {isSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-4 text-xs font-sans"
          >
            <div className="w-12 h-12 rounded-full bg-cyber-success/15 border border-cyber-success/30 text-cyber-success flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <FiCheckCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Dispatched Verification Code</h3>
              <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
                An active recovery token link has been compiled and emailed to <strong className="text-slate-200 font-mono font-medium">{email}</strong>. Check inbox logs.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="w-full h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold tracking-wider text-[10px] uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>RETURN TO PORTAL LOGIN</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Input Form */
          <form onSubmit={handleRequest} className="space-y-5 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Registered Security Email Address:</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="analyst@cybervision.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-cyber-cyan/20 transition-all font-mono"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-cyan hover:from-cyber-blue/90 hover:to-cyber-cyan/90 text-white font-bold tracking-wider text-xs uppercase shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <FiCpu className="animate-spin text-sm" />
                    <span>DISPATCHING SECURITY TOKEN...</span>
                  </>
                ) : (
                  <span>DISPATCH RECOVERY CODE</span>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

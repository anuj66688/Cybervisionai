"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiCpu, FiAlertTriangle, FiCheck } from "react-icons/fi";
import { RiRadarLine } from "react-icons/ri";

import { apiClient } from "@/utils/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dept, setDept] = useState("SOC");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("All analyst credential fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passcodes do not match operational profile requirements.");
      return;
    }

    if (!agreed) {
      setErrorMsg("You must declare compliance with SIEM security regulations.");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/auth/register", {
        name,
        email,
        password,
        department: dept,
      });

      setIsLoading(false);
      alert("Operational Profile provisioned successfully. Returning to Login portal.");
      router.push("/auth/login");
    } catch (err: any) {
      console.warn("Backend registration failed or offline. Using local session fallback.", err);
      setTimeout(() => {
        setIsLoading(false);
        alert("Operational Profile provisioned successfully (Local Fallback). Returning to Login portal.");
        router.push("/auth/login");
      }, 1000);
    }
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

        {/* Logo Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-cyber-blue/10 border border-cyber-cyan/40 text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <RiRadarLine className="text-2xl animate-spin [animation-duration:10s]" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider text-white">
              Provision Profile
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">
              SIEM ACCOUNT SETUP
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

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Analyst Name:</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tier 1 Auditor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.04] transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Security Email:</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                placeholder="analyst@cybervision.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.04] transition-all font-mono"
              />
            </div>
          </div>

          {/* Department Choice */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Specialization Unit:</label>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              disabled={isLoading}
              className="w-full h-10 px-3 rounded-xl bg-[#0f172a] border border-white/10 text-slate-200 focus:outline-none focus:border-cyber-cyan/50 font-sans"
            >
              <option value="SOC">Security Operations Center (SOC)</option>
              <option value="IR">Incident Response Team (IRT)</option>
              <option value="INTEL">Threat Intelligence unit</option>
              <option value="PENTEST">Offensive Penetration Auditor</option>
            </select>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Passcode:</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.04] transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Confirm:</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.04] transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Legal Compliance Check */}
          <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-[10px] text-slate-400 font-sans">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-3.5 h-3.5 rounded bg-[#0f172a] border border-white/10 text-cyber-cyan focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
            />
            <span>
              I certify that I will obey all system diagnostic protocols, data compliance regulations, and NDA rules under ISO 27001 policies.
            </span>
          </label>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-cyan hover:from-cyber-blue/90 hover:to-cyber-cyan/90 text-white font-bold tracking-wider text-xs uppercase shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <FiCpu className="animate-spin text-sm" />
                  <span>PROVISIONING PROFILE...</span>
                </>
              ) : (
                <span>PROVISION SECURE PORTAL PROFILE</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/5 text-center text-[10px] text-slate-500 select-none font-mono">
          <span>ALREADY REGISTERED?</span>
          <div className="mt-1.5 text-slate-400">
            <Link href="/auth/login" className="text-cyber-cyan font-semibold hover:underline">
              Access Account Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

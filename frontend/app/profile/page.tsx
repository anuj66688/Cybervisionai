"use client";

import React, { useState } from "react";
import { FiUser, FiMail, FiShield, FiBell, FiLock, FiCpu } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [name, setName] = useState("SecOps Analyst - Tier 3");
  const [email, setEmail] = useState("analyst.lead@cybervision.ai");
  const [dept, setDept] = useState("Global Threat Response Team");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("SecOps Profile credentials updated successfully.");
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl lg:text-2xl font-bold font-display text-white tracking-wide flex items-center gap-2">
          <FiUser className="text-cyber-cyan" />
          <span>Analyst Profile Command</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage identity profiles, active authorization tokens, and SIEM warning rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Profile card */}
        <div className="space-y-6 md:col-span-1">
          <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col items-center text-center space-y-4 shadow-2xl relative overflow-hidden">
            {/* Pulsing glow target behind avatar */}
            <div className="absolute w-24 h-24 rounded-full bg-cyber-blue/10 blur-xl top-6 pointer-events-none" />

            <div className="relative w-20 h-20 rounded-2xl bg-cyber-blue/10 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center">
              <FiUser size={36} className="animate-pulse" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyber-success border-2 border-[#050816]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white font-display tracking-wide">{name}</h3>
              <p className="text-[10px] text-cyber-cyan font-mono font-semibold tracking-wider">LEVEL 3 COMMANDER</p>
              <p className="text-[10px] text-slate-400 font-sans">{dept}</p>
            </div>

            <div className="w-full pt-4 border-t border-white/5 space-y-2 text-[10px] font-mono text-left text-slate-500">
              <div>SESSION ID: CV-7890-SEC</div>
              <div>ROUTING ID: SG-PERIMETER-EAST</div>
              <div>TOKEN EXPIRY: 14H REMAINING</div>
            </div>
          </div>

          {/* Active Credentials list */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <FiLock className="text-cyber-warning" />
              <span>Analyst Credentials</span>
            </h4>
            
            <div className="space-y-2.5 text-[11px] font-sans text-slate-400">
              <div className="flex justify-between">
                <span>SSO Status:</span>
                <span className="text-cyber-success font-semibold">AUTHENTICATED</span>
              </div>
              <div className="flex justify-between">
                <span>Security Clearance:</span>
                <span className="text-cyber-critical font-bold">TOP SECRET (TS-SCI)</span>
              </div>
              <div className="flex justify-between">
                <span>API Keys:</span>
                <span className="text-cyber-cyan font-mono">cv_key_********48ae</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Editable Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 rounded-2xl glass-panel border border-white/5 space-y-5">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-2.5">
              Edit SecOps Profile Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Analyst Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.04] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Department Unit:</label>
                <input
                  type="text"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.04] transition-colors"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-400 font-medium">Security Email Routing Address:</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-10 pr-3.5 rounded-lg bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.04] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 h-10 rounded-lg bg-cyber-blue hover:bg-cyber-blue/80 text-white font-semibold text-xs tracking-wider transition-colors cursor-pointer"
              >
                SAVE PROFILE SETTINGS
              </button>
            </div>
          </form>

          {/* Incident Ingestion Prefs */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-2.5 flex items-center gap-1.5">
              <FiBell className="text-cyber-cyan animate-pulse" />
              <span>SIEM Broadcast Preferences</span>
            </h3>

            <div className="space-y-3 font-sans select-none">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0f172a] border border-white/10 text-cyber-cyan focus:ring-0 focus:ring-offset-0 focus:outline-none"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">Critical SMS Notifications</span>
                  <span className="text-[10px] text-slate-500">Route SMS notification calls directly to on-call cell-phones.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0f172a] border border-white/10 text-cyber-cyan focus:ring-0 focus:ring-offset-0 focus:outline-none"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">Ingress Email Reports</span>
                  <span className="text-[10px] text-slate-500">Receive hourly summary alerts on vulnerability scans.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0f172a] border border-white/10 text-cyber-cyan focus:ring-0 focus:ring-offset-0 focus:outline-none"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">Play Auditory Warning Chimes</span>
                  <span className="text-[10px] text-slate-500">Enable audible warning sirens for Critical server alerts.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

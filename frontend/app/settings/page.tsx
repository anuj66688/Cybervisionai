"use client";

import React, { useState } from "react";
import { FiSettings, FiSliders, FiBell, FiGlobe, FiDatabase, FiRefreshCw } from "react-icons/fi";
import { useLayout } from "@/components/layout/LayoutContext";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { refreshRate, setRefreshRate, isLive, setIsLive } = useLayout();
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en-US");
  const [minCvss, setMinCvss] = useState(7.0);

  const handleApply = () => {
    alert("System diagnostic parameters saved successfully. Reloading platform configurations...");
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl lg:text-2xl font-bold font-display text-white tracking-wide flex items-center gap-2">
          <FiSettings className="text-cyber-cyan" />
          <span>System Console Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Configure security cluster endpoints, telemetry refresh ratios, and notification limits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left selector menu cards */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2.5 flex items-center gap-2">
              <FiSliders className="text-cyber-cyan" />
              <span>Theme Appearance</span>
            </h3>

            <div className="space-y-2 text-xs">
              {["dark", "light", "cyberpunk"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-full h-10 px-3.5 rounded-lg flex items-center justify-between font-semibold border capitalize transition-all cursor-pointer ${
                    theme === t
                      ? "bg-cyber-blue/10 border-cyber-cyan text-cyber-cyan shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{t} Mode</span>
                  <span className={`w-2 h-2 rounded-full ${theme === t ? "bg-cyber-cyan" : "bg-transparent"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/5 text-[10px] font-mono text-slate-500 space-y-1.5">
            <div>CONSOLE VERSION: v2.4.12</div>
            <div>BUILD SIG: DEPMIND-AI-REACT19</div>
            <div>STATUS: CONFIGURED OK</div>
          </div>
        </div>

        {/* Right configuration forms */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-5">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-2.5">
              SIEM Telemetry Parameters
            </h3>

            <div className="space-y-4 text-xs font-sans">
              {/* Ingestion feed toggle */}
              <div className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/5">
                <div>
                  <span className="font-semibold text-slate-200 block">Live Telemetry Loop</span>
                  <span className="text-[10px] text-slate-500">Inject real-time security alerts into the command center.</span>
                </div>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`px-3.5 h-8 rounded text-[10px] font-bold tracking-wider cursor-pointer transition-colors ${
                    isLive
                      ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30"
                      : "bg-white/5 text-slate-500 border border-white/5"
                  }`}
                >
                  {isLive ? "LOOPING ACTIVE" : "PAUSED"}
                </button>
              </div>

              {/* Feed speed selector */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">SIEM Ingestion Period:</label>
                <select
                  value={refreshRate}
                  onChange={(e) => setRefreshRate(parseInt(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan/50 font-sans"
                >
                  <option value={2000}>2 Seconds (High Resolution)</option>
                  <option value={4000}>4 Seconds (Recommended Standard)</option>
                  <option value={8000}>8 Seconds (Low Resource Limit)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">Sets how often the mock vulnerability router queries cluster changes.</span>
              </div>

              {/* CVSS minimum alarm slider */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.03]">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 font-medium">Min CVSS Incident Threat-Threshold Alert:</label>
                  <span className="font-mono text-cyber-warning font-bold">{minCvss.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="9.5"
                  step="0.5"
                  value={minCvss}
                  onChange={(e) => setMinCvss(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#0b0f19] rounded-lg appearance-none cursor-pointer accent-cyber-warning"
                />
                <span className="text-[10px] text-slate-500 block">Suppress auditory alarms for CVEs with CVSS weight below this slider index.</span>
              </div>

              {/* Language selection */}
              <div className="space-y-1.5 pt-4 border-t border-white/[0.03]">
                <label className="text-slate-400 font-medium">Console Locale Dialect Language:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan/50 font-sans"
                >
                  <option value="en-US">English (UTC ISO Timezone)</option>
                  <option value="de-DE">Deutsch (Berlin Timezone)</option>
                  <option value="zh-CN">Chinese Simplified (Beijing Timezone)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <button
                onClick={handleApply}
                className="px-5 h-10 rounded-lg bg-cyber-blue hover:bg-cyber-blue/80 text-white font-semibold text-xs tracking-wider transition-colors cursor-pointer"
              >
                APPLY PLATFORM SETTINGS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useLayout } from "./LayoutContext";
import { useDateTime } from "@/hooks/useDateTime";
import { apiClient } from "@/utils/api";
import {
  FiSearch,
  FiBell,
  FiUser,
  FiCpu,
  FiActivity,
  FiShield,
  FiChevronDown,
  FiZap,
  FiRefreshCw,
  FiRadio,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const {
    isNotificationOpen,
    setNotificationOpen,
    unreadCount,
    isIngestingNvd,
    triggerLiveNvdIngestion,
  } = useLayout();

  const { time, date, utc } = useDateTime();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const toggleNotifications = () => {
    setNotificationOpen(!isNotificationOpen);
  };

  const handleFetchLiveNvd = async () => {
    setActionFeedback("Connecting to NVD API Key...");
    try {
      const data = await triggerLiveNvdIngestion();
      setActionFeedback(data?.message || "Live NVD API alerts ingested successfully!");
      setNotificationOpen(true);
    } catch (err) {
      console.error("Live NVD fetch error:", err);
      setActionFeedback("Failed to reach NVD API key.");
    } finally {
      setTimeout(() => setActionFeedback(null), 4500);
    }
  };

  return (
    <header className="z-20 flex items-center justify-between h-20 px-8 border-b border-white/5 bg-[#080c16]/50 backdrop-blur-md">
      {/* Search Input Bar */}
      <div className="hidden md:flex items-center w-80 relative">
        <FiSearch className="absolute left-3 text-slate-400 select-none pointer-events-none" size={16} />
        <input
          type="text"
          placeholder="Search CVEs, IP addresses, hashes..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/[0.03] border border-white/10 text-sm placeholder-slate-400 focus:outline-none focus:border-cyber-cyan/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-cyber-cyan/30 transition-all"
        />
      </div>

      {/* Center Dynamic Time Clock */}
      <div className="flex items-center gap-5 text-xs text-slate-400 select-none bg-white/[0.02] border border-white/5 px-4 py-2 rounded-lg font-mono">
        <div className="flex items-center gap-1.5 text-cyber-cyan">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping" />
          <span className="font-semibold text-white tracking-wide">{time}</span>
        </div>
        <span className="text-white/10">|</span>
        <span>{date}</span>
        <span className="text-white/10">|</span>
        <span className="text-cyber-purple font-medium">{utc}</span>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-3">
        {/* Live NVD API Key Trigger Button */}
        <button
          disabled={isIngestingNvd}
          onClick={handleFetchLiveNvd}
          className="flex items-center gap-2 h-10 px-3.5 rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 hover:bg-cyber-cyan hover:text-[#050816] text-cyber-cyan text-xs font-semibold tracking-wider transition-all duration-300 select-none shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer disabled:opacity-50"
        >
          {isIngestingNvd ? (
            <FiRefreshCw className="animate-spin text-sm" />
          ) : (
            <FiRadio className="text-sm animate-pulse" />
          )}
          <span>{isIngestingNvd ? "FETCHING NVD..." : "LIVE NVD ALERTS"}</span>
        </button>

        {actionFeedback && (
          <div className="fixed top-24 right-8 z-50 rounded-lg border border-cyber-cyan/30 bg-[#08111f]/95 px-4 py-2.5 text-xs text-cyber-cyan shadow-2xl backdrop-blur-md font-mono flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Dynamic Notification Bell Button */}
        <button
          onClick={toggleNotifications}
          className={`relative flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 hover:border-cyber-cyan/50 bg-[#0f172a] hover:bg-cyber-cyan/5 transition-all text-slate-300 hover:text-cyber-cyan cursor-pointer ${
            isNotificationOpen ? "border-cyber-cyan/60 text-cyber-cyan bg-cyber-cyan/5 ring-1 ring-cyber-cyan/30" : ""
          }`}
        >
          <FiBell className={`${unreadCount > 0 ? "animate-swing" : ""}`} size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-bold text-white bg-cyber-critical shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <span className="w-px h-6 bg-white/10" />

        {/* Analyst User Badge */}
        <div className="flex items-center gap-3 select-none">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue">
            <FiUser size={18} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyber-success border border-[#050816]" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white tracking-wide">SecOps Analyst</div>
            <div className="text-[10px] text-cyber-success font-medium flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-cyber-success" />
              NVD Feed Active
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

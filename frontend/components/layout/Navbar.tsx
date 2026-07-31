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
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const {
    isNotificationOpen,
    setNotificationOpen,
    unreadCount,
    triggerManualAlert,
    addCustomNotification,
  } = useLayout();

  const { time, date, utc } = useDateTime();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isActionRunning, setIsActionRunning] = useState(false);

  const toggleNotifications = () => {
    setNotificationOpen(!isNotificationOpen);
  };

  const runQuickAction = async (action: string, fallbackSeverity: "Critical" | "High" | "Info") => {
    setIsActionRunning(true);
    setActionFeedback(null);

    // Guarantee default analyst session token exists for API calls
    if (typeof window !== "undefined" && !sessionStorage.getItem("cv_analyst_token")) {
      sessionStorage.setItem("cv_analyst_token", "cv_active_session_token_secops_lead");
    }

    try {
      const res = await apiClient.post("/notifications/simulate", { action });
      const feedbackMsg = res.data?.message || "Security exercise dispatched.";
      setActionFeedback(feedbackMsg);

      if (res.data?.notification) {
        addCustomNotification(res.data.notification);
      } else {
        triggerManualAlert(fallbackSeverity);
      }
    } catch (err) {
      console.log("Quick action backend call failed, running local simulation:", err);
      triggerManualAlert(fallbackSeverity);
      setActionFeedback("Security exercise simulation injected.");
    } finally {
      setIsActionRunning(false);
      setShowQuickActions(false);
      // Auto open notification drawer to display the newly generated security exercise alert
      setNotificationOpen(true);

      // Auto dismiss status message after 4 seconds
      setTimeout(() => {
        setActionFeedback(null);
      }, 4000);
    }
  };

  const handleQuickHunt = () => {
    void runQuickAction("critical_breach", "Critical");
  };

  const handleSimulateAttack = () => {
    void runQuickAction("bruteforce_high", "High");
  };

  const handleNetworkSweep = () => {
    void runQuickAction("network_sweep", "Info");
    setShowQuickActions(false);
  };

  return (
    <header className="z-20 flex items-center justify-between h-20 px-8 border-b border-white/5 bg-[#080c16]/50 backdrop-blur-md">
      {/* Search Input Bar */}
      <div className="hidden md:flex items-center w-96 relative">
        <FiSearch className="absolute left-3 text-slate-400 select-none pointer-events-none" size={16} />
        <input
          type="text"
          placeholder="Search CVEs, IP addresses, hashes, or logs..."
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
      <div className="flex items-center gap-4">
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            disabled={isActionRunning}
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-2 h-10 px-3.5 rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 hover:bg-cyber-cyan/15 hover:border-cyber-cyan/40 text-cyber-cyan text-xs font-semibold tracking-wider transition-all duration-200 select-none shadow-[0_0_15px_rgba(6,182,212,0.05)] cursor-pointer"
          >
            <FiZap className="text-sm animate-pulse" />
            <span>{isActionRunning ? "RUNNING..." : "QUICK ACTIONS"}</span>
            <FiChevronDown className={`transition-transform duration-200 ${showQuickActions ? "rotate-180" : ""}`} />
          </button>
          {actionFeedback && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-cyber-cyan/15 bg-[#08111f] px-3 py-2 text-[10px] text-slate-300 shadow-lg">
              {actionFeedback}
            </div>
          )}

          <AnimatePresence>
            {showQuickActions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickActions(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-[#0f172a]/95 backdrop-blur-md p-1.5 shadow-2xl z-50 text-slate-300"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase border-b border-white/5 select-none">
                    Security Exercises
                  </div>
                  <button
                    disabled={isActionRunning}
                    onClick={handleQuickHunt}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-white/5 hover:text-white transition-colors text-left font-sans cursor-pointer mt-1"
                  >
                    <FiShield className="text-cyber-critical text-sm" />
                    <span>Simulate Critical Breach</span>
                  </button>
                  <button
                    disabled={isActionRunning}
                    onClick={handleSimulateAttack}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-white/5 hover:text-white transition-colors text-left font-sans cursor-pointer"
                  >
                    <FiActivity className="text-cyber-warning text-sm" />
                    <span>Simulate Bruteforce (High)</span>
                  </button>
                  <button
                    disabled={isActionRunning}
                    onClick={handleNetworkSweep}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-xs rounded hover:bg-white/5 hover:text-white transition-colors text-left font-sans cursor-pointer"
                  >
                    <FiCpu className="text-cyber-cyan text-sm" />
                    <span>Trigger Network Sweep</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
              Active Session
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

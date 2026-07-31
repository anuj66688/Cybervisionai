"use client";

import { useLayout } from "./LayoutContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiTrash2,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
  FiShield,
  FiActivity,
  FiClock,
  FiRadio,
} from "react-icons/fi";
import { Notification } from "@/types";

export default function NotificationPanel() {
  const {
    isNotificationOpen,
    setNotificationOpen,
    notifications,
    isLive,
    setIsLive,
    refreshRate,
    setRefreshRate,
    unreadCount,
    markAllAsRead,
    markAsRead,
    clearAll,
  } = useLayout();

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Critical":
        return {
          icon: FiShield,
          bg: "bg-cyber-critical/10",
          border: "border-cyber-critical/30",
          text: "text-cyber-critical",
          glow: "shadow-[0_0_12px_rgba(239,68,68,0.25)]",
        };
      case "High":
        return {
          icon: FiAlertTriangle,
          bg: "bg-cyber-warning/10",
          border: "border-cyber-warning/30",
          text: "text-cyber-warning",
          glow: "shadow-[0_0_12px_rgba(245,158,11,0.25)]",
        };
      case "Warning":
        return {
          icon: FiActivity,
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-500",
          glow: "shadow-[0_0_12px_rgba(245,158,11,0.15)]",
        };
      default:
        return {
          icon: FiInfo,
          bg: "bg-cyber-cyan/10",
          border: "border-cyber-cyan/30",
          text: "text-cyber-cyan",
          glow: "shadow-[0_0_12px_rgba(6,182,212,0.25)]",
        };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "00:00:00";
    }
  };

  return (
    <AnimatePresence>
      {isNotificationOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationOpen(false)}
            className="fixed inset-0 bg-[#000000] z-40"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-[#0b0f19] border-l border-white/5 z-50 flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                  <FiRadio className={`text-cyber-cyan ${isLive ? "animate-pulse" : ""}`} />
                  <span>INCIDENT STREAM</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyber-critical text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                      {unreadCount} NEW
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time cybersecurity warning center</p>
              </div>
              <button
                onClick={() => setNotificationOpen(false)}
                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Stream Settings Controller */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 select-none">
                <span className="text-slate-400 font-medium">Feed Stream:</span>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`px-2 py-1 rounded font-bold cursor-pointer transition-colors ${
                    isLive
                      ? "bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20"
                      : "bg-white/5 text-slate-400 border border-white/5"
                  }`}
                >
                  {isLive ? "LIVE" : "PAUSED"}
                </button>
              </div>

              {isLive && (
                <div className="flex items-center gap-1.5 select-none">
                  <span className="text-slate-400">Interval:</span>
                  {[2000, 4000, 8000].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setRefreshRate(rate)}
                      className={`px-1.5 py-0.5 rounded font-mono font-medium cursor-pointer transition-colors ${
                        refreshRate === rate
                          ? "bg-cyber-blue/20 text-cyber-cyan border border-cyber-blue/30"
                          : "bg-white/5 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {rate / 1000}s
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Toolbar */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between text-xs select-none">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-slate-400 hover:text-cyber-cyan font-medium transition-colors cursor-pointer"
                >
                  <FiCheck />
                  <span>Mark all as read</span>
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-slate-400 hover:text-cyber-critical font-medium transition-colors cursor-pointer"
                >
                  <FiTrash2 />
                  <span>Clear stream log</span>
                </button>
              </div>
            )}

            {/* Notifications Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence initial={false}>
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center p-4"
                  >
                    <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-slate-500 mb-3 animate-pulse">
                      <FiShield size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Stream is Empty</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      No security incidents have been logged. Trigger simulated threats from the Quick Actions menu.
                    </p>
                  </motion.div>
                ) : (
                  notifications.map((notif) => {
                    const styles = getSeverityStyles(notif.severity);
                    const SeverityIcon = styles.icon;

                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 rounded-xl glass-panel border relative transition-all duration-200 group overflow-hidden ${
                          notif.isRead
                            ? "opacity-60 border-white/5 hover:opacity-100"
                            : `${styles.border} ${styles.glow}`
                        }`}
                      >
                        {/* Interactive click helper */}
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            title="Mark as Read"
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyber-cyan/15 hover:border-cyber-cyan/30 text-slate-400 hover:text-cyber-cyan transition-all duration-200 cursor-pointer"
                          >
                            <FiCheck size={10} />
                          </button>
                        )}

                        <div className="flex gap-3">
                          {/* Alert Icon Badge */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styles.bg} ${styles.text}`}>
                            <SeverityIcon size={16} />
                          </div>

                          <div className="flex-1 space-y-1">
                            {/* Card Header metadata */}
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold tracking-wider uppercase ${styles.text}`}>
                                {notif.severity}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <FiClock />
                                {formatTime(notif.timestamp)}
                              </span>
                            </div>

                            {/* Alert Message */}
                            <p className="text-xs font-medium text-white/90 leading-relaxed font-sans pr-4">
                              {notif.message}
                            </p>

                            {/* Extra event tags */}
                            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.03]">
                              <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/5">
                                SRC: {notif.source}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/5">
                                CAT: {notif.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

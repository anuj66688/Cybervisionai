"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import NotificationPanel from "./NotificationPanel";
import { LayoutProvider, useLayout } from "./LayoutContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiShield, FiAlertTriangle, FiX, FiArrowRight, FiRadio } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function LiveToastPopup() {
  const { activeToast, dismissToast, setNotificationOpen } = useLayout();

  if (!activeToast) return null;

  const isCritical = activeToast.severity === "Critical";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-24 right-8 z-50 max-w-md w-full p-4 rounded-xl border backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-start gap-3 select-none ${
          isCritical
            ? "border-cyber-critical/50 bg-[#17080a]/95 text-cyber-critical shadow-[0_0_25px_rgba(239,68,68,0.25)]"
            : "border-cyber-warning/50 bg-[#161208]/95 text-cyber-warning shadow-[0_0_25px_rgba(245,158,11,0.25)]"
        }`}
      >
        {/* Glowing Shield Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isCritical ? "bg-cyber-critical/20 border border-cyber-critical/40" : "bg-cyber-warning/20 border border-cyber-warning/40"
        }`}>
          {isCritical ? <FiShield size={20} className="animate-pulse" /> : <FiAlertTriangle size={20} className="animate-pulse" />}
        </div>

        {/* Live Toast Body */}
        <div className="flex-1 space-y-1 pr-2 font-sans">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
              isCritical ? "bg-cyber-critical/20 border border-cyber-critical/30" : "bg-cyber-warning/20 border border-cyber-warning/30"
            }`}>
              {activeToast.severity} ALERT
            </span>
            <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
              <FiRadio className="text-cyber-cyan animate-ping" />
              {activeToast.source || "NVD Directory API"}
            </span>
          </div>

          <p className="text-xs font-semibold text-white leading-snug">
            {activeToast.message}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/threat-feed"
              onClick={() => {
                dismissToast();
                setNotificationOpen(true);
              }}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-cyber-cyan hover:underline font-mono uppercase tracking-wider"
            >
              <span>INSPECT TELEMETRY</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <FiX size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

function LayoutShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = sessionStorage.getItem("cv_analyst_token");
    const isAuthPage = pathname?.startsWith("/auth");

    if (!token && !isAuthPage) {
      router.replace("/auth/login");
    } else if (token && isAuthPage) {
      router.replace("/");
    }
  }, [pathname, router]);

  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-screen bg-[#050816] text-[#F8FAFC] relative overflow-hidden flex items-center justify-center font-sans antialiased">
        <div className="absolute inset-0 cyber-grid-bg pointer-events-none opacity-45 z-0" />
        <div className="relative z-10 w-full">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050816] text-[#F8FAFC]">
      <div className="absolute inset-0 cyber-grid-bg pointer-events-none opacity-40 z-0" />

      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Interactive Screen Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 relative z-10">
        <Navbar />

        {/* Real-time Live Toast Alert Banner */}
        <LiveToastPopup />

        {/* Nested Page Content with Responsive Padding */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8 relative">
          {children}
        </main>
      </div>

      {/* Collapsible Right-hand Incident Log Panel */}
      <NotificationPanel />
    </div>
  );
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <LayoutShellInner>{children}</LayoutShellInner>
    </LayoutProvider>
  );
}

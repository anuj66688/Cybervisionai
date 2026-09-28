"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "./LayoutContext";
import {
  FiTrendingUp,
  FiShield,
  FiActivity,
  FiDatabase,
  FiGlobe,
  FiClock,
  FiFileText,
  FiBookmark,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
} from "react-icons/fi";
import { RiRadarLine } from "react-icons/ri";

const MENU_ITEMS = [
  { name: "Dashboard", href: "/", icon: FiTrendingUp },
  { name: "Live Threat Feed", href: "/threat-feed", icon: FiShield, badge: "LIVE" },
  { name: "Threat Analytics", href: "/threat-analytics", icon: FiActivity },
  { name: "MITRE Matrix", href: "/mitre-matrix", icon: FiGrid, badge: "NEW" },
  { name: "CVE Explorer", href: "/cve-explorer", icon: FiDatabase },
  { name: "Threat Map", href: "/threat-map", icon: FiGlobe },
  { name: "Threat Timeline", href: "/threat-timeline", icon: FiClock },
  { name: "Reports", href: "/reports", icon: FiFileText },
  { name: "Bookmarks", href: "/bookmarks", icon: FiBookmark },
];

const FOOTER_ITEMS = [
  { name: "Profile", href: "/profile", icon: FiUser },
  { name: "Settings", href: "/settings", icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed } = useLayout();

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <motion.aside
      className="z-30 flex flex-col h-screen shrink-0 border-r border-white/5 bg-[#0b0f19]/80 backdrop-blur-xl relative transition-all duration-300"
      animate={{ width: isSidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Sidebar Header / Logo */}
      <div className="flex items-center h-20 px-6 border-b border-white/5 overflow-hidden">
        <Link href="/" className="flex items-center gap-3 select-none">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyber-blue/10 border border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0">
            <RiRadarLine className="text-xl animate-spin [animation-duration:12s]" />
            <div className="absolute w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
          </div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-display font-semibold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyber-cyan bg-clip-text text-transparent truncate"
              >
                CyberVision <span className="text-cyber-cyan text-xs font-bold font-sans px-1 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/20 ml-1">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-24 -right-3 flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-[#0f172a] text-slate-400 hover:text-white hover:border-cyber-cyan/50 hover:bg-cyber-bg transition-all duration-200"
      >
        {isSidebarCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>

      {/* Scrollable Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative block">
              <div
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all group duration-200 select-none ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {/* Active Backdrop Highlight */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavLink"
                    className="absolute inset-0 rounded-lg bg-cyber-blue/10 border-l-[3px] border-cyber-cyan shadow-[inset_1px_0_12px_rgba(6,182,212,0.1)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className={`relative z-10 shrink-0 ${isActive ? "text-cyber-cyan" : "group-hover:text-cyber-cyan transition-colors"}`}>
                  <Icon size={18} />
                </div>

                <AnimatePresence mode="popLayout">
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="relative z-10 font-sans truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Optional Badge */}
                {item.badge && !isSidebarCollapsed && (
                  <span className="relative z-10 ml-auto px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-[#050816] bg-cyber-cyan rounded shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-white/5 space-y-1.5 bg-[#080c16]/50">
        {FOOTER_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative block">
              <div
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavLink"
                    className="absolute inset-0 rounded-lg bg-cyber-blue/10 border-l-[3px] border-cyber-cyan shadow-[inset_1px_0_12px_rgba(6,182,212,0.1)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className={`relative z-10 shrink-0 ${isActive ? "text-cyber-cyan" : "group-hover:text-cyber-cyan transition-colors"}`}>
                  <Icon size={18} />
                </div>

                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="relative z-10 font-sans truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}

        {/* Logout Action */}
        <button
          onClick={() => {
            if (confirm("Are you sure you want to terminate this analyst session?")) {
              sessionStorage.removeItem("cv_analyst_token");
              window.location.href = "/auth/login";
            }
          }}
          className="flex w-full items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-cyber-critical hover:bg-cyber-critical/5 transition-all group duration-200 select-none text-left cursor-pointer"
        >
          <div className="shrink-0 group-hover:text-cyber-critical transition-colors">
            <FiLogOut size={18} />
          </div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-sans truncate"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

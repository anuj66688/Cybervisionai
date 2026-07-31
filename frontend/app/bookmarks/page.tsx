"use client";

import { Severity } from "@/types";
import { FiBookmark, FiShield, FiArrowRight, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api";

export default function BookmarksPage() {
  const [bookmarkedThreats, setBookmarkedThreats] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get("/threats/bookmarks")
      .then((res) => {
        if (res.data) {
          setBookmarkedThreats(res.data);
        }
      })
      .catch((err) => console.log("Bookmarks fetch error:", err));
  }, []);

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case "Critical":
        return "bg-cyber-critical/15 text-cyber-critical border border-cyber-critical/30";
      case "High":
        return "bg-cyber-warning/15 text-cyber-warning border border-cyber-warning/30";
      default:
        return "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30";
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl lg:text-2xl font-bold font-display text-white tracking-wide flex items-center gap-2">
          <FiBookmark className="text-cyber-cyan" />
          <span>Watched Security Indicators</span>
        </h1>
        <p className="text-xs text-slate-400">
          Vulnerability profiles flagged for continuous threat hunting audits and perimeter scanning check-loops.
        </p>
      </div>

      {/* Bookmarks Warning Banner */}
      <div className="p-4 rounded-xl border border-cyber-cyan/20 bg-cyber-cyan/5 flex items-start gap-3">
        <FiInfo className="text-cyber-cyan mt-0.5 shrink-0" size={16} />
        <div className="text-xs text-slate-300 leading-relaxed font-sans">
          Profiles listed below are auto-monitored. Threat intelligence agents will issue real-time SMS pager alarms if new exploit signatures matching these assets bypass firewall perimeters.
        </div>
      </div>

      {/* List Grid */}
      <div className="space-y-3">
        {bookmarkedThreats.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl text-slate-500 font-mono">
            <FiBookmark className="mx-auto mb-2 text-xl text-slate-600 animate-pulse" />
            NO FLAGGED ASSET WATCHERS ACTIVE
          </div>
        ) : (
          bookmarkedThreats.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-cyber-cyan/30 transition-all duration-200 flex items-center justify-between"
            >
              <div className="space-y-1 pr-6 truncate">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-cyber-cyan">{t.cve}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${getSeverityBadge(t.severity)}`}>
                    {t.severity}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">CVSS {t.cvssScore.toFixed(1)}</span>
                </div>
                <h4 className="text-xs font-semibold text-white font-display truncate">
                  {t.vendor} {t.product} - {t.threatType}
                </h4>
              </div>

              <Link
                href={`/threat/${t.id}`}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded border border-white/10 text-slate-400 hover:text-white hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5 transition-colors cursor-pointer"
              >
                <FiArrowRight size={14} />
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { MOCK_THREATS } from "@/utils/mockThreats";
import { Severity } from "@/types";
import {
  FiClock,
  FiShield,
  FiAlertTriangle,
  FiInfo,
  FiTerminal,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api";

export default function ThreatTimelinePage() {
  const [threats, setThreats] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get("/threats")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setThreats(res.data);
        }
      })
      .catch((err) => console.log("Threat timeline load error:", err));
  }, []);

  // Sort threats by date / timestamp
  const sortedThreats = [...threats].sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate)
  );

  const getTimelineIcon = (sev: Severity) => {
    switch (sev) {
      case "Critical":
        return {
          icon: FiShield,
          bg: "bg-cyber-critical/10 border-cyber-critical/30 text-cyber-critical shadow-[0_0_12px_rgba(239,68,68,0.25)]",
        };
      case "High":
        return {
          icon: FiAlertTriangle,
          bg: "bg-cyber-warning/10 border-cyber-warning/30 text-cyber-warning shadow-[0_0_12px_rgba(245,158,11,0.25)]",
        };
      case "Warning":
        return {
          icon: FiAlertTriangle,
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-500",
        };
      default:
        return {
          icon: FiInfo,
          bg: "bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_12px_rgba(6,182,212,0.25)]",
        };
    }
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case "Critical":
        return "bg-cyber-critical/15 text-cyber-critical border border-cyber-critical/30";
      case "High":
        return "bg-cyber-warning/15 text-cyber-warning border border-cyber-warning/30";
      case "Warning":
        return "bg-amber-500/15 text-amber-500 border border-amber-500/30";
      default:
        return "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30";
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl lg:text-2xl font-bold font-display text-white tracking-wide flex items-center gap-2">
          <FiClock className="text-cyber-cyan" />
          <span>Security Incident Timeline</span>
        </h1>
        <p className="text-xs text-slate-400">
          Chronological breakdown of CVE detections, auditor diagnostics, and patch deployment cycles.
        </p>
      </div>

      {/* Main Vertical Timeline Container */}
      <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-8 py-2">
        {sortedThreats.map((threat, index) => {
          const ui = getTimelineIcon(threat.severity);
          const TimelineIcon = ui.icon;

          return (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="relative group"
            >
              {/* Pulsing Dot Axis anchor */}
              <span className={`absolute -left-[32.5px] sm:-left-[40.5px] top-1.5 w-7 h-7 rounded-lg border flex items-center justify-center bg-[#050816] ${ui.bg}`}>
                <TimelineIcon size={14} className="animate-pulse" />
              </span>

              {/* Event card details */}
              <div className="p-5 rounded-2xl glass-panel border border-white/5 group-hover:border-cyber-cyan/20 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.05)] transition-all duration-300 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyber-cyan tracking-wider">
                      {threat.cve}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getSeverityBadge(threat.severity)}`}>
                      {threat.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Ingest Source: {threat.source}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <FiClock />
                    {threat.publishedDate}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-white font-display">
                    {threat.vendor} {threat.product} - {threat.threatType}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                    {threat.summary}
                  </p>
                </div>

                {/* Footer options */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]">
                  <span className="text-[9px] font-mono text-slate-500">
                    CVSS SCORE: <strong className="text-slate-300 font-bold">{threat.cvssScore.toFixed(1)}</strong>
                  </span>
                  
                  <Link
                    href={`/threat/${threat.id}`}
                    className="flex items-center gap-1 text-[10px] font-bold text-cyber-cyan hover:underline hover:text-white transition-colors"
                  >
                    <span>DRILLDOWN INCIDENT</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

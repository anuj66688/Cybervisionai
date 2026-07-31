"use client";

import ChartCard from "@/components/charts/ChartCard";
import SeverityDistributionChart from "@/components/charts/SeverityDistributionChart";
import VendorAnalysisChart from "@/components/charts/VendorAnalysisChart";
import AttackCategoriesChart from "@/components/charts/AttackCategoriesChart";
import ThreatTrendChart from "@/components/charts/ThreatTrendChart";
import { FiActivity, FiShield, FiCpu, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ThreatAnalyticsPage() {
  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl lg:text-2xl font-bold font-display text-white tracking-wide flex items-center gap-2">
          <FiActivity className="text-cyber-cyan" />
          <span>Threat Telemetry Analytics</span>
        </h1>
        <p className="text-xs text-slate-400">
          In-depth diagnostics on incident counts, severity clusters, and vendor correlation metrics.
        </p>
      </div>

      {/* Analytics Summary Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-cyber-cyan tracking-wider font-mono">
            <FiCpu className="animate-spin [animation-duration:6s]" />
            <span>SIEM INGESTION RATE</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">41.8k <span className="text-xs text-slate-400 font-sans font-medium">EPS</span></div>
          <p className="text-[10px] text-slate-500">Events Per Second incoming flow. Buffer rate: 0.04%.</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-cyber-success tracking-wider font-mono">
            <FiShield />
            <span>SECURITY HEALTH SCORE</span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyber-success">98.2 / 100</div>
          <p className="text-[10px] text-slate-500">Corporate risk parameter computed on active assets.</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-cyber-warning tracking-wider font-mono">
            <FiTrendingUp />
            <span>AVG RECONNAISSANCE DELAY</span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyber-warning">4.2 min</div>
          <p className="text-[10px] text-slate-500">Mean time from initial packet sweep to policy block.</p>
        </div>
      </div>

      {/* Interactive Charts Matrix Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <ChartCard title="Security Telemetry Streams" subtitle="Ingestion Timelines">
          <ThreatTrendChart />
        </ChartCard>

        <ChartCard title="Categorized Vulnerabilities" subtitle="Exploit Types">
          <AttackCategoriesChart />
        </ChartCard>

        <ChartCard title="Active Incident Severities" subtitle="Priority Distributions">
          <SeverityDistributionChart />
        </ChartCard>

        <ChartCard title="Affected Enterprise Vendors" subtitle="Vendor Alerts Weight">
          <VendorAnalysisChart />
        </ChartCard>
      </motion.div>
    </div>
  );
}

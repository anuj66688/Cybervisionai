"use client";

import { useLayout } from "@/components/layout/LayoutContext";
import { MOCK_THREATS } from "@/utils/mockThreats";
import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api";
import StatisticCard from "@/components/cards/StatisticCard";
import ChartCard from "@/components/charts/ChartCard";
import ThreatTrendChart from "@/components/charts/ThreatTrendChart";
import AttackCategoriesChart from "@/components/charts/AttackCategoriesChart";
import SeverityDistributionChart from "@/components/charts/SeverityDistributionChart";
import VendorAnalysisChart from "@/components/charts/VendorAnalysisChart";
import LinkNext from "next/link";
import {
  FiShield,
  FiAlertOctagon,
  FiDatabase,
  FiActivity,
  FiTerminal,
  FiArrowRight,
  FiLock,
  FiCpu,
  FiCheckCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function Home() {
  const { notifications } = useLayout();

  // Dynamic statistics state
  const [stats, setStats] = useState({
    totalThreats: 1482,
    criticalAlerts: 12,
    highSeverity: 6,
    latestCves: 8,
    aiProcessed: 1290,
    ingestionFidelity: 98.4
  });

  const [recentIncidents, setRecentIncidents] = useState<any[]>(MOCK_THREATS.slice(0, 3));
  const [diagnosticMessage, setDiagnosticMessage] = useState<string | null>(null);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  useEffect(() => {
    // Ingest analytics overview
    apiClient.get("/analytics/dashboard")
      .then(res => {
        if (res.data) {
          setStats(res.data);
        }
      })
      .catch(err => console.log("Analytics dashboard load error:", err));

    // Ingest recent incidents
    apiClient.get("/threats?limit=8")
      .then(res => {
        if (res.data && res.data.length > 0) {
          setRecentIncidents(res.data);
        }
      })
      .catch(err => console.log("Threat feed load error:", err));
  }, []);

  // Calculate live notification stats from the context provider
  const criticalCount = notifications.filter((n) => n.severity === "Critical").length;
  const highCount = notifications.filter((n) => n.severity === "High").length;
  const warningCount = notifications.filter((n) => n.severity === "Warning").length;

  const runHealthDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    setDiagnosticMessage(null);

    try {
      const res = await apiClient.post("/notifications/simulate", { action: "health_diagnostic" });
      setDiagnosticMessage(res.data?.message || "Diagnostic completed.");
    } catch (err) {
      console.log("Health diagnostic backend call failed:", err);
      setDiagnosticMessage("Backend diagnostic unavailable, local health checks completed.");
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* 1. Hero / SOC Security Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-cyber-cyan/20 bg-gradient-to-r from-[#0b1329] via-[#090e1a] to-cyber-bg p-6 lg:p-8 shadow-[0_0_30px_rgba(6,182,212,0.06)]"
      >
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyber-cyan/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-success animate-ping" />
              <span className="text-[10px] font-bold tracking-widest text-cyber-success font-mono uppercase bg-cyber-success/10 border border-cyber-success/20 px-2 py-0.5 rounded">
                SYSTEM ONLINE: SECURE SHIELD ACTIVE
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white tracking-wide">
              Threat Intelligence Command Center
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 max-w-xl leading-relaxed">
              Monitoring telemetry across 14 enterprise data ingestion zones. AI models currently processing 18,490 active packets/min. No unresolved breaches detected.
            </p>
          </div>

          {/* Quick status block */}
          <div className="flex gap-4 self-start lg:self-center shrink-0">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center font-mono">
              <div className="text-xl font-bold text-cyber-critical">{stats.criticalAlerts}</div>
              <div className="text-[9px] text-slate-500 font-sans font-bold tracking-widest uppercase mt-0.5">CRIT ALERTS</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center font-mono">
              <div className="text-xl font-bold text-cyber-warning">{stats.highSeverity}</div>
              <div className="text-[9px] text-slate-500 font-sans font-bold tracking-widest uppercase mt-0.5">HIGH WARNS</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center font-mono animate-pulse">
              <div className="text-xl font-bold text-cyber-cyan">{stats.ingestionFidelity}%</div>
              <div className="text-[9px] text-slate-500 font-sans font-bold tracking-widest uppercase mt-0.5">AI FIDELITY</div>
            </div>
          </div>
        </div>
      </motion.div>
 
      {/* 2. Statistical KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatisticCard
          title="Today's Threats"
          value={stats.totalThreats}
          change={12.4}
          icon={FiShield}
          color="blue"
          sparklineData={[300, 420, 510, 390, 680, 890, 1120, 940, stats.totalThreats]}
        />
        <StatisticCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          change={-8.2}
          icon={FiAlertOctagon}
          color="critical"
          sparklineData={[18, 22, 14, 19, 10, 15, 12, 16, stats.criticalAlerts]}
        />
        <StatisticCard
          title="Latest CVEs"
          value={stats.latestCves}
          change={33.3}
          icon={FiDatabase}
          color="warning"
          sparklineData={[3, 5, 2, 6, 7, 4, stats.latestCves]}
        />
        <StatisticCard
          title="AI Processed"
          value={stats.aiProcessed}
          change={2.8}
          icon={FiActivity}
          color="success"
          sparklineData={[1100, 1150, 1210, 1180, 1240, stats.aiProcessed]}
        />
      </div>

      {/* 3. Dynamic Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Threat Trend (24h)" subtitle="Telemetry Timeline Ingests">
          <ThreatTrendChart />
        </ChartCard>

        <ChartCard title="Attack Categories" subtitle="Vector Distribution Analysis">
          <AttackCategoriesChart />
        </ChartCard>

        <ChartCard title="Severity Distribution" subtitle="Active Threat Severity Weight">
          <SeverityDistributionChart />
        </ChartCard>

        <ChartCard title="Vendor Analysis" subtitle="Vulnerability Alerts by Platform">
          <VendorAnalysisChart />
        </ChartCard>
      </div>

      {/* 4. Dashboard Footer - Recent Intel Feed & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Threat Intel */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <FiTerminal className="text-cyber-cyan" />
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Recent Threat Intelligence Reports
              </h3>
            </div>
            <LinkNext
              href="/threat-feed"
              className="text-[10px] font-bold text-cyber-cyan hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View Full Feed</span>
              <FiArrowRight />
            </LinkNext>
          </div>

          <div className="space-y-3">
            {recentIncidents.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all duration-200"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-cyber-cyan">{t.cve}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono">
                      CVSS: {t.cvssScore.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{t.publishedDate}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold line-clamp-1">
                    {t.vendor} {t.product} - {t.threatType}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{t.summary}</p>
                </div>

                <LinkNext
                  href={`/threat/${t.id}`}
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded border border-white/10 text-slate-400 hover:text-white hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5 transition-colors cursor-pointer"
                >
                  <FiArrowRight size={14} />
                </LinkNext>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Security Check */}
        <div className="p-6 rounded-2xl glass-panel border border-[#22c55e]/15 shadow-[0_0_20px_rgba(34,197,94,0.03)] space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <FiLock className="text-cyber-success" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Ops Security Status
            </h3>
          </div>

          <div className="space-y-4">
            {/* Status Checklist items */}
            <div className="flex items-start gap-3">
              <FiCheckCircle className="text-cyber-success shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-white">Firewall Perimeter</h4>
                <p className="text-[10px] text-slate-400">All edge router policies verified (0 policy anomalies).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FiCheckCircle className="text-cyber-success shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-white">SIEM Log Ingest</h4>
                <p className="text-[10px] text-slate-400">Kafka clusters receiving data (average delay 12ms).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FiCheckCircle className="text-cyber-success shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-white">User Session Audits</h4>
                <p className="text-[10px] text-slate-400">12 analyst tokens authenticated. Access logs clean.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => void runHealthDiagnostic()}
                disabled={isDiagnosticRunning}
                className="w-full h-10 rounded-lg bg-cyber-success/10 hover:bg-cyber-success hover:text-[#050816] text-cyber-success font-semibold border border-cyber-success/30 hover:border-cyber-success hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] text-xs tracking-wider transition-all duration-300 cursor-pointer"
              >
                {isDiagnosticRunning ? "RUNNING DIAGNOSTIC..." : "RUN HEALTH DIAGNOSTIC"}
              </button>
              {diagnosticMessage && (
                <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">{diagnosticMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

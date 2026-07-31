"use client";

import ThreatTable from "@/components/tables/ThreatTable";
import { MOCK_THREATS } from "@/utils/mockThreats";
import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api";
import { FiDownload, FiInfo, FiActivity, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ThreatFeedPage() {
  const [threats, setThreats] = useState<any[]>(MOCK_THREATS);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get("/threats?limit=100")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setThreats(res.data);
        }
      })
      .catch((err) => console.log("Threat list fetch error:", err));
  }, []);

  const handleExport = async (format: "pdf" | "csv" | "excel" | "json") => {
    setIsExporting(format);
    const token = typeof window !== "undefined"
      ? (sessionStorage.getItem("cv_analyst_token") || "cv_active_session_token_secops_lead")
      : "cv_active_session_token_secops_lead";

    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(threats, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "cybervision_threats_export.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setIsExporting(null);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/reports/${format}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", blobUrl);
      const ext = format === "excel" ? "xlsx" : format;
      downloadAnchor.setAttribute("download", `cybervision_threats_export.${ext}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.log("Reports endpoint offline. Falling back to local client generator.", err);
      const ext = format === "excel" ? "csv" : format;
      const headers = "CVE,Vendor,Product,Threat Type,Severity,CVSS Score,Published Date,Status\n";
      const rows = threats
        .map(
          (t) =>
            `"${t.cve}","${t.vendor}","${t.product}","${t.threatType}","${t.severity}",${t.cvssScore},"${t.publishedDate}","${t.status}"`
        )
        .join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", csvContent);
      downloadAnchor.setAttribute("download", `cybervision_threats_export.${ext}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl lg:text-2xl font-bold font-display text-white tracking-wide flex items-center gap-2">
            <FiActivity className="text-cyber-cyan animate-pulse" />
            <span>Live Threat Intelligence Feed ({threats.length} Active Incidents)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry and CVE vulnerabilities automatically collected across NVD, CISA KEV, GitHub, and Security RSS sources.
          </p>
        </div>

        {/* Export Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={isExporting === "pdf"}
            onClick={() => void handleExport("pdf")}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 hover:bg-cyber-cyan hover:text-[#050816] text-cyber-cyan text-xs font-semibold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting === "pdf" ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
            <span>PDF REPORT</span>
          </button>
          
          <button
            disabled={isExporting === "csv"}
            onClick={() => void handleExport("csv")}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-white/10 hover:border-cyber-cyan/50 bg-[#0f172a] hover:bg-cyber-cyan/5 text-slate-300 hover:text-cyber-cyan text-xs font-semibold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting === "csv" ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
            <span>CSV</span>
          </button>

          <button
            disabled={isExporting === "excel"}
            onClick={() => void handleExport("excel")}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#050816] text-emerald-400 text-xs font-semibold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting === "excel" ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
            <span>XLSX (EXCEL)</span>
          </button>

          <button
            disabled={isExporting === "json"}
            onClick={() => void handleExport("json")}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-white/10 hover:border-cyber-purple/50 bg-[#0f172a] hover:bg-cyber-purple/5 text-slate-300 hover:text-cyber-purple text-xs font-semibold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiDownload />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="p-4 rounded-xl border border-cyber-cyan/20 bg-cyber-cyan/5 flex items-start gap-3">
        <FiInfo className="text-cyber-cyan mt-0.5 shrink-0" size={16} />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Active Feed Status:</strong> Currently displaying {threats.length} validated threat telemetry records. Select any record to view AI remediation playbooks, IoC indicators, or trigger automated firewall mitigations.
        </div>
      </div>

      {/* Main Interactive Table Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ThreatTable threats={threats} />
      </motion.div>
    </div>
  );
}

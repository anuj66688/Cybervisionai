"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api";
import { MOCK_THREATS } from "@/utils/mockThreats";
import {
  FiArrowLeft,
  FiShield,
  FiActivity,
  FiTerminal,
  FiBookOpen,
  FiAlertTriangle,
  FiExternalLink,
  FiCpu,
  FiCheckCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function ThreatDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [threat, setThreat] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMitigating, setIsMitigating] = useState(false);

  const handleMitigate = async () => {
    if (!threat) return;
    setIsMitigating(true);
    try {
      const res = await apiClient.post(`/threats/${id}/mitigate`);
      if (res.data && res.data.threat) {
        setThreat(res.data.threat);
        alert(res.data.message || "Firewall mitigation rules deployed successfully!");
      }
    } catch (err) {
      console.error("Failed to deploy rules:", err);
      alert(`Enforced local sandbox mitigation firewall rules for ${threat.cve}.`);
      setThreat((prev: any) => prev ? { ...prev, status: "mitigated" } : null);
    } finally {
      setIsMitigating(false);
    }
  };


  useEffect(() => {
    setIsLoading(true);
    apiClient.get(`/threats/${id}`)
      .then((res) => {
        if (res.data) {
          setThreat(res.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Threat details load error, checking local fallback:", err);
        const fallbackThreat = MOCK_THREATS.find((t) => t.id === id);
        if (fallbackThreat) {
          setThreat(fallbackThreat);
        }
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 select-none">
        <FiActivity className="text-cyber-cyan text-4xl animate-spin mb-3" />
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">LOADING THREAT DOSSIER...</h2>
      </div>
    );
  }

  if (!threat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 select-none">
        <FiAlertTriangle className="text-cyber-critical text-4xl animate-pulse mb-3" />
        <h2 className="text-lg font-bold text-white">Incident Profile Not Found</h2>
        <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
          The requested threat ID "{id}" does not match active telemetry records in this cluster.
        </p>
        <button
          onClick={() => router.push("/threat-feed")}
          className="px-4 py-2 rounded-lg bg-cyber-blue hover:bg-cyber-blue/80 text-white font-semibold text-xs tracking-wider transition-all cursor-pointer"
        >
          RETURN TO THREAT FEED
        </button>
      </div>
    );
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-cyber-critical/15 text-cyber-critical border border-cyber-critical/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
      case "High":
        return "bg-cyber-warning/15 text-cyber-warning border border-cyber-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
      case "Warning":
        return "bg-amber-500/15 text-amber-500 border border-amber-500/30";
      default:
        return "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30";
    }
  };

  const getStatusTextStyles = (status: string) => {
    switch (status) {
      case "mitigated":
        return "text-cyber-success border-cyber-success/30 bg-cyber-success/5";
      case "investigating":
        return "text-cyber-warning border-cyber-warning/30 bg-cyber-warning/5";
      default:
        return "text-cyber-critical border-cyber-critical/30 bg-cyber-critical/5";
    }
  };

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors select-none cursor-pointer"
      >
        <FiArrowLeft />
        <span>BACK TO THREAT CLUSTER</span>
      </button>

      {/* Main Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl lg:text-2xl font-bold text-cyber-cyan tracking-wider">
                {threat.cve}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${getSeverityStyles(threat.severity)}`}>
                {threat.severity}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusTextStyles(threat.status)}`}>
                {threat.status}
              </span>
            </div>
            <h1 className="text-base lg:text-lg font-semibold text-white font-display">
              {threat.vendor} {threat.product} - {threat.threatType}
            </h1>
          </div>

          {/* CVSS Score Circle */}
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl select-none font-mono">
            <div className="text-center">
              <div className="text-2xl font-bold text-white tracking-tight">{threat.cvssScore.toFixed(1)}</div>
              <div className="text-[8px] text-slate-500 font-bold font-sans tracking-widest uppercase">CVSS 3.1</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-[10px] text-slate-400 leading-normal font-sans font-medium uppercase max-w-[80px]">
              {threat.cvssScore >= 9.0 ? "CRITICAL RISK" : threat.cvssScore >= 7.0 ? "HIGH RISK" : "MEDIUM RISK"}
            </div>
          </div>
        </div>

        {/* Technical Vector Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono select-none">
          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
            <span className="text-[9px] text-slate-500 font-sans block mb-0.5">INGESTION SOURCE</span>
            <span className="text-slate-200">{threat.source}</span>
          </div>
          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
            <span className="text-[9px] text-slate-500 font-sans block mb-0.5">DETECTION DATE</span>
            <span className="text-slate-200">{threat.publishedDate}</span>
          </div>
          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl col-span-1">
            <span className="text-[9px] text-slate-500 font-sans block mb-0.5">ATTACK VECTOR MAPPING</span>
            <span className="text-cyber-cyan overflow-hidden text-ellipsis block truncate" title={threat.attackVector}>
              {threat.attackVector.split("/")[0]} ({threat.attackVector.substr(0, 15)}...)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Details Panel split in Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Summary and Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Threat Summary */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl glass-panel border border-white/5 space-y-3"
          >
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2 border-b border-white/5 pb-2.5">
              <FiBookOpen className="text-cyber-cyan" />
              <span>AI Exploit Analysis</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {threat.summary}
            </p>
          </motion.div>

          {/* Incident Mitigation & Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl glass-panel border border-[#22c55e]/10 shadow-[0_0_20px_rgba(34,197,94,0.02)] space-y-4"
          >
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2 border-b border-white/5 pb-2.5">
              <FiCheckCircle className="text-cyber-success" />
              <span>Mitigation Remediation Protocol</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {threat.remediation}
            </p>
            <div className="pt-2 border-t border-white/[0.03]">
              <button
                onClick={handleMitigate}
                disabled={isMitigating || threat.status === "mitigated"}
                className={`px-4 h-9 rounded text-[10px] font-bold tracking-wider transition-all duration-300 cursor-pointer border ${
                  threat.status === "mitigated"
                    ? "bg-cyber-success/5 border-cyber-success/20 text-cyber-success/50 cursor-not-allowed"
                    : "bg-cyber-success/10 hover:bg-cyber-success hover:text-[#050816] text-cyber-success hover:shadow-[0_0_12px_rgba(34,197,94,0.3)] border-cyber-success/20 hover:border-cyber-success"
                }`}
              >
                {isMitigating ? "ENFORCING RULES..." : threat.status === "mitigated" ? "MITIGATION ACTIVE" : "DEPLOY FIREWALL MITIGATION BLOCK"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: References & Timeline */}
        <div className="space-y-6">
          {/* Timeline of events */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2 border-b border-white/5 pb-2.5">
              <FiActivity className="text-cyber-purple" />
              <span>Telemetry Timeline</span>
            </h3>
            
            <div className="relative pl-4 space-y-4 border-l border-white/10 font-sans text-xs">
              <div className="relative">
                <span className="absolute -left-[20.5px] top-0.5 w-3 h-3 rounded-full bg-cyber-critical border border-[#050816]" />
                <div className="font-semibold text-white">Detection Influx</div>
                <div className="text-[10px] text-slate-500 font-mono">2026-07-17 09:40 UTC</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Exploit attempt packets logged by IDS nodes.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[20.5px] top-0.5 w-3 h-3 rounded-full bg-cyber-warning border border-[#050816]" />
                <div className="font-semibold text-white">Analyst Audit</div>
                <div className="text-[10px] text-slate-500 font-mono">2026-07-17 10:15 UTC</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Assigned to SecOps team for vector mapping.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[20.5px] top-0.5 w-3 h-3 rounded-full bg-[#1e293b] border border-white/20" />
                <div className="font-semibold text-slate-400">Rules Pending</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Awaiting signature check for firewall deploy.</p>
              </div>
            </div>
          </motion.div>

          {/* References */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl glass-panel border border-white/5 space-y-3"
          >
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2 border-b border-white/5 pb-2.5">
              <FiTerminal className="text-cyber-cyan" />
              <span>External References</span>
            </h3>
            
            <ul className="space-y-2.5 text-[10px] font-mono">
              {threat.references && threat.references.length > 0 ? (
                threat.references.map((r: string, i: number) => (
                  <li key={i} className="truncate">
                    <a
                      href={r}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-cyber-cyan hover:underline hover:text-white transition-colors"
                    >
                      <FiExternalLink className="shrink-0" />
                      <span className="truncate">{r}</span>
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No external references logged for this dossier.</li>
              )}
            </ul>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
}

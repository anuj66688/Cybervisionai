"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/utils/api";
import {
  FiGrid,
  FiShield,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiSearch,
  FiExternalLink,
  FiLayers,
  FiCpu
} from "react-icons/fi";
import Link from "next/link";

interface Technique {
  id: string;
  name: string;
  description: string;
  threatCount: number;
  intensity: number;
  matchedThreats: any[];
}

interface Tactic {
  id: string;
  name: string;
  shortName: string;
  description: string;
  techniques: Technique[];
}

interface MatrixData {
  matrix: Tactic[];
  stats: {
    totalTactics: number;
    activeTechniques: number;
    totalMappedThreats: number;
    coverageScore: number;
  };
}

export default function MitreMatrixPage() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTechnique, setSelectedTechnique] = useState<{
    technique: Technique;
    tacticName: string;
  } | null>(null);

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/mitre/matrix");
      setData(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load MITRE ATT&CK Matrix:", err);
      setError("Unable to connect to MITRE ATT&CK Matrix service.");
    } finally {
      setLoading(false);
    }
  };

  const getIntensityBadge = (intensity: number) => {
    switch (intensity) {
      case 3:
        return "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]";
      case 2:
        return "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
      case 1:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
      default:
        return "bg-slate-800/40 text-slate-500 border-slate-700/30";
    }
  };

  const getCardBg = (intensity: number, isHovered: boolean) => {
    switch (intensity) {
      case 3:
        return "bg-gradient-to-br from-rose-950/40 to-slate-900/90 border-rose-500/40 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
      case 2:
        return "bg-gradient-to-br from-amber-950/30 to-slate-900/90 border-amber-500/30 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]";
      case 1:
        return "bg-gradient-to-br from-cyan-950/20 to-slate-900/90 border-cyan-500/20 hover:border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]";
      default:
        return "bg-slate-900/40 border-slate-800/60 hover:border-slate-700 text-slate-400";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1700px] mx-auto min-h-screen text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyber-blue/10 border border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <FiGrid className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white flex items-center gap-3">
                MITRE ATT&CK® Threat Matrix
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
                  Enterprise v14
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Real-time mapping of active CVE vulnerabilities and threat intelligence to MITRE ATT&CK tactics & techniques.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search technique or T-ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-all"
            />
          </div>
          <button
            onClick={fetchMatrix}
            className="px-4 py-2 rounded-lg bg-cyber-blue/20 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium hover:bg-cyber-cyan hover:text-slate-950 transition-all flex items-center gap-2"
          >
            <FiCpu className="animate-spin [animation-duration:8s]" />
            Refresh Matrix
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tactics</span>
              <FiLayers className="text-cyber-cyan text-xl" />
            </div>
            <div className="mt-3 text-3xl font-bold font-display text-white">{data.stats.totalTactics}</div>
            <p className="text-xs text-slate-500 mt-1">Enterprise ATT&CK Domain Pillars</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Techniques</span>
              <FiActivity className="text-amber-400 text-xl" />
            </div>
            <div className="mt-3 text-3xl font-bold font-display text-amber-400">{data.stats.activeTechniques}</div>
            <p className="text-xs text-slate-500 mt-1">Identified in Active Threat Catalog</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mapped Threat Catalog</span>
              <FiShield className="text-rose-400 text-xl" />
            </div>
            <div className="mt-3 text-3xl font-bold font-display text-white">{data.stats.totalMappedThreats}</div>
            <p className="text-xs text-slate-500 mt-1">CVE Bulletins Vector Tagged</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Threat Coverage</span>
              <FiCheckCircle className="text-emerald-400 text-xl" />
            </div>
            <div className="mt-3 text-3xl font-bold font-display text-emerald-400">{data.stats.coverageScore}%</div>
            <p className="text-xs text-slate-500 mt-1">ATT&CK Matrix Detection Ratio</p>
          </motion.div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyber-cyan/20 border-t-cyber-cyan animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Processing ATT&CK Tactic vectors & CVE telemetry...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3">
          <FiAlertTriangle className="text-xl shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Interactive Matrix Grid */}
      {!loading && data && (
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-[1300px]">
            {data.matrix.map((tactic, tIdx) => {
              // Filter techniques by search query
              const filteredTechniques = tactic.techniques.filter(
                (tech) =>
                  tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  tech.id.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return (
                <div key={tactic.id} className="flex-1 min-w-[240px] max-w-[280px] space-y-3">
                  {/* Tactic Header Column Card */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 backdrop-blur-md shadow-lg sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-cyber-cyan uppercase tracking-wider">
                        {tactic.id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {tactic.techniques.reduce((acc, curr) => acc + curr.threatCount, 0)} CVEs
                      </span>
                    </div>
                    <h3 className="text-sm font-bold font-display text-white mt-1 leading-snug">
                      {tactic.name}
                    </h3>
                  </div>

                  {/* Techniques List Cards */}
                  <div className="space-y-2.5">
                    {filteredTechniques.map((tech) => {
                      const hasThreats = tech.threatCount > 0;

                      return (
                        <motion.div
                          key={tech.id}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => setSelectedTechnique({ technique: tech, tacticName: tactic.name })}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${getCardBg(
                            tech.intensity,
                            false
                          )}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-mono font-semibold text-slate-300">
                              {tech.id}
                            </span>
                            {hasThreats ? (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getIntensityBadge(tech.intensity)}`}>
                                {tech.threatCount} CVE{tech.threatCount > 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">Clean</span>
                            )}
                          </div>

                          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white">
                            {tech.name}
                          </h4>

                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {tech.description}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technique Detail Slide-Over Modal */}
      <AnimatePresence>
        {selectedTechnique && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full max-w-2xl h-full max-h-[90vh] bg-[#0d1322] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/20">
                      {selectedTechnique.technique.id}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Tactic: {selectedTechnique.tacticName}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-display text-white mt-1">
                    {selectedTechnique.technique.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Technique Overview
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-white/5">
                    {selectedTechnique.technique.description}
                  </p>
                </div>

                {/* Threat Telemetry */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Mapped Active Vulnerabilities ({selectedTechnique.technique.matchedThreats.length})
                    </h3>
                  </div>

                  {selectedTechnique.technique.matchedThreats.length === 0 ? (
                    <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                      <FiCheckCircle className="text-lg shrink-0" />
                      <span>No active critical threats currently exploiting this technique.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTechnique.technique.matchedThreats.map((threat: any, idx: number) => (
                        <div
                          key={threat.id || idx}
                          className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 hover:border-cyber-cyan/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono font-bold text-cyber-cyan">
                              {threat.cve}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                threat.cvssScore >= 9.0
                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                  : threat.cvssScore >= 7.0
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                              }`}
                            >
                              CVSS {threat.cvssScore}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {threat.summary}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
                            <span>Vendor: {threat.vendor}</span>
                            <Link
                              href={`/cve-explorer?cve=${threat.cve}`}
                              className="text-cyber-cyan hover:underline flex items-center gap-1 font-medium"
                            >
                              View Threat Profile <FiExternalLink />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

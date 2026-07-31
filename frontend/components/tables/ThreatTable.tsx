"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Threat, Severity } from "@/types";
import {
  FiChevronUp,
  FiChevronDown,
  FiSearch,
  FiExternalLink,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";

interface ThreatTableProps {
  threats: Threat[];
}

type SortField = "cve" | "vendor" | "product" | "severity" | "publishedDate" | "cvssScore";
type SortOrder = "asc" | "desc";

export default function ThreatTable({ threats }: ThreatTableProps) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("publishedDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Severe hierarchy helper for sorting
  const severityWeight = (s: Severity) => {
    switch (s) {
      case "Critical":
        return 4;
      case "High":
        return 3;
      case "Warning":
        return 2;
      default:
        return 1;
    }
  };

  // 1. Filtering Logic
  const filteredThreats = useMemo(() => {
    return threats.filter((t) => {
      const matchSearch =
        t.cve.toLowerCase().includes(search.toLowerCase()) ||
        t.vendor.toLowerCase().includes(search.toLowerCase()) ||
        t.product.toLowerCase().includes(search.toLowerCase()) ||
        t.threatType.toLowerCase().includes(search.toLowerCase());

      const matchSeverity =
        severityFilter === "All" || t.severity === severityFilter;

      return matchSearch && matchSeverity;
    });
  }, [threats, search, severityFilter]);

  // 2. Sorting Logic
  const sortedThreats = useMemo(() => {
    const sorted = [...filteredThreats];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortField === "severity") {
        comparison = severityWeight(a.severity) - severityWeight(b.severity);
      } else if (sortField === "cvssScore") {
        comparison = a.cvssScore - b.cvssScore;
      } else {
        comparison = a[sortField].localeCompare(b[sortField]);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredThreats, sortField, sortOrder]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, severityFilter]);

  // 3. Pagination Logic
  const totalItems = sortedThreats.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedThreats = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedThreats.slice(startIdx, startIdx + pageSize);
  }, [sortedThreats, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to desc for new fields
    }
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case "Critical":
        return "bg-cyber-critical/15 text-cyber-critical border border-cyber-critical/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]";
      case "High":
        return "bg-cyber-warning/15 text-cyber-warning border border-cyber-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]";
      case "Warning":
        return "bg-amber-500/15 text-amber-500 border border-amber-500/30";
      default:
        return "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]";
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "mitigated":
        return "text-cyber-success bg-cyber-success/10 border-cyber-success/20";
      case "investigating":
        return "text-cyber-warning bg-cyber-warning/10 border-cyber-warning/20";
      default:
        return "text-cyber-critical bg-cyber-critical/10 border-cyber-critical/20";
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <FiChevronUp className="inline ml-1 text-cyber-cyan" />
    ) : (
      <FiChevronDown className="inline ml-1 text-cyber-cyan" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0b0f19]/30 p-4 rounded-xl border border-white/5 backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search CVEs, products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/[0.02] border border-white/10 text-xs text-white focus:outline-none focus:border-cyber-cyan/50 transition-colors"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#0f172a] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan/50 font-sans"
          >
            <option value="All">All Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/5 glass-panel">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-wider font-semibold">
              <th onClick={() => handleSort("cve")} className="p-4 cursor-pointer hover:text-white transition-colors">
                CVE <SortIcon field="cve" />
              </th>
              <th onClick={() => handleSort("vendor")} className="p-4 cursor-pointer hover:text-white transition-colors">
                Vendor <SortIcon field="vendor" />
              </th>
              <th onClick={() => handleSort("product")} className="p-4 cursor-pointer hover:text-white transition-colors text-ellipsis max-w-[150px]">
                Product <SortIcon field="product" />
              </th>
              <th onClick={() => handleSort("severity")} className="p-4 cursor-pointer hover:text-white transition-colors">
                Severity <SortIcon field="severity" />
              </th>
              <th onClick={() => handleSort("cvssScore")} className="p-4 cursor-pointer hover:text-white transition-colors text-center">
                CVSS <SortIcon field="cvssScore" />
              </th>
              <th onClick={() => handleSort("publishedDate")} className="p-4 cursor-pointer hover:text-white transition-colors">
                Published <SortIcon field="publishedDate" />
              </th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {paginatedThreats.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500 font-mono">
                  <FiAlertCircle className="mx-auto mb-2 text-xl animate-pulse text-cyber-warning" />
                  NO INCIDENTS MATCHING THE ACTIVE SEARCH PRESETS
                </td>
              </tr>
            ) : (
              paginatedThreats.map((threat) => (
                <tr
                  key={threat.id}
                  className="hover:bg-white/[0.02] hover:text-white transition-all duration-150 group"
                >
                  <td className="p-4 font-mono font-bold text-cyber-cyan tracking-wider">
                    {threat.cve}
                  </td>
                  <td className="p-4 font-semibold">{threat.vendor}</td>
                  <td className="p-4 font-medium text-slate-400 truncate max-w-[150px]">
                    {threat.product}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono font-semibold">
                    <span className={threat.cvssScore >= 9.0 ? "text-cyber-critical font-bold" : threat.cvssScore >= 7.0 ? "text-cyber-warning" : "text-slate-300"}>
                      {threat.cvssScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{threat.publishedDate}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${getStatusIndicator(threat.status)}`}>
                      {threat.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/threat/${threat.id}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyber-blue/10 hover:bg-cyber-blue text-cyber-cyan hover:text-white border border-cyber-blue/30 transition-all font-semibold"
                      >
                        <FiExternalLink size={12} />
                        <span>DRILLDOWN</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs select-none">
          <span className="text-slate-400 font-medium">
            Showing <strong className="text-white">{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</strong> to{" "}
            <strong className="text-white">{Math.min(totalItems, currentPage * pageSize)}</strong> of{" "}
            <strong className="text-white">{totalItems}</strong> entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded border border-white/10 flex items-center justify-center bg-[#0f172a] hover:bg-white/5 hover:border-white/20 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <FiChevronLeft />
            </button>
            
            <div className="font-mono text-slate-400">
              Page <span className="text-white font-semibold">{currentPage}</span> of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded border border-white/10 flex items-center justify-center bg-[#0f172a] hover:bg-white/5 hover:border-white/20 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

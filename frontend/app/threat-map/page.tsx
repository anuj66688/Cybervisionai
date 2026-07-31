"use client";

import WorldMap from "@/components/dashboard/WorldMap";
import { FiGlobe, FiMapPin, FiActivity, FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";

const COUNTRY_STATS = [
  { name: "Russian Federation", code: "RU", attacks: 1120, pct: 38, severity: "Critical" },
  { name: "China", code: "CN", attacks: 890, pct: 28, severity: "High" },
  { name: "United States", code: "US", attacks: 420, pct: 14, severity: "Warning" },
  { name: "Brazil", code: "BR", attacks: 280, pct: 9, severity: "Warning" },
  { name: "Germany", code: "DE", attacks: 190, pct: 6, severity: "Info" },
];

export default function ThreatMapPage() {
  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl lg:text-2xl font-bold font-display text-white tracking-wide flex items-center gap-2">
          <FiGlobe className="text-cyber-cyan animate-pulse" />
          <span>Geographic Threat Distribution Map</span>
        </h1>
        <p className="text-xs text-slate-400">
          Geolocating active network attack nodes. Coordinates derived from live firewall packet telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World Map SVG panel */}
        <div className="lg:col-span-2 rounded-2xl glass-panel border border-white/5 p-6 h-[480px] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 select-none">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              ACTIVE GEO-TARGET VECTOR TRAILS
            </h3>
            <span className="flex items-center gap-1 text-[9px] font-mono text-cyber-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping" />
              <span>LOGGING NODES</span>
            </span>
          </div>
          <div className="flex-1 min-h-0 pt-4">
            <WorldMap />
          </div>
        </div>

        {/* Origin Country Stats panel */}
        <div className="rounded-2xl glass-panel border border-white/5 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <FiAlertTriangle className="text-cyber-warning" />
              <h3 className="text-xs font-bold tracking-widest text-white uppercase">
                ATTACK VECTOR ORIGINS
              </h3>
            </div>

            {/* List of Countries */}
            <div className="space-y-4">
              {COUNTRY_STATS.map((country, index) => {
                const getSeverityText = (sev: string) => {
                  if (sev === "Critical") return "text-cyber-critical";
                  if (sev === "High") return "text-cyber-warning";
                  return "text-cyber-cyan";
                };

                return (
                  <div key={country.code} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs select-none">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-bold">0{index + 1}</span>
                        <FiMapPin className="text-slate-400" />
                        <span className="font-semibold text-slate-200">{country.name}</span>
                      </div>
                      <div className="text-right font-mono font-semibold">
                        <span className="text-white mr-1.5">{country.attacks.toLocaleString()}</span>
                        <span className={`text-[10px] uppercase font-bold ${getSeverityText(country.severity)}`}>
                          ({country.pct}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="w-full h-1.5 bg-white/[0.02] border border-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          country.severity === "Critical"
                            ? "bg-cyber-critical shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                            : country.severity === "High"
                            ? "bg-cyber-warning shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : "bg-cyber-blue shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                        }`}
                        style={{ width: `${country.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnostic status block */}
          <div className="pt-4 border-t border-white/5 text-[10px] text-slate-500 font-mono space-y-1 select-none">
            <div>GEOLOCATION POOL: 4,921 ACTIVE AGENTS</div>
            <div>INGESTION STATUS: 100% NOMINAL</div>
          </div>
        </div>
      </div>
    </div>
  );
}

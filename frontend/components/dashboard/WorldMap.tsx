"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiGlobe, FiAlertTriangle, FiCheck } from "react-icons/fi";

interface AttackRoute {
  id: string;
  fromName: string;
  toName: string;
  fromCoords: [number, number]; // [x, y] percentage
  toCoords: [number, number];
  severity: "Critical" | "High" | "Warning";
  type: string;
}

const INITIAL_ROUTES: AttackRoute[] = [
  { id: "route-1", fromName: "Beijing, CN", toName: "Washington D.C., US", fromCoords: [78, 48], toCoords: [28, 44], severity: "Critical", type: "RCE Attempt" },
  { id: "route-2", fromName: "Moscow, RU", toName: "Berlin, DE", fromCoords: [62, 34], toCoords: [50, 41], severity: "High", type: "SSH Bruteforce" },
  { id: "route-3", fromName: "Sao Paulo, BR", toName: "New York, US", fromCoords: [38, 74], toCoords: [29, 46], severity: "Warning", type: "SQL Injection" },
  { id: "route-4", fromName: "St. Petersburg, RU", toName: "London, UK", fromCoords: [58, 32], toCoords: [47, 39], severity: "Critical", type: "DDoS Flood" },
  { id: "route-5", fromName: "Shenzhen, CN", toName: "Silicon Valley, US", fromCoords: [77, 51], toCoords: [22, 45], severity: "High", type: "API Exploitation" },
];

export default function WorldMap() {
  const [routes, setRoutes] = useState<AttackRoute[]>(INITIAL_ROUTES);
  const [activeRoute, setActiveRoute] = useState<AttackRoute | null>(null);

  // Periodic route updates to simulate streaming coordinates
  useEffect(() => {
    const timer = setInterval(() => {
      // Rotate active route highlight
      const randomIdx = Math.floor(Math.random() * routes.length);
      setActiveRoute(routes[randomIdx]);
    }, 3000);

    return () => clearInterval(timer);
  }, [routes]);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Critical":
        return "#EF4444"; // Red
      case "High":
        return "#F59E0B"; // Orange
      default:
        return "#eab308"; // Yellow
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col justify-between">
      {/* Map telemetry widget overlay */}
      {activeRoute && (
        <div className="absolute top-4 left-4 p-3 rounded-lg border border-white/5 bg-[#0f172a]/90 backdrop-blur-md z-10 text-[10px] space-y-1 font-mono max-w-[200px] pointer-events-none select-none shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-cyber-critical uppercase tracking-wider">
              {activeRoute.severity} ATTACK PATH
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-critical animate-ping" />
          </div>
          <div className="text-white font-semibold truncate">{activeRoute.type}</div>
          <div className="text-slate-400">
            FROM: <span className="text-white">{activeRoute.fromName}</span>
          </div>
          <div className="text-slate-400">
            TO: <span className="text-white">{activeRoute.toName}</span>
          </div>
        </div>
      )}

      {/* Stylized Cyber SVG World Map */}
      <div className="flex-1 w-full min-h-[220px] relative overflow-hidden bg-white/[0.003] border border-white/5 rounded-xl">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full absolute inset-0 select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines inside map */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#grid)" />

          {/* Dotted outlines of major continents (Abstract representation) */}
          {/* North America */}
          <circle cx="180" cy="120" r="45" fill="rgba(255, 255, 255, 0.03)" border-dashed="true" />
          <circle cx="280" cy="180" r="30" fill="rgba(255, 255, 255, 0.03)" />
          {/* South America */}
          <circle cx="340" cy="280" r="40" fill="rgba(255, 255, 255, 0.02)" />
          <circle cx="370" cy="340" r="25" fill="rgba(255, 255, 255, 0.02)" />
          {/* Europe */}
          <circle cx="500" cy="130" r="35" fill="rgba(255, 255, 255, 0.03)" />
          {/* Africa */}
          <circle cx="520" cy="240" r="45" fill="rgba(255, 255, 255, 0.02)" />
          {/* Asia */}
          <circle cx="680" cy="140" r="65" fill="rgba(255, 255, 255, 0.03)" />
          <circle cx="730" cy="220" r="40" fill="rgba(255, 255, 255, 0.03)" />
          {/* Australia */}
          <circle cx="760" cy="320" r="30" fill="rgba(255, 255, 255, 0.025)" />

          {/* Render Attack Nodes and Trails */}
          {routes.map((route) => {
            const x1 = (route.fromCoords[0] / 100) * 800;
            const y1 = (route.fromCoords[1] / 100) * 400;
            const x2 = (route.toCoords[0] / 100) * 800;
            const y2 = (route.toCoords[1] / 100) * 400;
            const color = getSeverityColor(route.severity);
            const isActive = activeRoute?.id === route.id;

            // Curved arc path logic
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dr = Math.sqrt(dx * dx + dy * dy);
            const pathD = `M${x1},${y1} A${dr},${dr * 1.2} 0 0,1 ${x2},${y2}`;

            return (
              <React.Fragment key={route.id}>
                {/* Attack connection curve line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray="4,4"
                  opacity={isActive ? 0.9 : 0.25}
                  className="transition-all duration-300"
                />

                {/* Animated beam pulse flowing along the line */}
                {isActive && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeDasharray="15, 150"
                    opacity={0.8}
                    className="animate-dash"
                    style={{
                      strokeDashoffset: 165,
                      animation: "dash 2s linear infinite",
                    }}
                  />
                )}

                {/* Attacker Origin Pin (pulsing ring + central dot) */}
                <circle cx={x1} cy={y1} r="3" fill={color} />
                <circle
                  cx={x1}
                  cy={y1}
                  r="8"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  className="animate-ping"
                  style={{ animationDuration: "1.8s" }}
                />

                {/* Target Destination Pin */}
                <circle cx={x2} cy={y2} r="4" fill="#06B6D4" />
                <circle
                  cx={x2}
                  cy={y2}
                  r="10"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="1"
                  className="animate-pulse"
                />
              </React.Fragment>
            );
          })}
        </svg>

        {/* CSS Keyframe for dashes animations in map */}
        <style jsx>{`
          @keyframes dash {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

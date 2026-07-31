"use client";

import { motion } from "framer-motion";
import { FiRefreshCw, FiMoreHorizontal } from "react-icons/fi";
import React, { useState } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  onRefresh,
  isLoading = false,
}: ChartCardProps) {
  const [isRotating, setIsRotating] = useState(false);

  const handleRefreshClick = () => {
    if (onRefresh) {
      setIsRotating(true);
      onRefresh();
      setTimeout(() => setIsRotating(false), 800);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="p-6 rounded-2xl glass-panel border border-white/5 hover:border-white/10 transition-colors shadow-2xl relative flex flex-col h-[360px]"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4 select-none">
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-white font-display tracking-wider">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-sans tracking-wide uppercase">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={handleRefreshClick}
              disabled={isLoading || isRotating}
              className="w-7 h-7 rounded bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <FiRefreshCw
                size={12}
                className={isRotating || isLoading ? "animate-spin" : ""}
              />
            </button>
          )}
          <button className="w-7 h-7 rounded bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
            <FiMoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 relative min-h-0 w-full flex items-center justify-center">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0f19]/40 backdrop-blur-sm z-10 space-y-3 rounded-xl">
            <div className="w-8 h-8 rounded-full border-2 border-t-cyber-cyan border-white/5 animate-spin" />
            <span className="text-xs text-slate-400 font-mono tracking-widest animate-pulse">
              STREAMING TELEMETRY...
            </span>
          </div>
        ) : null}
        <div className="w-full h-full relative z-0">{children}</div>
      </div>
    </motion.div>
  );
}

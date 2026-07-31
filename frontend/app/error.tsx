"use client";

import { useEffect } from "react";
import { FiRefreshCw, FiAlertTriangle } from "react-icons/fi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console diagnostic logs
    console.error("SOC System Diagnostic Failure:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 select-none">
      <div className="w-16 h-16 rounded-2xl bg-cyber-warning/10 border border-cyber-warning/30 text-cyber-warning flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-bounce">
        <FiAlertTriangle size={32} />
      </div>

      <h1 className="text-xl font-bold font-display text-white tracking-wider mb-2">
        DIAGNOSTIC CRITICAL: TELEMETRY FAULT
      </h1>
      
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6 font-sans">
        A system failure occurred during live telemetry rendering. This can be caused by network stream buffer overruns.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-cyber-cyan hover:bg-cyber-cyan/80 text-[#050816] font-bold text-xs tracking-wider transition-colors cursor-pointer select-none"
        >
          <FiRefreshCw className="animate-spin" />
          <span>RESET SYSTEM TELEMETRY</span>
        </button>
      </div>
    </div>
  );
}

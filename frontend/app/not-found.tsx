"use client";

import Link from "next/link";
import { FiAlertOctagon, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 select-none">
      <div className="w-16 h-16 rounded-2xl bg-cyber-critical/10 border border-cyber-critical/30 text-cyber-critical flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
        <FiAlertOctagon size={32} />
      </div>

      <h1 className="text-2xl font-bold font-display text-white tracking-wider mb-2">
        ROUTING FAULT: 404 NOT IN PERIMETER
      </h1>
      
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6 font-sans">
        The requested address endpoint does not exist inside CyberVision SIEM mapped perimeters. Check cluster coordinates.
      </p>

      <Link
        href="/"
        className="flex items-center gap-2 px-4 h-10 rounded-lg bg-cyber-blue hover:bg-cyber-blue/80 text-white font-semibold text-xs tracking-wider transition-colors cursor-pointer select-none"
      >
        <FiArrowLeft />
        <span>RETURN TO COMMAND COMMAND</span>
      </Link>
    </div>
  );
}

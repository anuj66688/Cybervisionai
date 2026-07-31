"use client";

import { motion } from "framer-motion";
import { IconType } from "react-icons";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { useEffect, useState } from "react";

interface StatisticCardProps {
  title: string;
  value: number;
  change: number;
  icon: IconType;
  color: "blue" | "cyan" | "purple" | "success" | "warning" | "critical";
  sparklineData: number[];
}

export default function StatisticCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  sparklineData,
}: StatisticCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated count-up
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 1.2; // seconds
    const increment = end / (duration * 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value]);

  const getColorStyles = () => {
    switch (color) {
      case "cyan":
        return {
          glow: "glass-panel-glow-cyan",
          border: "glow-border-cyan",
          text: "text-cyber-cyan",
          bg: "bg-cyber-cyan/10",
          stroke: "#06B6D4",
        };
      case "purple":
        return {
          glow: "glass-panel-glow-purple",
          border: "glow-border-purple",
          text: "text-cyber-purple",
          bg: "bg-cyber-purple/10",
          stroke: "#7C3AED",
        };
      case "success":
        return {
          glow: "shadow-[0_0_20px_rgba(34,197,94,0.1)]",
          border: "border-cyber-success/20 hover:border-cyber-success/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]",
          text: "text-cyber-success",
          bg: "bg-cyber-success/10",
          stroke: "#22C55E",
        };
      case "warning":
        return {
          glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
          border: "border-cyber-warning/20 hover:border-cyber-warning/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]",
          text: "text-cyber-warning",
          bg: "bg-cyber-warning/10",
          stroke: "#F59E0B",
        };
      case "critical":
        return {
          glow: "glass-panel-glow-critical",
          border: "glow-border-critical",
          text: "text-cyber-critical",
          bg: "bg-cyber-critical/10",
          stroke: "#EF4444",
        };
      default:
        return {
          glow: "glass-panel-glow-blue",
          border: "glow-border-blue",
          text: "text-cyber-blue",
          bg: "bg-cyber-blue/10",
          stroke: "#2563EB",
        };
    }
  };

  const styles = getColorStyles();

  // Helper to generate SVG Path from sparkline points
  const generateSparklinePath = (points: number[]) => {
    if (points.length === 0) return "";
    const width = 120;
    const height = 40;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min === 0 ? 1 : max - min;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - 5 - ((p - min) / range) * (height - 10);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${coords.join(" L ")}`;
  };

  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`p-6 rounded-2xl glass-panel relative overflow-hidden group select-none ${styles.border} ${styles.glow}`}
    >
      {/* Background card accent gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.02] to-transparent pointer-events-none rounded-bl-full" />

      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-medium tracking-wider uppercase font-display">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
              {displayValue.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Floating Icon Box */}
        <div className={`p-3 rounded-xl ${styles.bg} ${styles.text} border border-white/5 shadow-inner`}>
          <Icon className="text-lg animate-pulse" />
        </div>
      </div>

      {/* Sparkline & Trend Metrics */}
      <div className="flex items-end justify-between mt-6 pt-4 border-t border-white/[0.03]">
        {/* Trend Percentage Badge */}
        <div className="flex flex-col gap-0.5">
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-cyber-success" : "text-cyber-critical"}`}>
            {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            <span>{isPositive ? `+${change}%` : `${change}%`}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans tracking-wide">VS LAST 24H</span>
        </div>

        {/* Mini SVG Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-[120px] h-10 overflow-hidden opacity-85 group-hover:opacity-100 transition-opacity">
            <svg width="120" height="40">
              <path
                d={generateSparklinePath(sparklineData)}
                fill="none"
                stroke={styles.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}

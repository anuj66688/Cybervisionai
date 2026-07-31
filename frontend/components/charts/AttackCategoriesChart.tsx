"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AttackCategoriesChart() {
  const [chartData, setChartData] = useState<{ labels: string[]; data: number[] }>({
    labels: ["Malware", "Phishing", "DDoS Mitigation", "Exploit Attempt", "IAM Anomalies"],
    data: [35, 20, 15, 22, 8],
  });

  useEffect(() => {
    apiClient.get("/analytics/categories")
      .then((res) => {
        if (res.data && res.data.labels && res.data.labels.length > 0) {
          setChartData(res.data);
        }
      })
      .catch((err) => console.log("Category chart load error:", err));
  }, []);

  const totalBlocked = chartData.data.reduce((a, b) => a + b, 0);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        backgroundColor: [
          "#06B6D4", // Cyan
          "#2563EB", // Blue
          "#7C3AED", // Purple
          "#EF4444", // Critical Red
          "#F59E0B", // Warning Orange
        ],
        borderColor: "#111827",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#94A3B8",
          font: {
            family: "Inter",
            size: 11,
          },
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: "rgba(11, 15, 25, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#94A3B8",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        usePointStyle: true,
      },
    },
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Center Label Overlay */}
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none -translate-x-[36px]">
        <span className="text-xl font-bold font-mono text-white tracking-tighter">{totalBlocked}</span>
        <span className="text-[9px] font-bold text-slate-500 tracking-widest font-sans uppercase">
          Threats Blocked
        </span>
      </div>

      <Doughnut data={data} options={options} />
    </div>
  );
}

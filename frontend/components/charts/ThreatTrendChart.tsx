"use client";

import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext,
} from "chart.js";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ThreatTrendChart() {
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<any>({
    datasets: [],
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Create beautiful background gradients for lines
    const ctx = chart.ctx;
    const gradientBlue = ctx.createLinearGradient(0, 0, 0, 240);
    gradientBlue.addColorStop(0, "rgba(37, 99, 235, 0.25)");
    gradientBlue.addColorStop(1, "rgba(37, 99, 235, 0.00)");

    const gradientCyan = ctx.createLinearGradient(0, 0, 0, 240);
    gradientCyan.addColorStop(0, "rgba(6, 182, 212, 0.25)");
    gradientCyan.addColorStop(1, "rgba(6, 182, 212, 0.00)");

    setChartData({
      labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
      datasets: [
        {
          label: "Intrusions Blocked",
          data: [65, 82, 53, 95, 110, 88, 70],
          borderColor: "#06B6D4",
          backgroundColor: gradientCyan,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "#06B6D4",
          pointBorderColor: "rgba(255,255,255,0.1)",
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#06B6D4",
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: "Active Scans",
          data: [42, 60, 48, 75, 85, 62, 50],
          borderColor: "#2563EB",
          backgroundColor: gradientBlue,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "#2563EB",
          pointBorderColor: "rgba(255,255,255,0.1)",
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#2563EB",
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    });
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#94A3B8",
          font: {
            family: "Inter",
            size: 11,
          },
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          padding: 15,
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
        displayColors: true,
        boxWidth: 6,
        boxHeight: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.02)",
        },
        ticks: {
          color: "#64748B",
          font: {
            family: "Courier New",
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.03)",
        },
        ticks: {
          color: "#64748B",
          font: {
            family: "Courier New",
            size: 10,
          },
          stepSize: 20,
        },
      },
    },
  };

  return <Line ref={chartRef} data={chartData} options={options} />;
}

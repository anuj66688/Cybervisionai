"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SeverityDistributionChart() {
  const [chartData, setChartData] = useState<{ labels: string[]; data: number[] }>({
    labels: ["Critical", "High", "Warning", "Info"],
    data: [12, 38, 74, 142],
  });

  useEffect(() => {
    apiClient.get("/analytics/severity")
      .then((res) => {
        if (res.data && res.data.labels && res.data.labels.length > 0) {
          setChartData(res.data);
        }
      })
      .catch((err) => console.log("Severity chart load error:", err));
  }, []);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Alert Count",
        data: chartData.data,
        backgroundColor: [
          "#EF4444", // Critical
          "#F59E0B", // Warning Orange/High
          "#eab308", // Yellow Warning
          "#06B6D4", // Cyan Info
        ],
        borderRadius: 6,
        borderWidth: 0,
        barThickness: 24,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // No legend needed for single dataset
      },
      tooltip: {
        backgroundColor: "rgba(11, 15, 25, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#94A3B8",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            family: "Inter",
            size: 11,
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
          stepSize: 40,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

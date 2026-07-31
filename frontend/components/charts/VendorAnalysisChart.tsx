"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function VendorAnalysisChart() {
  const [chartData, setChartData] = useState<{ labels: string[]; data: number[] }>({
    labels: ["Microsoft", "Linux Kernel", "Cisco Systems", "Apache Software", "Adobe Systems"],
    data: [42, 31, 25, 18, 12],
  });

  useEffect(() => {
    apiClient.get("/analytics/vendors")
      .then((res) => {
        if (res.data && res.data.labels && res.data.labels.length > 0) {
          setChartData(res.data);
        }
      })
      .catch((err) => console.log("Vendor chart load error:", err));
  }, []);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Vulnerability Detections",
        data: chartData.data,
        backgroundColor: "rgba(37, 99, 235, 0.75)",
        borderColor: "#2563EB",
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 14,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          color: "rgba(255, 255, 255, 0.03)",
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
    },
  };

  return <Bar data={data} options={options} />;
}

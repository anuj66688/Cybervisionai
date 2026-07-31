"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Notification, Severity } from "@/types";
import { apiClient } from "@/utils/api";

const ALERTS_POOL: Omit<Notification, "id" | "timestamp" | "isRead">[] = [
  { message: "SSH brute force attempt detected on jump-box-01", severity: "High", source: "192.168.1.144", category: "Auth Bypass" },
  { message: "SQL injection payload blocked by WAF-Prod-App", severity: "Warning", source: "84.21.3.109", category: "Injection" },
  { message: "Critical CVE-2026-9912 in OpenSSL active exploit attempt detected", severity: "Critical", source: "45.138.89.201", category: "RCE Exploit" },
  { message: "Phishing email pattern detected and quarantined for user sales-03", severity: "Warning", source: "MX-Gateway-East", category: "Phishing" },
  { message: "Unauthorized database schema change attempted on pg-cluster", severity: "Critical", source: "internal-service-db", category: "Database Integrity" },
  { message: "Port scanning activity detected targeting domain controller", severity: "High", source: "10.0.12.55", category: "Reconnaissance" },
  { message: "Multiple admin login failures detected on cloud-console-portal", severity: "High", source: "203.0.113.88", category: "IAM Alert" },
  { message: "Outbound communication to known Command & Control server blocked", severity: "Critical", source: "workstation-hr-22", category: "C2 Malware" },
  { message: "TLS certificates renewal successful for api.cybervision.ai", severity: "Info", source: "Let's Encrypt Client", category: "Infrastructure" },
  { message: "Docker daemon socket file access anomaly detected by runtime agent", severity: "High", source: "k8s-node-04", category: "Privilege Escalation" },
  { message: "Large data egress volume detected on s3-billing-archive", severity: "Critical", source: "data-sync-agent", category: "Exfiltration" },
  { message: "API endpoint rate limiting triggered on /v1/auth/token", severity: "Warning", source: "5.18.244.13", category: "DDoS mitigation" }
];

export function useNotificationFeed(maxLogs = 50, initialRate = 4000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [refreshRate, setRefreshRate] = useState(initialRate); // ms
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addNotification = useCallback((severity?: Severity) => {
    const randomTemplate = ALERTS_POOL[Math.floor(Math.random() * ALERTS_POOL.length)];
    const newAlert: Notification = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: randomTemplate.message,
      severity: severity || randomTemplate.severity,
      source: randomTemplate.source,
      category: randomTemplate.category,
      isRead: false,
    };

    setNotifications((prev) => {
      const updated = [newAlert, ...prev];
      if (updated.length > maxLogs) {
        return updated.slice(0, maxLogs);
      }
      return updated;
    });
  }, [maxLogs]);

  // Seed initial alerts from backend, fall back to mock
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const res = await apiClient.get("/notifications");
        if (res.data && res.data.length > 0) {
          setNotifications(res.data);
        } else {
          seedMockAlerts();
        }
      } catch (err) {
        console.log("Failed to fetch notifications from backend, using mock alerts:", err);
        seedMockAlerts();
      }
    };

    const seedMockAlerts = () => {
      const initialAlerts: Notification[] = [];
      const now = Date.now();
      for (let i = 0; i < 8; i++) {
        const template = ALERTS_POOL[Math.floor(Math.random() * ALERTS_POOL.length)];
        initialAlerts.push({
          id: `alert-init-${i}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(now - i * 15 * 60 * 1000).toISOString(),
          message: template.message,
          severity: template.severity,
          source: template.source,
          category: template.category,
          isRead: i > 3, // Mark some as read
        });
      }
      setNotifications(initialAlerts);
    };

    fetchInitialNotifications();
  }, []);

  // Connect to Live SSE stream from backend, fall back to local simulated feed on error
  useEffect(() => {
    if (!isLive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const token = typeof window !== "undefined" ? sessionStorage.getItem("cv_analyst_token") : null;
    let sse: EventSource | null = null;
    let useFallbackTimer = false;

    const startLocalFallbackTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (Math.random() > 0.2) {
          addNotification();
        }
      }, refreshRate);
    };

    if (token) {
      const streamUrl = `http://localhost:8000/api/notifications/stream?token=${token}`;
      console.log("Opening EventSource listener to backend threat notifications...");
      sse = new EventSource(streamUrl);

      sse.onmessage = (event) => {
        try {
          const newAlert: Notification = JSON.parse(event.data);
          setNotifications((prev) => {
            // Avoid duplicates
            if (prev.some((n) => n.id === newAlert.id)) return prev;
            const updated = [newAlert, ...prev];
            return updated.slice(0, maxLogs);
          });
        } catch (e) {
          console.error("Error parsing streamed notification:", e);
        }
      };

      sse.onerror = (err) => {
        console.warn("EventSource stream connection dropped. Activating local telemetry generator fallback.", err);
        if (sse) sse.close();
        startLocalFallbackTimer();
      };
    } else {
      startLocalFallbackTimer();
    }

    return () => {
      if (sse) sse.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive, refreshRate, addNotification, maxLogs]);

  const addCustomNotification = useCallback((custom: Partial<Notification>) => {
    const newAlert: Notification = {
      id: custom.id || `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: custom.timestamp || new Date().toISOString(),
      message: custom.message || "Simulated security alert triggered",
      severity: (custom.severity as Severity) || "High",
      source: custom.source || "SOC-Automation",
      category: custom.category || "Simulation",
      isRead: false,
    };

    setNotifications((prev) => {
      const updated = [newAlert, ...prev.filter((n) => n.id !== newAlert.id)];
      return updated.slice(0, maxLogs);
    });
  }, [maxLogs]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    isLive,
    setIsLive,
    refreshRate,
    setRefreshRate,
    unreadCount,
    markAllAsRead,
    markAsRead,
    clearAll,
    triggerManualAlert: (severity?: Severity) => addNotification(severity),
    addCustomNotification,
  };
}


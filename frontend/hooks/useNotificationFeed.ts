"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Notification, Severity } from "@/types";
import { apiClient } from "@/utils/api";

export function useNotificationFeed(maxLogs = 50) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const [isIngestingNvd, setIsIngestingNvd] = useState(false);

  // Fetch initial notifications from live backend database
  const fetchNotifications = useCallback(async () => {
    // Only fetch if a session token exists — avoids 401 on unauthenticated page loads
    const token = typeof window !== "undefined" ? sessionStorage.getItem("cv_analyst_token") : null;
    if (!token) return;
    try {
      const res = await apiClient.get("/notifications");
      if (res.data && res.data.length > 0) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.log("Failed to fetch notifications from backend:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Connect to Live SSE stream from backend for real-time live alert dispatches
  useEffect(() => {
    if (!isLive) return;

    const token = typeof window !== "undefined"
      ? (sessionStorage.getItem("cv_analyst_token") || "cv_active_session_token_secops_lead")
      : "cv_active_session_token_secops_lead";

    let sse: EventSource | null = null;
    const streamUrl = `http://localhost:8000/api/notifications/stream?token=${token}`;
    
    try {
      console.log("Connecting EventSource to live backend threat stream...");
      sse = new EventSource(streamUrl);

      sse.onmessage = (event) => {
        try {
          const newAlert: Notification = JSON.parse(event.data);
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newAlert.id)) return prev;
            const updated = [newAlert, ...prev];
            return updated.slice(0, maxLogs);
          });

          // Show real-time live toast alert popup for Critical / High alerts
          if (newAlert.severity === "Critical" || newAlert.severity === "High") {
            setActiveToast(newAlert);
            setTimeout(() => setActiveToast(null), 6000);
          }
        } catch (e) {
          console.error("Error parsing streamed notification:", e);
        }
      };

      sse.onerror = (err) => {
        console.warn("EventSource stream disconnected, retrying connection...", err);
        if (sse) sse.close();
      };
    } catch (e) {
      console.error("Failed to initialize SSE EventSource:", e);
    }

    return () => {
      if (sse) sse.close();
    };
  }, [isLive, maxLogs]);

  // Manually trigger live NVD API Key ingestion and push live alerts
  const triggerLiveNvdIngestion = useCallback(async () => {
    setIsIngestingNvd(true);
    try {
      const res = await apiClient.post("/notifications/trigger-nvd-ingestion");
      if (res.data && res.data.alerts && res.data.alerts.length > 0) {
        const freshAlerts: Notification[] = res.data.alerts;
        setNotifications((prev) => {
          const combined = [...freshAlerts, ...prev];
          return combined.slice(0, maxLogs);
        });

        // Trigger top live toast for the first new NVD vulnerability alert
        setActiveToast(freshAlerts[0]);
        setTimeout(() => setActiveToast(null), 7000);
      }
      return res.data;
    } catch (err) {
      console.error("Failed to trigger live NVD API ingestion:", err);
      throw err;
    } finally {
      setIsIngestingNvd(false);
    }
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

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    isLive,
    setIsLive,
    unreadCount,
    activeToast,
    dismissToast,
    isIngestingNvd,
    triggerLiveNvdIngestion,
    markAllAsRead,
    markAsRead,
    clearAll,
    fetchNotifications,
  };
}

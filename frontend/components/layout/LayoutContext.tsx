"use client";

import React, { createContext, useContext, useState } from "react";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { Notification } from "@/types";

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  isNotificationOpen: boolean;
  setNotificationOpen: (val: boolean) => void;

  // Telemetry refresh rate (ms)
  refreshRate: number;
  setRefreshRate: (val: number) => void;

  // Live notification feed properties
  notifications: Notification[];
  isLive: boolean;
  setIsLive: (val: boolean) => void;
  unreadCount: number;
  activeToast: Notification | null;
  dismissToast: () => void;
  isIngestingNvd: boolean;
  triggerLiveNvdIngestion: () => Promise<any>;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  fetchNotifications: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [refreshRate, setRefreshRate] = useState(4000);
  const feed = useNotificationFeed();

  return (
    <LayoutContext.Provider
      value={{
        isSidebarCollapsed,
        setSidebarCollapsed,
        isNotificationOpen,
        setNotificationOpen,
        refreshRate,
        setRefreshRate,
        ...feed,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}

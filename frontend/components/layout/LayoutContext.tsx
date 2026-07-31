"use client";

import React, { createContext, useContext, useState } from "react";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { Notification, Severity } from "@/types";

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  isNotificationOpen: boolean;
  setNotificationOpen: (val: boolean) => void;
  
  // Live notification feed properties
  notifications: Notification[];
  isLive: boolean;
  setIsLive: (val: boolean) => void;
  refreshRate: number;
  setRefreshRate: (val: number) => void;
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  triggerManualAlert: (severity?: Severity) => void;
  addCustomNotification: (custom: Partial<Notification>) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const feed = useNotificationFeed();

  return (
    <LayoutContext.Provider
      value={{
        isSidebarCollapsed,
        setSidebarCollapsed,
        isNotificationOpen,
        setNotificationOpen,
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

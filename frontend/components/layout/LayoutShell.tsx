"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import NotificationPanel from "./NotificationPanel";
import { LayoutProvider } from "./LayoutContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiCpu } from "react-icons/fi";
import { RiRadarLine } from "react-icons/ri";

function LayoutShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
    const token = sessionStorage.getItem("cv_analyst_token");
    const isAuthPage = pathname?.startsWith("/auth");

    if (!token && !isAuthPage) {
      // Not authenticated & trying to access dashboard -> redirect to login
      router.replace("/auth/login");
    } else if (token && isAuthPage) {
      // Authenticated & trying to access login/register -> redirect to dashboard
      router.replace("/");
    } else {
      // Authorized route combination
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Premium loading terminal screen while checking session tokens or during initial SSR mount
  if (!mounted || isChecking) {
    return (
      <div className="min-h-screen w-screen bg-[#050816] text-[#F8FAFC] flex flex-col items-center justify-center font-mono select-none" suppressHydrationWarning>
        <div className="absolute inset-0 cyber-grid-bg pointer-events-none opacity-20 z-0" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-cyber-blue/10 border border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-pulse">
            <RiRadarLine className="text-3xl animate-spin [animation-duration:8s]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-white tracking-widest uppercase">
              NEGOTIATING SIEM HANDSHAKE...
            </h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide">
              Securing cluster sockets and verifying authorization tokens
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-screen bg-[#050816] text-[#F8FAFC] relative overflow-hidden flex items-center justify-center font-sans antialiased" suppressHydrationWarning>
        {/* Dynamic Cyber Grid Background Lines */}
        <div className="absolute inset-0 cyber-grid-bg pointer-events-none opacity-45 z-0" />
        <div className="relative z-10 w-full">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050816] text-[#F8FAFC]" suppressHydrationWarning>
      {/* Dynamic Cyber Grid Background Lines */}
      <div className="absolute inset-0 cyber-grid-bg pointer-events-none opacity-40 z-0" />

      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Interactive Screen Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 relative z-10">
        <Navbar />

        {/* Nested Page Content with Responsive Padding */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8 relative">
          {children}
        </main>
      </div>

      {/* Collapsible Right-hand Incident Log Panel */}
      <NotificationPanel />
    </div>
  );
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <LayoutShellInner>{children}</LayoutShellInner>
    </LayoutProvider>
  );
}

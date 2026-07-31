import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";

export const metadata: Metadata = {
  title: "CyberVision AI - Enterprise Cyber Threat Intelligence",
  description: "Real-Time AI Cyber Threat Intelligence and Early Warning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <body className="min-h-full bg-[#050816] text-[#F8FAFC] font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

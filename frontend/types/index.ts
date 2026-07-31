export type Severity = "Critical" | "High" | "Warning" | "Info";

export interface Threat {
  id: string;
  cve: string;
  vendor: string;
  product: string;
  threatType: string;
  severity: Severity;
  publishedDate: string;
  source: string;
  summary: string;
  remediation: string;
  references: string[];
  cvssScore: number;
  attackVector: string;
  status: "active" | "mitigated" | "investigating";
  countryCode?: string;
  timestamp: string;
}

export interface CVE {
  id: string;
  summary: string;
  published: string;
  cvss: number;
  severity: Severity;
  references: string[];
}

export interface Notification {
  id: string;
  timestamp: string;
  message: string;
  severity: Severity;
  source: string;
  isRead: boolean;
  category: string;
}

export interface SystemPreferences {
  theme: "dark" | "light" | "cyberpunk";
  notificationsEnabled: boolean;
  notificationSound: boolean;
  refreshRate: number; // in seconds
  language: string;
}

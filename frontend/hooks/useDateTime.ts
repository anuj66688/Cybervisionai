"use client";

import { useState, useEffect } from "react";

export function useDateTime() {
  const [dateTime, setDateTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial date on client to avoid hydration mismatch
    setDateTime(new Date());
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!dateTime) {
    return {
      time: "--:--:--",
      date: "Loading system time...",
      utc: "UTC: --:--:--",
    };
  }

  const timeString = dateTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateString = dateTime.toLocaleDateString([], {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const utcString = `UTC: ${dateTime.getUTCHours().toString().padStart(2, "0")}:${dateTime.getUTCMinutes().toString().padStart(2, "0")}:${dateTime.getUTCSeconds().toString().padStart(2, "0")}`;

  return {
    time: timeString,
    date: dateString,
    utc: utcString,
  };
}

"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NetworkStatus() {
  const [latency, setLatency] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial network status
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    const checkLatency = async () => {
      if (!navigator.onLine) {
        setIsOffline(true);
        setLatency(null);
        return;
      }

      const start = performance.now();
      try {
        // Fetch a tiny resource to measure round-trip time.
        // Using cache: no-store to prevent browser caching from artificially lowering the ping.
        await fetch(window.location.origin + "/favicon.ico", {
          method: "HEAD",
          cache: "no-store",
        });
        const end = performance.now();
        const ping = Math.round(end - start);
        
        setIsOffline(false);
        setLatency(ping);
      } catch (error) {
        // If fetch fails, we might be offline or the server is unreachable
        setIsOffline(true);
        setLatency(null);
      }
    };

    // Run immediately
    checkLatency();

    // Check every 5 seconds
    const interval = setInterval(checkLatency, 5000);

    // Listen to browser online/offline events for immediate reaction
    const handleOnline = () => {
      setIsOffline(false);
      checkLatency();
    };
    const handleOffline = () => {
      setIsOffline(true);
      setLatency(null);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Determine color and status
  let statusColor = "text-slate-400";
  let badgeClasses = "border-slate-200 bg-slate-50";
  
  if (!isOffline && latency !== null) {
    if (latency < 100) {
      statusColor = "text-emerald-500";
      badgeClasses = "border-emerald-200 bg-emerald-50";
    } else if (latency < 300) {
      statusColor = "text-amber-500";
      badgeClasses = "border-amber-200 bg-amber-50";
    } else {
      statusColor = "text-red-500";
      badgeClasses = "border-red-200 bg-red-50";
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors duration-300",
        badgeClasses
      )}
      title={isOffline ? "Offline" : `Latency: ${latency}ms`}
    >
      {isOffline ? (
        <WifiOff className="w-4 h-4 text-slate-400" />
      ) : (
        <Wifi className={cn("w-4 h-4", statusColor)} />
      )}
      <span
        className={cn(
          "text-xs font-bold tracking-wide",
          isOffline ? "text-slate-500" : statusColor
        )}
      >
        {isOffline ? "OFFLINE" : `${latency} ms`}
      </span>
    </div>
  );
}

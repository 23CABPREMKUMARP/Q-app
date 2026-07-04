import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/src/lib/supabase";

export interface BusPosition {
  busId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: string;
  deviceStatus: "Online" | "Offline";
}

interface UseBusRealtimeOptions {
  busId?: string | null;       // Track a specific bus. If null, track all.
  pollFallbackMs?: number;     // How often to poll /api/gps/status if realtime fails (default: 5000)
}

export function useBusRealtime({ busId, pollFallbackMs = 5000 }: UseBusRealtimeOptions = {}) {
  const [positions, setPositions] = useState<Record<string, BusPosition>>({});
  const [isConnected, setIsConnected] = useState(false);
  const channelsRef = useRef<any[]>([]);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const updatePosition = useCallback((pos: BusPosition) => {
    setPositions((prev) => ({
      ...prev,
      [pos.busId]: pos,
    }));
  }, []);

  // Subscribe to Supabase Realtime broadcast for a given busId
  const subscribeToChannel = useCallback(
    (id: string) => {
      const channelName = `gps:${id}`;
      const channel = supabase
        .channel(channelName)
        .on("broadcast", { event: "location" }, (msg) => {
          if (msg.payload && isMountedRef.current) {
            updatePosition({
              busId: msg.payload.busId || id,
              lat: msg.payload.lat,
              lng: msg.payload.lng,
              speed: msg.payload.speed || 0,
              heading: msg.payload.heading || 0,
              timestamp: msg.payload.timestamp || new Date().toISOString(),
              deviceStatus: msg.payload.deviceStatus || "Online",
            });
          }
        })
        .subscribe((status) => {
          if (isMountedRef.current) {
            setIsConnected(status === "SUBSCRIBED");
          }
        });

      channelsRef.current.push(channel);
      return channel;
    },
    [updatePosition]
  );

  // Poll fallback: fetch last known location via REST if realtime is unavailable
  const pollGPSStatus = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/gps/status/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.location && isMountedRef.current) {
          updatePosition({
            busId: id,
            lat: data.location.lat,
            lng: data.location.lng,
            speed: data.location.speed || 0,
            heading: data.location.heading || 0,
            timestamp: data.lastSeen || new Date().toISOString(),
            deviceStatus: data.gpsOnline ? "Online" : "Offline",
          });
        }
      } catch {
        // Silently handle polling errors
      }
    },
    [updatePosition]
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (busId) {
      // Single bus tracking
      subscribeToChannel(busId);

      // Initial poll to get last known position immediately
      pollGPSStatus(busId);

      // Fallback poll in case realtime is down
      pollTimerRef.current = setInterval(() => {
        if (!isConnected) {
          pollGPSStatus(busId);
        }
      }, pollFallbackMs);
    }

    return () => {
      isMountedRef.current = false;
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [busId, pollFallbackMs, subscribeToChannel, pollGPSStatus]);

  const getPosition = useCallback(
    (id: string): BusPosition | null => positions[id] || null,
    [positions]
  );

  return {
    positions,
    getPosition,
    isConnected,
  };
}

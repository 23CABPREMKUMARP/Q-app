import { useEffect, useRef, useCallback, useState } from "react";

const MIN_DISTANCE_METERS = 20; // Only send update if moved > 20m
const MAX_INTERVAL_MS = 10000;  // Force send at least every 10 seconds
const GPS_TIMEOUT_MS = 10000;
const GPS_MAX_AGE_MS = 5000;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

interface UseGPSOptions {
  busId: string;
  conductorId: string;
  enabled: boolean;
  onLocationUpdate?: (pos: { lat: number; lng: number; speed: number; heading: number }) => void;
  onError?: (err: string) => void;
  onStatusChange?: (status: "broadcasting" | "idle" | "error" | "no_permission") => void;
}

interface GPSState {
  lat: number | null;
  lng: number | null;
  speed: number;
  heading: number;
  accuracy: number | null;
  status: "broadcasting" | "idle" | "error" | "no_permission";
  errorMessage: string | null;
  updateCount: number;
}

export function useGPS({
  busId,
  conductorId,
  enabled,
  onLocationUpdate,
  onError,
  onStatusChange,
}: UseGPSOptions) {
  const [gpsState, setGpsState] = useState<GPSState>({
    lat: null,
    lng: null,
    speed: 0,
    heading: 0,
    accuracy: null,
    status: "idle",
    errorMessage: null,
    updateCount: 0,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const forceSendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sendUpdate = useCallback(
    async (lat: number, lng: number, speed: number, heading: number) => {
      try {
        await fetch("/api/gps/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ busId, conductorId, lat, lng, speed, heading }),
        });
        lastSentRef.current = { lat, lng, time: Date.now() };
        setGpsState((prev) => ({ ...prev, updateCount: prev.updateCount + 1 }));
        onLocationUpdate?.({ lat, lng, speed, heading });
      } catch (err) {
        console.error("GPS send error:", err);
      }
    },
    [busId, conductorId, onLocationUpdate]
  );

  const handlePosition = useCallback(
    (position: GeolocationPosition) => {
      const { latitude: lat, longitude: lng, accuracy, speed: rawSpeed } = position.coords;
      const speed = rawSpeed ? Math.round(rawSpeed * 3.6) : 0; // Convert m/s → km/h

      let heading = 0;
      if (lastSentRef.current) {
        heading = calculateHeading(lastSentRef.current.lat, lastSentRef.current.lng, lat, lng);
      }

      setGpsState((prev) => ({
        ...prev,
        lat,
        lng,
        speed,
        heading,
        accuracy,
        status: "broadcasting",
        errorMessage: null,
      }));

      // Throttle: only send if moved > MIN_DISTANCE_METERS OR > MAX_INTERVAL_MS since last send
      const now = Date.now();
      const last = lastSentRef.current;
      const timeSinceLast = last ? now - last.time : Infinity;
      const distanceMoved = last ? haversineDistance(last.lat, last.lng, lat, lng) : Infinity;

      if (distanceMoved >= MIN_DISTANCE_METERS || timeSinceLast >= MAX_INTERVAL_MS) {
        sendUpdate(lat, lng, speed, heading);
      }
    },
    [sendUpdate]
  );

  const handleError = useCallback(
    (err: GeolocationPositionError) => {
      const msg =
        err.code === 1
          ? "Location permission denied. Please allow GPS access."
          : err.code === 2
          ? "GPS signal unavailable. Move to an open area."
          : "GPS request timed out. Retrying...";

      const status = err.code === 1 ? "no_permission" : "error";
      setGpsState((prev) => ({ ...prev, status, errorMessage: msg }));
      onStatusChange?.(status);
      onError?.(msg);
    },
    [onError, onStatusChange]
  );

  useEffect(() => {
    if (!enabled || !busId) {
      // Stop watching
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (forceSendTimerRef.current) {
        clearInterval(forceSendTimerRef.current);
        forceSendTimerRef.current = null;
      }
      setGpsState((prev) => ({ ...prev, status: "idle" }));
      onStatusChange?.("idle");
      return;
    }

    if (!("geolocation" in navigator)) {
      setGpsState((prev) => ({ ...prev, status: "error", errorMessage: "Geolocation not supported" }));
      onError?.("Geolocation not supported by this device.");
      return;
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: GPS_TIMEOUT_MS,
      maximumAge: GPS_MAX_AGE_MS,
    });

    onStatusChange?.("broadcasting");

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (forceSendTimerRef.current) {
        clearInterval(forceSendTimerRef.current);
        forceSendTimerRef.current = null;
      }
    };
  }, [enabled, busId, handlePosition, handleError, onStatusChange]);

  return gpsState;
}

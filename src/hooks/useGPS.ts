import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { App } from '@capacitor/app';
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { useEffect, useRef, useCallback, useState } from "react";

const MIN_DISTANCE_METERS = 20; // Only send update if moved > 20m
const MAX_INTERVAL_MS = 10000;  // Force send at least every 10 seconds
const GPS_TIMEOUT_MS = 10000;
const GPS_MAX_AGE_MS = 5000;
const OFFLINE_QUEUE_KEY = "jeffben_gps_queue";

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
  onStatusChange?: (status: "broadcasting" | "idle" | "error" | "no_permission" | "offline") => void;
}

interface GPSState {
  lat: number | null;
  lng: number | null;
  speed: number;
  heading: number;
  accuracy: number | null;
  status: "broadcasting" | "idle" | "error" | "no_permission" | "offline";
  errorMessage: string | null;
  updateCount: number;
  queuedCount: number;
}

interface GPSPayload {
  busId: string;
  conductorId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: number;
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
    queuedCount: 0,
  });

  const watchIdRef = useRef<string | number | null>(null);
  const lastSentRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const isSyncingRef = useRef<boolean>(false);
  const wakeLockRef = useRef<any>(null);

  const getOfflineQueue = useCallback((): GPSPayload[] => {
    if (typeof window === "undefined") return [];
    try {
      const q = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  }, []);

  const saveToOfflineQueue = useCallback((payload: GPSPayload) => {
    if (typeof window === "undefined") return;
    try {
      const q = getOfflineQueue();
      q.push(payload);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q));
      setGpsState(prev => ({ ...prev, queuedCount: q.length, status: "offline" }));
      onStatusChange?.("offline");
    } catch (e) {
      console.warn("Failed to save to offline queue", e);
    }
  }, [getOfflineQueue, onStatusChange]);

  const clearOfflineQueue = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    setGpsState(prev => ({ ...prev, queuedCount: 0, status: "broadcasting" }));
    onStatusChange?.("broadcasting");
  }, [onStatusChange]);

  const syncQueue = useCallback(async () => {
    if (isSyncingRef.current) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    isSyncingRef.current = true;
    try {
      const res = await fetch("/api/gps/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: queue }),
      });
      if (res.ok) {
        clearOfflineQueue();
        setGpsState((prev) => ({ ...prev, updateCount: prev.updateCount + queue.length }));
      }
    } catch (err) {
      console.warn("Bulk sync failed, will retry later", err);
    } finally {
      isSyncingRef.current = false;
    }
  }, [getOfflineQueue, clearOfflineQueue]);

  const sendUpdate = useCallback(
    async (lat: number, lng: number, speed: number, heading: number) => {
      const payload: GPSPayload = { busId, conductorId, lat, lng, speed, heading, timestamp: Date.now() };
      
      try {
        const queue = getOfflineQueue();
        if (queue.length > 0) {
          // If we have a queue, add this to queue and try a bulk sync
          saveToOfflineQueue(payload);
          await syncQueue();
        } else {
          // Normal real-time send
          const res = await fetch("/api/gps/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Network response was not ok");
          
          setGpsState((prev) => ({ ...prev, updateCount: prev.updateCount + 1, status: "broadcasting" }));
          onStatusChange?.("broadcasting");
        }
        lastSentRef.current = { lat, lng, time: Date.now() };
        onLocationUpdate?.({ lat, lng, speed, heading });
      } catch (err) {
        // Network error, queue it
        saveToOfflineQueue(payload);
        lastSentRef.current = { lat, lng, time: Date.now() };
        onLocationUpdate?.({ lat, lng, speed, heading });
      }
    },
    [busId, conductorId, onLocationUpdate, getOfflineQueue, saveToOfflineQueue, syncQueue, onStatusChange]
  );

  const handlePosition = useCallback(
    (position: any) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      const rawSpeed = position.coords.speed;
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
    (err: any) => {
      const msg =
        err.code === 1 || err.PERMISSION_DENIED === err.code
          ? "Location permission denied. Please allow GPS access."
          : err.code === 2 || err.POSITION_UNAVAILABLE === err.code
          ? "GPS signal unavailable. Move to an open area."
          : "GPS request timed out. Retrying...";

      const status = (err.code === 1 || err.PERMISSION_DENIED === err.code) ? "no_permission" : "error";
      setGpsState((prev) => ({ ...prev, status, errorMessage: msg }));
      onStatusChange?.(status);
      onError?.(msg);
    },
    [onError, onStatusChange]
  );

  useEffect(() => {
    // Attempt to get wake lock to keep screen alive
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err: any) {
          console.warn(`Wake Lock error: ${err.name}, ${err.message}`);
        }
      }
    };

    if (!enabled || !busId) {
      if (watchIdRef.current !== null) {
        if (typeof watchIdRef.current === 'string') {
          Geolocation.clearWatch({ id: watchIdRef.current });
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current as number);
        }
        watchIdRef.current = null;
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(console.warn);
        wakeLockRef.current = null;
      }
      setGpsState((prev) => ({ ...prev, status: "idle" }));
      onStatusChange?.("idle");
      return;
    }

    const startWatching = async () => {
      requestWakeLock();
      syncQueue(); // Try to sync any stuck offline queue

      try {
        if (Capacitor.isNativePlatform()) {
          const perm = await Geolocation.checkPermissions();
          if (perm.location !== 'granted') {
            const req = await Geolocation.requestPermissions();
            if (req.location !== 'granted') {
              handleError({ code: 1, message: 'Permission denied', PERMISSION_DENIED: 1 });
              return;
            }
          }
          
          // Use Capacitor Geolocation with Background Task capability
          const id = await Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: GPS_TIMEOUT_MS,
            maximumAge: GPS_MAX_AGE_MS,
          }, (pos, err) => {
            if (err) handleError(err);
            if (pos) handlePosition(pos);
          });
          watchIdRef.current = id;
          onStatusChange?.("broadcasting");
          setGpsState((prev) => ({ ...prev, status: "broadcasting" }));
          
          // Register Background Task to keep app alive
          App.addListener('appStateChange', async ({ isActive }) => {
            if (!isActive && enabled) {
              const taskId = await BackgroundTask.beforeExit(async () => {
                // In background, keep syncing if possible
                await syncQueue();
                BackgroundTask.finish({ taskId });
              });
            }
          });
          
          return;
        }
      } catch (e) {
        console.warn("Capacitor Geolocation check failed, falling back to HTML5", e);
      }

      if (!("geolocation" in navigator)) {
        setGpsState((prev) => ({ ...prev, status: "error", errorMessage: "Geolocation not supported" }));
        onError?.("Geolocation not supported by this device.");
        return;
      }

      // Start watching position via HTML5
      watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        timeout: GPS_TIMEOUT_MS,
        maximumAge: GPS_MAX_AGE_MS,
      });
      
      onStatusChange?.("broadcasting");
      setGpsState((prev) => ({ ...prev, status: "broadcasting" }));
    };
    
    startWatching();

    return () => {
      if (watchIdRef.current !== null) {
        if (typeof watchIdRef.current === 'string') {
          Geolocation.clearWatch({ id: watchIdRef.current });
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current as number);
        }
        watchIdRef.current = null;
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(console.warn);
        wakeLockRef.current = null;
      }
    };
  }, [enabled, busId, handlePosition, handleError, onStatusChange, syncQueue]);

  return gpsState;
}

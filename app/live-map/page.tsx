"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import {
  Bus, MapPin, Navigation, Search, X, RefreshCw, Radio,
  WifiOff, ChevronDown, ShieldCheck, Layers, Locate,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence as AP } from "motion/react";

import { MOCK_BUSES } from "@/src/lib/constants";
import { TrackingStatusPanel } from "@/src/components/TrackingStatusPanel";
import { useBusRealtime } from "@/src/hooks/useBusRealtime";
import SecureView from "@/src/components/SecureView";
import type { BusData } from "@/src/types";

// Dynamic import — no SSR for Leaflet
const LeafletBusMap = dynamic(() => import("@/src/components/map/LiveBusMap"), { ssr: false });

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const MapSkeleton = () => (
  <div className="flex items-center justify-center h-full w-full bg-white relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-slate-50 animate-pulse" />
    <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
      <div className="w-20 h-20 border-4 border-orange-200 border-t-[#FF9933] rounded-full animate-spin" />
      <div>
        <p className="font-black text-xl text-zinc-900 uppercase tracking-tight">Loading Map</p>
        <p className="text-zinc-400 text-xs font-semibold mt-1 uppercase tracking-widest">OpenStreetMap · Leaflet Engine</p>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveMapPage() {
  return (
    <SecureView>
      <Suspense fallback={<MapSkeleton />}>
        <LiveMapContent />
      </Suspense>
    </SecureView>
  );
}

function LiveMapContent() {
  const searchParams = useSearchParams();
  const targetBusId = searchParams.get("busId");

  // ── Data ──────────────────────────────────────────────────────────────────
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Map state ─────────────────────────────────────────────────────────────
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [centerOn, setCenterOn] = useState<{ lat: number; lng: number } | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStops, setShowStops] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Realtime positions from Supabase ─────────────────────────────────────
  // Subscribe to realtime for the targeted bus (if specific bus) or poll all
  const { positions: livePositions, isConnected } = useBusRealtime({
    busId: targetBusId || undefined,
    pollFallbackMs: 5000,
  });

  // ── Load buses ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadBuses() {
      setLoading(true);
      try {
        const res = await fetch("/api/buses");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const formatted: BusData[] = data.map((b: any) => ({
              _id: b._id || b.id,
              busNumber: b.busNumber || b.bus_number || "",
              busCode: b.busCode || b.bus_code || "",
              status: b.status || "Scheduled",
              speed: Number(b.speed) || 0,
              fare: Number(b.fare) || Number(b.price) || 15,
              availableSeats: Number(b.availableSeats) || Number(b.available_seats) || 40,
              departureTime: b.departureTime || b.departure_time || "",
              arrivalTime: b.arrivalTime || b.arrival_time || "",
              location: b.location || { lat: 11.0168, lng: 76.9558, rotation: 0 },
              routeId: b.routeId || b.routes,
            }));
            setBuses(formatted);
          } else {
            // Fallback to local mock data
            setBuses(MOCK_BUSES as any);
          }
        } else {
          setBuses(MOCK_BUSES as any);
        }
      } catch {
        setBuses(MOCK_BUSES as any);
      } finally {
        setLoading(false);
      }
    }
    loadBuses();
  }, []);

  // ── Auto-select bus from URL param ────────────────────────────────────────
  useEffect(() => {
    if (targetBusId && buses.length > 0) {
      const bus = buses.find((b) => b._id === targetBusId || b.busCode === targetBusId);
      if (bus) {
        setSelectedBus(bus);
        setIsDrawerOpen(true);
        const live = livePositions[bus._id];
        const lat = live?.lat ?? bus.location?.lat;
        const lng = live?.lng ?? bus.location?.lng;
        if (lat && lng) setCenterOn({ lat, lng });
      }
    }
  }, [targetBusId, buses.length]);

  // ── User location ─────────────────────────────────────────────────────────
  const requestUserLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setCenterOn(loc);
      },
      () => { /* permission denied — silently ignore */ },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("hasLocationPermission");
    if (saved === "true") requestUserLocation();
  }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return buses.filter(
      (b) =>
        b.busNumber.toLowerCase().includes(q) ||
        (b.busCode && b.busCode.toLowerCase().includes(q)) ||
        (b.routeId?.from && b.routeId.from.toLowerCase().includes(q)) ||
        (b.routeId?.to && b.routeId.to.toLowerCase().includes(q)) ||
        (b.routeId?.routeName && b.routeId.routeName.toLowerCase().includes(q))
    );
  }, [searchQuery, buses]);

  const handleBusClick = useCallback(
    (bus: BusData) => {
      setSelectedBus(bus);
      setIsDrawerOpen(true);
      const live = livePositions[bus._id];
      const lat = live?.lat ?? bus.location?.lat;
      const lng = live?.lng ?? bus.location?.lng;
      if (lat && lng) setCenterOn({ lat, lng });
    },
    [livePositions]
  );

  const liveCount = Object.values(livePositions).filter((p) => p.deviceStatus === "Online").length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-100 font-sans">
      {/* ── Map ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        {loading ? (
          <MapSkeleton />
        ) : (
          <LeafletBusMap
            buses={buses}
            livePositions={livePositions}
            selectedBusId={selectedBus?._id}
            onBusClick={handleBusClick}
            userLocation={userLocation}
            centerOn={centerOn}
            showRoutes={showRoutes}
            showStops={showStops}
          />
        )}
      </div>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-[500] p-4 flex flex-col gap-3 pointer-events-none">
        {/* Header */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 px-4 py-3 flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-[#FF9933] rounded-xl flex items-center justify-center flex-shrink-0">
              <Bus size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-zinc-900 uppercase tracking-widest leading-none">Live Tracking</p>
              <div className="flex items-center gap-2 mt-0.5">
                {isConnected ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                    <Radio size={8} className="animate-pulse" /> Realtime Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400">
                    <WifiOff size={8} /> Polling Mode
                  </span>
                )}
                {liveCount > 0 && (
                  <span className="text-[9px] font-bold text-zinc-400">· {liveCount} bus{liveCount !== 1 ? "es" : ""} live</span>
                )}
              </div>
            </div>
          </div>

          {/* Locate me */}
          <button
            onClick={() => { requestUserLocation(); localStorage.setItem("hasLocationPermission", "true"); }}
            className="w-12 h-12 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 flex items-center justify-center text-zinc-600 hover:text-[#FF9933] transition-colors pointer-events-auto"
          >
            <Locate size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 flex items-center gap-3 px-4 h-12">
            <Search size={16} className="text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bus number, route, stop…"
              className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-zinc-700">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden max-h-64 overflow-y-auto z-50"
              >
                {searchResults.map((bus) => {
                  const live = livePositions[bus._id];
                  return (
                    <button
                      key={bus._id}
                      onClick={() => { handleBusClick(bus); setSearchQuery(""); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#FF9933]/10 flex items-center justify-center flex-shrink-0">
                        <Bus size={14} className="text-[#FF9933]" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-black text-zinc-900">{bus.busNumber}</p>
                        <p className="text-xs text-zinc-500 truncate">{bus.routeId?.from} → {bus.routeId?.to}</p>
                      </div>
                      {live?.deviceStatus === "Online" && (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">LIVE</span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layer toggles */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setShowRoutes((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showRoutes ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/30" : "bg-white/90 text-zinc-600 shadow"
            }`}
          >
            <Layers size={11} /> Routes
          </button>
          <button
            onClick={() => setShowStops((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showStops ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/30" : "bg-white/90 text-zinc-600 shadow"
            }`}
          >
            <MapPin size={11} /> Stops
          </button>
        </div>
      </div>

      {/* ── Bus count chip (bottom-left) ───────────────────────────────────── */}
      <div className="absolute bottom-6 left-4 z-[500] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 px-3 py-2 flex items-center gap-2">
          <Bus size={12} className="text-[#FF9933]" />
          <span className="text-xs font-black text-zinc-900">{buses.length} buses</span>
          {liveCount > 0 && (
            <>
              <span className="w-px h-3 bg-zinc-200" />
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                {liveCount} live
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Tracking status panel (drawer) ────────────────────────────────── */}
      <AnimatePresence>
        {selectedBus && isDrawerOpen && (
          <TrackingStatusPanel
            bus={selectedBus}
            livePosition={livePositions[selectedBus._id] || null}
            userLocation={userLocation}
            onClose={() => { setIsDrawerOpen(false); setSelectedBus(null); }}
            onMinimize={() => setIsDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Minimized bus pill (shown when drawer is closed but bus selected) */}
      <AnimatePresence>
        {selectedBus && !isDrawerOpen && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setIsDrawerOpen(true)}
            className="absolute bottom-6 inset-x-4 z-[500] bg-zinc-900 text-white rounded-2xl p-4 flex items-center gap-3 shadow-2xl"
          >
            <div className="w-10 h-10 bg-[#FF9933] rounded-xl flex items-center justify-center flex-shrink-0">
              <Bus size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-black uppercase tracking-tight">{selectedBus.busNumber}</p>
              <p className="text-xs text-zinc-400">{selectedBus.routeId?.from} → {selectedBus.routeId?.to}</p>
            </div>
            <ChevronDown size={18} className="text-zinc-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

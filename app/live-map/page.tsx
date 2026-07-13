"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, X, Locate, Layers, Bus, Navigation, MapPin,
  Radio, WifiOff, ChevronUp, ChevronDown, Gauge,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useBusRealtime } from "@/src/hooks/useBusRealtime";
import SecureView from "@/src/components/SecureView";
import type { BusData } from "@/src/types";

// Leaflet map — no SSR
const LeafletBusMap = dynamic(() => import("@/src/components/map/LiveBusMap"), { ssr: false });

// ─── Map skeleton ─────────────────────────────────────────────────────────────
const MapSkeleton = () => (
  <div className="flex items-center justify-center h-full w-full bg-[#e8eaed]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-[#F59E0B] rounded-full animate-spin" />
      <p className="text-gray-500 text-sm font-medium">Loading map…</p>
    </div>
  </div>
);

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

  // ── State ──────────────────────────────────────────────────────────────────
  const [buses, setBuses] = useState<BusData[]>([]); // Real buses fetched from DB
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [drawerState, setDrawerState] = useState<"closed" | "peek" | "full">("closed");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [centerOn, setCenterOn] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const { positions: livePositions, isConnected } = useBusRealtime({
    busId: targetBusId || undefined,
    pollFallbackMs: 5000,
  });

  const liveCount = Object.values(livePositions).filter((p) => p.deviceStatus === "Online").length;

  // ── Fetch Buses ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch("/api/buses");
        const data = await res.json();
        if (Array.isArray(data)) {
          setBuses(data);
        }
      } catch (err) {
        console.error("Failed to fetch buses for live map:", err);
      }
    };
    fetchBuses();
  }, []);


  // ── Location — manual only, no auto-request to avoid CoreLocation spam ─────
  const locationAttemptedRef = useRef(false);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator) || locationAttemptedRef.current) return;
    locationAttemptedRef.current = true;
    setLocating(true);
    setLocationError(false);

    const handleFallback = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const loc = { lat: data.latitude, lng: data.longitude };
          setUserLocation(loc);
          // Small random offset to force centerOn object change so map recenters even if slightly unchanged
          setCenterOn({ lat: data.latitude, lng: data.longitude + (Math.random() * 0.0000001) });
          setLocating(false);
          locationAttemptedRef.current = false;
          return;
        }
      } catch (err) {
        // Fallback failed
      }
      setLocating(false);
      setLocationError(true);
      locationAttemptedRef.current = false;
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setCenterOn({ lat: loc.lat, lng: loc.lng + (Math.random() * 0.0000001) }); // force recenter
        setLocating(false);
        localStorage.setItem("hasLocationPermission", "true");
        locationAttemptedRef.current = false;
      },
      () => handleFallback(), // If GPS fails (e.g. desktop), use IP
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  const handleBusClick = useCallback((bus: BusData) => {
    setSelectedBus(bus);
    setDrawerState("peek");
    const live = livePositions[bus._id];
    const lat = live?.lat ?? bus.location?.lat;
    const lng = live?.lng ?? bus.location?.lng;
    if (lat && lng) setCenterOn({ lat, lng });
  }, [livePositions]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerState("closed");
    setSelectedBus(null);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#e8eaed] select-none">

      {/* ── FULL-SCREEN MAP ──────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        <LeafletBusMap
          buses={buses}
          livePositions={livePositions}
          selectedBusId={selectedBus?._id}
          onBusClick={handleBusClick}
          userLocation={userLocation}
          centerOn={centerOn}
          showRoutes={showRoutes}
          showStops={false}
        />
      </div>

      {/* ── TOP BAR (Google Maps style) ──────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-[500] p-3 md:p-4 pointer-events-none">
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto max-w-xl mx-auto md:mx-0">

          {/* Search box */}
          <div className={`flex-1 bg-[#ffffff] rounded-full shadow-lg flex items-center gap-3 px-4 transition-all ${searchFocused ? "ring-2 ring-[#F59E0B] shadow-xl" : ""}`}
            style={{ height: 48 }}>
            {searchFocused ? (
              <button onClick={() => { setSearchFocused(false); setSearchQuery(""); }} className="text-gray-500">
                <X size={20} />
              </button>
            ) : (
              <Search size={18} className="text-gray-400 flex-shrink-0" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search buses, stops, routes…"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Profile avatar circle */}
          <div className="w-10 h-10 rounded-full bg-[#FF5F1F] flex items-center justify-center shadow-md flex-shrink-0">
            <Bus size={18} className="text-[#111827]" />
          </div>
        </div>

        {/* Realtime status chip — below search */}
        <div className="flex justify-center md:justify-start max-w-xl mx-auto md:mx-0 mt-2 pointer-events-none">
          {isConnected ? (
            <span className="flex items-center gap-1.5 bg-[#ffffff]/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-bold text-emerald-700 shadow">
              <Radio size={9} className="animate-pulse" /> Realtime Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-[#ffffff]/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-bold text-gray-500 shadow">
              <WifiOff size={9} /> Polling Mode
            </span>
          )}
        </div>
      </div>

      {/* ── RIGHT SIDE FLOATING BUTTONS (Google Maps style) ─────────────── */}
      <div className="absolute right-3 md:right-4 z-[500] flex flex-col gap-3" style={{ bottom: drawerState === "full" ? "75%" : drawerState === "peek" ? 220 : 24 }}>

        {/* Layers button */}
        <div className="relative">
          <button
            onClick={() => setShowLayers((v) => !v)}
            className="w-12 h-12 bg-[#ffffff] rounded-2xl shadow-lg flex items-center justify-center text-gray-600 hover:shadow-xl transition-all active:scale-95"
          >
            <Layers size={20} />
          </button>

          {/* Layers popover */}
          <AnimatePresence>
            {showLayers && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className="absolute right-14 top-0 bg-[#ffffff] rounded-2xl shadow-2xl p-4 w-44"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Map Layers</p>
                {[
                  { label: "Routes", value: showRoutes, toggle: () => setShowRoutes((v) => !v) },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.toggle}
                    className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-700"
                  >
                    {item.label}
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? "bg-[#F59E0B]" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-[#ffffff] rounded-full shadow transition-all ${item.value ? "left-5" : "left-0.5"}`} />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Locate me button */}
        <button
          onClick={requestLocation}
          disabled={locating}
          className={`w-12 h-12 bg-[#ffffff] rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 ${locating ? "opacity-60" : "hover:shadow-xl"} ${locationError ? "text-[#EF4444]" : "text-[#F59E0B]"}`}
        >
          {locating ? (
            <div className="w-5 h-5 border-2 border-blue-300 border-t-[#F59E0B] rounded-full animate-spin" />
          ) : (
            <Locate size={20} />
          )}
        </button>
      </div>

      {/* ── BOTTOM SHEET DRAWER (Google Maps style) ─────────────────────── */}
      <AnimatePresence>
        {selectedBus && drawerState !== "closed" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: drawerState === "full" ? "0%" : "calc(100% - 180px)" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 60) {
                drawerState === "full" ? setDrawerState("peek") : handleCloseDrawer();
              } else if (info.offset.y < -60) {
                setDrawerState("full");
              }
            }}
            className="absolute inset-x-0 bottom-0 z-[600] bg-[#ffffff] rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)]"
            style={{ maxHeight: "85vh", overflow: "hidden" }}
          >
            {/* Drag handle */}
            <div className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Peek preview */}
            <div className="px-5 pb-4">
              <div className="flex items-start gap-4">
                {/* Bus icon */}
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <Bus size={26} className="text-[#F59E0B]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{selectedBus.busNumber}</h2>
                    {livePositions[selectedBus._id]?.deviceStatus === "Online" && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-[#FF5F1F] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <Radio size={7} className="animate-pulse" /> LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-medium truncate">
                    {selectedBus.routeId?.from} → {selectedBus.routeId?.to}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedBus.routeId?.routeName}</p>
                </div>

                <button
                  onClick={handleCloseDrawer}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { icon: Gauge, label: "Speed", value: `${livePositions[selectedBus._id]?.speed ?? selectedBus.speed ?? 0} km/h` },
                  { icon: MapPin, label: "Fare", value: `₹${selectedBus.fare}` },
                  { icon: Bus, label: "Seats", value: `${selectedBus.availableSeats} left` },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-2xl p-3 text-center">
                      <Icon size={16} className="text-[#F59E0B] mx-auto mb-1" />
                      <p className="text-xs font-black text-gray-800">{stat.value}</p>
                      <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Expand indicator */}
              <button
                onClick={() => setDrawerState(drawerState === "peek" ? "full" : "peek")}
                className="w-full mt-3 py-2 flex items-center justify-center gap-1 text-xs font-bold text-[#F59E0B]"
              >
                {drawerState === "peek" ? "More info" : "Less info"}
                {drawerState === "peek" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Full details (visible when expanded) */}
            {drawerState === "full" && selectedBus && (() => {
              const live = livePositions[selectedBus._id] || null;
              const from = selectedBus.routeId?.from || "Start";
              const to = selectedBus.routeId?.to || "End";
              const speed = live?.speed ?? selectedBus.speed ?? 0;
              const lat = live?.lat ?? selectedBus.location?.lat ?? null;
              const lng = live?.lng ?? selectedBus.location?.lng ?? null;
              const isOnline = live?.deviceStatus === "Online";
              const lastSeenText = live?.timestamp
                ? (() => {
                    const diff = Math.floor((Date.now() - new Date(live.timestamp).getTime()) / 1000);
                    if (diff < 10) return "Just now";
                    if (diff < 60) return `${diff}s ago`;
                    return `${Math.floor(diff / 60)}m ago`;
                  })()
                : "Unknown";
              const stops = selectedBus.routeId?.stops || [];
              let nextStop: any = null;
              if (lat && lng && stops.length) {
                let min = Infinity;
                stops.forEach((s: any) => {
                  const d = Math.hypot(lat - s.lat, lng - s.lng);
                  if (d < min) { min = d; nextStop = s; }
                });
              }
              return (
                <div className="px-5 pb-8 overflow-y-auto border-t border-gray-100 pt-5 space-y-4">
                  {/* Route */}
                  <div className="bg-gray-900 rounded-2xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">From</p>
                      <p className="text-sm font-black text-[#111827] truncate">{from}</p>
                    </div>
                    <Navigation size={16} className="text-[#FF5F1F] flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">To</p>
                      <p className="text-sm font-black text-[#111827] truncate">{to}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1"><Gauge size={10} /> Speed</div>
                      <p className="text-2xl font-black text-gray-900">{speed}<span className="text-sm font-semibold text-gray-400 ml-1">km/h</span></p>
                    </div>
                    {nextStop && (
                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-[#F59E0B] uppercase tracking-widest mb-1"><MapPin size={10} /> Next Stop</div>
                        <p className="text-sm font-black text-gray-900 leading-tight">{nextStop.stopName}</p>
                      </div>
                    )}
                  </div>

                  {/* GPS offline warning */}
                  {!isOnline && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                      <WifiOff size={16} className="text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-amber-800">GPS Offline</p>
                        <p className="text-[10px] text-amber-600 mt-0.5">Last updated {lastSeenText}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM STATUS BAR when no bus selected (Google Maps bottom pill) */}
      <AnimatePresence>
        {!selectedBus && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="absolute bottom-6 inset-x-4 z-[500] flex items-center justify-between"
          >
            {/* Left: bus count pill */}
            <div className="bg-[#ffffff] rounded-full shadow-lg px-4 py-2.5 flex items-center gap-2.5">
              <Bus size={14} className="text-[#FF5F1F]" />
              <span className="text-xs font-bold text-gray-700">Digi Bus Stand</span>
              {liveCount > 0 && (
                <>
                  <span className="w-px h-3 bg-gray-200" />
                  <span className="flex items-center gap-1 text-xs font-bold text-[#FF5F1F]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F1F] animate-pulse inline-block" />
                    {liveCount} live
                  </span>
                </>
              )}
            </div>

            {/* Right: location error note */}
            {locationError && (
              <div className="bg-[#ffffff] rounded-full shadow-lg px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <MapPin size={12} />
                Location unavailable
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismiss layers panel on outside click */}
      {showLayers && (
        <div className="absolute inset-0 z-[490]" onClick={() => setShowLayers(false)} />
      )}
    </div>
  );
}

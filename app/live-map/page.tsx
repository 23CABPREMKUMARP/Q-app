"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, X, Locate, Layers, Bus, Navigation, MapPin, Map,
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
      <div className="w-16 h-16 border-4 border-gray-300 border-t-[#FF6D00] rounded-full animate-spin" />
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

  const [notification, setNotification] = useState<{ message: string, title?: string } | null>(null);
  const notified5kmRef = useRef(false);

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

  // ── Search Logic ────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const q = searchQuery.toLowerCase();
    const results: any[] = [];
    
    buses.forEach(bus => {
      // 1. Check Bus
      if (
        bus.busNumber?.toLowerCase().includes(q) || 
        bus.busCode?.toLowerCase().includes(q)
      ) {
        results.push({ type: 'bus', title: `Bus ${bus.busNumber} ${bus.busCode ? `(${bus.busCode})` : ''}`, subtitle: bus.routeId?.routeName || 'No Route', lat: bus.location?.lat, lng: bus.location?.lng, bus });
      }
      
      // 2. Check Route
      if (bus.routeId && (bus.routeId.routeName || "").toLowerCase().includes(q)) {
        if (!results.find(r => r.type === 'route' && r.title === bus.routeId.routeName)) {
          results.push({ type: 'route', title: bus.routeId.routeName, subtitle: `Route`, lat: bus.location?.lat, lng: bus.location?.lng, bus });
        }
      }
      
      // 3. Check Stops
      if (bus.routeId && Array.isArray(bus.routeId.stops)) {
        bus.routeId.stops.forEach((stop: any) => {
          if (stop.stopName && stop.stopName.toLowerCase().includes(q)) {
             if (!results.find(r => r.type === 'stop' && r.title === stop.stopName)) {
               results.push({ type: 'stop', title: stop.stopName, subtitle: `Stop on ${bus.routeId.routeName}`, lat: stop.lat, lng: stop.lng, bus });
             }
          }
        });
      }
    });
    
    return results.slice(0, 10);
  }, [searchQuery, buses]);

  // ── Proximity Notification ──────────────────────────────────────────────────
  useEffect(() => {
    if (!targetBusId || !userLocation) return;
    const live = livePositions[targetBusId];
    if (live && live.lat && live.lng) {
      // Calculate distance between userLocation and live
      const R = 6371; // km
      const dLat = (live.lat - userLocation.lat) * Math.PI / 180;
      const dLng = (live.lng - userLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(live.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      if (distance <= 5.0 && !notified5kmRef.current) {
        setNotification({ title: "Bus Approaching!", message: "Your bus is within 5 km of your location." });
        notified5kmRef.current = true;
        setTimeout(() => setNotification(null), 8000); // Hide after 8s
      }
    }
  }, [livePositions, targetBusId, userLocation]);

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
          buses={buses.filter(bus => livePositions[bus._id] !== undefined)}
          livePositions={livePositions}
          selectedBusId={selectedBus?._id}
          onBusClick={handleBusClick}
          userLocation={userLocation}
          centerOn={centerOn}
          showRoutes={showRoutes}
          showStops={false}
        />
      </div>

      {/* ── NOTIFICATION TOAST ───────────────────────────────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 inset-x-4 z-[600] pointer-events-none"
          >
            <div className="max-w-md mx-auto bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#FF6D00]/20 p-4 flex items-start gap-3 pointer-events-auto">
              <div className="w-10 h-10 bg-[#FF6D00]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bus size={20} className="text-[#FF6D00]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-gray-900">{notification.title}</h3>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP BAR (Google Maps style) ──────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-[500] p-3 md:p-4 pointer-events-none">
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto max-w-xl mx-auto md:mx-0">

          {/* Search box container */}
          <div className={`flex-1 relative bg-[#FFFFFF] rounded-full shadow-lg flex items-center gap-3 px-4 transition-all ${searchFocused ? "ring-2 ring-[#FF6D00] shadow-xl" : ""}`}
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

            {/* Search Results Dropdown */}
            {searchFocused && searchQuery && searchResults.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-[#FFFFFF] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[501] max-h-80 overflow-y-auto pointer-events-auto">
                {searchResults.map((res, i) => (
                  <button 
                    key={i}
                    onMouseDown={() => {
                      if (res.lat && res.lng) {
                        setCenterOn({ lat: res.lat, lng: res.lng });
                        if (res.type === 'bus') {
                           handleBusClick(res.bus);
                        }
                      }
                      setSearchFocused(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                      {res.type === 'bus' ? <Bus size={16} /> : res.type === 'route' ? <Map size={16} /> : <MapPin size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-gray-900 truncate">{res.title}</p>
                       <p className="text-xs text-gray-500 truncate">{res.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile avatar circle */}
          <div className="w-10 h-10 rounded-full bg-[#FF6D00] flex items-center justify-center shadow-md flex-shrink-0">
            <Bus size={18} className="text-[#1A0B00]" />
          </div>
        </div>

        {/* Realtime status chip — below search */}
        <div className="flex justify-center md:justify-start max-w-xl mx-auto md:mx-0 mt-2 pointer-events-none">
          {isConnected ? (
            <span className="flex items-center gap-1.5 bg-[#FFFFFF]/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-bold text-emerald-700 shadow">
              <Radio size={9} className="animate-pulse" /> Realtime Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-[#FFFFFF]/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-bold text-gray-500 shadow">
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
            className="w-12 h-12 bg-[#FFFFFF] rounded-2xl shadow-lg flex items-center justify-center text-gray-600 hover:shadow-xl transition-all active:scale-95"
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
                className="absolute right-14 top-0 bg-[#FFFFFF] rounded-2xl shadow-2xl p-4 w-44"
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
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? "bg-[#FF6D00]" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-[#FFFFFF] rounded-full shadow transition-all ${item.value ? "left-5" : "left-0.5"}`} />
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
          className={`w-12 h-12 bg-[#FFFFFF] rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 ${locating ? "opacity-60" : "hover:shadow-xl"} ${locationError ? "text-[#EF4444]" : "text-[#FF6D00]"}`}
        >
          {locating ? (
            <div className="w-5 h-5 border-2 border-blue-300 border-t-[#FF6D00] rounded-full animate-spin" />
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
            className="absolute inset-x-0 bottom-0 z-[600] bg-[#FFFFFF] rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)]"
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
                  <Bus size={26} className="text-[#FF6D00]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{selectedBus.busNumber}</h2>
                    {livePositions[selectedBus._id]?.deviceStatus === "Online" && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-[#FF6D00] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
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
                    <div key={stat.label} className="bg-[#FFFFFF] rounded-2xl p-3 text-center">
                      <Icon size={16} className="text-[#FF6D00] mx-auto mb-1" />
                      <p className="text-xs font-black text-gray-800">{stat.value}</p>
                      <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Expand indicator */}
              <button
                onClick={() => setDrawerState(drawerState === "peek" ? "full" : "peek")}
                className="w-full mt-3 py-2 flex items-center justify-center gap-1 text-xs font-bold text-[#FF6D00]"
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
                      <p className="text-sm font-black text-[#1A0B00] truncate">{from}</p>
                    </div>
                    <Navigation size={16} className="text-[#FF6D00] flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">To</p>
                      <p className="text-sm font-black text-[#1A0B00] truncate">{to}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#FFFFFF] rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1"><Gauge size={10} /> Speed</div>
                      <p className="text-2xl font-black text-gray-900">{speed}<span className="text-sm font-semibold text-gray-400 ml-1">km/h</span></p>
                    </div>
                    {nextStop && (
                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-[#FF6D00] uppercase tracking-widest mb-1"><MapPin size={10} /> Next Stop</div>
                        <p className="text-sm font-black text-gray-900 leading-tight">{nextStop.stopName}</p>
                      </div>
                    )}
                  </div>

                  {/* GPS offline warning */}
                  {!isOnline && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-[#FF6D00] rounded-2xl">
                      <WifiOff size={16} className="text-[#FF6D00] flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-amber-800">GPS Offline</p>
                        <p className="text-[10px] text-[#FF6D00] mt-0.5">Last updated {lastSeenText}</p>
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
            <div className="bg-[#FFFFFF] rounded-full shadow-lg px-4 py-2.5 flex items-center gap-2.5">
              <Bus size={14} className="text-[#FF6D00]" />
              <span className="text-xs font-bold text-gray-700">Smart Tamizha</span>
              {liveCount > 0 && (
                <>
                  <span className="w-px h-3 bg-gray-200" />
                  <span className="flex items-center gap-1 text-xs font-bold text-[#FF6D00]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6D00] animate-pulse inline-block" />
                    {liveCount} live
                  </span>
                </>
              )}
            </div>

            {/* Right: location error note */}
            {locationError && (
              <div className="bg-[#FFFFFF] rounded-full shadow-lg px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-[#FF6D00]">
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

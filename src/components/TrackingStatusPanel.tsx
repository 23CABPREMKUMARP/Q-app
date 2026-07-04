"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Navigation, Clock, MapPin, X, ArrowRight, Route, ShieldCheck, Wifi, WifiOff, Gauge, Bus, Radio } from "lucide-react";
import type { BusData } from "@/src/types";
import type { BusPosition } from "@/src/hooks/useBusRealtime";

interface TrackingStatusPanelProps {
  bus: BusData;
  livePosition: BusPosition | null;
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
  onMinimize: () => void;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const TrackingStatusPanel: React.FC<TrackingStatusPanelProps> = ({
  bus,
  livePosition,
  userLocation,
  onClose,
  onMinimize,
}) => {
  const from = bus?.routeId?.from || "Start";
  const to = bus?.routeId?.to || "End";
  const isGpsOnline = livePosition?.deviceStatus === "Online";

  const speed = livePosition?.speed ?? bus?.speed ?? 0;
  const lat = livePosition?.lat ?? bus?.location?.lat ?? null;
  const lng = livePosition?.lng ?? bus?.location?.lng ?? null;

  const distanceToUser = useMemo(() => {
    if (!userLocation || !lat || !lng) return null;
    const d = haversineKm(userLocation.lat, userLocation.lng, lat, lng);
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  }, [userLocation, lat, lng]);

  const lastSeenText = useMemo(() => {
    if (!livePosition?.timestamp) return "Unknown";
    const diff = Math.floor((Date.now() - new Date(livePosition.timestamp).getTime()) / 1000);
    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }, [livePosition]);

  const nextStop = useMemo(() => {
    const stops = bus?.routeId?.stops || [];
    if (!lat || !lng || stops.length === 0) return null;
    let minDist = Infinity;
    let nearest: any = null;
    for (const stop of stops) {
      const d = haversineKm(lat, lng, stop.lat, stop.lng);
      if (d < minDist) { minDist = d; nearest = stop; }
    }
    return nearest;
  }, [bus, lat, lng]);

  const etaMinutes = useMemo(() => {
    if (!nextStop || !lat || !lng) return null;
    const dist = haversineKm(lat, lng, nextStop.lat, nextStop.lng);
    const avgSpeed = speed > 5 ? speed : 25; // assume 25km/h if stopped
    return Math.ceil((dist / avgSpeed) * 60);
  }, [nextStop, lat, lng, speed]);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => { if (info.offset.y > 150) onMinimize(); }}
      className="fixed inset-x-0 bottom-0 z-[1000] bg-[#ffffff] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
    >
      {/* Drag handle */}
      <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing flex-shrink-0">
        <div className="w-10 h-1 bg-zinc-200 rounded-full" />
      </div>

      <div className="px-5 md:px-8 pb-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {isGpsOnline ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                  <Radio size={10} className="animate-pulse" /> Live GPS
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200">
                  <WifiOff size={10} /> Last Known · {lastSeenText}
                </span>
              )}
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[9px] font-bold rounded-full">
                {bus.busCode || bus.busNumber}
              </span>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">{bus.busNumber}</h2>
            <p className="text-sm font-bold text-zinc-500">{bus.routeId?.routeName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Route card */}
        <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black rounded-2xl p-5 mb-4 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#A4E5E0] rounded-l-2xl" />
          <div className="flex items-center gap-4 pl-3">
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">From</p>
              <p className="text-sm font-black text-black uppercase truncate">{from}</p>
            </div>
            <ArrowRight size={16} className="text-[#A4E5E0] flex-shrink-0" />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">To</p>
              <p className="text-sm font-black text-black uppercase truncate">{to}</p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              <Gauge size={11} /> Speed
            </div>
            <p className="text-2xl font-black text-zinc-900">{speed}<span className="text-sm font-bold text-zinc-600 ml-1">km/h</span></p>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              <Navigation size={11} /> Distance
            </div>
            <p className="text-2xl font-black text-zinc-900">{distanceToUser || <span className="text-sm text-zinc-600">No location</span>}</p>
          </div>

          {nextStop && (
            <div className="bg-[#FFF8F0] border border-[#A4E5E0]/20 rounded-2xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-[#A4E5E0] uppercase tracking-widest">
                <MapPin size={11} /> Next Stop
              </div>
              <p className="text-sm font-black text-zinc-900 leading-tight">{nextStop.stopName}</p>
            </div>
          )}

          {etaMinutes !== null && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                <Clock size={11} /> ETA
              </div>
              <p className="text-2xl font-black text-zinc-900">{etaMinutes}<span className="text-sm font-bold text-zinc-600 ml-1">min</span></p>
            </div>
          )}
        </div>

        {/* GPS offline warning */}
        {!isGpsOnline && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800">
            <WifiOff size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wide">GPS Offline</p>
              <p className="text-xs font-medium mt-0.5 text-amber-700">Showing last known location · Updated {lastSeenText}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

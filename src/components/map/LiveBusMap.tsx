"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap, Tooltip, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { BusData } from "@/src/types";
import type { BusPosition } from "@/src/hooks/useBusRealtime";

// ─── Fix Leaflet default icon paths (Next.js static assets) ──────────────────
if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// ─── Icon Factories ───────────────────────────────────────────────────────────

function createBusIcon(bus: BusData, livePos: BusPosition | null, isSelected: boolean): L.DivIcon {
  const isOnline = livePos?.deviceStatus === "Online";
  const isRunning = bus.status === "Running" || isOnline;
  const heading = livePos?.heading ?? bus.location?.rotation ?? 0;
  const speed = livePos?.speed ?? bus.speed ?? 0;

  const pulseClass = isRunning ? "animate-ping" : "";
  const ringColor = isSelected ? "#f97316" : isRunning ? "#22c55e" : "#94a3b8";
  const ringClass = isSelected ? "ring-orange-500 shadow-orange-400/50" : isRunning ? "ring-green-400 shadow-green-400/40" : "ring-slate-300";

  const html = `
    <div class="relative flex flex-col items-center" style="transform: rotate(${heading}deg)">
      <div class="relative">
        <div class="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-xl ring-2 ${ringClass} ring-offset-2 overflow-hidden" style="box-shadow: 0 4px 20px ${ringColor}40">
          <img src="/bus-marker-3d.png" alt="Bus" style="width:40px;height:40px;object-fit:contain;" />
        </div>
        ${isRunning ? `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 ring-2 ring-white ${pulseClass} z-10"></span>` : `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-300 ring-2 ring-white z-10"></span>`}
      </div>
      <div style="transform: rotate(-${heading}deg)" class="mt-1 bg-zinc-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg border border-white/10">
        ${bus.busCode || bus.busNumber}${speed > 0 ? ` · ${speed}km/h` : ""}
      </div>
    </div>`;

  return L.divIcon({
    html,
    className: "",
    iconSize: [64, 80],
    iconAnchor: [32, 48],
    popupAnchor: [0, -48],
  });
}

function createUserIcon(): L.DivIcon {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-5 h-5 rounded-full bg-blue-500 ring-4 ring-blue-300/60 shadow-lg"></div>
      <div class="absolute w-12 h-12 rounded-full bg-blue-400/20 animate-ping"></div>
    </div>`;
  return L.divIcon({ html, className: "", iconSize: [24, 24], iconAnchor: [12, 12] });
}

function createStopIcon(type: "major" | "small"): L.DivIcon {
  const size = type === "major" ? 10 : 6;
  const color = type === "major" ? "#f97316" : "#94a3b8";
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`;
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

// ─── Map auto-fit component ───────────────────────────────────────────────────

function AutoFit({ buses, livePositions, centerOn }: { buses: BusData[]; livePositions: Record<string, BusPosition>; centerOn?: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (centerOn) {
      map.setView([centerOn.lat, centerOn.lng], 16, { animate: true, duration: 0.8 });
      return;
    }

    const points: [number, number][] = buses
      .map((b) => {
        const live = livePositions[b._id];
        const lat = live?.lat ?? b.location?.lat;
        const lng = live?.lng ?? b.location?.lng;
        return lat && lng ? ([lat, lng] as [number, number]) : null;
      })
      .filter(Boolean) as [number, number][];

    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [50, 50], animate: true, duration: 0.8, maxZoom: 15 });
    }
  }, [centerOn, buses.length]);

  return null;
}

// ─── Animated marker wrapper ──────────────────────────────────────────────────
// Smoothly slides markers to new positions via CSS transitions baked into divIcon

function AnimatedBusMarker({
  bus,
  livePos,
  isSelected,
  onClick,
  showRoute,
}: {
  bus: BusData;
  livePos: BusPosition | null;
  isSelected: boolean;
  onClick: () => void;
  showRoute: boolean;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  const lat = livePos?.lat ?? bus.location?.lat ?? 11.0168;
  const lng = livePos?.lng ?? bus.location?.lng ?? 76.9558;
  const icon = createBusIcon(bus, livePos, isSelected);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
      // Smoothly animate to new position
      const current = markerRef.current.getLatLng();
      if (Math.abs(current.lat - lat) > 0.00001 || Math.abs(current.lng - lng) > 0.00001) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [lat, lng, livePos?.heading, isSelected]);

  const routePath: [number, number][] = showRoute && bus.routeId?.stops
    ? bus.routeId.stops.map((s: any) => [s.lat, s.lng] as [number, number])
    : [];

  return (
    <>
      {showRoute && routePath.length > 1 && (
        <Polyline
          positions={routePath}
          pathOptions={{ color: isSelected ? "#f97316" : "#94a3b8", weight: isSelected ? 4 : 2, opacity: isSelected ? 0.9 : 0.4, dashArray: isSelected ? undefined : "6 6" }}
        />
      )}
      <Marker
        ref={markerRef as any}
        position={[lat, lng]}
        icon={icon}
        eventHandlers={{ click: onClick }}
        zIndexOffset={isSelected ? 1000 : 0}
      >
        <Tooltip direction="top" offset={[0, -50]} permanent={false}>
          <div className="font-bold text-xs">
            {bus.routeId?.from} → {bus.routeId?.to}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}

// ─── Stop markers ─────────────────────────────────────────────────────────────

function StopMarkers({ bus }: { bus: BusData }) {
  const stops = bus.routeId?.stops || [];
  return (
    <>
      {stops.map((stop: any) => (
        <Marker
          key={stop._id}
          position={[stop.lat, stop.lng]}
          icon={createStopIcon(stop.type)}
        >
          <Tooltip direction="top" offset={[0, -4]}>
            <span className="text-xs font-semibold">{stop.stopName}</span>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

// ─── Main Map Component ───────────────────────────────────────────────────────

interface LeafletBusMapProps {
  buses: BusData[];
  livePositions: Record<string, BusPosition>;
  selectedBusId?: string | null;
  onBusClick: (bus: BusData) => void;
  userLocation?: { lat: number; lng: number } | null;
  centerOn?: { lat: number; lng: number } | null;
  showRoutes?: boolean;
  showStops?: boolean;
}

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const DEFAULT_CENTER: [number, number] = [11.0168, 76.9558]; // Coimbatore

const LeafletBusMap = React.memo(
  ({ buses, livePositions, selectedBusId, onBusClick, userLocation, centerOn, showRoutes = true, showStops = false }: LeafletBusMapProps) => {
    return (
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        className="w-full h-full rounded-3xl z-0"
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />
        <ZoomControl position="bottomright" />

        <AutoFit buses={buses} livePositions={livePositions} centerOn={centerOn} />

        {buses.map((bus) => (
          <React.Fragment key={bus._id}>
            <AnimatedBusMarker
              bus={bus}
              livePos={livePositions[bus._id] || null}
              isSelected={selectedBusId === bus._id}
              onClick={() => onBusClick(bus)}
              showRoute={showRoutes}
            />
            {showStops && selectedBusId === bus._id && <StopMarkers bus={bus} />}
          </React.Fragment>
        ))}

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
              <Tooltip direction="top" offset={[0, -12]}>
                <span className="text-xs font-bold">Your Location</span>
              </Tooltip>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={500}
              pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.06, weight: 1, opacity: 0.3 }}
            />
          </>
        )}
      </MapContainer>
    );
  }
);

LeafletBusMap.displayName = "LeafletBusMap";
export default LeafletBusMap;

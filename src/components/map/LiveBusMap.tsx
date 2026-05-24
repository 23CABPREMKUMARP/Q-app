import React, { useEffect, useState, useRef, Suspense } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";


import { createRoot, Root } from "react-dom/client";
import { Bus, Navigation, Radar } from "lucide-react";

import { BusData, MapLayers } from "@/src/types";

function getSimulatedLocation(bus: any, timeMs: number) {
  if (bus.status !== "Running" || !bus.routeId?.path || bus.routeId.path.length < 2) {
    return bus.location;
  }
  
  // 120 seconds for a full loop along the route
  const loopDuration = 120000; 
  // Offset by bus ID to spread them out
  const offset = String(bus._id).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) * 1000;
  
  let progress = ((timeMs + offset) % loopDuration) / loopDuration; 
  // Make it go back and forth (triangle wave)
  if (progress > 0.5) {
     progress = 1 - (progress - 0.5) * 2;
  } else {
     progress = progress * 2;
  }

  const path = bus.routeId.path;
  const totalSegments = path.length - 1;
  const exactSegment = progress * totalSegments;
  const segmentIndex = Math.floor(exactSegment);
  const segmentProgress = exactSegment - segmentIndex;

  const startPoint = path[segmentIndex];
  const endPoint = path[Math.min(segmentIndex + 1, path.length - 1)];

  const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * segmentProgress;
  const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * segmentProgress;

  // Calculate rotation (bearing)
  const dy = endPoint.lat - startPoint.lat;
  const dx = endPoint.lng - startPoint.lng;
  let rotation = Math.atan2(dy, dx) * 180 / Math.PI;
  // Convert math angle to map bearing
  rotation = 90 - rotation;

  return { lat, lng, rotation };
}

const BusMarker = React.memo(({ isRunning, busNumber, isSelected, isNearby, speed, availableSeats, from, to, rotationDegrees, mapBearing }: { isRunning: boolean, busNumber: string, isSelected: boolean, isNearby?: boolean, speed?: number, availableSeats?: number, from?: string, to?: string, rotationDegrees?: number, mapBearing?: number }) => {
  return (
    <div className={`flex flex-col items-center justify-center relative transition-all duration-300 ${isSelected ? "z-50" : "z-10"}`}>
      {/* HUD Plate - Pure Origin-Dest Zero-Gap Interface */}
      <div className={`absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${isSelected ? "z-50 scale-110" : "z-10 scale-90"}`}>
          <div className={`bg-zinc-900/95 premium-blur border border-white/20 rounded-md px-2 py-0.5 shadow-2xl flex items-center gap-2 whitespace-nowrap ${isSelected ? "ring-2 ring-orange-500" : ""}`}>
             {/* Dynamic Status Pulsar */}
             <div className={`w-1 h-1 rounded-full bg-orange-500 ${isRunning ? "animate-pulse" : ""}`} />

             {/* Pure Route Telemetry */}
             <div className="flex items-center gap-1.5 text-[8px] font-black tracking-tight text-white uppercase italic">
                <span className="text-orange-400">{from || "Origin"}</span>
                <Navigation size={6} className="rotate-90 text-zinc-500 opacity-50" />
                <span className="text-orange-400">{to || "Dest"}</span>
             </div>

             {/* Micro Stats (Contextual on Selection) */}
             {isSelected && (
                <div className="flex items-center gap-1.5 border-l border-white/10 ml-0.5 pl-1.5 transition-all">
                   <span className="text-[7px] font-black text-white">{speed || 0}<span className="text-zinc-500 pl-0.5">K</span></span>
                   <span className="text-[7px] font-black text-emerald-400">{availableSeats || 0}<span className="text-zinc-500 pl-0.5">S</span></span>
                </div>
             )}
          </div>
      </div>

      <div 
        className="w-16 h-16 relative flex items-center justify-center transition-transform duration-300 ease-out will-change-transform"
        style={{ 
          transform: `translate3d(0,0,0) scale(calc(var(--bus-scale, 1.0) * ${isSelected ? 1.4 : 1}))`, 
          transformOrigin: 'center center' 
        }}
      >
        {/* Soft Shadow Underneath (Simulated Elevation) */}
        <div className="absolute top-[80%] left-1/4 right-1/4 h-2 bg-black/40 blur-sm rounded-full transform scale-x-150 md:blur-md" />

        {/* Live Neural Pulse Glow - High Contrast for Rapido Aesthetic */}
        {isRunning && (
          <div className="absolute inset-[-10px] rounded-full border-2 border-orange-500/30 animate-[ping_3s_infinite] opacity-50" />
        )}

        {/* Main Icon Body - Using the Premium Front-Face Asset */}
        <div 
          className="w-full h-full flex items-center justify-center transition-all duration-500 relative z-10"
        >
          <img 
            src="/bus-marker-3d.png" 
            alt="Bus" 
            loading="lazy"
            className={`w-14 h-14 object-contain transition-transform duration-500 ${isSelected ? "scale-110 drop-shadow-xl" : isNearby ? "scale-125 drop-shadow-2xl" : "scale-100"}`} 
          />
        </div>

        {isSelected && (
          <div className="absolute -inset-1 rounded-full border-[3px] border-orange-500 shadow-[0_0_20px_rgba(255,107,0,0.5)] md:shadow-[0_0_40px_rgba(255,107,0,0.8)] animate-pulse" />
        )}
        {!isSelected && isNearby && (
          <div className="absolute -inset-1 rounded-full border-[2px] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
        )}
      </div>
    </div>
  );
});

const LiveBusMap = React.memo(({ 
    onBusClick, buses, selectedBusId, nearbyBusIds, layers, onUserLocationUpdate,
    userLocation, nearestBus, centerOn, navPath, navStats
}: { 
    onBusClick: (bus: any) => void, buses: BusData[], selectedBusId?: string | null, nearbyBusIds?: string[], layers: MapLayers, onUserLocationUpdate?: (pos: {lat: number, lng: number}) => void,
    userLocation?: {lat: number, lng: number} | null, nearestBus?: any, centerOn?: any, navPath?: any, navStats?: any
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const busMarkers = useRef<{ [key: string]: { marker: maplibregl.Marker, root: Root, isRunning: boolean, isSelected: boolean, rotation?: number, speed?: number, availableSeats?: number } }>({});
  const stopMarkersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapBearing, setMapBearing] = useState(-15);

  // Memoize unique stops list to prevent nested iteration on every telemetry tick
  const allStops = React.useMemo(() => {
    const stopsMap = new Map();
    buses.forEach(bus => {
      if (bus.routeId?.stops) {
        bus.routeId.stops.forEach((stop: any) => {
          stopsMap.set(stop._id, stop);
        });
      }
    });
    return Array.from(stopsMap.values());
  }, [buses.length]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Vibrant Premium Map Theme (Voyager Style - Colorful and Detailed)
    // Google Maps Style Roadmap Theme
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          google: {
            type: "raster",
            tiles: ["https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"],
            tileSize: 256,
            attribution: "Google Maps"
          }
        },
        layers: [
          {
            id: "google-roadmap",
            type: "raster",
            source: "google",
            paint: {
              "raster-opacity": 1
            }
          }
        ]
      },
      center: [76.9558, 11.0168],
      zoom: 14,
      pitch: 45, // Professional angle
      bearing: -10,
      scrollZoom: true
    });

    // Dynamically scale buses perfectly with map zoom without React re-renders!
    const updateBusScale = () => {
      if (mapContainer.current) {
        const zoom = map.getZoom();
        // SUBTLE SCALING: Gentle zoom curve to prevent massive distortion during tracking
        const scale = Math.max(0.65, Math.min(1.2, 0.95 * Math.pow(1.04, zoom - 14)));
        mapContainer.current.style.setProperty('--bus-scale', scale.toString());
      }
    };

    map.on('zoom', updateBusScale);
    map.on('rotate', () => setMapBearing(map.getBearing()));

    map.on("load", () => {
      setMapLoaded(true);
      updateBusScale(); // Apply initial scale

      // Only adding essential route sources
      map.addSource("routes", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      
      // 0. Volumetric Drop Shadow (Depth)
      map.addLayer({
        id: "routes-layer-shadow",
        type: "line",
        source: "routes",
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": "rgba(0,0,0,0.15)",
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            10, 16,
            14, 30,
            18, 64
          ],
          "line-blur": 2,
          "line-offset": 2
        }
      });

      // 1. Outer Casing (The "road structure" base)
      map.addLayer({
        id: "routes-layer-casing",
        type: "line",
        source: "routes",
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "isActive"], true], "#FFEDD5", // Light orange border for active
            "#e2e8f0" // Faint gray for inactive
          ],
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            10, 10,
            14, 26,
            18, 60
          ],
          "line-opacity": [
            "case",
            ["==", ["get", "isActive"], true], 1.0,
            0.5
          ]
        }
      });

      // 2. Inner Route Line (The high-intensity "lane")
      map.addLayer({
        id: "routes-layer-inner",
        type: "line",
        source: "routes",
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "isActive"], true], "#FF3D00", // Neural Hot Orange
            "#64748b" // Cool Slate for background routes
          ],
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            10, 8,
            14, 20,
            18, 52
          ],
          "line-opacity": [
            "case",
            ["==", ["get", "isActive"], true], 0.9,
            0.4
          ]
        }
      });

      // 3. User to Bus Navigation Path (Neon Radioactive Highlights)
      map.addSource("nav-routes", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "nav-routes-casing",
        type: "line",
        source: "nav-routes",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { 
          "line-color": "#00E5FF", // Cyber Cyan Casing
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 10, 14, 22, 18, 36], 
          "line-opacity": 0.3 
        }
      });
      map.addLayer({
        id: "nav-routes-inner",
        type: "line",
        source: "nav-routes",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { 
          "line-color": "#18FFFF", // Radioactive Cyan
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 5, 14, 12, 18, 24] 
        }
      });
    });

    mapRef.current = map;
    return () => {
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getStyle()) return;
    const routeFeatures = !layers.showRoutes ? [] : buses.filter(b => b.routeId?.path && b.routeId.path.length >= 2).map(bus => ({
      type: "Feature",
      properties: {
        isActive: selectedBusId ? selectedBusId === bus._id : true
      },
      geometry: { type: "LineString", coordinates: bus.routeId!.path.map(p => [p.lng, p.lat]) }
    }));
    
    try {
      const s = map.getSource("routes") as maplibregl.GeoJSONSource;
      if (s) s.setData({ type: "FeatureCollection", features: routeFeatures } as any);

      // Update Live Navigation Paths
      const navSource = map.getSource("nav-routes") as maplibregl.GeoJSONSource;
      if (navSource) {
        if (navPath) {
          navSource.setData({
            type: "FeatureCollection",
            features: [{ type: "Feature", properties: {}, geometry: navPath }]
          } as any);
        
        // Auto-center and perfectly frame the user's nav path on screen
        if (navPath.coordinates && navPath.coordinates.length > 0) {
           const bounds = new maplibregl.LngLatBounds();
           navPath.coordinates.forEach((coord: any) => bounds.extend(coord));
           map.fitBounds(bounds, { padding: 120, duration: 2000, pitch: 45, maxZoom: 16 });
        }
      } else {
        navSource.setData({ type: "FeatureCollection", features: [] } as any);
      }
    }
    } catch (error) {
      console.warn("Map layer update error:", error);
    }
  }, [buses, mapLoaded, selectedBusId, navPath, layers.showRoutes]);

  // Center Map when Search or Navigation triggers
  useEffect(() => {
    if (mapRef.current && centerOn && mapLoaded) {
      mapRef.current.flyTo({ 
        center: [centerOn.lng, centerOn.lat], 
        zoom: centerOn.zoom || 16, 
        pitch: centerOn.pitch !== undefined ? centerOn.pitch : 45,
        bearing: centerOn.bearing !== undefined ? centerOn.bearing : 0,
        essential: true, 
        duration: 2500 
      });
    }
  }, [centerOn, mapLoaded]);

  // Handle User Location Map Marker
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapLoaded) return;
      
      if (userLocation) {
         if (!userMarkerRef.current) {
            const el = document.createElement('div');
            el.className = 'relative flex items-center justify-center';
            
            const radius = document.createElement('div');
            radius.className = 'absolute w-32 h-32 bg-orange-500/10 rounded-full border border-orange-500/20 animate-pulse';
            
            const dot = document.createElement('div');
            dot.className = 'w-5 h-5 bg-orange-600 border-[3px] border-white rounded-full shadow-[0_0_20px_rgba(255,107,0,0.8)] z-10';
            
            el.appendChild(radius);
            el.appendChild(dot);
            
            userMarkerRef.current = new maplibregl.Marker({ element: el })
              .setLngLat([userLocation.lng, userLocation.lat])
              .addTo(map);
         } else {
            userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
         }
      } else if (userMarkerRef.current) {
         userMarkerRef.current.remove();
         userMarkerRef.current = null;
      }
  }, [userLocation, mapLoaded]);


  // Update Markers Target Engine
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    buses.forEach(bus => {
      const isSelected = selectedBusId === bus._id;
      const isNearby = nearbyBusIds?.includes(bus._id) || false;
      const isRunning = bus.status === 'Running';

      if (!busMarkers.current[bus._id]) {
        const el = document.createElement('div');
        el.className = "bus-marker-canvas-wrapper";
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onBusClick(bus);
          map.flyTo({ center: [bus.location.lng, bus.location.lat], zoom: 15 });
        });
        
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([bus.location.lng, bus.location.lat])
          .addTo(map);
          
        const root = createRoot(el);
        root.render(<BusMarker rotationDegrees={bus.location.rotation} isRunning={isRunning} busNumber={bus.busNumber} isSelected={isSelected} isNearby={isNearby} mapBearing={mapBearing} from={bus.routeId?.from} to={bus.routeId?.to} speed={bus.speed} availableSeats={bus.availableSeats} />);
        busMarkers.current[bus._id] = { 
            marker, root, isRunning, isSelected, 
            rotation: bus.location.rotation,
            speed: bus.speed,
            availableSeats: bus.availableSeats,
            targetLng: bus.location.lng, 
            targetLat: bus.location.lat,
            busData: bus
        } as any;
      } else {
        const cache = busMarkers.current[bus._id] as any;
        // Set target coordinates for the smooth interpolator Engine!
        cache.targetLng = bus.location.lng;
        cache.targetLat = bus.location.lat;
        cache.busData = bus;
        
        // Critical: Re-render marker if telemetry, selection, or rotation state shifts
        if (
          cache.isRunning !== isRunning || 
          cache.isSelected !== isSelected || cache.isNearby !== isNearby || 
          cache.speed !== bus.speed || 
          cache.availableSeats !== bus.availableSeats || 
          cache.rotation !== bus.location.rotation
        ) {
           cache.isRunning = isRunning;
           cache.isSelected = isSelected; cache.isNearby = isNearby;
           cache.speed = bus.speed;
           cache.availableSeats = bus.availableSeats;
           cache.rotation = bus.location.rotation;
           cache.root.render(
             <BusMarker 
               isRunning={isRunning} 
               busNumber={bus.busNumber} 
               isSelected={isSelected} isNearby={isNearby} 
               speed={bus.speed} 
               availableSeats={bus.availableSeats} 
               from={bus.routeId?.from}
               to={bus.routeId?.to}
               rotationDegrees={bus.location.rotation}
               mapBearing={mapBearing}
             />
           );
        }
        cache.marker.getElement().style.display = layers.showBuses ? 'block' : 'none';
      }
    });

    Object.keys(busMarkers.current).forEach(id => {
      if (!buses.find(b => b._id === id)) {
        setTimeout(() => {
           if (busMarkers.current[id]) {
               busMarkers.current[id].root.unmount();
               busMarkers.current[id].marker.remove();
               delete busMarkers.current[id];
           }
        }, 0);
      }
    });
  }, [buses, mapLoaded, selectedBusId, onBusClick, layers.showBuses, mapBearing]);

  // Decoupled Station/Stops Engine Handler to avoid checking stops on every bus telemetry loop
  useEffect(() => {
    const activeMap = mapRef.current;
    if (!activeMap || !mapLoaded) return;

    if (layers.showMajorStops) {
      allStops.forEach((stop: any) => {
        if (!stopMarkersRef.current[stop._id]) {
          const el = document.createElement('div');
          el.className = "relative flex flex-col items-center group cursor-pointer";
          
          // The Dot - Neural high-vis update
          const dot = document.createElement('div');
          dot.className = "w-3 h-3 bg-white border-2 border-[#FF3D00] shadow-[0_0_12px_rgba(255,61,0,0.6)] rounded-full transition-transform hover:scale-150";
          
          // The Label (Always visible in Intelligence mode)
          const label = document.createElement('div');
          label.className = "absolute -bottom-8 bg-white/95 text-zinc-900 text-[10px] font-black tracking-tight px-3 py-1 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] whitespace-nowrap backdrop-blur-md opacity-100 scale-100 transition-all duration-300 pointer-events-none z-50 uppercase italic border border-zinc-200";
          label.innerText = stop.stopName;
          
          el.appendChild(dot);
          el.appendChild(label);
          
          const smarker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([stop.lng, stop.lat])
            .addTo(activeMap);
          stopMarkersRef.current[stop._id] = smarker;
        }
      });
      
      // Cleanup stops that are no longer in the active lists
      Object.keys(stopMarkersRef.current).forEach(id => {
        if (!allStops.some(s => s._id === id)) {
          stopMarkersRef.current[id].remove();
          delete stopMarkersRef.current[id];
        }
      });
    } else {
      Object.keys(stopMarkersRef.current).forEach(id => {
        stopMarkersRef.current[id].remove();
        delete stopMarkersRef.current[id];
      });
    }
  }, [allStops, mapLoaded, layers.showMajorStops]);

  // Buttery-Smooth Fast-Rendering GPU Interpolator
  useEffect(() => {
     let frameId: number;
     const animateGL = () => {
        Object.values(busMarkers.current).forEach((cache: any) => {
           const bus = cache.busData;
           if (bus && bus.status === "Running" && bus.routeId?.path?.length > 1) {
               const sim = getSimulatedLocation(bus, Date.now());
               cache.targetLng = sim.lng;
               cache.targetLat = sim.lat;
               
               // Smooth Camera Track for Selected Bus
               if (cache.isSelected && mapRef.current) {
                   const center = mapRef.current.getCenter();
                   const dist = Math.hypot(center.lng - sim.lng, center.lat - sim.lat);
                   if (dist > 0.0005) {
                       mapRef.current.easeTo({ center: [sim.lng, sim.lat], duration: 100, easing: (t) => t });
                   }
               }
           }

           if (cache.targetLng !== undefined && cache.targetLat !== undefined) {
              const curr = cache.marker.getLngLat();
              const dx = cache.targetLng - curr.lng;
              const dy = cache.targetLat - curr.lat;
              
              // Glide marker position smoothly (12% closer per frame, achieving ~60FPS visual snap)
              if (Math.abs(dx) > 0.000001 || Math.abs(dy) > 0.000001) {
                  cache.marker.setLngLat([
                    curr.lng + dx * 0.12, 
                    curr.lat + dy * 0.12
                  ]);
              } else if (dx !== 0 || dy !== 0) {
                  // Perfect snapping once reached target, stopping continuous setLngLat paint calls
                  cache.marker.setLngLat([cache.targetLng, cache.targetLat]);
              }
           }
        });
        frameId = requestAnimationFrame(animateGL);
     };
     frameId = requestAnimationFrame(animateGL);
     return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="h-full w-full relative bg-zinc-50 overflow-hidden">
      <div 
        ref={mapContainer} 
        className="w-full h-full relative" 
        style={{ minHeight: '600px', position: 'relative' }} 
      />
      
    </div>
  );
});

export default LiveBusMap;

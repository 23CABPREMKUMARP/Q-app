"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Bus, MapPin, Navigation, User, Phone, Mail, ChevronRight, X, CreditCard, Ticket, LayoutDashboard, QrCode, Zap, Info, ShieldCheck, Clock, CheckCircle, ArrowLeft, ArrowRight, Activity, Gauge, Search, Route, Camera, Wind, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import QRScanner from "@/src/components/ui/QRScanner";
import { useSearchParams } from "next/navigation";
import * as turf from '@turf/turf';

// --- Types ---
interface BusLocation { lat: number; lng: number; rotation: number; }
interface BusPathNode { lat: number; lng: number; }
interface BusStop { _id: string; stopName: string; lat: number; lng: number; type: 'major' | 'small'; }
interface BusData {
  _id: string;
  busNumber: string;
  status: string;
  speed: number;
  fare: number;
  availableSeats: number;
  departureTime: string;
  arrivalTime: string;
  currentStop?: string;
  nextStop?: string;
  location: BusLocation;
  routeId?: {
    routeName: string;
    from: string;
    to: string;
    path: BusPathNode[];
    stops: BusStop[];
  };
}

// --- Constants ---
const MOCK_BUSES: BusData[] = [
  {
    _id: "bus1",
    busNumber: "TN-38-EF-2025",
    status: "Running",
    speed: 45,
    fare: 25,
    availableSeats: 35,
    departureTime: "08:00 AM",
    arrivalTime: "09:30 AM",
    currentStop: "Gandhipuram",
    location: { lat: 10.9996, lng: 76.9702, rotation: 50 },
    routeId: {
      routeName: "Coimbatore → Mettupalayam",
      from: "Gandhipuram",
      to: "Mettupalayam",
      path: [
        { lat: 10.9996, lng: 76.9702 }, // Gandhipuram
        { lat: 11.0500, lng: 76.9600 }, // Thudiyalur
        { lat: 11.1500, lng: 76.9500 }, // Periyanaickenpalayam
        { lat: 11.2500, lng: 76.9400 }, // Karamadai
        { lat: 11.3000, lng: 76.9366 }  // Mettupalayam
      ],
      stops: [
        { _id: "s1", stopName: "Gandhipuram Central", lat: 10.9996, lng: 76.9702, type: 'major' },
        { _id: "s2", stopName: "Thudiyalur Hub", lat: 11.0500, lng: 76.9600, type: 'major' },
        { _id: "s3", stopName: "Karamadai Point", lat: 11.2500, lng: 76.9400, type: 'major' },
        { _id: "s4", stopName: "Mettupalayam Terminal", lat: 11.3000, lng: 76.9366, type: 'major' }
      ]
    }
  },
  {
    _id: "bus2",
    busNumber: "TN-38-XY-9999",
    status: "Boarding",
    speed: 0,
    fare: 40,
    availableSeats: 22,
    departureTime: "09:30 AM",
    arrivalTime: "11:30 AM",
    currentStop: "Ukkadam",
    location: { lat: 10.9940, lng: 76.9548, rotation: 180 },
    routeId: {
      routeName: "Coimbatore → Pollachi",
      from: "Ukkadam",
      to: "Pollachi",
      path: [
        { lat: 10.9940, lng: 76.9548 }, // Ukkadam
        { lat: 10.8500, lng: 76.9800 }, // Kinathukadavu
        { lat: 10.6620, lng: 77.0060 }  // Pollachi
      ],
      stops: [
        { _id: "s5", stopName: "Ukkadam Hub", lat: 10.9940, lng: 76.9548, type: 'major' },
        { _id: "s6", stopName: "Kinathukadavu Stop", lat: 10.8500, lng: 76.9800, type: 'major' },
        { _id: "s7", stopName: "Pollachi Terminal", lat: 10.6620, lng: 77.0060, type: 'major' }
      ]
    }
  },
  {
    _id: "bus3",
    busNumber: "TN-38-AM-1111",
    status: "Running",
    speed: 55,
    fare: 35,
    availableSeats: 18,
    departureTime: "07:30 AM",
    arrivalTime: "09:00 AM",
    currentStop: "SITRA",
    location: { lat: 11.0300, lng: 77.0400, rotation: 90 },
    routeId: {
      routeName: "Coimbatore → Avinashi",
      from: "Coimbatore",
      to: "Avinashi",
      path: [
        { lat: 11.0168, lng: 76.9558 }, // Coimbatore
        { lat: 11.0300, lng: 77.0400 }, // SITRA
        { lat: 11.1000, lng: 77.1500 }, // Karumathampatti
        { lat: 11.1930, lng: 77.2680 }  // Avinashi
      ],
      stops: [
        { _id: "s8", stopName: "Coimbatore Junction", lat: 11.0168, lng: 76.9558, type: 'major' },
        { _id: "s9", stopName: "SITRA Hub", lat: 11.0300, lng: 77.0400, type: 'major' },
        { _id: "s10", stopName: "Avinashi Terminal", lat: 11.1930, lng: 77.2680, type: 'major' }
      ]
    }
  },
  {
    _id: "bus4",
    busNumber: "TN-38-PL-4444",
    status: "Running",
    speed: 48,
    fare: 30,
    availableSeats: 40,
    departureTime: "10:00 AM",
    arrivalTime: "11:30 AM",
    currentStop: "Singanallur",
    location: { lat: 11.0000, lng: 77.0300, rotation: 110 },
    routeId: {
      routeName: "Coimbatore → Palladam",
      from: "Coimbatore",
      to: "Palladam",
      path: [
        { lat: 11.0168, lng: 76.9558 }, // Coimbatore
        { lat: 11.0000, lng: 77.0300 }, // Singanallur
        { lat: 11.0200, lng: 77.1200 }, // Sulur
        { lat: 11.0000, lng: 77.2880 }  // Palladam
      ],
      stops: [
        { _id: "s11", stopName: "Singanallur Bus Stand", lat: 11.0000, lng: 77.0300, type: 'major' },
        { _id: "s12", stopName: "Sulur Hub", lat: 11.0200, lng: 77.1200, type: 'major' },
        { _id: "s13", stopName: "Palladam Stand", lat: 11.0000, lng: 77.2880, type: 'major' }
      ]
    }
  },
  {
    _id: "bus5",
    busNumber: "TN-38-AR-5555",
    status: "Boarding",
    speed: 0,
    fare: 28,
    availableSeats: 30,
    departureTime: "11:00 AM",
    arrivalTime: "12:30 PM",
    currentStop: "Saravanampatti",
    location: { lat: 11.0700, lng: 77.0000, rotation: 45 },
    routeId: {
      routeName: "Coimbatore → Annur",
      from: "Coimbatore",
      to: "Annur",
      path: [
        { lat: 11.0168, lng: 76.9558 }, // Coimbatore
        { lat: 11.0700, lng: 77.0000 }, // Saravanampatti
        { lat: 11.1500, lng: 77.0500 }, // Kovilpalayam
        { lat: 11.2330, lng: 77.1000 }  // Annur
      ],
      stops: [
        { _id: "s14", stopName: "Saravanampatti Signal", lat: 11.0700, lng: 77.0000, type: 'major' },
        { _id: "s15", stopName: "Kovilpalayam Stop", lat: 11.1500, lng: 77.0500, type: 'major' },
        { _id: "s16", stopName: "Annur Bus Stand", lat: 11.2330, lng: 77.1000, type: 'major' }
      ]
    }
  }
];

// --- Sub Components (Memoized for Performance) ---
const LiveBusMap = dynamic(() => import("@/src/components/map/LiveBusMap"), {
  ssr: false,
});

const MapLoadingSkeleton = React.memo(() => (
  <div className="flex items-center justify-center h-full w-full bg-white rounded-[56px] overflow-hidden border-8 border-zinc-50 shadow-2xl relative">
     <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-amber-600/5 backdrop-blur-3xl animate-pulse" />
     <div className="relative z-10 flex flex-col items-center gap-16">
        <div className="w-32 h-32 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin p-8 flex items-center justify-center">
           <div className="w-full h-full border-2 border-orange-500 rounded-full animate-pulse" />
        </div>
        <div className="space-y-4 text-center">
           <p className="text-zinc-900 font-black italic tracking-tight text-2xl">Initializing Live Track</p>
           <p className="text-zinc-400 text-[10px] uppercase font-black tracking-[0.4em] whitespace-nowrap">Connecting to Transit Hub ... OK</p>
        </div>
     </div>
  </div>
));
MapLoadingSkeleton.displayName = "MapLoadingSkeleton";



export default function LiveMapBookingPage() {
  return (
    <React.Suspense fallback={<MapLoadingSkeleton />}>
      <LiveMapContent />
    </React.Suspense>
  );
}

function LiveMapContent() {
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [ticketId, setTicketId] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [boardingPoint, setBoardingPoint] = useState("");
  const [dropPoint, setDropPoint] = useState("");
  const [passengerDetails, setPassengerDetails] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [showBusQR, setShowBusQR] = useState(false);
  const [layers, setLayers] = useState({
    showBuses: true,
    showRoutes: true,
    showMajorStops: true,
    showSmallStops: true,
    showTraffic: false,
    showBuildings: true
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLiveLocationOn, setIsLiveLocationOn] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [nearbyRadius] = useState(5); // 5km
  const [centerOn, setCenterOn] = useState<{lat: number, lng: number} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [navTarget, setNavTarget] = useState<any>(null);
  const [navPath, setNavPath] = useState<any>(null);
  const [navStats, setNavStats] = useState<{distance: number, duration: number} | null>(null);
  const [navMode, setNavMode] = useState<'driving' | 'walking'>('walking');
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideNearestCard, setHideNearestCard] = useState(false);
  
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lower = searchQuery.toLowerCase();
    return buses.filter(b => 
      b.busNumber.toLowerCase().includes(lower) || 
      (b.routeId?.routeName && b.routeId.routeName.toLowerCase().includes(lower)) ||
      (b.routeId?.from && b.routeId.from.toLowerCase().includes(lower)) ||
      (b.routeId?.to && b.routeId.to.toLowerCase().includes(lower))
    );
  }, [searchQuery, buses]);
  
  const watchIdRef = useRef<number | null>(null);
  const searchParams = useSearchParams();

  // --- Initial Data Load ---
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setBuses(MOCK_BUSES);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- Live Location Logic ---
  const toggleLiveLocation = () => {
    if (isLiveLocationOn) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setUserLocation(null);
      setLocationError(null);
      setIsLiveLocationOn(false);
      setShowNearbyOnly(false);
    } else {
      setHideNearestCard(false);
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser.");
        return;
      }
      
      const success = (pos: GeolocationPosition) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLoc);
        setLocationError(null);
      };

      const error = (err: GeolocationPositionError) => {
        // Set fallback to user's real-world location (Palladam, TN) since localhost testing blocks live GPS
        setTimeout(() => {
           setUserLocation({ lat: 11.0000, lng: 77.2880 });
           setLocationError(null);
        }, 1000);
        
        // On fatal user permission denial, reset toggle
        if (err.code === 1) setIsLiveLocationOn(false);
      };
      
      watchIdRef.current = navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy: false, // Less strictly accurate to avoid common timeout on some devices
        timeout: 15000,
        maximumAge: 0
      });
      setIsLiveLocationOn(true);
      setLocationError("Syncing...");
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Handle QR scanning
  const handleQRScan = (decodedText: string) => {
    setIsScanning(false);
    let busId = decodedText;
    
    // Support both raw ID and URL formats
    if (decodedText.startsWith("{")) {
       try {
         const data = JSON.parse(decodedText);
         busId = data.busId || data.id;
       } catch (e) {}
    } else if (decodedText.includes("busId=")) {
      busId = decodedText.split("busId=")[1].split("&")[0];
    }
    
    const foundBus = buses.find(b => b._id === busId || b.busNumber === busId);
    if (foundBus) {
      setSelectedBus(foundBus);
      setIsBooking(true);
      setStep(1); // Open Boarding Details
    } else {
      alert("Electronic Signature mismatch. Bus not found in fleet grid.");
    }
  };

  // URL Bus Selection Auto-Trigger
  useEffect(() => {
    const busId = searchParams.get("busId");
    if (busId && buses.length > 0) {
      const foundBus = buses.find(b => b._id === busId);
      if (foundBus) {
        setSelectedBus(foundBus);
        setIsBooking(true);
        setStep(1);
      }
    }
  }, [searchParams, buses]);

  // Nearby Proximity Logic
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // Navigation Logic
  const fetchNavigationPath = async (from: {lat: number, lng: number}, to: {lat: number, lng: number}, profile: 'driving' | 'walking' = 'walking') => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes[0]) {
        setNavPath(data.routes[0].geometry);
        setNavStats({
          distance: +(data.routes[0].distance / 1000).toFixed(1),
          duration: Math.round(data.routes[0].duration / 60)
        });
        return true;
      }
    } catch (e) {
      console.warn("Navigation fetch failed", e);
    }
    return false;
  };

  const startNavigation = async (target: any) => {
    if (!userLocation) {
      setLocationError("Turn on GPS to navigate");
      return;
    }
    setNavTarget(target);
    const success = await fetchNavigationPath(userLocation, target.location || target);
    if (success) {
      setIsNavigating(true);
      setShowNearbyOnly(false);
      // Zoom to route handled in map via centerOn or map effect
    }
  };

  const clearNavigation = () => {
    setIsNavigating(false);
    setNavTarget(null);
    setNavPath(null);
    setNavStats(null);
  };

  // Recalculate Navigation if user or target moves
  useEffect(() => {
    if (isNavigating && userLocation && navTarget) {
      const targetLoc = navTarget.location || navTarget;
      fetchNavigationPath(userLocation, targetLoc, navMode);
    }
  }, [userLocation, navTarget?.location?.lat, navTarget?.location?.lng, isNavigating, navMode]);

  const filteredBuses = useMemo(() => {
    if (!showNearbyOnly) return buses;
    if (!userLocation) return []; 
    const nearby = buses.filter(bus => 
      getDistance(userLocation.lat, userLocation.lng, bus.location.lat, bus.location.lng) <= nearbyRadius
    );
    // CRITICAL FIX: If user is testing outside physical city limits (>5km), never return empty array!
    // Always fall back to showing the absolute closest bus in the active fleet so the map never dies.
    if (nearby.length === 0 && buses.length > 0) {
      let min = Infinity;
      let closest = null;
      buses.forEach(b => {
        const d = getDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
        if (d < min) { min = d; closest = b; }
      });
      return closest ? [closest] : [];
    }
    return nearby;
  }, [buses, userLocation, showNearbyOnly, nearbyRadius]);

  const nearestBus = useMemo(() => {
    if (!userLocation || buses.length === 0) return null;
    let min = Infinity;
    let closest = null;
    buses.forEach(b => {
      const d = getDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
      if (d < min) { min = d; closest = b; }
    });
    return closest;
  }, [userLocation, buses]);

  // Auto-Navigate to nearest bus immediately when user hits Nearby
  useEffect(() => {
    if (showNearbyOnly && userLocation && nearestBus && !isNavigating) {
      startNavigation(nearestBus);
    }
  }, [showNearbyOnly, userLocation, nearestBus, isNavigating]);

  const simState = React.useRef(MOCK_BUSES.map(bus => ({
     busId: bus._id,
     segmentIndex: 0,
     progress: 0,
     status: "Boarding",
     stopWaitLeft: 5000, 
     speed: 0.0,
     maxSpeed: 0.00025,
     currentRotation: bus.location.rotation || 0,
     targetRotation: bus.location.rotation || 0,
  })));

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    const initSimulator = async () => {
      const baseBuses = JSON.parse(JSON.stringify(MOCK_BUSES));
      setBuses(baseBuses);
      setLoading(false);
      baseBuses.forEach(async (bus: any) => {
          if (!bus.routeId || !bus.routeId.path) return;
          let newPath = [...bus.routeId.path];
          const coordinateString = bus.routeId.path.map((n:any) => `${n.lng},${n.lat}`).join(';');
          try {
             const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=full&geometries=geojson`);
             const data = await res.json();
             if (data.code === "Ok" && data.routes && data.routes[0]) {
                newPath = data.routes[0].geometry.coordinates.map((c:any) => ({ lat: c[1], lng: c[0] }));
             }
          } catch(e) { console.warn(`OSRM failed:`, e); }

          // ARTIFICIAL SMOOTHING: Rebuild physical map structure into gorgeous bezier arcs seamlessly 
          if (newPath.length >= 2) {
             try {
                const line = turf.lineString(newPath.map((p: any) => [p.lng, p.lat]));
                // A resolution of ~2000 dynamically guarantees incredibly smooth aesthetic bends
                const curved = turf.bezierSpline(line, { resolution: 2000, sharpness: 0.85 });
                newPath = curved.geometry.coordinates.map((c: any) => ({ lat: c[1], lng: c[0] }));
             } catch(e) { console.warn("Turf bezier failed", e); }
          }
          
          setBuses(prev => prev.map(b => b._id === bus._id ? { ...b, routeId: { ...b.routeId, path: newPath } } : b));
      });
      const loop = (currentTime: number) => {
        const dt = currentTime - lastTime;
        // THROTTLED TO 3.3 FPS: Massive CPU + Battery saver on low-end hardware. 
        // WebGL LERP engine handles the 60FPS visual fidelity decoupling.
        if (dt >= 300) { 
           lastTime = currentTime;
           setBuses(prev => prev.map(bus => {
             const sim = simState.current.find(s => s.busId === bus._id);
             if (!sim || !bus.routeId?.path) return bus;
             const path = bus.routeId.path;
             if (sim.status === "Boarding") {
                sim.stopWaitLeft -= 100; 
                if (sim.stopWaitLeft <= 0) sim.status = "Running";
                sim.speed *= 0.8; 
             }
             let start = path[sim.segmentIndex];
             let end = path[sim.segmentIndex + 1];
             if (!end) return bus;

             // True distance handling: carry over excess progress mathematically to prevent corner-cutting and jumping
             let dist = Math.hypot(end.lat - start.lat, end.lng - start.lng);
             
             // Time-stabilized velocity step
             const distanceToMove = dist > 0 ? (sim.speed * (dt / 250)) : 0;
             sim.progress += dist > 0 ? (distanceToMove / dist) : 1;

             while (sim.progress >= 1.0) {
                 sim.progress -= 1.0;
                 sim.segmentIndex++;
                 if (sim.segmentIndex >= path.length - 1) {
                     sim.segmentIndex = 0;
                     bus.routeId.path.reverse();
                     if (bus.routeId.stops) bus.routeId.stops.reverse();
                     sim.status = "Boarding";
                     sim.stopWaitLeft = 8000;
                     sim.progress = 0;
                     break;
                 }
             }

             start = path[sim.segmentIndex];
             end = path[sim.segmentIndex + 1] || start;
             dist = Math.hypot(end.lat - start.lat, end.lng - start.lng);

             const dx = end.lng - start.lng;
             const dy = end.lat - start.lat;
             let targetHeading = Math.atan2(dx, dy) * (180 / Math.PI);
             if (targetHeading < 0) targetHeading += 360;
             sim.targetRotation = targetHeading;
             
             let diff = sim.targetRotation - sim.currentRotation;
             diff = ((diff % 360) + 360) % 360;
             if (diff > 180) diff -= 360;
             sim.currentRotation += diff * 0.2; 
             sim.currentRotation = ((sim.currentRotation % 360) + 360) % 360;
             
             if (sim.status === "Running") {
                const isTurning = Math.abs(diff) > 20;
                sim.speed += ((isTurning ? sim.maxSpeed * 0.4 : sim.maxSpeed) - sim.speed) * 0.15;
             }

             const lat = start.lat + (end.lat - start.lat) * sim.progress;
             const lng = start.lng + (end.lng - start.lng) * sim.progress;
             return { ...bus, status: sim.status === "Boarding" && sim.speed < 0.00002 ? "Boarding.." : "Running", speed: Math.floor(sim.speed * 220000), location: { ...bus.location, lat, lng, rotation: sim.currentRotation } };
           }));
        }
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);
    };
    initSimulator();
    return () => cancelAnimationFrame(frameId);
  }, []);

  const confirmBooking = async () => {
    setLoading(true);
    const newTicketId = "MTRX-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    setTicketId(newTicketId);
    setBuses(prev => prev.map(bus => bus._id === selectedBus?._id ? { ...bus, availableSeats: bus.availableSeats - ticketQuantity } : bus));
    setTimeout(() => { setStep(4); setLoading(false); }, 1500);
  };

  return (
    <main className="h-[100dvh] w-full flex flex-col bg-zinc-50 overflow-hidden font-sans text-zinc-900 relative">
      <AnimatePresence>
        {isScanning && <QRScanner onScan={handleQRScan} onClose={() => setIsScanning(false)} />}
      </AnimatePresence>

      <div className="flex-1 w-full h-full relative">
         {/* Top: Feature Header (Search & Quick Actions) */}
         <div className="absolute top-4 md:top-8 left-0 right-0 px-4 md:px-8 z-[200] flex items-center justify-between pointer-events-none">
             
             {/* Left Actions: Brand Logo */}
             <div className="flex pointer-events-auto">
                <Link 
                  href="/"
                  className="pointer-events-auto flex items-center justify-center transition-all active:scale-90"
                  title="Home"
                >
                   <Image 
                     src="/logo2.png" 
                     alt="Jeffben" 
                     width={200} 
                     height={200} 
                     className="w-24 h-24 md:w-40 md:h-40 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xl"
                   />
                </Link>
             </div>

             {/* Center: Search Bar */}
             <div className="flex-1 max-w-sm md:max-w-md mx-2 md:mx-6 pointer-events-auto">
                 <div className="flex flex-col relative">
                      <div className="flex items-center bg-white/95 backdrop-blur-md border border-white text-zinc-900 rounded-[28px] px-4 md:px-6 py-3 md:py-4 shadow-2xl transition-all focus-within:ring-2 ring-orange-500/20 group w-full">
                        <Search size={22} className="text-zinc-400 mr-2 md:mr-3 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search Routes & Fleet..." 
                          className="bg-transparent border-none text-zinc-900 outline-none w-full placeholder-zinc-400 font-black text-sm md:text-base tracking-tight" 
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")} className="ml-2 p-1 hover:bg-zinc-100 rounded-full transition-colors">
                             <X size={16} className="text-zinc-400" />
                          </button>
                        )}
                      </div>

                      {/* Mobile Focus Search Overlay */}
                      <AnimatePresence>
                        {searchQuery && (
                           <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0 }}
                             className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm pointer-events-none md:hidden" 
                           />
                        )}
                      </AnimatePresence>

                      {/* Search Autocomplete Dropdown - Mobile Full-Width Focus Override */}
                      <AnimatePresence mode="wait">
                        {searchQuery && searchResults.length > 0 && (
                           <motion.div 
                             initial={{ opacity: 0, y: -20, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: -20, scale: 0.95 }}
                             className="fixed md:absolute top-[80px] md:top-[115%] left-2 right-2 md:left-0 md:right-0 bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/50 overflow-hidden z-[1000] flex flex-col max-h-[70vh] md:max-h-[400px] overflow-y-auto no-scrollbar pointer-events-auto ring-1 ring-black/5 animate-in fade-in slide-in-from-top-4"
                           >
                              <div className="px-6 py-4 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
                                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Intelligence Match ({searchResults.length} Fleet Found)</p>
                                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                              </div>
                              {searchResults.map((bus) => (
                                 <div 
                                    key={bus._id} 
                                    onClick={() => {
                                       setSearchQuery("");
                                       setSelectedBus(bus);
                                       setStep(0);
                                       setIsBooking(true);
                                       setCenterOn({...bus.location});
                                    }}
                                    className="p-6 hover:bg-orange-50 border-b border-zinc-100 cursor-pointer flex items-center justify-between transition-all group active:bg-orange-100"
                                >
                                    <div className="flex-1">
                                       <p className="text-xl font-black text-zinc-900 group-hover:text-primary transition-colors leading-none tracking-tight italic uppercase">{bus.busNumber}</p>
                                       <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter mt-2">{bus.routeId?.routeName}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <span className={`text-[10px] font-black uppercase px-5 py-2.5 rounded-full tracking-wider shadow-sm transition-transform group-hover:scale-105 ${bus.status === 'Running' ? 'bg-primary text-white' : 'bg-orange-100 text-[#EA580C]'}`}>{bus.status}</span>
                                       <ChevronRight size={22} className="text-zinc-200 group-hover:text-primary transition-colors" />
                                    </div>
                                 </div>
                              ))}
                           </motion.div>
                        )}
                      </AnimatePresence>
                 </div>
             </div>

             {/* Right Actions: QR & Tickets */}
             <div className="flex gap-2 md:gap-4 pointer-events-auto">
                <button 
                  onClick={() => setIsScanning(true)}
                  className="w-12 h-12 md:w-14 md:h-14 bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl flex items-center justify-center text-zinc-900 border border-white shadow-xl hover:bg-primary hover:text-white transition-all active:scale-90"
                  title="Scan QR"
                >
                  <Camera size={22} className="md:w-6 md:h-6" />
                </button>
                <Link 
                  href="/my-bookings"
                  className="w-12 h-12 md:w-14 md:h-14 bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl flex items-center justify-center text-zinc-900 border border-white shadow-xl hover:bg-primary hover:text-white transition-all active:scale-90"
                  title="Journeys"
                >
                  <Ticket size={22} className="md:w-6 md:h-6" />
                </Link>
             </div>
         </div>

         {/* Map Background Layer */}
         <div className="absolute inset-0 z-0 h-full w-full">
            <LiveBusMap 
              buses={filteredBuses} 
              selectedBusId={selectedBus?._id}
              layers={layers}
              userLocation={userLocation}
              nearestBus={nearestBus}
              centerOn={centerOn}
              navPath={navPath}
              navStats={navStats}
              onBusClick={(bus) => {
                setSelectedBus(bus);
                setStep(0); 
                setIsBooking(true);
              }}
            />
         </div>

         {/* Right Side Controls */}
         <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-[150] flex flex-col gap-4 pointer-events-none">
            <div className="flex flex-col gap-2 p-1.5 md:p-2 bg-white/95 backdrop-blur-md rounded-[24px] md:rounded-[32px] shadow-xl border border-white pointer-events-auto">
               <button 
                 onClick={() => { 
                   if(userLocation) setCenterOn({...userLocation} as any); 
                   else toggleLiveLocation(); 
                 }} 
                 className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-primary hover:text-white text-primary rounded-xl md:rounded-3xl flex items-center justify-center transition-all group shadow-sm border border-zinc-100/50"
                 title="Locate Me"
               >
                 <Navigation size={18} className="group-active:scale-90 transition-transform" />
               </button>
               {(showNearbyOnly || isNavigating || selectedBus) && (
                 <>
                   <div className="w-full h-px bg-zinc-100 mx-auto" />
                   <button 
                     onClick={() => { 
                        clearNavigation(); 
                        setShowNearbyOnly(false); 
                        setSelectedBus(null);
                        setIsBooking(false);
                        setHideNearestCard(true);
                        setCenterOn({ lat: 11.0168, lng: 76.9558, zoom: 14, pitch: 60, bearing: -15 } as any);
                     }} 
                     className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-primary hover:text-white text-primary rounded-xl md:rounded-3xl flex items-center justify-center transition-all group shadow-sm border border-zinc-100/50"
                     title="Reset Map"
                   >
                     <RefreshCw size={18} className="group-active:-rotate-180 transition-transform duration-500" />
                   </button>
                 </>
               )}
            </div>
         </div>

         {/* Bottom Navigation Panel */}
         <div className="absolute bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-max z-[200] pointer-events-auto">
            <div className="bg-white/90 backdrop-blur-xl border-t border-zinc-100 md:border md:rounded-full rounded-t-[32px] pb-6 pt-3 px-4 md:p-2 sm:pb-3 flex items-center justify-between md:justify-center gap-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-x-auto no-scrollbar w-full">
               
               <button onClick={toggleLiveLocation} className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] md:min-w-[80px] h-12 md:h-16 rounded-2xl md:rounded-full transition-all flex-shrink-0 relative ${isLiveLocationOn ? "text-orange-500 bg-orange-500/10" : "hover:bg-zinc-50 text-zinc-500"}`}>
                 <LayoutDashboard size={20} className={isLiveLocationOn ? "animate-pulse" : ""} />
                 <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1">{isLiveLocationOn ? "Stop Hub" : "Location Hub"}</span>
                 {isLiveLocationOn && <X size={12} className="absolute top-1 right-1 text-orange-500" />}
               </button>

               <button 
                 onClick={() => {
                    if (!isLiveLocationOn) { toggleLiveLocation(); setShowNearbyOnly(true); return; }
                    if (!userLocation) { setLocationError("GPS..."); return; }
                    setShowNearbyOnly(!showNearbyOnly);
                    if (!showNearbyOnly && nearestBus) startNavigation(nearestBus);
                    else clearNavigation();
                 }}
                 className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] md:min-w-[80px] h-12 md:h-16 rounded-2xl md:rounded-full transition-all flex-shrink-0 relative ${showNearbyOnly ? "text-orange-500 bg-orange-500/10" : "hover:bg-zinc-50 text-zinc-500"}`}
               >
                 <Navigation size={20} />
                 <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1">{showNearbyOnly ? "Cancel" : "Nearby"}</span>
                 {showNearbyOnly && <X size={12} className="absolute top-1 right-1 text-orange-500" />}
               </button>

               <div className="w-px h-8 bg-zinc-100 mx-0.5 md:mx-1 hidden md:block flex-shrink-0" />

               <button onClick={() => setLayers(l => ({...l, showRoutes: !l.showRoutes}))} className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] md:min-w-[80px] h-12 md:h-16 rounded-2xl md:rounded-full transition-all flex-shrink-0 ${layers.showRoutes ? "text-orange-600 bg-orange-50" : "hover:bg-zinc-50 text-zinc-500"}`}>
                 <Route size={20} />
                 <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1">Routes</span>
               </button>

               <button onClick={() => setLayers(l => ({...l, showBuses: !l.showBuses}))} className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] md:min-w-[80px] h-12 md:h-16 rounded-2xl md:rounded-full transition-all flex-shrink-0 ${layers.showBuses ? "text-orange-600 bg-orange-50" : "hover:bg-zinc-50 text-zinc-500"}`}>
                 <Bus size={20} />
                 <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1">Fleet</span>
               </button>

               <button onClick={() => setLayers(l => ({...l, showMajorStops: !l.showMajorStops}))} className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] md:min-w-[80px] h-12 md:h-16 rounded-2xl md:rounded-full transition-all flex-shrink-0 ${layers.showMajorStops ? "text-orange-600 bg-orange-50" : "hover:bg-zinc-50 text-zinc-500"}`}>
                 <Zap size={18} className={layers.showMajorStops ? "fill-orange-400/20" : ""} />
                 <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1">Intelligence</span>
               </button>

               <div className="w-px h-8 bg-zinc-100 mx-0.5 md:mx-1 hidden md:block flex-shrink-0" />

               {(isLiveLocationOn || showNearbyOnly || selectedBus || isNavigating) && (
                  <>
                     <div className="w-px h-8 bg-white/10 mx-0.5 md:mx-1 hidden md:block flex-shrink-0" />
                     <button 
                        onClick={() => {
                           // 1. Core Navigation & Simulation Resets
                           clearNavigation(); 
                           setShowNearbyOnly(false); 
                           setSelectedBus(null);
                           setIsBooking(false);
                           setHideNearestCard(true);
                           setSearchQuery("");
                           
                           // 2. Clear Live GPS if on
                           if(isLiveLocationOn) toggleLiveLocation();
                           
                           // 3. Reset Layer Visibility to Defaults
                           setLayers({
                             showBuses: true,
                             showRoutes: true,
                             showMajorStops: true,
                             showSmallStops: true,
                             showTraffic: false,
                             showBuildings: true
                           });

                           // 4. Cinematic Reset to City Overview
                           setCenterOn({ lat: 11.0168, lng: 76.9558, zoom: 14, pitch: 60, bearing: -15 } as any);
                        }}
                        className="flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] md:min-w-[80px] h-12 md:h-16 rounded-2xl md:rounded-full transition-all bg-primary text-white flex-shrink-0 shadow-lg shadow-primary/30 animate-in fade-in slide-in-from-right-4"
                     >
                        <RefreshCw size={20} />
                        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1">Cancel</span>
                     </button>
                  </>
               )}

            </div>
         </div>

            {isNavigating && navStats && (
               <motion.div 
                 initial={{ opacity: 0, y: 100 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="absolute bottom-[100px] md:bottom-32 left-1/2 -translate-x-1/2 z-[100] w-[90%] md:w-[600px] bg-orange-600 text-white p-8 rounded-[48px] shadow-2xl flex items-center justify-between pointer-events-auto"
               >
                  <div className="flex gap-10">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em]">Distance</span>
                        <div className="flex items-baseline gap-1">
                           <span className="text-4xl font-black italic">{navStats.distance}</span>
                           <span className="text-xs font-black opacity-60">KM</span>
                        </div>
                     </div>
                     <div className="w-[1px] h-12 bg-white/20" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em]">Arrival ETA</span>
                        <div className="flex items-baseline gap-1">
                           <span className="text-4xl font-black italic text-sky-200">{navStats.duration}</span>
                           <span className="text-xs font-black opacity-60 text-sky-200">MINS</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-4">
                     <button 
                       onClick={() => setNavMode(prev => prev === 'driving' ? 'walking' : 'driving')}
                       className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all"
                     >
                       <Zap size={24} className={navMode === 'driving' ? 'text-amber-300' : 'text-white'} />
                     </button>
                     <button 
                       onClick={clearNavigation}
                       className="px-8 h-14 bg-white text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-900 hover:text-white transition-all shadow-xl"
                     >
                       Finish
                     </button>
                  </div>
               </motion.div>
            )}

            {!isNavigating && userLocation && nearestBus && !hideNearestCard && (
               <div className="absolute bottom-[120px] left-4 right-4 md:bottom-32 md:right-8 md:left-auto z-[100] bg-zinc-950/95 backdrop-blur-md p-5 pb-6 md:p-8 rounded-[32px] md:rounded-[48px] shadow-2xl border border-white/10 flex flex-col md:flex-row md:items-center md:gap-12 gap-5 group hover:scale-[1.02] transition-all animate-in fade-in slide-in-from-bottom-8 pointer-events-auto">
                  <button 
                    onClick={() => setHideNearestCard(true)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all z-10"
                  >
                    <X size={14} />
                  </button>

                  <div className="flex flex-col gap-1 md:gap-2 pr-8 md:pr-0">
                     <span className="text-[9px] md:text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] truncate w-full">Nearest: {(nearestBus as any).busNumber}</span>
                     
                     <div className="flex flex-row md:flex-col items-baseline gap-4 md:gap-0">
                        <div className="flex items-baseline gap-1">
                           <span className="text-3xl md:text-4xl font-black italic text-white tracking-tighter">{getDistance(userLocation.lat, userLocation.lng, (nearestBus as any).location.lat, (nearestBus as any).location.lng).toFixed(1)}</span>
                           <span className="text-xs md:text-sm font-black text-zinc-600 uppercase">KM</span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0 md:mt-1">
                           <span className="text-xl md:text-2xl font-black italic text-primary tracking-tighter">{Math.round(getDistance(userLocation.lat, userLocation.lng, (nearestBus as any).location.lat, (nearestBus as any).location.lng) * 2.5)}</span>
                           <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase">Min ETA</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="w-full h-[1px] md:w-[1px] md:h-16 bg-white/10" />
                  
                  <div className="flex w-full md:w-auto gap-3 md:gap-4 justify-between md:justify-start">
                     <button 
                       onClick={() => startNavigation(nearestBus)}
                       className="flex-1 md:flex-none h-14 md:w-16 md:h-16 bg-white/10 border border-white/20 rounded-2xl md:rounded-full flex items-center justify-center text-white shadow-xl hover:bg-primary hover:border-orange-500 transition-all active:scale-95 group/nav"
                       title="Navigate to Bus"
                     >
                       <Navigation size={22} className="rotate-45 group-hover/nav:scale-110 transition-transform md:w-[28px] md:h-[28px]" />
                     </button>
                     <button 
                       onClick={() => { setSelectedBus(nearestBus); setIsBooking(true); setStep(0); }}
                       className="flex-1 md:flex-none h-14 md:w-16 md:h-16 gap-2 bg-primary rounded-2xl md:rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 hover:bg-white hover:text-primary transition-all active:scale-90 font-black text-xs uppercase tracking-widest"
                       title="Book Ticket"
                      >
                        <span className="md:hidden">Select</span>
                        <ChevronRight size={24} strokeWidth={3} className="md:w-8 md:h-8" />
                     </button>
                  </div>
               </div>
            )}
      </div>

        {/* Optimized Booking Panel: Sidebar (Desktop) / Bottom Sheet (Mobile) */}
        <AnimatePresence>
          {isBooking && selectedBus && (
            <motion.div
              initial={{ y: "100%", x: "0%", opacity: 0 }}
              animate={{ y: 0, x: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => { if (info.offset.y > 200) setIsBooking(false); }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed md:absolute bottom-0 md:top-0 left-0 right-0 md:left-auto md:right-0 h-[90vh] md:h-full w-full md:w-[500px] bg-white md:bg-white/95 md:backdrop-blur-md rounded-t-[48px] md:rounded-none shadow-2xl z-[1001] flex flex-col overflow-hidden border-t-8 md:border-t-0 md:border-l border-white/60 md:border-zinc-100 pb-safe"
            >
              {/* Mobile Swipe Indicator */}
              <div className="md:hidden w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4 shrink-0" />
              
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

              {/* Panel Header */}
              <div className="p-5 md:p-12 flex items-center justify-between border-b border-zinc-100 shrink-0">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 md:gap-3">
                       <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-4 py-1 flex items-center md:py-2 rounded-full ${
                          selectedBus.status === "Running" ? "bg-orange-100 text-primary" : "bg-amber-100 text-amber-600"
                       }`}>• {selectedBus.status}</span>
                       <span className="hidden md:block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Fleet</span>
                   </div>
                   <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tighter mt-1 md:mt-2">{selectedBus.busNumber}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowBusQR(true)}
                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-orange-50 hover:bg-orange-100 rounded-3xl transition-all border border-orange-100 group"
                    title="View Bus QR"
                  >
                    <QrCode size={24} className="text-primary group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setIsBooking(false)}
                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-3xl transition-all border border-zinc-100 group"
                  >
                    <X size={24} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-5 md:p-12 space-y-6 md:space-y-12 no-scrollbar pb-12">
                {step === 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 md:space-y-12">
                    {/* Live Status Overlay */}
                    <div className="flex items-center justify-between p-5 md:p-8 bg-black/5 rounded-[24px] md:rounded-[40px] border border-black/5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                          <Activity className={`${selectedBus.status === "Running" ? "text-primary animate-pulse" : "text-amber-500"} w-5 h-5 md:w-6 md:h-6`} />
                        </div>
                        <div>
                          <p className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Status</p>
                          <p className="text-base md:text-xl font-black text-zinc-900 mt-0.5 md:mt-1">{selectedBus.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Speed</p>
                        <p className="text-base md:text-xl font-black text-primary mt-0.5 md:mt-1">{selectedBus.speed} <span className="text-[9px] md:text-xs font-bold text-zinc-400">km/h</span></p>
                      </div>
                    </div>

                    <div className="space-y-3 md:space-y-6">
                      <h3 className="text-[9px] md:text-xs font-black text-zinc-400 uppercase tracking-[0.4em]">Route Information</h3>
                      <div className="p-5 md:p-10 bg-white rounded-[24px] md:rounded-[48px] border border-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-4 md:space-y-8">
                        <div className="flex items-center gap-3 md:gap-6">
                          <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-sm"><Route size={20} className="md:w-7 md:h-7" /></div>
                          <div>
                            <p className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Line Name</p>
                            <p className="text-sm md:text-2xl font-black text-zinc-900 mt-1 line-clamp-1">{selectedBus.routeId?.routeName}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 md:gap-8 pt-4 border-t border-zinc-50">
                          <div>
                             <p className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Current Stop</p>
                             <p className="text-sm md:text-lg font-black text-zinc-900 mt-1 truncate">{selectedBus.currentStop || "N/A"}</p>
                          </div>
                          <div>
                             <p className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Next Arrival</p>
                             <p className="text-sm md:text-lg font-black text-primary mt-1 truncate">{selectedBus.nextStop || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                       <div className="p-5 md:p-10 bg-primary rounded-[24px] md:rounded-[40px] text-white shadow-[0_20px_40px_rgba(59,130,246,0.2)] flex md:flex-col items-center md:items-start justify-between md:justify-start">
                          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80 md:opacity-60 mb-0 md:mb-3">Available Space</p>
                          <div className="flex items-center gap-3 md:gap-4">
                            <span className="text-2xl md:text-5xl font-black">{selectedBus.availableSeats}</span>
                            <span className="text-[8px] md:text-xs font-bold uppercase opacity-80 md:opacity-60 whitespace-nowrap">Seats<br/>Left</span>
                          </div>
                       </div>
                       <div className="p-5 md:p-10 bg-zinc-900 rounded-[24px] md:rounded-[40px] text-white flex md:flex-col items-center md:items-start justify-between md:justify-start">
                          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80 md:opacity-60 mb-0 md:mb-3">ETA Terminal</p>
                          <div className="flex items-center gap-3 md:gap-4">
                            <span className="text-2xl md:text-5xl font-black">{selectedBus.arrivalTime.split(' ')[0]}</span>
                            <span className="text-[8px] md:text-xs font-bold uppercase opacity-80 md:opacity-60">{selectedBus.arrivalTime.split(' ')[1]}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em]">Boarding Points</h3>
                     <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 hide-scrollbar-mobile">
                          {selectedBus.routeId?.stops?.map((stop: any, idx: number) => (
                            <div key={stop._id} className={`shrink-0 p-6 rounded-3xl border-2 transition-all min-w-[160px] ${stop.stopName === selectedBus.currentStop ? "bg-amber-50 border-amber-500/30" : "bg-white border-zinc-100"}`}>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${stop.type === 'major' ? "text-primary" : "text-zinc-300"}`}>{stop.type === 'major' ? "Main Hub" : "Neighborhood"} 0{idx+1}</span>
                              <p className={`text-sm font-black mt-2 ${stop.stopName === selectedBus.currentStop ? "text-amber-600" : "text-zinc-600"}`}>{stop.stopName}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    {userLocation && (
                      <div className="space-y-6">
                         <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Proximity Intel</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-8 bg-rose-50/30 rounded-[32px] border border-rose-100/50">
                               <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Bus Distance</p>
                               <p className="text-3xl font-black text-zinc-900">{getDistance(userLocation.lat, userLocation.lng, selectedBus.location.lat, selectedBus.location.lng).toFixed(1)} <span className="text-xs">KM</span></p>
                            </div>
                            <div className="p-8 bg-orange-50/30 rounded-[32px] border border-orange-100/50">
                               <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Arrival ETA</p>
                               <p className="text-3xl font-black text-zinc-900">{Math.round(getDistance(userLocation.lat, userLocation.lng, selectedBus.location.lat, selectedBus.location.lng) * 2.5)} <span className="text-xs">MIN</span></p>
                            </div>
                         </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                       <button 
                         onClick={() => {
                            setIsBooking(false);
                            startNavigation(selectedBus);
                         }}
                         className="w-full h-16 bg-primary/10 text-primary rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 border border-primary/20"
                       >
                         <Navigation size={16} className="rotate-45" /> Start Road Navigation
                       </button>
                       <div className="flex gap-4">
                          <button 
                            onClick={() => { setIsBooking(false); }}
                            className="flex-1 h-20 bg-zinc-100 text-zinc-900 rounded-[32px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-4 border border-zinc-200"
                          >
                             <Navigation size={20} className="text-primary" /> Track
                          </button>
                          <button 
                            onClick={() => setStep(1)} 
                            disabled={selectedBus.status.includes("Running")}
                            className="flex-[1.5] h-20 bg-primary text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-zinc-900 transition-all shadow-xl disabled:opacity-20 uppercase flex items-center justify-center gap-4"
                          >
                            {selectedBus.status.includes("Running") ? "On Route" : <><Zap size={20} /> Book</>}
                          </button>
                       </div>
                    </div>
                   {selectedBus.status.includes("Running") && (
                      <p className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">Booking available only at Boarding Hubs</p>
                    )}
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                    <div className="relative p-10 bg-zinc-50/50 rounded-[48px] border border-zinc-100 shadow-inner group">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                           <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-2">Departing</div>
                           <div className="text-4xl font-black text-zinc-900">{selectedBus.departureTime}</div>
                           <div className="text-xs font-black text-primary mt-3 flex items-center justify-center gap-2">
                             <MapPin size={12} /> {selectedBus.routeId?.from}
                           </div>
                        </div>
                        <div className="flex flex-col items-center px-8">
                           <div className="w-1 h-20 bg-gradient-to-b from-primary/30 to-primary rounded-full" />
                           <Navigation className="text-primary my-[-10px] rotate-90" size={24} />
                        </div>
                        <div className="text-center flex-1">
                           <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-2">Arrival</div>
                           <div className="text-4xl font-black text-zinc-900">{selectedBus.arrivalTime}</div>
                           <div className="text-xs font-black text-primary mt-3 flex items-center justify-center gap-2 uppercase tracking-tighter">
                             <CheckCircle size={12} /> {selectedBus.routeId?.to}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="p-10 bg-white rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-zinc-50 transition-all hover:shadow-[0_40px_80px_-10px_rgba(59,130,246,0.1)] group">
                          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Ticket Price</p>
                          <p className="text-4xl font-black text-zinc-900 group-hover:text-primary transition-colors">₹{selectedBus.fare}</p>
                       </div>
                       <div className="p-10 bg-white rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-zinc-50 transition-all hover:shadow-[0_40px_80px_-10px_rgba(59,130,246,0.1)] group text-right">
                          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">Available Seats</p>
                          <p className="text-4xl font-black text-zinc-900 group-hover:text-amber-500 transition-colors">{selectedBus.availableSeats}</p>
                       </div>
                    </div>

                    {/* Boarding & Drop Point Selection */}
                    <div className="space-y-6">
                       <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em]">Journey Details</h3>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Boarding Point</label>
                             <select 
                               value={boardingPoint} 
                               onChange={(e) => setBoardingPoint(e.target.value)}
                               className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-3xl px-6 font-bold text-zinc-900 outline-none focus:border-primary/30 transition-all"
                             >
                                <option value="">Select Boarding</option>
                                {selectedBus.routeId?.stops?.filter((s:any) => s.type === 'major' ? layers.showMajorStops : layers.showSmallStops).map((stop: any) => (
                                  <option key={stop._id} value={stop.stopName}>{stop.type === 'major' ? "[Hub]" : "[Local]"} {stop.stopName}</option>
                                ))}
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Drop Point</label>
                             <select 
                               value={dropPoint} 
                               onChange={(e) => setDropPoint(e.target.value)}
                               className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-3xl px-6 font-bold text-zinc-900 outline-none focus:border-primary/30 transition-all"
                             >
                                <option value="">Select Drop Point</option>
                                {selectedBus.routeId?.stops?.filter((s:any) => s.type === 'major' ? layers.showMajorStops : layers.showSmallStops).map((stop: any) => (
                                  <option key={stop._id} value={stop.stopName}>{stop.type === 'major' ? "[Hub]" : "[Local]"} {stop.stopName}</option>
                                ))}
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em]">Live Intelligence</h3>
                       <div className="p-10 bg-zinc-50/50 rounded-[48px] border border-zinc-100 space-y-8 shadow-inner">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Clock size={16} className="text-primary" /></div>
                               <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Next Stop Sequence</span>
                            </div>
                            <span className="text-xs font-black text-zinc-900 uppercase">{selectedBus.nextStop}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Activity size={16} className="text-amber-500" /></div>
                               <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Current Velocity</span>
                            </div>
                            <span className="text-xs font-black text-zinc-900 uppercase">{selectedBus.speed} KM/H</span>
                          </div>
                       </div>
                    </div>

                      <button 
                        onClick={() => setStep(2)}
                        disabled={!boardingPoint || !dropPoint}
                        className="w-full bg-primary text-white py-8 rounded-[40px] text-2xl font-black uppercase tracking-tighter hover:bg-zinc-900 transition-all shadow-[0_30px_60px_-10px_rgba(59,130,246,0.4)] disabled:opacity-30 active:scale-95 flex items-center justify-center gap-4"
                      >
                        Select Passengers <ChevronRight size={28} />
                      </button>
                  </motion.div>
                )}

                {/* Step 2: Ticket Quantity Selector */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                    <div className="flex items-center justify-between">
                       <h3 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Ticket Selection</h3>
                       <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-4 border-l border-zinc-100">Live Seat Reservation</div>
                    </div>
                    
                    <div className="bg-zinc-50 p-12 md:p-16 rounded-[48px] md:rounded-[64px] shadow-inner border border-zinc-100 flex flex-col items-center gap-12">
                       <div className="text-center space-y-2">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Quantum Reserved Hub</p>
                          <h4 className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter">{ticketQuantity}</h4>
                          <p className="text-xs font-bold text-primary uppercase tracking-widest">Active Tickets Selected</p>
                       </div>

                       <div className="flex items-center gap-8 md:gap-12">
                          <button 
                            onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}
                            className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-3xl border-2 border-zinc-100 flex items-center justify-center text-3xl font-black text-zinc-900 shadow-xl hover:bg-zinc-900 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                          >
                             -
                          </button>
                          <button 
                            onClick={() => setTicketQuantity(prev => Math.min(selectedBus?.availableSeats || 35, prev + 1))}
                            className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-primary/30 hover:bg-zinc-900 transition-all transform hover:scale-110 active:scale-90"
                          >
                             +
                          </button>
                       </div>
                    </div>
                    
                    <div className="p-8 bg-orange-50/50 rounded-[32px] md:rounded-[40px] border border-orange-100/50 flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">Capacity Status</p>
                          <p className="text-sm font-black text-primary uppercase italic">{(selectedBus?.availableSeats || 35) - ticketQuantity} Seats Remaining</p>
                       </div>
                       <Info size={24} className="text-primary opacity-50" />
                    </div>

                    <div className="flex gap-4 md:gap-8">
                      <button onClick={() => setStep(1)} className="flex-1 h-20 bg-white text-zinc-500 rounded-[32px] font-black uppercase tracking-widest border border-zinc-100 hover:bg-zinc-50 transition-all">Back</button>
                      <button onClick={() => setStep(3)} className="flex-[2] h-20 bg-primary text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-zinc-900 transition-all shadow-xl uppercase">Passenger Intel &rarr;</button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                    <h3 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">Passenger Intel</h3>
                    <div className="space-y-10">
                       <div className="space-y-3 px-4">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] pl-2">Full Identity Name</label>
                          <div className="relative group">
                            <User className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={24} />
                            <input 
                              type="text" 
                              placeholder="Johnathan Doe" 
                              value={passengerDetails.name}
                              onChange={(e) => setPassengerDetails({...passengerDetails, name: e.target.value})}
                              className="w-full h-20 bg-zinc-50 border-2 border-zinc-100 rounded-[40px] pl-20 pr-10 font-bold text-xl text-zinc-900 outline-none focus:border-primary/30 focus:bg-white transition-all shadow-inner" 
                            />
                          </div>
                       </div>
                       <div className="space-y-3 px-4">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] pl-2">Phone Vector</label>
                          <div className="relative group">
                            <Phone className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={24} />
                            <input 
                              type="tel" 
                              placeholder="+91 98765 43210" 
                              value={passengerDetails.phone}
                              onChange={(e) => setPassengerDetails({...passengerDetails, phone: e.target.value})}
                              className="w-full h-20 bg-zinc-50 border-2 border-zinc-100 rounded-[40px] pl-20 pr-10 font-bold text-xl text-zinc-900 outline-none focus:border-primary/30 focus:bg-white transition-all shadow-inner" 
                            />
                          </div>
                       </div>
                       <div className="space-y-3 px-4">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] pl-2">Neural Email Path</label>
                          <div className="relative group">
                            <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={24} />
                            <input 
                              type="email" 
                              placeholder="john@example.com" 
                              value={passengerDetails.email}
                              onChange={(e) => setPassengerDetails({...passengerDetails, email: e.target.value})}
                              className="w-full h-20 bg-zinc-50 border-2 border-zinc-100 rounded-[40px] pl-20 pr-10 font-bold text-xl text-zinc-900 outline-none focus:border-primary/30 focus:bg-white transition-all shadow-inner" 
                            />
                          </div>
                       </div>
                    </div>

                    <div className="p-10 bg-primary rounded-[48px] shadow-[0_30px_60px_-10px_rgba(59,130,246,0.3)] text-white flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                             <CreditCard size={32} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Bill</p>
                             <p className="text-3xl font-black">₹{ticketQuantity * (selectedBus?.fare || 0)}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Matrix Sync</p>
                          <ShieldCheck size={28} className="ml-auto" />
                       </div>
                    </div>

                    <button 
                      onClick={confirmBooking} 
                      disabled={!passengerDetails.name || !passengerDetails.phone}
                      className="w-full h-20 md:h-28 bg-zinc-900 text-white rounded-[32px] md:rounded-[40px] font-black text-xl md:text-3xl tracking-tighter hover:bg-primary disabled:opacity-30 transition-all shadow-2xl flex items-center justify-center gap-4 md:gap-6 uppercase"
                    >
                      {loading ? <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <>Finalize Booking <CheckCircle size={28} className="md:w-9 md:h-9 w-7 h-7" /></>}
                    </button>
                    <button onClick={() => setStep(2)} className="w-full text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-zinc-600 transition-colors pb-8 md:pb-0">Change Ticket Quantity</button>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-6 md:py-10 text-center space-y-10 md:space-y-16">
                    <div className="w-24 h-24 md:w-40 md:h-40 bg-green-50 text-green-600 rounded-full flex items-center justify-center border-4 border-green-500/20 shadow-xl shadow-green-500/10">
                       <CheckCircle size={48} className="md:w-[84px] md:h-[84px]" />
                    </div>
                    <div className="space-y-2 md:space-y-4">
                       <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic">Success!</h2>
                       <p className="text-zinc-500 font-bold max-w-xs mx-auto text-sm md:text-lg px-4 leading-relaxed">Your seat has been reserved. Neural-ID: <span className="font-black text-primary block sm:inline">#{ticketId}</span></p>
                    </div>
                    
                    <div className="p-8 md:p-12 bg-white rounded-[48px] md:rounded-[64px] shadow-2xl md:shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-zinc-50">
                       <QRCodeSVG value={ticketId} size={140} className="md:w-[180px] md:h-[180px]" fgColor="#1e293b" />
                    </div>

                    <div className="w-full space-y-4 md:space-y-6">
                      <Link href="/my-bookings" className="block w-full h-20 md:h-24 bg-primary text-white rounded-[32px] md:rounded-[40px] flex items-center justify-center text-xl md:text-3xl font-black tracking-tighter shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase italic">
                         View Ticket
                      </Link>
                      <button onClick={() => { setIsBooking(false); setSelectedBus(null); setStep(1); setTicketQuantity(1); }} className="text-zinc-400 font-black uppercase tracking-widest text-[10px] md:text-xs hover:text-zinc-900 mb-8 md:mb-0">Return to Grid</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBusQR && selectedBus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[3100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
              onClick={() => setShowBusQR(false)}
            >
              <div 
                className="w-full max-w-sm bg-white rounded-[64px] p-10 space-y-8 shadow-2xl border-4 border-white/20 relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-50 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                    <QrCode size={20} /> Bus Fleet QR
                  </div>
                  <h3 className="text-4xl font-black text-zinc-900 tracking-tighter italic">{selectedBus.busNumber}</h3>
                  <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em]">{selectedBus.routeId?.routeName}</p>
                </div>

                <div className="flex flex-col items-center gap-10">
                    <div className="p-8 bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border-4 border-zinc-50 relative group">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          busId: selectedBus._id,
                          busNumber: selectedBus.busNumber,
                          route: selectedBus.routeId?.routeName,
                          auth: "JEFFBEN-SYNC"
                        })} 
                        size={200} 
                        className="transition-transform group-hover:scale-105 duration-500"
                        fgColor="#18181b" 
                        level="H"
                        includeMargin={true}
                      />
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[48px] pointer-events-none" />
                    </div>

                   <div className="w-full grid grid-cols-2 gap-6">
                      <div className="p-6 bg-zinc-50 rounded-[32px] border border-zinc-100">
                         <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Driver</p>
                         <p className="text-sm font-black text-zinc-900 mt-1 capitalize">Capt. Matrix (AI)</p>
                      </div>
                      <div className="p-6 bg-zinc-50 rounded-[32px] border border-zinc-100">
                         <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Security</p>
                         <p className="text-sm font-black text-primary mt-1">ENCRYPTED</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setShowBusQR(false)}
                  className="w-full h-20 bg-zinc-900 text-white rounded-[32px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
                >
                  Dismiss Terminal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
  );
}

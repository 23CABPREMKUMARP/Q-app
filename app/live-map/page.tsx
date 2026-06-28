"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Bus, MapPin, MapPinOff, Navigation, User, Phone, Mail, ChevronRight, X, CreditCard, Ticket, LayoutDashboard, QrCode, Zap, Info, Shield, ShieldCheck, Clock, CheckCircle, ArrowLeft, ArrowRight, Activity, Gauge, Search, Route, Camera, Wind, RefreshCw, Download, Wallet, Banknote, CheckCircle2, AlertCircle, ShieldAlert, Package } from "lucide-react";
import Script from "next/script";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import QRScanner from "@/src/components/ui/QRScanner";
import { useSearchParams } from "next/navigation";
import { TrackingStatusPanel } from "@/src/components/TrackingStatusPanel";
import { lineString, bezierSpline } from '@turf/turf';

import { BusData, MapLayers } from "@/src/types";
import { MOCK_BUSES } from "@/src/lib/constants";
import SecureView from "@/src/components/SecureView";

// --- Sub Components (Memoized for Performance) ---

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

const LiveBusMap = dynamic(() => import("@/src/components/map/LiveBusMap"), {
  ssr: false,
});

const MapLoadingSkeleton = React.memo(() => (
  <div className="flex items-center justify-center h-full w-full bg-white rounded-3xl overflow-hidden border-8 border-zinc-50 shadow-2xl relative">
    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-amber-600/5 backdrop-blur-3xl animate-pulse" />
    <div className="relative z-10 flex flex-col items-center gap-16">
      <div className="w-32 h-32 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin p-8 flex items-center justify-center">
        <div className="w-full h-full border-2 border-orange-500 rounded-full animate-pulse" />
      </div>
      <div className="space-y-4 text-center">
        <p className="text-zinc-900 font-bold tracking-tight text-2xl">Initializing Digi Bus Stand</p>
        <p className="text-zinc-400 text-[10px] uppercase font-semibold tracking-widest whitespace-nowrap">Powered by <span className="text-black">Jeff</span> Ben ... OK</p>
      </div>
    </div>
  </div>
));
MapLoadingSkeleton.displayName = "MapLoadingSkeleton";

const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-[2000] overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: "50%", 
            left: "50%", 
            scale: 0,
            x: 0,
            y: 0,
            rotate: 0
          }}
          animate={{ 
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600 - 100,
            scale: [0, 1, 0.5],
            rotate: Math.random() * 360,
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: 2, 
            ease: "easeOut",
            delay: Math.random() * 0.2
          }}
          className="absolute w-2 h-2 rounded-sm"
          style={{ 
            backgroundColor: ['#F18701', '#3B82F6', '#10B981', '#EF4444'][Math.floor(Math.random() * 4)] 
          }}
        />
      ))}
    </div>
  );
};



export default function LiveMapBookingPage() {
  return (
    <SecureView>
      <React.Suspense fallback={<MapLoadingSkeleton />}>
        <LiveMapContent />
      </React.Suspense>
    </SecureView>
  );
}

function LiveMapContent() {
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBusQR, setShowBusQR] = useState(false);
  const [layers, setLayers] = useState({
    showBuses: true,
    showRoutes: false,
    showMajorStops: false,
    showSmallStops: false,
    showTraffic: false,
    showBuildings: false
  });
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLiveLocationOn, setIsLiveLocationOn] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [nearbyRadius] = useState(5); // 5km
  const [centerOn, setCenterOn] = useState<{ lat: number, lng: number } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [navTarget, setNavTarget] = useState<any>(null);
  const [navPath, setNavPath] = useState<any>(null);
  const [navStats, setNavStats] = useState<{ distance: number, duration: number } | null>(null);
  const [navMode, setNavMode] = useState<'driving' | 'walking'>('walking');
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideNearestCard, setHideNearestCard] = useState(false);
  const [isAuthorizedToTrack, setIsAuthorizedToTrack] = useState(true);
  const [authChecking, setAuthChecking] = useState(false);
  const [isDrawerClosed, setIsDrawerClosed] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<'granted' | 'skipped' | 'pending' | 'denied'>('pending');



  const fetchLocation = () => {
    setLocationError("");
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setHasLocationPermission('granted');
        localStorage.setItem('hasLocationPermission', 'true');
      },
      (err) => {
        console.warn("High accuracy GPS failed, falling back to low accuracy:", err);
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            setUserLocation({ lat: fallbackPos.coords.latitude, lng: fallbackPos.coords.longitude });
            setHasLocationPermission('granted');
            localStorage.setItem('hasLocationPermission', 'true');
          },
          (fallbackErr) => {
            console.warn("All GPS fetches failed:", fallbackErr);
            setLocationError("Failed to acquire GPS location. Please check device settings and browser permissions.");
            setHasLocationPermission('denied');
            localStorage.setItem('hasLocationPermission', 'false');
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem('hasLocationPermission');
    if (saved === 'true') {
      setHasLocationPermission('granted');
      if (!userLocation) {
        fetchLocation();
      }
    } else if (saved === 'skipped') {
      setHasLocationPermission('skipped');
    } else {
      setHasLocationPermission('pending');
    }
  }, [userLocation]);

  useEffect(() => {
    if (selectedBus) {
      setIsDrawerClosed(false);
    }
  }, [selectedBus]);

  const busesRef = useRef(buses);
  useEffect(() => {
    busesRef.current = buses;
  }, [buses]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lower = searchQuery.toLowerCase();
    return buses.filter(b =>
      b.busNumber.toLowerCase().includes(lower) ||
      (b.busCode && b.busCode.toLowerCase().includes(lower)) ||
      (b.routeId?.routeName && b.routeId.routeName.toLowerCase().includes(lower)) ||
      (b.routeId?.from && b.routeId.from.toLowerCase().includes(lower)) ||
      (b.routeId?.to && b.routeId.to.toLowerCase().includes(lower))
    );

  }, [searchQuery, buses]);

  const watchIdRef = useRef<number | null>(null);
  const autoBookTriggeredRef = useRef(false);
  const searchParams = useSearchParams();

  // --- Initial Data Load & Real-Time Security Verification Loop ---
  useEffect(() => {
    const targetBusId = searchParams.get("busId");
    const isFromCode = searchParams.get("code") === "true";
    
    const verifyTrackingAuthorization = async () => {
      if (isFromCode) {
        setIsAuthorizedToTrack(true);
        return;
      }
      if (!targetBusId) {
        setIsAuthorizedToTrack(true);
        return;
      }
      
      const phone = localStorage.getItem("registeredPhone");
      if (!phone) {
        setIsAuthorizedToTrack(false);
        return;
      }

      try {
        setAuthChecking(true);
        const res = await fetch("/api/bookings/by-phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone })
        });
        const bookings = await res.json();
        if (Array.isArray(bookings)) {
          const hasPaidBooking = bookings.some((b: any) => 
            b.paymentStatus === "Paid" && 
            (b.busId?._id === targetBusId || b.busId === targetBusId)
          );
          setIsAuthorizedToTrack(hasPaidBooking);
        } else {
          setIsAuthorizedToTrack(false);
        }
      } catch (err) {
        setIsAuthorizedToTrack(false);
      } finally {
        setAuthChecking(false);
      }
    };

    verifyTrackingAuthorization();

    const fetchLiveBuses = async () => {
      try {
        const res = await fetch("/api/buses");
        if (res.ok) {
          const data = await res.json();
          const matrixBuses = data.map((b: any) => ({
            ...b,
            _id: b._id,
            busCode: b.busCode || `${b.busNumber?.split('-').pop() || b._id.substring(b._id.length - 4)}`.toUpperCase(),
            location: {
              lat: b.location?.lat || b.location?.latitude || 11.0168,
              lng: b.location?.lng || b.location?.longitude || 76.9558,
              rotation: b.location?.rotation || 0
            }
          }));
          const finalBuses = matrixBuses.length > 0 ? matrixBuses : MOCK_BUSES;
          
          setBuses(finalBuses);
          
          if (targetBusId) {
            const found = finalBuses.find((b: any) => b._id === targetBusId || b.busId === targetBusId);
            if (found) {
              setSelectedBus((prev: any) => prev?._id === found._id ? prev : found);
              setCenterOn((prev: any) => prev ? prev : found.location);
              
              if (isFromCode && !autoBookTriggeredRef.current) {
                autoBookTriggeredRef.current = true;
              }
            }
          }
        } else {
          setBuses(MOCK_BUSES);
        }
      } catch (e) {
        setBuses(MOCK_BUSES);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveBuses();

    const pollInterval = setInterval(() => {
      fetchLiveBuses();
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [searchParams]);


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
      clearNavigation();
    } else {
      setLocationError(null); // Reset error state on retry
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
        let msg = "GPS Signal Lost";
        if (err.code === 1) msg = "Permission Denied";
        else if (err.code === 3) msg = "Connection Timeout";
        
        setLocationError(msg);

        // On fatal user permission denial, reset toggle
        if (err.code === 1) setIsLiveLocationOn(false);
      };

      watchIdRef.current = navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy: true,
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
  const handleQRScan = React.useCallback((decodedText: string) => {
    setIsScanning(false);
    let busId = decodedText.trim();

    // Support both raw ID and URL formats
    if (busId.startsWith("{")) {
      try {
        const data = JSON.parse(busId);
        busId = data.busId || data.id || busId;
      } catch (e) { }
    } else if (busId.includes("busId=")) {
      busId = busId.split("busId=")[1].split("&")[0];
    }

    const cleanTarget = busId.toLowerCase().replace(/\s+/g, '');
    
    const foundBus = busesRef.current.find(b => 
      b._id.toLowerCase().replace(/\s+/g, '') === cleanTarget || 
      b.busNumber.toLowerCase().replace(/\s+/g, '') === cleanTarget || 
      (b.busCode && b.busCode.toLowerCase().replace(/\s+/g, '') === cleanTarget)
    );
    if (foundBus) {
      setSelectedBus(foundBus);
    } else {
      alert("Electronic Signature mismatch. Bus not found in fleet grid.");
    }
  }, []);

  useEffect(() => {
    const action = searchParams.get("action");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    
    if (action === "scan") {
      setIsScanning(true);
    } else if (action === "nearby") {
      if (lat && lng) {
        setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
        setCenterOn({ lat: parseFloat(lat), lng: parseFloat(lng) } as any);
      }
      setShowNearbyOnly(true);
      if (!isLiveLocationOn) {
        toggleLiveLocation();
      }
    }
  }, [searchParams]);

  // URL Bus Selection Auto-Trigger
  useEffect(() => {
    const busId = searchParams.get("busId");
    const isFromCode = searchParams.get("code") === "true";
    if (busId && buses.length > 0) {
      const foundBus = buses.find(b => b._id === busId);
      if (foundBus) {
        setSelectedBus(foundBus);
        if (isFromCode && foundBus.location) {
          setCenterOn({ lat: foundBus.location.lat, lng: foundBus.location.lng } as any);
        }
      }
    }
  }, [searchParams, buses]);

  // Nearby Proximity Logic
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Navigation Logic
  const lastFetchedNavLoc = useRef<{ lat: number, lng: number } | null>(null);

  const fetchNavigationPath = async (from: { lat: number, lng: number }, to: { lat: number, lng: number }, profile: 'driving' | 'walking' = 'walking') => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes[0]) {
        setNavPath(data.routes[0].geometry);
        setNavStats({
          distance: +(data.routes[0].distance / 1000).toFixed(1),
          duration: Math.round(data.routes[0].duration / 60)
        });
        lastFetchedNavLoc.current = to;
        return true;
      }
    } catch (e) {
      // Navigation fetch failed
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
      // Zoom to route handled in map via centerOn or map effect
    }
  };

  const clearNavigation = () => {
    setIsNavigating(false);
    setNavTarget(null);
    setNavPath(null);
    setNavStats(null);
    lastFetchedNavLoc.current = null;
  };

  // Auto-Track from Search Params
  useEffect(() => {
    if (searchParams.get("action") === "track" && selectedBus && userLocation && !autoBookTriggeredRef.current) {
      startNavigation(selectedBus);
      autoBookTriggeredRef.current = true;
    }
  }, [searchParams, selectedBus, userLocation]);

  // Recalculate Navigation if user or target moves
  useEffect(() => {
    if (isNavigating && userLocation && navTarget) {
      const targetLoc = navTarget.location || navTarget;
      if (lastFetchedNavLoc.current) {
        const dist = getDistance(lastFetchedNavLoc.current.lat, lastFetchedNavLoc.current.lng, targetLoc.lat, targetLoc.lng);
        // Only fetch new routing path from OSRM if target has moved more than 100 meters (0.1 km)
        if (dist < 0.1) {
          return;
        }
      }
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

  const nearbyBuses = useMemo(() => {
    if (!userLocation || buses.length === 0) return [];
    
    const withDistance = buses.map(b => {
      const dist = getDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
      return { ...b, distance: dist };
    });
    
    const nearby = withDistance.filter(b => b.distance <= 5.0).sort((a, b) => a.distance - b.distance);
    
    // Always fall back to closest 3 if none within 5km for testing/robustness
    if (nearby.length === 0) {
      return withDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
    }
    return nearby.slice(0, 5);
  }, [userLocation, buses]);

  const nearestBus = useMemo(() => {
    return nearbyBuses.length > 0 ? nearbyBuses[0] : null;
  }, [nearbyBuses]);

  // Auto-Navigate to nearest bus immediately when user hits Nearby
  useEffect(() => {
    if (showNearbyOnly && userLocation && nearestBus && !isNavigating) {
      startNavigation(nearestBus);
    }
  }, [showNearbyOnly, userLocation, nearestBus, isNavigating]);




  const confirmBooking = async () => {
  };

  if (hasLocationPermission === 'pending') {
    return (
      <main className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.1),transparent_60%)]" />
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl relative z-10">
          <div className="w-20 h-20 bg-[#FF9933]/20 rounded-[28px] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(255,153,51,0.3)]">
            <MapPin size={40} className="text-[#FF9933]" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase text-white">Find Nearby Buses</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
              Allow location access to see nearby buses, estimate exact arrival times, and track your route.
            </p>
          </div>
          
          <div className="w-full space-y-3 pt-4">
            <button 
              onClick={() => {
                if ("geolocation" in navigator) {
                  fetchLocation();
                }
              }}
              className="w-full bg-[#FF9933] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-[#FF9933]/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <Navigation size={18} /> Allow Location
            </button>
            
            <button 
              onClick={() => {
                localStorage.setItem('hasLocationPermission', 'skipped');
                setHasLocationPermission('skipped');
              }}
              className="w-full bg-white/5 text-slate-400 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors active:scale-95"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading) return <MapLoadingSkeleton />;

  if (!isAuthorizedToTrack) {
    return (
      <main className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.1),transparent_60%)]" />
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-500 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">Access Restricted</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[#FF9933]">Confirmed Passengers Only</p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time live location tracking and telemetry details for this vehicle are private. Please book a pass or verify your payment status to retrieve active live positioning coordinates.
          </p>
          <div className="pt-4 space-y-2">
            <Link 
              href="/"
              className="w-full py-4 bg-[#FF9933] hover:bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
            >
              Go to Home Screen
            </Link>
            <Link 
              href="/get-ticket"
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Retrieve Ticket Pass
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="h-[100dvh] w-full flex flex-col bg-zinc-50 overflow-hidden font-sans text-zinc-900 relative"
    >
      <h1 className="sr-only">Live Bus Tracking & Booking | JeffBen Systems</h1>
      <AnimatePresence mode="wait">
        {isScanning && <QRScanner onScan={handleQRScan} onClose={() => setIsScanning(false)} />}
      </AnimatePresence>

      <div className="flex-1 w-full h-full relative">



        {/* Map Background Layer */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <LiveBusMap
            buses={filteredBuses}
            selectedBusId={selectedBus?._id}
            nearbyBusIds={nearbyBuses.map(b => b._id)}
            layers={layers}
            userLocation={userLocation}
            nearestBus={nearestBus}
            centerOn={centerOn}
            navPath={navPath}
            navStats={navStats}
            onBusClick={(bus) => {
              // Level 1: Initial Discovery Phase (Telemetry)
              setSelectedBus(bus);
            }}
          />
        </div>


      </div>

      {/* Rapido-Style Sliding Bottom Sheet */}
      <AnimatePresence>
        {selectedBus && !isDrawerClosed && (
          <TrackingStatusPanel 
            bus={selectedBus} 
            userLocation={userLocation}
            onClose={() => setSelectedBus(null)}
            onMinimize={() => setIsDrawerClosed(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDrawerClosed && selectedBus && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4"
          >
            <div className="bg-slate-900/90 text-white rounded-3xl p-3.5 shadow-2xl border border-slate-800 backdrop-blur-md flex items-center justify-between gap-4 pl-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-[#FF9933]/20 rounded-full flex items-center justify-center shrink-0">
                  <Bus size={18} className="text-[#FF9933]" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-white leading-tight truncate">Bus JB-{selectedBus.busCode}</p>
                  <p className="text-[9px] text-[#FF9933] font-bold uppercase tracking-wider truncate">{selectedBus.routeId?.routeName || "Live Tracking"}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedBus(null);
                    setIsDrawerClosed(false);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer border border-slate-700/50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsDrawerClosed(false)}
                  className="px-5 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white rounded-2xl font-bold text-[9px] uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  Details
                </button>
              </div>
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
            className="fixed inset-0 z-[3100] flex items-center justify-center bg-black/20 backdrop-blur-md p-4"
            onClick={() => setShowBusQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[64px] p-10 space-y-8 shadow-2xl border-4 border-white/20 relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <h3 className="text-4xl font-black text-zinc-900 tracking-tighter ">{selectedBus.busNumber}</h3>
                <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em]">{selectedBus.routeId?.routeName}</p>
              </div>

              <div className="flex flex-col items-center gap-10">
                <div className="p-8 bg-[#FF9933] rounded-[48px] shadow-[0_40px_100px_rgba(255,153,51,0.2)] border-4 border-[#FF9933]/20 relative overflow-hidden group">
                  {/* Secure Watermark Layer */}
                  <div className="absolute inset-0 opacity-[0.35] pointer-events-none flex flex-wrap gap-3 items-center justify-center text-[8px] font-black uppercase tracking-widest text-white -rotate-12 scale-125">
                    {Array(30).fill(null).map((_, i) => (
                      <span key={i} className="whitespace-nowrap">DIGI BUS STAND • JEFFBEN •</span>
                    ))}
                  </div>
                  <QRCodeSVG
                    value={JSON.stringify({ busId: selectedBus._id, auth: "JEFFBEN-SYNC" })}
                    size={200}
                    fgColor="#18181b"
                    level="H"
                    imageSettings={{
                      src: "/hero-logo.png",
                      x: undefined,
                      y: undefined,
                      height: 70,
                      width: 70,
                      excavate: true,
                    }}
                  />
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.4em]">Bus Code</p>
                  <div className="px-10 py-4 bg-primary rounded-full shadow-lg border-4 border-white/20">
                     <span className="text-white font-black text-2xl tracking-[0.2em]">{selectedBus.busCode}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowBusQR(false)}
                className="w-full h-20 bg-zinc-950 text-white rounded-[32px] font-black uppercase tracking-widest hover:bg-primary transition-all"
              >
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          @page {
            size: landscape !important;
            margin: 0 !important;
          }

          .no-print, nav, form, .diagnostics-plate, button, .Internal-Fleet-Diagnostics, footer, .Confetti { display: none !important; }
          
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            margin: 0 !important;
            padding: 0 !important;
          }

          main { background: white !important; padding: 0 !important; margin: 0 !important; }
          
          #printable-ticket {
            visibility: visible !important;
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            border: 1px solid #f4f4f5 !important;
            border-radius: 40px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #printable-ticket * {
            visibility: visible !important;
          }
        }
      `}</style>
    </motion.main>
  );
}

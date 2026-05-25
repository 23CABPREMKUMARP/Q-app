"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Bus, MapPin, Navigation, User, Phone, Mail, ChevronRight, X, CreditCard, Ticket, LayoutDashboard, QrCode, Zap, Info, Shield, ShieldCheck, Clock, CheckCircle, ArrowLeft, ArrowRight, Activity, Gauge, Search, Route, Camera, Wind, RefreshCw, Download, Wallet, Banknote, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import Script from "next/script";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import QRScanner from "@/src/components/ui/QRScanner";
import { RollingNumber } from "@/src/components/ui/RollingNumber";
import { IntelligentPhoneInput } from "@/src/components/ui/IntelligentPhoneInput";
import { useSearchParams } from "next/navigation";
import { lineString, bezierSpline } from '@turf/turf';

import { BusData, MapLayers } from "@/src/types";
import { MOCK_BUSES } from "@/src/lib/constants";

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
  const [passengerDetails, setPassengerDetails] = useState({ phone: "", seatNumber: "" });
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
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>({ lat: 11.0168, lng: 76.9558 }); // Fallback for local testing
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
  const [paymentState, setPaymentState] = useState<'idle' | 'preparing' | 'checkout' | 'verifying' | 'success' | 'failed'>('idle');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isAuthorizedToTrack, setIsAuthorizedToTrack] = useState(true);
  const [authChecking, setAuthChecking] = useState(false);
  const [isDrawerClosed, setIsDrawerClosed] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<'granted' | 'skipped' | 'pending'>('pending');
  const [showNearbyBusesDrawer, setShowNearbyBusesDrawer] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('hasLocationPermission');
    if (saved === 'true') {
      setHasLocationPermission('granted');
    } else if (saved === 'skipped') {
      setHasLocationPermission('skipped');
    } else {
      setHasLocationPermission('pending');
    }
  }, []);

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
          
          // Apply Live Simulation Engine
          const simulatedBuses = finalBuses.map((bus: any) => ({
            ...bus,
            location: getSimulatedLocation(bus, Date.now())
          }));
          
          setBuses(simulatedBuses);
          
          if (targetBusId) {
            const found = finalBuses.find((b: any) => b._id === targetBusId || b.busId === targetBusId);
            if (found) {
              setSelectedBus((prev: any) => prev?._id === found._id ? prev : found);
              setCenterOn((prev: any) => prev ? prev : found.location);
              
              if (isFromCode && !autoBookTriggeredRef.current) {
                setIsBooking(true);
                setStep(2);
                autoBookTriggeredRef.current = true;
              }
            }
          }
        } else {
          const simulatedMock = MOCK_BUSES.map((bus: any) => ({
            ...bus,
            location: getSimulatedLocation(bus, Date.now())
          }));
          setBuses(simulatedMock);
        }
      } catch (e) {
        const simulatedMock = MOCK_BUSES.map((bus: any) => ({
          ...bus,
          location: getSimulatedLocation(bus, Date.now())
        }));
        setBuses(simulatedMock);
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

        // Set fallback to user's real-world location (Palladam, TN) since localhost testing blocks live GPS
        setTimeout(() => {
          if (!userLocation) setUserLocation({ lat: 11.0000, lng: 77.2880 });
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
      setIsBooking(true);
      setStep(2); // Open Boarding Details
    } else {
      alert("Electronic Signature mismatch. Bus not found in fleet grid.");
    }
  }, []);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "scan") {
      setIsScanning(true);
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
        if (isFromCode) {
          setIsBooking(false);
          if (foundBus.location) {
            setCenterOn({ lat: foundBus.location.lat, lng: foundBus.location.lng } as any);
          }
        } else {
          setIsBooking(true);
          setStep(1);
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
      setShowNearbyOnly(false);
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
      setIsBooking(true);
      setStep(2);
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


  const handlePayment = async () => {
    if (!selectedBus) return;
    setPaymentState('preparing');
    setPaymentError(null);
    
    try {
      const amount = ticketQuantity * (selectedBus.fare || 1);
      
      // 1. Create Razorpay Order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: "INR",
        name: "JeffBen Systems",
        description: `Bus Booking: ${selectedBus.busNumber}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          setPaymentState('verifying');
          
          try {
            // 3. Verify Payment and Finalize Booking
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDetails: {
                  busId: selectedBus._id,
                  seats: Array.from({ length: ticketQuantity }, (_, i) => `S-${i + 1}`),
                  totalAmount: amount,
                  boardingPoint,
                  destination: dropPoint,
                  passengers: [{ phone: passengerDetails.phone || "9999999999" }]
                }
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setBookingResult(verifyData.booking);
              setTicketId(verifyData.booking.ticketId);
              setPaymentState('success');
              setStep(5);
              
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([100, 30, 100]);
              }
              
              setBuses(prev => prev.map(bus => bus._id === selectedBus._id ? { ...bus, availableSeats: bus.availableSeats - ticketQuantity } : bus));
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (err: any) {
            setPaymentState('failed');
            setPaymentError(err.message || "Failed to verify payment");
            setStep(6);
            console.error("Verification Error:", err);
          }
        },
        modal: {
          ondismiss: function() {
            setPaymentState('failed');
            setPaymentError("Payment cancelled by user");
            setStep(6);
          }
        },
        prefill: {
          contact: passengerDetails.phone || "9999999999",
        },
        theme: {
          color: "#18181b",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setPaymentState('failed');
      setPaymentError(error.message || "Failed to initialize payment");
      setStep(6);
      console.error("Payment Initialization Error:", error);
    }
  };

  const confirmBooking = async () => {
    setStep(4);
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
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      localStorage.setItem('hasLocationPermission', 'true');
                      setHasLocationPermission('granted');
                      setShowNearbyBusesDrawer(true);
                    },
                    (err) => {
                      console.warn("Location services unavailable, using fallback coordinates.");
                      setUserLocation({ lat: 11.0168, lng: 76.9558 });
                      localStorage.setItem('hasLocationPermission', 'true');
                      setHasLocationPermission('granted');
                      setShowNearbyBusesDrawer(true);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                  );
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
                setShowNearbyBusesDrawer(false);
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
              setStep(1);
              setIsBooking(false);
            }}
          />
        </div>


      </div>

      {/* Rapido-Style Sliding Bottom Sheet */}
      <AnimatePresence>
        {selectedBus && !isDrawerClosed && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            drag={ (isBooking || step === 4 || step === 5) ? false : "y"}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150 && step < 4) {
                setIsDrawerClosed(true);
              }
            }}
            className="fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-100 flex flex-col max-h-[92vh] overflow-hidden gpu-accelerated"
          >
            {/* Drag Handle */}
            {step !== 4 && (
              <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
              </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 pb-12">
              {step === 5 ? (
                /* STEP 5: FINAL DIGITAL TICKET */
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative flex flex-col items-center justify-center p-0 text-center py-12">
                   <div className="w-full max-w-[340px] md:max-w-4xl relative group">
                    {/* VINTAGE ORNATE GOLD TICKET DESIGN */}
                    <div 
                      id="printable-ticket"
                      className="ticket-container relative bg-[#f7e49f] bg-gradient-to-br from-[#f7e49f] via-[#e5c167] to-[#d4af37] rounded-[20px] md:rounded-[40px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-[6px] md:border-[12px] border-[#b8860b]/30 flex flex-col md:flex-row min-h-[550px] md:min-h-[400px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] print:rounded-none print:shadow-none print:border-[4px] print:m-0"
                    >
                      <div className="absolute inset-0 opacity-100 mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] print:opacity-50" />
                      <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
                      <div className="absolute inset-0 border-[6px] border-[#d4af37] opacity-80 pointer-events-none" />
                      
                      {/* Left Side: Main Info */}
                      <div className="p-8 md:p-14 flex-1 relative border-b-4 md:border-b-0 md:border-r-4 border-dashed border-[#b8860b]/40">
                        <div className="relative z-10 text-center mb-10">
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <Image src="/logo2.png" alt="JeffBen" width={40} height={40} className="object-contain" />
                            <div className="h-8 w-[1px] bg-[#5d4037]/20" />
                            <Image src="/hero-logo.png" alt="Digi Bus Stand" width={40} height={40} className="object-contain mix-blend-multiply" />
                          </div>
                          <p className="text-[10px] font-black text-[#5d4037]/50 uppercase tracking-[0.4em] mb-1">Digi Bus Stand Framework</p>
                          <p className="text-xl md:text-2xl font-vintage  text-[#5d4037]/80 leading-none mb-2">Powered by <span className="text-black">Jeff</span>Ben</p>
                          <h3 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-[#5d4037] leading-none mb-2 uppercase">Digi Bus Stand Ticket</h3>
                        </div>

                        <div className="space-y-6 text-left relative z-10 px-4">
                          <div className="grid grid-cols-2 gap-8 border-b border-[#5d4037]/20 pb-4">
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[10px] tracking-[0.3em] text-[#5d4037]/60">Bus No:</span>
                              <span className="text-xl md:text-2xl font-serif text-[#5d4037] font-black tracking-tight uppercase ">{selectedBus.busNumber}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[10px] tracking-[0.3em] text-[#5d4037]/60">Passengers:</span>
                              <span className="text-xl md:text-2xl font-serif text-[#5d4037] font-black tracking-tight">{ticketQuantity}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8 border-b border-[#5d4037]/20 pb-4">
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[10px] tracking-[0.3em] text-[#5d4037]/60">Boarding</span>
                              <p className="text-base font-serif text-[#5d4037] font-bold uppercase ">{boardingPoint}</p>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[10px] tracking-[0.3em] text-[#5d4037]/60">Destination</span>
                              <p className="text-base font-serif text-[#5d4037] font-bold uppercase ">{dropPoint}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: QR Secure Matrix */}
                      <div className="p-8 md:p-12 md:w-[320px] flex flex-col justify-between items-center relative overflow-hidden bg-black/5">
                        <div className="p-3 bg-[#FF9933]/10 rounded-2xl shadow-inner border-2 border-[#FF9933] relative overflow-hidden group">
                          {/* Secure Watermark Layer */}
                          <div className="absolute inset-0 opacity-[0.4] pointer-events-none flex flex-wrap gap-2 items-center justify-center text-[6px] font-black uppercase tracking-tighter text-white -rotate-12 scale-110">
                            {Array(20).fill(null).map((_, i) => (
                              <span key={i} className="whitespace-nowrap">DIGI BUS STAND • JEFFBEN •</span>
                            ))}
                          </div>
                          <QRCodeSVG 
                              value={btoa(JSON.stringify({
                                t: ticketId,
                                b: selectedBus._id,
                                q: ticketQuantity,
                                r: selectedBus.routeId?._id,
                                m: "JB-NEURAL-SECURE"
                              }))} 
                              size={140} 
                              fgColor="#2d1a12" 
                              bgColor="transparent"
                              level="H" 
                              imageSettings={{
                                src: "/hero-logo.png",
                                x: undefined,
                                y: undefined,
                                height: 35,
                                width: 35,
                                excavate: true,
                              }}
                            />
                        </div>
                        <div className="text-center mt-6">
                           <p className="text-[10px] font-bold text-[#5d4037]/50 uppercase tracking-widest">Serial Key</p>
                           <p className="text-xs font-serif font-black text-[#5d4037]">JB-{ticketId?.slice(-8) || "98765432"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-8 no-print">
                      <button 
                        onClick={() => window.print()}
                        className="h-20 bg-zinc-950 text-white rounded-[32px] font-black text-xl tracking-tighter flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
                      >
                        <Download size={22} /> Download Pass
                      </button>
                      <button 
                         onClick={() => {
                            setSelectedBus(null);
                            setStep(1);
                            setIsBooking(false);
                         }}
                         className="h-16 bg-white border border-zinc-100 text-zinc-400 rounded-[28px] font-bold uppercase tracking-widest text-xs hover:text-zinc-900 transition-colors"
                      >
                        Close & Track Map
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (step === 1 || step === 2 || step === 3 || step === 4) && !isBooking ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  {/* Primary CTA Stack - Promoted to top for Rapido speed */}
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => { setIsBooking(true); setStep(2); }}
                      className="w-full h-16 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Book Ticket
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setIsDrawerClosed(true)}
                        className="h-16 bg-white border-2 border-zinc-100 text-zinc-900 rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:border-primary transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <Navigation size={14} className="text-primary rotate-45" /> Map View
                      </button>
                      <button 
                         onClick={() => setShowBusQR(true)}
                         className="h-16 bg-white border-2 border-zinc-100 text-zinc-900 rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:border-primary transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <QrCode size={14} className="text-primary" /> Matrix ID: <span className="text-primary ml-1">{selectedBus.busCode}</span>
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-50" />

                  {/* Peek Content: Active Trip Info */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none">Arriving in approx 8 Mins</p>
                      </div>
                      <h2 className="text-4xl font-black text-zinc-900 tracking-tighter leading-none mt-2 uppercase whitespace-nowrap truncate font-heading">{selectedBus.busNumber}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs font-bold text-zinc-400">{selectedBus.routeId?.routeName}</p>
                        <span className="px-2 py-0.5 bg-zinc-950 text-white text-[8px] font-black rounded-full uppercase tracking-widest">{selectedBus.busCode}</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center border border-orange-100/50 shadow-sm relative">
                       <Bus size={30} className="text-primary" />
                       <div className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-950 rounded-full flex items-center justify-center border-2 border-white">
                          <Zap size={10} className="text-white fill-current" />
                       </div>
                    </div>
                  </div>

                  {/* Real-time Telemetry Grid with Glassmorphism */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-50/50 backdrop-blur-md rounded-[24px] p-5 flex flex-col items-center justify-center border border-zinc-100/50 group hover:border-orange-500/30 transition-all">
                      <Clock size={16} className="text-zinc-400 mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter">{selectedBus.departureTime}</span>
                      <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1">Start</span>
                    </div>
                    <div className="bg-zinc-50/50 backdrop-blur-md rounded-[24px] p-5 flex flex-col items-center justify-center border border-zinc-100/50 group hover:border-orange-500/30 transition-all">
                      <Gauge size={16} className="text-zinc-400 mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter">{selectedBus.speed} <span className="text-[7px]">KM/H</span></span>
                      <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1">Velocity</span>
                    </div>
                    <div className="bg-zinc-50/50 backdrop-blur-md rounded-[24px] p-5 flex flex-col items-center justify-center border border-zinc-100/50 group hover:border-orange-500/30 transition-all">
                      <User size={16} className="text-zinc-400 mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter">{selectedBus.availableSeats} <span className="text-[7px]">Left</span></span>
                      <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1">Load</span>
                    </div>
                  </div>

                  {/* Premium Bus Features Section */}
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-1.5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                           <Zap size={14} className="text-orange-500" />
                           <span className="text-[7px] font-black uppercase tracking-widest">WiFi 6</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                           <Shield size={14} className="text-blue-500" />
                           <span className="text-[7px] font-black uppercase tracking-widest">CCTV Secure</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                           <Clock size={14} className="text-primary" />
                           <span className="text-[7px] font-black uppercase tracking-widest">A/C Units</span>
                        </div>
                     </div>
                     <div className="h-4 w-[1px] bg-zinc-100" />
                     <div className="text-right">
                        <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest leading-none">Comfort Class</p>
                        <p className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter mt-1 ">Executive Neural</p>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                   {/* BOOKING FLOW STATE */}
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <button onClick={() => setIsBooking(false)} className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all"><ArrowLeft size={20} /></button>
                         <h3 className="text-2xl font-bold text-zinc-900 tracking-tight uppercase">Secure Booking</h3>
                      </div>
                      <button onClick={() => { setIsBooking(false); setSelectedBus(null); }} className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><X size={20} /></button>
                   </div>

                   {/* Routing Dynamic Highlight */}
                   <div className="bg-zinc-950 rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden group">
                      <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Origin</span>
                         <span className="text-sm font-black text-white uppercase  truncate max-w-[120px]">{boardingPoint || "Select Stop"}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center px-4">
                         <div className="w-full h-[1px] bg-zinc-800 relative">
                            <div className="absolute inset-0 bg-primary animate-pulse" />
                            <ArrowRight size={14} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-primary" />
                         </div>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                         <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Drop</span>
                         <span className="text-sm font-black text-white uppercase  truncate max-w-[120px]">{dropPoint || "Choose End"}</span>
                      </div>
                   </div>

                   {step === 2 && (
                      <div className="space-y-8">
                         {/* Integrated Step 1 Telemetry */}
                         <div className="grid grid-cols-3 gap-3">
                            <div className="bg-zinc-50 rounded-[22px] p-4 flex flex-col items-center border border-zinc-100">
                               <Gauge size={14} className="text-primary mb-1" />
                               <span className="text-[10px] font-black text-zinc-900">{selectedBus.speed} KM/H</span>
                               <span className="text-[7px] font-bold text-zinc-400 uppercase">Velocity</span>
                            </div>
                            <div className="bg-zinc-50 rounded-[22px] p-4 flex flex-col items-center border border-zinc-100">
                               <User size={14} className="text-primary mb-1" />
                               <span className="text-[10px] font-black text-zinc-900">{selectedBus.availableSeats}</span>
                               <span className="text-[7px] font-bold text-zinc-400 uppercase">Empty</span>
                            </div>
                            <div className="bg-zinc-50 rounded-[22px] p-4 flex flex-col items-center border border-zinc-100">
                               <Shield size={14} className="text-primary mb-1" />
                               <span className="text-[10px] font-black text-zinc-900">SECURE</span>
                               <span className="text-[7px] font-bold text-zinc-400 uppercase">Unit Status</span>
                            </div>
                         </div>
                         {/* Step 1 Interaction Stack */}
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => setIsDrawerClosed(true)}
                              className="h-16 bg-white border-2 border-zinc-100 text-zinc-900 rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:border-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Navigation size={14} className="text-primary rotate-45" /> Map View
                            </button>
                            <button 
                               onClick={() => setShowBusQR(true)}
                               className="h-16 bg-white border-2 border-zinc-100 text-zinc-900 rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:border-primary transition-all flex items-center justify-center gap-2"
                            >
                              <QrCode size={14} className="text-primary" /> Matrix ID
                            </button>
                         </div>

                         <div className="w-full h-px bg-zinc-50" />

                         <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Boarding From</label>
                               <select 
                                 value={boardingPoint} 
                                 onChange={(e) => setBoardingPoint(e.target.value)} 
                                 onPointerDown={(e) => e.stopPropagation()}
                                 onTouchStart={(e) => e.stopPropagation()}
                                 className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[24px] px-6 font-bold text-zinc-900 outline-none focus:ring-2 ring-primary/20 transition-all cursor-pointer relative z-50"
                               >
                                 <option value="">Choose Station</option>
                                 {selectedBus.routeId?.stops?.map((s: any) => <option key={s._id} value={s.stopName}>{s.stopName}</option>)}
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Drop Destination</label>
                               <select 
                                 value={dropPoint} 
                                 onChange={(e) => setDropPoint(e.target.value)} 
                                 onPointerDown={(e) => e.stopPropagation()}
                                 onTouchStart={(e) => e.stopPropagation()}
                                 className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[24px] px-6 font-bold text-zinc-900 outline-none focus:ring-2 ring-primary/20 transition-all cursor-pointer relative z-50"
                               >
                                 <option value="">Choose Destination</option>
                                 {selectedBus.routeId?.stops?.map((s: any) => <option key={s._id} value={s.stopName}>{s.stopName}</option>)}
                               </select>
                            </div>
                         </div>
                         <button 
                           onClick={() => setStep(3)}
                           disabled={!boardingPoint || !dropPoint}
                           className="w-full h-20 bg-zinc-950 text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95"
                         >
                           Select Passengers <ChevronRight size={24} />
                         </button>
                      </div>
                   )}

                   {step === 3 && (
                      <div className="space-y-8">
                         <div className="flex flex-col items-center py-6 bg-zinc-50 rounded-[40px] border border-zinc-100">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">Ticket Quantity</p>
                            <div className="flex items-center gap-12">
                               <button onClick={() => setTicketQuantity(prev => Math.max(1, prev -1))} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-zinc-900 shadow-sm hover:bg-zinc-950 hover:text-white transition-all border border-zinc-200">-</button>
                                                               <div className="text-5xl font-black text-zinc-900  min-w-[80px] flex justify-center">
                                  <RollingNumber value={ticketQuantity} />
                                </div>

                               <button onClick={() => setTicketQuantity(prev => Math.min(selectedBus.availableSeats, prev + 1))} className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg hover:bg-zinc-950 transition-all">+</button>
                            </div>
                            <div className="space-y-4 w-full px-6 mt-6">
                               <IntelligentPhoneInput 
                                 value={passengerDetails.phone}
                                 onChange={(val) => setPassengerDetails({...passengerDetails, phone: val})}
                               />
                             </div>
                         </div>

                         <button 
                           onClick={confirmBooking}
                           disabled={!passengerDetails.phone || passengerDetails.phone.length < 10}
                           className="w-full h-20 bg-primary text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-zinc-950 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
                         >
                           Proceed to Payment <ChevronRight size={24} />
                         </button>
                      </div>
                   )}
                    {step === 4 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="space-y-8"
                      >
                        <div className="bg-zinc-950 rounded-[40px] p-8 text-white space-y-6 relative overflow-hidden group">
                          {/* Animated Gradient Glow */}
                          <motion.div 
                            animate={{ 
                              opacity: [0.1, 0.3, 0.1],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-20 -right-20 w-64 h-64 bg-primary rounded-full blur-[100px] pointer-events-none"
                          />
                          
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CreditCard size={120} />
                          </div>
                          <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Payment Summary</p>
                            <h4 className="text-3xl font-black tracking-tighter  uppercase whitespace-nowrap truncate font-heading">{selectedBus.busNumber}</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Tickets</p>
                              <div className="flex items-center gap-1">
                                <RollingNumber value={ticketQuantity} />
                                <span className="text-lg font-black  ml-1">Seats</span>
                              </div>
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Total Fare</p>
                              <div className="text-2xl font-black text-primary  flex justify-end">
                                <RollingNumber value={ticketQuantity * (selectedBus.fare || 150)} prefix="₹" />
                              </div>
                            </div>
                          </div>

                          <div className="w-full h-px bg-zinc-800" />

                          <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                              <MapPin size={14} className="text-zinc-500" />
                              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight">{boardingPoint} → {dropPoint}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone size={14} className="text-zinc-500" />
                              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight">{passengerDetails.phone}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button 
                            onClick={handlePayment}
                            disabled={paymentState !== 'idle' && paymentState !== 'failed'}
                            className="w-full h-20 bg-primary text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-zinc-950 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 relative overflow-hidden group"
                          >
                            <AnimatePresence mode="wait">
                              {paymentState === 'idle' || paymentState === 'failed' ? (
                                <motion.div 
                                  key="idle"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="flex items-center gap-3"
                                >
                                  Secure Checkout <ChevronRight size={24} />
                                </motion.div>
                              ) : (
                                <motion.div 
                                  key="processing"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-3"
                                >
                                  <RefreshCw size={20} className="animate-spin" />
                                  <span className="uppercase tracking-widest text-sm">{paymentState}...</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                          <button 
                            onClick={() => setStep(3)}
                            className="w-full h-14 bg-zinc-50 text-zinc-400 rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:bg-zinc-100 hover:text-zinc-900 transition-all active:scale-95"
                          >
                            Edit Details
                          </button>
                        </div>
                        
                        {paymentError && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-rose-500 justify-center"
                          >
                            <AlertCircle size={14} />
                            <p className="text-[10px] font-black uppercase tracking-tight">{paymentError}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {step === 5 && bookingResult && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8 relative"
                      >
                        <Confetti />
                        <div className="text-center space-y-4 relative z-10 mb-12">
                          <motion.div 
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100"
                          >
                            <CheckCircle2 size={32} className="text-emerald-500" />
                          </motion.div>
                          <div className="space-y-1">
                            <motion.h4 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="text-2xl font-bold text-zinc-900 tracking-tight uppercase"
                            >
                              Payment Verified
                            </motion.h4>
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest"
                            >
                              Ticket Generated Successfully
                            </motion.p>
                          </div>
                        </div>

                        {/* Modern Compact Ticket Card */}
                        <div className="w-full overflow-hidden flex items-center justify-center py-4">
                          <motion.div 
                            id="printable-ticket"
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.3 }}
                            className="bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-zinc-100 flex flex-row transition-all hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)] origin-center scale-[0.55] sm:scale-[0.75] md:scale-100 min-w-[600px] md:min-w-0"
                            style={{ margin: '-15% 0' }}
                          >
                           <div className="p-8 border-r border-dashed border-zinc-100 flex flex-col items-center justify-center gap-6 bg-zinc-50/50 w-[240px]">
                              <div className="bg-white p-4 rounded-3xl shadow-xl border border-zinc-50 group-hover:scale-105 transition-transform duration-500">
                                <QRCodeSVG 
                                   value={bookingResult.qrToken} 
                                   size={180} 
                                   level="H"
                                   fgColor="#18181b"
                                   imageSettings={{
                                     src: "/hero-logo.png",
                                     height: 50,
                                     width: 50,
                                     excavate: true,
                                   }}
                                />
                              </div>
                              <div className="text-center space-y-1">
                                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Pass Identity Token</p>
                                 <p className="text-xs font-bold text-zinc-900 uppercase tracking-tight">{bookingResult.ticketId}</p>
                              </div>
                           </div>

                           <div className="p-8 flex-1 space-y-6 flex flex-col justify-center">
                              {/* Travel Route Segment */}
                              <div className="relative">
                                 <div className="flex items-center justify-between relative z-10">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Departure</p>
                                      <p className="text-xl font-bold text-zinc-900 tracking-tight uppercase">{bookingResult.boardingPoint || boardingPoint || "ORIGIN"}</p>
                                    </div>
                                    <div className="flex-1 px-4 flex flex-col items-center justify-center gap-1">
                                       <div className="w-full h-px bg-zinc-100 relative">
                                          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                                       </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Arrival</p>
                                      <p className="text-xl font-bold text-zinc-900 tracking-tight uppercase">{bookingResult.destination || dropPoint || "DESTIN"}</p>
                                    </div>
                                 </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-4 gap-4 py-4 border-y border-zinc-50">
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Bus Number</p>
                                    <p className="text-xs font-bold text-zinc-900 uppercase">{selectedBus.busNumber}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Seat Node</p>
                                    <p className="text-xs font-bold text-zinc-900 uppercase">{bookingResult.seats?.join(", ") || "S-1"}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Travel Date</p>
                                    <p className="text-xs font-bold text-zinc-900">{bookingResult.bookingDate ? new Date(bookingResult.bookingDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Sync Time</p>
                                    <p className="text-xs font-bold text-zinc-900 uppercase">{selectedBus.departureTime || "LIVE"}</p>
                                 </div>
                              </div>

                              <div className="flex items-center justify-between">
                                 <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">Encrypted Ticket Token • Non-Transferable</span>
                                 <p className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Amt: ₹{bookingResult.totalAmount || (ticketQuantity * (selectedBus.fare || 1))}</p>
                              </div>
                           </div>

                           {/* Side Notches */}
                           <div className="absolute left-0 top-[60%] -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100" />
                           <div className="absolute right-0 top-[60%] translate-x-1/2 w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100" />
                        </motion.div>
                        </div>

                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="grid grid-cols-2 gap-3"
                        >
                           <button 
                             onClick={() => window.print()}
                             className="h-16 bg-zinc-950 text-white rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:bg-primary transition-all flex items-center justify-center gap-2 active:scale-95"
                           >
                             <Download size={14} /> Print Pass
                           </button>
                           <button 
                             onClick={() => { setIsBooking(false); setSelectedBus(null); setStep(1); }}
                             className="h-16 bg-zinc-50 text-zinc-900 rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                           >
                             Return to Hub
                           </button>
                        </motion.div>
                      </motion.div>
                    )}

                    {step === 6 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8 text-center py-12"
                      >
                        <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border-2 border-rose-100">
                          <X size={48} className="text-rose-500" />
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">Transaction Failed</h4>
                          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest max-w-xs mx-auto">
                            {paymentError || "The transit matrix encountered a processing error. Please verify your credentials and try again."}
                          </p>
                        </div>

                        <div className="pt-8 space-y-3">
                          <button 
                            onClick={() => { setStep(4); setPaymentState('idle'); }}
                            className="w-full h-20 bg-zinc-950 text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-zinc-900/10"
                          >
                            <RefreshCw size={24} /> Retry Payment
                          </button>
                          <button 
                             onClick={() => { setIsBooking(false); setSelectedBus(null); setStep(1); }}
                             className="w-full h-14 bg-zinc-50 text-zinc-400 rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:bg-zinc-100 hover:text-zinc-900 transition-all active:scale-95"
                          >
                            Return to Fleet Hub
                          </button>
                        </div>
                      </motion.div>
                    )}
                </motion.div>
              )}
            </div>
          </motion.div>
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
                    setIsBooking(false);
                    setStep(1);
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
                  <p className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.4em]">Matrix ID</p>
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

      {/* Floating Nearby Buses Button (When drawer is closed) */}
      <AnimatePresence>
        {!showNearbyBusesDrawer && hasLocationPermission === 'granted' && !selectedBus && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 right-6 z-[1000]"
          >
            <button
              onClick={() => setShowNearbyBusesDrawer(true)}
              className="w-16 h-16 bg-[#FF9933] rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-[#FF9933]/50 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-colors" />
              <div className="relative z-10 flex flex-col items-center">
                <Bus size={24} className="text-white mb-0.5" />
                <span className="text-[7px] font-black text-white uppercase tracking-widest">Nearby</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nearby Buses Bottom Sheet */}
      <AnimatePresence>
        {showNearbyBusesDrawer && hasLocationPermission === 'granted' && !selectedBus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-slate-950/60 backdrop-blur-sm flex items-end justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden pointer-events-auto"
            >
              <div className="w-full flex justify-center py-4 cursor-grab" onClick={() => setShowNearbyBusesDrawer(false)}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>
              
              <div className="px-6 pb-4 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-lg">Nearby Fleet</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Found {nearbyBuses.length} Active Vehicles</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {nearbyBuses.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-[24px] border border-slate-100">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No buses found nearby</p>
                  </div>
                ) : (
                  nearbyBuses.map((bus: any, idx: number) => {
                    const isNearest = idx === 0;
                    return (
                      <div key={bus._id} className={`bg-slate-50 border ${isNearest ? 'border-[#FF9933] shadow-md' : 'border-slate-100'} rounded-[24px] p-5 flex items-center justify-between gap-4 relative overflow-hidden transition-all hover:bg-slate-100`}>
                        {isNearest && (
                          <div className="absolute top-0 right-0 bg-[#FF9933] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                            Nearest Bus
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-2xl uppercase text-slate-900 tracking-tighter">{bus.busNumber}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[180px] mb-3">
                            {bus.routeId?.routeName || "Scanning route..."}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-widest uppercase text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex items-center gap-1.5">
                              <MapPin size={12} className="text-[#FF9933]" /> {bus.distance.toFixed(1)} km
                            </span>
                            <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 ml-1">Status: <span className="text-emerald-500">{bus.status}</span></span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => {
                            setShowNearbyBusesDrawer(false);
                            // Pan map directly to this bus
                            setCenterOn({ lat: bus.location.lat, lng: bus.location.lng });
                            setSelectedBus(bus);
                            setIsDrawerClosed(true);
                          }}
                          className={`flex-shrink-0 w-16 h-16 ${isNearest ? 'bg-[#FF9933] text-white shadow-xl shadow-[#FF9933]/20' : 'bg-slate-900 text-white'} rounded-[20px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:scale-105 transition-all active:scale-95`}
                        >
                          <Navigation size={20} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </motion.main>
  );
}

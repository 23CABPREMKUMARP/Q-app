"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, LogIn, Camera, QrCode, CheckCircle2, AlertTriangle, XCircle, 
  Clock, MapPin, User, ChevronLeft, Volume2, Vibrate, LayoutDashboard, 
  History, Settings, Bus, Share2, X, Fingerprint, Lock, Shield, KeyRound,
  Search, Plus, Minus, AlertCircle, RefreshCw, Smartphone, CreditCard, 
  HelpCircle, HardDrive, Wifi, WifiOff, FileText, Bell, Users, DollarSign, Menu,
  Radio, Navigation, Gauge, BatteryMedium, Signal
} from "lucide-react";
import { useGPS } from "@/src/hooks/useGPS";
import { BusMatrixQR } from "@/src/components/BusMatrixQR";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from "@/src/lib/supabase";
import SecureView from "@/src/components/SecureView";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Hardcoded stops from town-bus
const STOPS = ["Gandhipuram", "Lakshmi Mills", "Peelamedu", "Hope College", "Singanallur", "Ukkadam", "Railway Station"];

const INITIAL_PASSENGERS = [
  { ticketId: "TB-849204", name: "Anand Kumar", boarding: "Gandhipuram", destination: "Singanallur", status: "Boarded", seat: "S4" },
  { ticketId: "TB-732049", name: "Priya Sharma", boarding: "Lakshmi Mills", destination: "Ukkadam", status: "Not Boarded", seat: "S12" },
  { ticketId: "TB-590234", name: "Karthik Mani", boarding: "Peelamedu", destination: "Railway Station", status: "Boarded", seat: "S18" },
  { ticketId: "TB-920482", name: "Divya Nathan", boarding: "Hope College", destination: "Singanallur", status: "Not Boarded", seat: "S25" },
  { ticketId: "TB-310492", name: "Ramesh Krishnan", boarding: "Gandhipuram", destination: "Ukkadam", status: "Boarded", seat: "S7" }
];

export default function EnterpriseConductorPortal() {
  // Clerk Auth & Assignment States
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isCheckingAssignment, setIsCheckingAssignment] = useState(true);
  const [isAssigned, setIsAssigned] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Controls portal visibility
  
  const [employeeId, setEmployeeId] = useState("");
  const [assignedRouteName, setAssignedRouteName] = useState("");
  const [error, setError] = useState("");

  // Portal Shell State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showQR, setShowQR] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [busDbId, setBusDbId] = useState("");
  const [tripStatus, setTripStatus] = useState("Scheduled");
  const [speed, setSpeed] = useState(0);
  const [lat, setLat] = useState(11.0168); // Coimbatore central coordinates
  const [lng, setLng] = useState(76.9558);
  const [broadcasting, setBroadcasting] = useState(false);
  const [pathIndex, setPathIndex] = useState(0);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  // Real GPS via useGPS hook
  const gpsState = useGPS({
    busId: busDbId,
    conductorId: employeeId,
    enabled: gpsEnabled && !!busDbId,
    onLocationUpdate: ({ lat: newLat, lng: newLng, speed: newSpeed }) => {
      setLat(newLat);
      setLng(newLng);
      setSpeed(newSpeed);
    },
    onError: (err) => setError(err),
  });

  // Statistics & Log Registers (persisted to state)
  const [ticketsSold, setTicketsSold] = useState(12);
  const [passengersBoarded, setPassengersBoarded] = useState(3);
  const [totalRevenue, setTotalRevenue] = useState(180);
  const [cashCollection, setCashCollection] = useState(120);
  const [onlineCollection, setOnlineCollection] = useState(60);
  const [completedTrips, setCompletedTrips] = useState(1);
  const [occupancy, setOccupancy] = useState(28); // Current passengers onboard

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const scannerRef = useRef<any>(null);

  // Onboard Ticket Form
  const [obBoarding, setObBoarding] = useState(STOPS[0]);
  const [obDestination, setObDestination] = useState(STOPS[1]);
  const [obQuantity, setObQuantity] = useState(1);
  const [obPaymentMode, setObPaymentMode] = useState<"Cash" | "UPI" | "PhonePe" | "GPay">("Cash");
  const [obSuccessTicket, setObSuccessTicket] = useState<any>(null);

  // Passenger Management State
  const [passengers, setPassengers] = useState<any[]>(INITIAL_PASSENGERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [passengerFilter, setPassengerFilter] = useState<"All" | "Boarded" | "Not Boarded">("All");

  // Occupancy Map State
  const [seats, setSeats] = useState<boolean[]>(
    Array(50).fill(false).map((_, i) => i < 28) // first 28 seats occupied
  );

  // Offline Mode States
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Issue Reporting States
  const [issueType, setIssueType] = useState("Vehicle Breakdown");
  const [issueSeverity, setIssueSeverity] = useState("Medium");
  const [issueDesc, setIssueDesc] = useState("");
  const [issueSuccess, setIssueSuccess] = useState(false);

  // Notifications Box
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: "Route Delay Info", message: "Coimbatore Local: Traffic delays near Hope College bypass.", time: "5m ago", type: "warning" },
    { id: 2, title: "Assigned Bus", message: "Assigned to Bus Code 1024 (TN-38-EF-2025) for current shift.", time: "1h ago", type: "info" },
    { id: 3, title: "Announcement", message: "Conductors must enforce digital QR pass scanning strictly.", time: "2h ago", type: "info" }
  ]);

  // Log Records
  const [logs, setLogs] = useState<any[]>([
    { time: "08:30 AM", event: "Shift engaged by Employee EMP-9824", type: "system" },
    { time: "09:12 AM", event: "Validated Ticket TB-849204 (Boarded: Gandhipuram)", type: "scan" },
    { time: "09:45 AM", event: "Completed Trip 1: Ukkadam Express", type: "trip" }
  ]);

  // Route points simulation
  const routePathCoordinates = [
    { lat: 11.0168, lng: 76.9558 }, // Gandhipuram
    { lat: 11.0120, lng: 76.9700 }, // Lakshmi Mills
    { lat: 11.0250, lng: 76.9850 }, // Peelamedu
    { lat: 11.0380, lng: 77.0010 }, // Hope College
    { lat: 11.0100, lng: 77.0200 }, // Singanallur
    { lat: 10.9950, lng: 76.9600 }  // Ukkadam
  ];

  // Fetch Bus details and initialize trip status
  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/buses")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const matchedBus = data.find((b: any) => b.busCode === "1024");
            if (matchedBus) {
              setBusDbId(matchedBus._id);
              setTripStatus(matchedBus.status || "Scheduled");
              setSpeed(matchedBus.speed || 0);
              if (matchedBus.location) {
                setLat(matchedBus.location.lat || 11.0168);
                setLng(matchedBus.location.lng || 76.9558);
              }
            }
          }
        })
        .catch((err) => console.error("Error fetching buses:", err));
    }
  }, [isAuthenticated]);

  // Simulated GPS Telemetry Broadcast updates
  useEffect(() => {
    let interval: any = null;
    if (broadcasting && !isOffline) {
      interval = setInterval(() => {
        setPathIndex((prev) => {
          const nextIndex = (prev + 1) % routePathCoordinates.length;
          const nextCoord = routePathCoordinates[nextIndex];
          setLat(nextCoord.lat);
          setLng(nextCoord.lng);
          
          fetch("/api/conductor/update-trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              busId: busDbId || "65f02cdcf8dbd5225c588825",
              status: tripStatus,
              speed: speed > 0 ? speed : 48,
              lat: nextCoord.lat,
              lng: nextCoord.lng
            })
          }).catch(console.error);

          return nextIndex;
        });
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [broadcasting, busDbId, tripStatus, speed, isOffline]);

  // Check Clerk User Assignment
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in?redirect_url=/conductor");
      } else if (user?.primaryEmailAddress?.emailAddress) {
        fetch(`/api/conductor/check-assignment?email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.isAssigned) {
              setEmployeeId(data.assignment.employee_id || "EMP-N/A");
              setBusDbId(data.assignment.assigned_bus || "");
              setAssignedRouteName(data.assignment.assigned_route || "Route Unassigned");
              setIsAssigned(true);
              setIsAuthenticated(true);
            } else {
              setIsAssigned(false);
            }
            setIsCheckingAssignment(false);
          })
          .catch(err => {
            console.error("Assignment check failed", err);
            setIsCheckingAssignment(false);
          });
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  

  // Launch camera scan handler
  useEffect(() => {
    let html5QrCode: any = null;

    const startScanner = async () => {
      if (isAuthenticated && isScanning) {
        const { Html5Qrcode } = await import("html5-qrcode");
        
        html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            async (decodedText: string) => {
              handleScanSuccess(decodedText);
              await html5QrCode.stop();
              setIsScanning(false);
            },
            (errorMessage: string) => {
              // ignore scanner failures
            }
          );
        } catch (err) {
          console.error("Camera access failed", err);
          setError("Camera Access Denied");
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isAuthenticated, isScanning]);

  const handleScanSuccess = async (token: string) => {
    setValidating(true);
    setScanResult(null);

    // 1. Offline Mode Validation Fallback
    if (isOffline) {
      setTimeout(() => {
        setValidating(false);
        // Simulate validating offline ticket
        const offlineValid = token.startsWith("TB-") || token.includes("JB-NEURAL");
        const ticketId = token.startsWith("TB-") ? token : "TB-" + Math.floor(100000 + Math.random() * 900000);
        
        if (offlineValid) {
          const scanObj = {
            success: true,
            message: "Offline Validated (Sync Pending)",
            booking: {
              ticketId,
              route: `${obBoarding} → ${obDestination}`,
              seats: 1,
              boardingPoint: obBoarding,
              status: "Valid"
            }
          };
          setScanResult(scanObj);
          setPassengersBoarded(p => p + 1);
          setOccupancy(o => Math.min(50, o + 1));
          
          // Log locally
          const updatedLogs = [
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `[Offline] Validated Ticket ${ticketId}`, type: "scan" },
            ...logs
          ];
          setLogs(updatedLogs);

          // Queue sync request
          setOfflineQueue(q => [...q, { type: "scan-validation", token, time: Date.now() }]);
          playBeep(true);
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else {
          setScanResult({ success: false, message: "Invalid Offline Pass" });
          playBeep(false);
          if (navigator.vibrate) navigator.vibrate([300]);
        }
      }, 1000);
      return;
    }

    // 2. Standard Online API Validation
    try {
      const res = await fetch("/api/conductor/validate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          scannedBy: "CONDUCTOR_MOBILE_01",
          location: "Mobile Entry"
        }),
      });

      const data = await res.json();
      setScanResult(data);
      
      if (data.success) {
        setPassengersBoarded(p => p + 1);
        setOccupancy(o => Math.min(50, o + 1));
        
        // Log transaction
        const updatedLogs = [
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Validated Ticket ${data.booking?.ticketId}`, type: "scan" },
          ...logs
        ];
        setLogs(updatedLogs);
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        playBeep(true);
      } else {
        if (navigator.vibrate) navigator.vibrate([300]);
        playBeep(false);
      }
    } catch (err) {
      console.error("Validation failed", err);
      setError("Network Sync Failed");
    } finally {
      setValidating(false);
    }
  };

  const playBeep = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(success ? 880 : 220, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  // Onboard ticket pricing rules
  const getStopIndex = (stopName: string) => STOPS.indexOf(stopName);
  const stopsDelta = Math.abs(getStopIndex(obDestination) - getStopIndex(obBoarding)) || 1;
  const fareRate = 15; // base price
  const ticketFare = stopsDelta * fareRate * obQuantity;

  // Onboard ticket issuance
  
  const saveStats = (updated: any) => {
    localStorage.setItem("conductorStats", JSON.stringify({
      ticketsSold: updated.ticketsSold ?? ticketsSold,
      passengersBoarded: updated.passengersBoarded ?? passengersBoarded,
      totalRevenue: updated.totalRevenue ?? totalRevenue,
      cashCollection: updated.cashCollection ?? cashCollection,
      onlineCollection: updated.onlineCollection ?? onlineCollection
    }));
  };

  
  const handleLogout = () => {
    signOut(() => router.push("/"));
  };

  const handleIssueTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (obBoarding === obDestination) return;

    const newTicketId = "TB-ONB-" + Math.floor(100000 + Math.random() * 900000);
    const mockTicket = {
      ticketId: newTicketId,
      boarding: obBoarding,
      destination: obDestination,
      quantity: obQuantity,
      fare: ticketFare,
      paymentMode: obPaymentMode,
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setObSuccessTicket(mockTicket);
    setTicketsSold(t => t + obQuantity);
    setTotalRevenue(r => r + ticketFare);
    setOccupancy(o => Math.min(50, o + obQuantity));

    if (obPaymentMode === "Cash") {
      setCashCollection(c => c + ticketFare);
      saveStats({
        ticketsSold: ticketsSold + obQuantity,
        totalRevenue: totalRevenue + ticketFare,
        cashCollection: cashCollection + ticketFare
      });
    } else {
      setOnlineCollection(o => o + ticketFare);
      saveStats({
        ticketsSold: ticketsSold + obQuantity,
        totalRevenue: totalRevenue + ticketFare,
        onlineCollection: onlineCollection + ticketFare
      });
    }

    // Add passenger entry
    const newPassenger = {
      ticketId: newTicketId,
      name: `Onboard Pass x${obQuantity}`,
      boarding: obBoarding,
      destination: obDestination,
      status: "Boarded",
      seat: "S" + (occupancy + 1)
    };
    setPassengers(prev => [newPassenger, ...prev]);

    // Save logs
    setLogs(prev => [
      { time: mockTicket.issuedAt, event: `Issued ${obQuantity} Onboard Ticket(s) (Total ₹${ticketFare})`, type: "onboard" },
      ...prev
    ]);

    // Offline queue if offline
    if (isOffline) {
      setOfflineQueue(q => [...q, { type: "ticket-issuance", ticket: mockTicket }]);
    }

    playBeep(true);
  };

  // Sync Offline Queue
  const handleSyncData = () => {
    if (offlineQueue.length === 0) return;
    
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      setLogs(prev => [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Offline Sync completed successfully (${offlineQueue.length} records)`, type: "sync" },
        ...prev
      ]);
      setOfflineQueue([]);
      playBeep(true);
    }, 2000);
  };

  // Toggle single seats from occupancy monitor grid
  const toggleSeat = (idx: number) => {
    const updated = [...seats];
    updated[idx] = !updated[idx];
    setSeats(updated);
    setOccupancy(updated.filter(v => v).length);
    playBeep(true);
  };

  // Handle reporting issues
  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDesc.trim()) return;

    setIssueSuccess(true);
    setLogs(prev => [
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Reported issue: [${issueSeverity}] ${issueType}`, type: "report" },
      ...prev
    ]);

    if (issueSeverity === "Emergency") {
      triggerTripBroadcast("Delayed", `EMERGENCY ALERT: ${issueType}. ${issueDesc}`);
    }

    setTimeout(() => {
      setIssueSuccess(false);
      setIssueDesc("");
    }, 3000);
    playBeep(true);
  };

  const triggerTripBroadcast = async (statusOverride?: string, customText?: string) => {
    if (isOffline) return;
    try {
      const res = await fetch("/api/conductor/update-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: busDbId || "65f02cdcf8dbd5225c588825",
          status: statusOverride || tripStatus,
          speed: speed,
          lat: lat,
          lng: lng,
          customBroadcast: customText || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        if (statusOverride) {
          setTripStatus(statusOverride);
          setLogs(prev => [
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Trip status broadcasted: ${statusOverride}`, type: "trip" },
            ...prev
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered passengers
  const filteredPassengers = passengers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = passengerFilter === "All" || 
                          (passengerFilter === "Boarded" && p.status === "Boarded") ||
                          (passengerFilter === "Not Boarded" && p.status === "Not Boarded");
    return matchesSearch && matchesFilter;
  });

  return (
    <SecureView>
      <div className="min-h-screen bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] text-zinc-900 font-sans antialiased overflow-x-hidden flex flex-col md:flex-row">
      
      {/* 1. AUTHENTICATION MODULE (CLERK REPLACEMENT) */}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] flex flex-col items-center justify-center p-6 text-zinc-200 overflow-y-auto"
          >
            <div className="text-center space-y-4 max-w-md w-full p-8 border border-zinc-300 rounded-3xl bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] shadow-2xl relative">
              <div className="absolute top-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-600/30">
                <ShieldCheck className="text-[#111827]" size={32} />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-[#111827]">Transit Console</h1>
              
              {!isLoaded || isCheckingAssignment ? (
                <div className="space-y-2 pt-4">
                  <RefreshCw className="animate-spin mx-auto text-orange-500" size={24} />
                  <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Verifying Clearance...</p>
                </div>
              ) : !isSignedIn ? (
                <div className="space-y-4 pt-4">
                  <p className="text-xs font-bold text-[#EF4444] uppercase tracking-widest">Authentication Required</p>
                  <button onClick={() => router.push("/sign-in?redirect_url=/conductor")} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-[#111827] font-black rounded-xl uppercase tracking-widest text-[10px]">
                    Sign In to Continue
                  </button>
                </div>
              ) : !isAssigned ? (
                <div className="space-y-4 pt-4">
                  <p className="text-sm font-bold text-[#EF4444]">ACCESS DENIED</p>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Your email <b>{user?.primaryEmailAddress?.emailAddress}</b> is not assigned to any conductor role. 
                    Please contact the Operations Admin for clearance.
                  </p>
                  <div className="pt-4 space-y-3">
                    <button onClick={() => router.push("/")} className="w-full py-3 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-zinc-700 text-[#111827] font-bold rounded-xl text-xs uppercase tracking-wider transition-all">
                      Return to Passenger Dashboard
                    </button>
                    <button onClick={() => signOut()} className="w-full py-3 bg-red-600/10 text-[#EF4444] hover:bg-red-600/20 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-[#EF4444]/20">
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CORE LAYOUT DESIGN (IF AUTHENTICATED) */}
      {isAuthenticated && (
        <>
          {/* SIDEBAR FOR DESKTOP */}
          <aside className="hidden md:flex flex-col w-72 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border-r border-zinc-300 p-6 space-y-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30">
                <Image src="/hero-logo.png" alt="JB" width={22} height={22} className="invert brightness-0" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-tight">Transit Console</h2>
                <p className="text-[9px] text-[#22C55E] font-bold uppercase tracking-wider">Sync Engaged</p>
              </div>
            </div>

            <div className="h-px bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827]" />

            {/* Sidebar Tabs */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {[
                { id: "dashboard", label: "Home Dashboard", icon: LayoutDashboard },
                { id: "scan", label: "QR Pass Scanner", icon: QrCode },
                { id: "ticketing", label: "Onboard Ticketing", icon: DollarSign },
                { id: "passengers", label: "Passenger Ledger", icon: Users },
                { id: "occupancy", label: "Occupancy Map", icon: Bus },
                { id: "gps", label: "GPS & Trip Tracker", icon: MapPin },
                { id: "collections", label: "Revenue Ledger", icon: FileText },
                { id: "offline", label: `Offline Sync (${offlineQueue.length})`, icon: isOffline ? WifiOff : Wifi },
                { id: "issues", label: "Report Issue", icon: AlertTriangle },
                { id: "notifications", label: `Announcements (${notifications.length})`, icon: Bell }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-orange-600 text-[#111827] shadow-md shadow-orange-600/10" : "text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/40"}`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-zinc-300 space-y-3">
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] p-3.5 rounded-xl border border-zinc-300 text-[10px] space-y-1">
                <span className="text-zinc-500 font-bold uppercase block tracking-wider">Conductor ID</span>
                <span className="text-zinc-200 font-black uppercase block">{employeeId || "EMP-9824"}</span>
                <span className="text-zinc-600 block pt-1">Conductor</span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-zinc-755 border border-zinc-300 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95"
              >
                Logout Shift
              </button>
            </div>
          </aside>

          {/* MOBILE HEADER */}
          <header className="md:hidden flex items-center justify-between px-5 py-4 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border-b border-zinc-300 sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-zinc-750 border border-zinc-300 rounded-lg text-zinc-300 mr-0.5"
              >
                <Menu size={16} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/30">
                  <Image src="/hero-logo.png" alt="JB" width={18} height={18} className="invert brightness-0" />
                </div>
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-tight text-[#111827] leading-tight">Console</h2>
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${isOffline ? "bg-[#EF4444] animate-pulse" : "bg-[#22C55E] animate-pulse"}`} />
                    <span className="text-[7.5px] font-bold text-zinc-600 uppercase tracking-widest leading-none">
                      {isOffline ? "Offline" : "Live"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {offlineQueue.length > 0 && (
                <button 
                  onClick={() => setActiveTab("offline")} 
                  className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full text-[9px] font-black animate-pulse border border-amber-500/30"
                >
                  Sync ({offlineQueue.length})
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="p-2 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-xl text-zinc-405 transition-colors"
              >
                <LogIn size={14} className="rotate-180 text-orange-500" />
              </button>
            </div>
          </header>

          {/* MOBILE SLIDE-OUT MENU DRAWER */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-[100] md:hidden">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute inset-0 bg-[#F8FAFC]/90 backdrop-blur-md backdrop-blur-sm"
                />
                
                {/* Drawer Panel */}
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.25 }}
                  className="absolute left-0 top-0 bottom-0 w-64 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border-r border-zinc-300 p-6 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center">
                          <Image src="/hero-logo.png" alt="JB" width={18} height={18} className="invert brightness-0" />
                        </div>
                        <span className="font-black text-xs tracking-tight text-[#111827] uppercase">Transit Menu</span>
                      </div>
                      <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-500 hover:text-[#ffffff] p-1">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="h-px bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827]" />

                    <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 no-scrollbar animate-none">
                      {[
                        { id: "dashboard", label: "Home Dashboard", icon: LayoutDashboard },
                        { id: "scan", label: "QR Pass Scanner", icon: QrCode },
                        { id: "ticketing", label: "Onboard Ticketing", icon: DollarSign },
                        { id: "passengers", label: "Passenger Ledger", icon: Users },
                        { id: "occupancy", label: "Occupancy Map", icon: Bus },
                        { id: "gps", label: "GPS & Trip Tracker", icon: MapPin },
                        { id: "collections", label: "Revenue Ledger", icon: FileText },
                        { id: "offline", label: `Offline Sync (${offlineQueue.length})`, icon: isOffline ? WifiOff : Wifi },
                        { id: "issues", label: "Report Issue", icon: AlertTriangle },
                        { id: "notifications", label: `Announcements (${notifications.length})`, icon: Bell }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              isActive 
                                ? "bg-orange-600 text-[#111827] shadow-md" 
                                : "text-zinc-600 hover:text-zinc-200"
                            }`}
                          >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="pt-4 border-t border-zinc-300">
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-zinc-700 text-zinc-350 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      Logout Shift
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] pb-20 md:pb-6">
            
            {/* Top Stat Bar */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border-b border-zinc-300 p-4 px-6 flex flex-wrap gap-4 items-center justify-between relative">
              <div className="flex items-center gap-3">
                <Wifi size={14} className={isOffline ? "text-zinc-600" : "text-[#22C55E]"} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  {isOffline ? "Console Offline" : "Telemetry Engaged"}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-bold text-zinc-600">
                <span className="hidden sm:inline">Route: <strong className="text-zinc-200 uppercase">Coimbatore EXP-1024</strong></span>
                <span>Bus: <strong className="text-zinc-200">1024</strong></span>
                <span className="text-[10px] bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 px-2 py-0.5 rounded text-orange-400 font-mono">
                  {tripStatus}
                </span>
              </div>
            </div>

            {/* Dashboard Inner Container */}
            <div className="p-4 md:p-8 max-w-4xl w-full mx-auto space-y-6">
              
              {/* TAB CONTENT: 1. DASHBOARD */}
              {activeTab === "dashboard" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Conductor Profile Welcome */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-orange-500 tracking-widest">Conductor</span>
                        <span className="text-[9px] bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] text-zinc-600 px-2 py-0.5 rounded font-mono">Shift Active</span>
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-[#111827]">Rajesh Kumar</h2>
                      <p className="text-xs text-zinc-500">Employee ID: <strong className="text-zinc-300">EMP-9824</strong> • Mobile: <strong className="text-zinc-300">9876543210</strong></p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                      <button 
                        onClick={() => setShowQR(true)}
                        className="px-4 py-3 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-zinc-700 border border-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Share2 size={12} className="text-orange-500" />
                        Show Matrix QR
                      </button>
                      
                      <button 
                        onClick={() => {
                          const mockSpeed = speed === 0 ? 52 : 0;
                          setSpeed(mockSpeed);
                          const nextStatus = tripStatus === "Scheduled" ? "Trip Started" : tripStatus === "Trip Started" ? "Arriving Soon" : "Completed";
                          setTripStatus(nextStatus);
                          triggerTripBroadcast(nextStatus);
                          playBeep(true);
                        }}
                        className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-orange-600/10 text-[#111827]"
                      >
                        <Bus size={12} />
                        Cycle Status
                      </button>
                    </div>
                  </div>

                  {/* Core Statistics grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: "Tickets Sold Today", val: ticketsSold, desc: "Total issuances", color: "text-orange-500", icon: FileText },
                      { title: "Passengers Boarded", val: passengersBoarded, desc: "QR codes scanned", color: "text-[#22C55E]", icon: ShieldCheck },
                      { title: "Bus Occupancy", val: `${occupancy}/50`, desc: `Occupied: ${Math.round((occupancy/50)*100)}%`, color: "text-[#F59E0B]", icon: Bus },
                      { title: "Revenue Collection", val: `₹${totalRevenue}`, desc: `Cash: ₹${cashCollection} | UPI: ₹${onlineCollection}`, color: "text-purple-500", icon: DollarSign }
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 p-5 rounded-2xl space-y-2 shadow-md">
                          <div className="flex justify-between items-center text-zinc-500">
                            <span className="text-[9px] font-bold uppercase tracking-widest">{stat.title}</span>
                            <Icon size={14} className={stat.color} />
                          </div>
                          <h3 className="text-2xl font-black tracking-tight text-[#111827]">{stat.val}</h3>
                          <p className="text-[10px] text-zinc-500 font-semibold">{stat.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Operational Timeline / Announcements Quick Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shift Logs */}
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600">Shift Activity Log</h3>
                        <span className="text-[9px] text-zinc-500 font-mono">Latest 3 actions</span>
                      </div>
                      <div className="space-y-4 pt-2">
                        {logs.slice(0, 3).map((log, i) => (
                          <div key={i} className="flex gap-3 items-start text-xs">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-zinc-200 font-medium">{log.event}</p>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{log.time} • {log.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Announcement Cards */}
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600">Control Broadcasts</h3>
                        <span className="text-[9px] text-orange-500 font-black animate-pulse">LIVE</span>
                      </div>
                      <div className="space-y-3">
                        {notifications.slice(0, 2).map((n) => (
                          <div key={n.id} className="bg-zinc-955 p-3 rounded-xl border border-zinc-300 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-wider text-orange-500">{n.title}</span>
                              <span className="text-[8px] text-zinc-500 font-mono">{n.time}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-snug">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 2. QR PASS SCANNER */}
              {activeTab === "scan" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
                    
                    {!isScanning ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-orange-500 blur-[50px] opacity-10" />
                          <div className="w-28 h-28 bg-zinc-955 rounded-[32px] border-2 border-dashed border-orange-500/20 flex items-center justify-center relative z-10">
                            <QrCode size={40} className="text-orange-500" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-xl font-black uppercase text-[#111827] tracking-tight">QR Scanner Engaged</h2>
                          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Supports native transit tickets and online digital passes</p>
                        </div>
                        <button 
                          onClick={() => setIsScanning(true)}
                          className="w-full max-w-xs bg-orange-600 hover:bg-orange-700 text-[#111827] py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-orange-600/10 cursor-pointer"
                        >
                          <Camera size={18} />
                          Launch Scanner Camera
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-sm mx-auto">
                        <div id="reader" className="overflow-hidden rounded-2xl border-4 border-orange-600 shadow-inner bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827]" />
                        <button 
                          onClick={() => setIsScanning(false)}
                          className="w-full bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-zinc-800 border border-zinc-300 text-zinc-600 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                        >
                          Cancel Scanner
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Validation results status indicators */}
                  <AnimatePresence mode="wait">
                    {validating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-8 text-center space-y-4">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-orange-500 font-black uppercase tracking-widest text-[10px]">Validating Digital Ticket...</p>
                      </motion.div>
                    )}

                    {scanResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-[32px] p-6 border-2 transition-all ${
                          scanResult.success 
                            ? "bg-green-950/20 border-[#22C55E]/50 shadow-[0_0_30px_rgba(34,197,94,0.05)]" 
                            : scanResult.message?.includes("Used")
                              ? "bg-amber-950/20 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.05)]"
                              : scanResult.message?.includes("Expired")
                                ? "bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border-zinc-300 shadow-[0_0_30px_rgba(100,116,139,0.05)]"
                                : "bg-red-950/20 border-[#EF4444]/50 shadow-[0_0_30px_rgba(239,68,68,0.05)]"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-6">
                          <div className="flex items-center gap-3">
                            {scanResult.success ? (
                               <CheckCircle2 size={40} className="text-[#22C55E]" />
                            ) : scanResult.message?.includes("Used") ? (
                              <AlertTriangle size={40} className="text-amber-500" />
                            ) : scanResult.message?.includes("Expired") ? (
                              <Clock size={40} className="text-zinc-500" />
                            ) : (
                              <XCircle size={40} className="text-[#EF4444]" />
                            )}
                            <div className="space-y-1 text-left">
                              <h3 className={`text-xl font-black uppercase tracking-tight ${
                                scanResult.success ? "text-[#22C55E]" : scanResult.message?.includes("Used") ? "text-amber-500" : scanResult.message?.includes("Expired") ? "text-zinc-600" : "text-[#EF4444]"
                              }`}>
                                {scanResult.success ? "🟢 Valid Ticket" : scanResult.message?.includes("Used") ? "🟡 Already Used" : scanResult.message?.includes("Expired") ? "⚪ Expired Ticket" : "🔴 Invalid Ticket"}
                              </h3>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{scanResult.message}</p>
                            </div>
                          </div>

                          {scanResult.booking && (
                            <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-zinc-300 text-left text-xs">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Ticket ID</span>
                                <p className="font-mono font-bold text-zinc-200">{scanResult.booking.ticketId || scanResult.booking.ticket_id}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Passengers</span>
                                <p className="font-bold text-zinc-200">{scanResult.booking.seats?.length || 1} {scanResult.booking.passengers?.some((p: any) => p.luggage && p.luggage !== 'None') && "(+ Luggage)"}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Boarding Points</span>
                                <p className="text-xs font-bold text-zinc-200 leading-tight pr-2">
                                  {(scanResult.booking.boarding_point === "Combined Journey" || scanResult.booking.boardingPoint === "Combined Journey") && scanResult.booking.passengers 
                                    ? scanResult.booking.passengers.map((p: any) => p.boarding).join(' • ') 
                                    : (scanResult.booking.boarding_point || scanResult.booking.boardingPoint || "Unknown")}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Drop Points</span>
                                <p className="text-xs font-bold text-zinc-200 leading-tight pr-2">
                                  {scanResult.booking.destination === "Multi-Stop" && scanResult.booking.passengers 
                                    ? scanResult.booking.passengers.map((p: any) => p.destination).join(' • ') 
                                    : (scanResult.booking.destination || "Unknown")}
                                </p>
                              </div>
                            </div>
                          )}

                          {scanResult.booking?.passengers && scanResult.booking.passengers.length > 0 && (scanResult.booking.boarding_point === "Combined Journey" || scanResult.booking.boardingPoint === "Combined Journey") ? (
                            <div className="w-full bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-xl p-4 mt-2">
                              <h4 className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider mb-3">Journey Segments</h4>
                              <div className="space-y-3">
                                {scanResult.booking.passengers.map((p: any, idx: number) => (
                                  <div key={idx} className="text-xs bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-zinc-300 font-medium">Journey {idx + 1} {p.luggage && p.luggage !== 'None' ? `(+${p.luggage})` : ''}</span>
                                      <span className="text-orange-500 font-bold">₹{p.fare || 20}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                      <span>{p.boarding || "Unknown"}</span>
                                      <span className="text-zinc-700">→</span>
                                      <span>{p.destination || "Unknown"}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            scanResult.booking?.passengers && scanResult.booking.passengers.length > 0 && scanResult.booking.destination === "Multi-Stop" && (
                              <div className="w-full bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-xl p-4 mt-2">
                                <h4 className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider mb-3">Passenger Destinations</h4>
                                <div className="space-y-2">
                                  {scanResult.booking.passengers.map((p: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                      <span className="text-zinc-300 font-medium">Passenger {idx + 1} {p.luggage && p.luggage !== 'None' ? `(${p.luggage})` : ''}</span>
                                      <span className="text-orange-500 font-bold uppercase truncate max-w-[100px]">{p.destination || "Unknown"}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}

                          <button 
                            onClick={() => setScanResult(null)}
                            className="w-full py-4 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-300 rounded-xl font-black uppercase tracking-widest text-[9px]"
                          >
                            Dismiss Report
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Manual Input Entry validation */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600">Manual Ticket ID Entry</h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="E.g. TB-601090"
                        id="manualTicketInput"
                        className="flex-1 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900 placeholder:text-zinc-750 font-mono"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById("manualTicketInput") as HTMLInputElement;
                          if (input && input.value.trim()) {
                            handleScanSuccess(input.value.trim());
                            input.value = "";
                          }
                        }}
                        className="px-5 bg-orange-600 hover:bg-orange-700 text-[#111827] rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-orange-600/10"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 3. ONBOARD TICKETING */}
              {activeTab === "ticketing" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* form card */}
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-5 text-left">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-300 pb-3">New Passenger Ticket</h3>
                      <form onSubmit={handleIssueTicket} className="space-y-4">
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Boarding From</label>
                          <select 
                            value={obBoarding}
                            onChange={(e) => {
                              setObBoarding(e.target.value);
                              setObSuccessTicket(null);
                            }}
                            className="w-full bg-zinc-955 border border-zinc-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900"
                          >
                            {STOPS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Destination To</label>
                          <select 
                            value={obDestination}
                            onChange={(e) => {
                              setObDestination(e.target.value);
                              setObSuccessTicket(null);
                            }}
                            className="w-full bg-zinc-955 border border-zinc-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900"
                          >
                            {STOPS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {obBoarding === obDestination && (
                            <p className="text-[#EF4444] text-[8px] font-bold uppercase tracking-wider pl-1 pt-1">Boarding & destination cannot match</p>
                          )}
                        </div>

                        {/* Passenger Quantities selector */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">Passenger Count</label>
                          <div className="flex items-center gap-3 bg-zinc-955 border border-zinc-300 rounded-xl p-1.5 max-w-[150px] justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setObQuantity(q => Math.max(1, q - 1));
                                setObSuccessTicket(null);
                              }}
                              className="w-9 h-9 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 text-zinc-300 rounded-lg flex items-center justify-center hover:bg-zinc-800 cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black text-[#111827]">{obQuantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setObQuantity(q => Math.min(10, q + 1));
                                setObSuccessTicket(null);
                              }}
                              className="w-9 h-9 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 text-zinc-300 rounded-lg flex items-center justify-center hover:bg-zinc-800 cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Payment method */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">Payment Method</label>
                          <div className="grid grid-cols-4 gap-2">
                            {["Cash", "UPI", "PhonePe", "GPay"].map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setObPaymentMode(p as any)}
                                className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${obPaymentMode === p ? "bg-orange-600/10 border-orange-500 text-orange-500" : "bg-zinc-955 border-zinc-300 text-zinc-500"}`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="flex justify-between items-center bg-zinc-955 p-4 rounded-xl border border-zinc-300 mb-4">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Calculated Fare</span>
                            <span className="text-xl font-black text-[#111827]">₹{ticketFare}</span>
                          </div>

                          <button
                            type="submit"
                            disabled={obBoarding === obDestination}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-[#111827] rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-600/15 disabled:opacity-40 cursor-pointer"
                          >
                            Print & Issue Ticket
                          </button>
                        </div>

                      </form>
                    </div>

                    {/* Receipt Output Panel */}
                    <div className="flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {obSuccessTicket ? (
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-[280px] bg-yellow-100 bg-gradient-to-br from-yellow-100 to-yellow-200 text-zinc-950 p-6 rounded-2xl shadow-xl space-y-4 border border-yellow-300 relative font-mono text-xs overflow-hidden"
                          >
                            {/* ticket jagged borders */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 to-transparent opacity-20" />
                            
                            <div className="text-center border-b-2 border-dashed border-zinc-800/20 pb-4">
                              <h4 className="font-black tracking-widest uppercase text-[10px]">Digi Bus Ticket</h4>
                              <p className="text-[8px] text-zinc-600 uppercase">Onboard issuance • Local Node</p>
                            </div>

                            <div className="space-y-2 py-2">
                              <div className="flex justify-between">
                                <span className="text-zinc-600">Ticket ID:</span>
                                <span className="font-bold">{obSuccessTicket.ticketId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-600">From:</span>
                                <span className="font-bold uppercase truncate max-w-[120px]">{obSuccessTicket.boarding}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-600">To:</span>
                                <span className="font-bold uppercase truncate max-w-[120px]">{obSuccessTicket.destination}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-600">QTY / Fare:</span>
                                <span className="font-bold">{obSuccessTicket.quantity} Passenger(s)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-600">Payment:</span>
                                <span className="font-bold">{obSuccessTicket.paymentMode}</span>
                              </div>
                            </div>

                            <div className="border-t-2 border-dashed border-zinc-800/20 pt-4 flex flex-col items-center gap-3">
                              <div className="p-2 bg-[#F8FAFC] rounded-xl shadow-inner border border-yellow-300/40">
                                <QRCodeSVG 
                                  value={btoa(JSON.stringify({ t: obSuccessTicket.ticketId, b: "1024", q: obSuccessTicket.quantity, m: "JB-ONBOARD-TKT" }))}
                                  size={100}
                                  bgColor="transparent"
                                  fgColor="#09090b"
                                />
                              </div>
                              <div className="text-center space-y-1">
                                <span className="text-[14px] font-black">₹{obSuccessTicket.fare}</span>
                                <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-sans">Present to ticket checker</p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center p-8 bg-zinc-900/40 border-2 border-dashed border-zinc-300 rounded-3xl w-full py-16 space-y-3">
                            <FileText size={32} className="text-zinc-700 mx-auto" />
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Ticket Output Area</p>
                            <p className="text-[10px] text-zinc-600 max-w-xs mx-auto">Fill details and tap Print to generate a live QR boarding pass receipt.</p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 4. PASSENGER LEDGER */}
              {activeTab === "passengers" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                  
                  {/* Search and Filters */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-5 space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-3.5 text-zinc-600" />
                        <input
                          type="text"
                          placeholder="Search Passenger Name or Ticket ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-zinc-955 border border-zinc-300 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-zinc-200 placeholder:text-zinc-750"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {["All", "Boarded", "Not Boarded"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setPassengerFilter(filter as any)}
                          className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all ${passengerFilter === filter ? "bg-orange-600/10 border-orange-500 text-orange-500 shadow-sm" : "bg-zinc-955 border-zinc-850 text-zinc-500"}`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Passenger Table/List */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border-b border-zinc-300 text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                          <tr>
                            <th className="p-4 px-6">Ticket ID</th>
                            <th className="p-4">Passenger Name</th>
                            <th className="p-4">Boarding</th>
                            <th className="p-4">Destination</th>
                            <th className="p-4">Seat</th>
                            <th className="p-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850">
                          {filteredPassengers.length > 0 ? (
                            filteredPassengers.map((p, i) => (
                              <tr key={i} className="hover:bg-zinc-850/25 transition-colors">
                                <td className="p-4 px-6 font-mono font-bold text-zinc-600">{p.ticketId}</td>
                                <td className="p-4 font-bold text-zinc-900">{p.name}</td>
                                <td className="p-4 text-zinc-600 truncate max-w-[120px]">{p.boarding}</td>
                                <td className="p-4 text-zinc-600 truncate max-w-[120px]">{p.destination}</td>
                                <td className="p-4 font-bold text-zinc-200">{p.seat}</td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => {
                                      const updated = [...passengers];
                                      const index = passengers.findIndex(val => val.ticketId === p.ticketId);
                                      if (index !== -1) {
                                        updated[index].status = p.status === "Boarded" ? "Not Boarded" : "Boarded";
                                        setPassengers(updated);
                                        
                                        // Update stats
                                        setPassengersBoarded(prev => p.status === "Boarded" ? prev - 1 : prev + 1);
                                        setOccupancy(prev => p.status === "Boarded" ? Math.max(0, prev - 1) : Math.min(50, prev + 1));
                                        
                                        setLogs(prev => [
                                          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Manually marked ${p.name} as ${updated[index].status}`, type: "ledger" },
                                          ...prev
                                        ]);
                                        playBeep(true);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${p.status === "Boarded" ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]" : "bg-zinc-955 border-zinc-300 text-zinc-500 hover:border-zinc-700"}`}
                                  >
                                    {p.status}
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-zinc-600 uppercase tracking-widest font-black">No passengers matched search query</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 5. OCCUPANCY MONITOR */}
              {activeTab === "occupancy" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-300 pb-3">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600">Live Occupancy Monitor</h3>
                        <p className="text-[10px] text-zinc-500">Tap seats to manually toggle boarded state</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#111827]">{occupancy}/50</span>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block">Capacity</span>
                      </div>
                    </div>

                    {/* legend status */}
                    <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-orange-600 rounded" />
                        <span>Occupied ({occupancy})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded" />
                        <span>Available ({50 - occupancy})</span>
                      </div>
                    </div>

                    {/* bus layout seats grid */}
                    <div className="bg-zinc-955 border border-zinc-850 p-6 rounded-2xl relative overflow-hidden">
                      {/* Driver Steering wheel mockup */}
                      <div className="flex justify-between items-center border-b border-zinc-300 pb-4 mb-6">
                        <div className="w-8 h-8 rounded-full border-4 border-dashed border-zinc-300 flex items-center justify-center">
                          <div className="w-3 h-3 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] rounded-full" />
                        </div>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">FRONT ENTRANCE</span>
                      </div>

                      {/* Seats rows grid */}
                      <div className="grid grid-cols-5 gap-3 max-w-[340px] mx-auto">
                        {seats.map((isOccupied, idx) => {
                          const seatNum = idx + 1;
                          const isAisle = (idx % 5 === 2); // column 3 is aisle
                          
                          if (isAisle) {
                            return (
                              <React.Fragment key={`aisle-${idx}`}>
                                <div className="h-9 w-0" /> {/* Aisle space */}
                                <button
                                  type="button"
                                  onClick={() => toggleSeat(idx)}
                                  className={`h-9 rounded-xl border text-[9px] font-bold flex items-center justify-center transition-all active:scale-90 cursor-pointer ${isOccupied ? "bg-orange-600 border-orange-500 text-[#111827] shadow-md shadow-orange-600/10" : "bg-zinc-955 border-zinc-300 text-zinc-700 hover:border-zinc-700"}`}
                                >
                                  S{seatNum}
                                </button>
                              </React.Fragment>
                            );
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleSeat(idx)}
                              className={`h-9 rounded-xl border text-[9px] font-bold flex items-center justify-center transition-all active:scale-90 cursor-pointer ${isOccupied ? "bg-orange-600 border-orange-500 text-[#111827] shadow-md shadow-orange-600/10" : "bg-zinc-955 border-zinc-300 text-zinc-700 hover:border-zinc-700"}`}
                            >
                              S{seatNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 6. TRIP & GPS TRACKER */}
              {activeTab === "gps" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-left">

                  {/* GPS Status Header Card */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          gpsState.status === 'broadcasting'
                            ? 'bg-emerald-500 text-[#111827] shadow-lg shadow-emerald-500/30'
                            : gpsState.status === 'no_permission'
                            ? 'bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]'
                            : 'bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] text-zinc-500 border border-zinc-300'
                        }`}>
                          {gpsState.status === 'broadcasting'
                            ? <Radio size={22} className="animate-pulse" />
                            : <Navigation size={22} />}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-zinc-900">GPS Tracker</h3>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${
                            gpsState.status === 'broadcasting' ? 'text-emerald-400' :
                            gpsState.status === 'error' ? 'text-[#EF4444]' :
                            gpsState.status === 'no_permission' ? 'text-amber-400' :
                            'text-zinc-500'
                          }`}>
                            {gpsState.status === 'broadcasting' ? '● Broadcasting Live' :
                             gpsState.status === 'error' ? '⚠ GPS Error' :
                             gpsState.status === 'no_permission' ? '⚠ Permission Denied' :
                             '○ Standby'}
                          </p>
                        </div>
                      </div>

                      {/* Start / End Trip */}
                      <button
                        onClick={() => {
                          const next = !gpsEnabled;
                          setGpsEnabled(next);
                          if (!next) setBroadcasting(false);
                          else { setBroadcasting(true); setTripStatus('Trip Started'); }
                          playBeep(true);
                        }}
                        disabled={!busDbId}
                        className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 ${
                          gpsEnabled
                            ? 'bg-[#EF4444] hover:bg-red-600 text-[#111827] shadow-lg shadow-[#EF4444]/30'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-[#111827] shadow-lg shadow-emerald-500/30'
                        }`}
                      >
                        {gpsEnabled ? 'End Trip' : 'Start Trip'}
                      </button>
                    </div>

                    {/* Error message */}
                    {gpsState.errorMessage && (
                      <div className="flex items-start gap-2 p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-[#EF4444] text-[10px] font-bold mb-4">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        {gpsState.errorMessage}
                      </div>
                    )}

                    {/* Coordinate Readout */}
                    <div className="grid grid-cols-2 gap-3 font-mono">
                      <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] rounded-xl p-3 border border-zinc-300">
                        <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wider mb-1">Latitude</span>
                        <span className="text-sm font-bold text-zinc-200">
                          {gpsState.lat !== null ? gpsState.lat.toFixed(6) : (lat !== 0 ? lat.toFixed(6) : '—')}
                        </span>
                      </div>
                      <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] rounded-xl p-3 border border-zinc-300">
                        <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wider mb-1">Longitude</span>
                        <span className="text-sm font-bold text-zinc-200">
                          {gpsState.lng !== null ? gpsState.lng.toFixed(6) : (lng !== 0 ? lng.toFixed(6) : '—')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-2xl p-4 text-center">
                      <Gauge size={18} className="text-[#F28500] mx-auto mb-2" />
                      <p className="text-2xl font-black text-[#111827]">{gpsState.speed || speed}</p>
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">km/h</p>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-2xl p-4 text-center">
                      <Radio size={18} className="text-emerald-400 mx-auto mb-2" />
                      <p className="text-2xl font-black text-[#111827]">{gpsState.updateCount}</p>
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">Updates</p>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-2xl p-4 text-center">
                      <Signal size={18} className="text-[#F59E0B] mx-auto mb-2" />
                      <p className="text-[11px] font-black text-[#111827]">{gpsState.accuracy ? `${Math.round(gpsState.accuracy)}m` : '—'}</p>
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">Accuracy</p>
                    </div>
                  </div>

                  {/* Current Route */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-2xl p-4 flex items-center gap-3">
                    <Bus size={20} className="text-[#F28500] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Current Route</p>
                      <p className="text-sm font-black text-zinc-900 truncate">{assignedRouteName || 'Not Assigned'}</p>
                    </div>
                    <div className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                      tripStatus === 'Trip Started' || tripStatus === 'Boarding'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] text-zinc-600'
                    }`}>{tripStatus}</div>
                  </div>

                  {/* Trip Status Controls */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-2xl p-5 space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Update Trip Status</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: "Scheduled", icon: Clock },
                        { name: "Boarding", icon: Users },
                        { name: "Trip Started", icon: ShieldCheck },
                        { name: "Reached Stop", icon: MapPin },
                        { name: "Arriving Soon", icon: Volume2 },
                        { name: "Completed", icon: CheckCircle2 }
                      ].map((s) => {
                        const Icon = s.icon;
                        const isActive = tripStatus === s.name;
                        return (
                          <button
                            key={s.name}
                            onClick={() => { setTripStatus(s.name); triggerTripBroadcast(s.name); playBeep(true); }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 cursor-pointer ${
                              isActive ? 'bg-orange-600 border-orange-500 text-[#111827] shadow-md' : 'bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border-zinc-300 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                          >
                            <Icon size={16} />
                            <span className="text-[8px] uppercase tracking-wide font-bold leading-tight">{s.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 7. REVENUE LEDGER */}
              {activeTab === "collections" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-300 pb-3">Collection Summary</h3>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Cash Collection Ledger:</span>
                        <span className="font-bold text-zinc-200">₹{cashCollection}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">UPI / QR Digital Ledger:</span>
                        <span className="font-bold text-zinc-200">₹{onlineCollection}</span>
                      </div>
                      <div className="h-px bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827]" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600 font-bold">Total Revenue Ledger:</span>
                        <span className="font-black text-orange-500 text-lg">₹{totalRevenue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600">Shift Handover Operations</h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider font-bold">Tap below to close the current shift tally, save collections report, and transfer transit controls to the next supervisor node.</p>
                    <button
                      onClick={() => {
                        alert("Shift details locked successfully. Receipts exported to terminal database.");
                        handleLogout();
                      }}
                      className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-[#111827] rounded-xl font-black uppercase tracking-widest text-[9px] active:scale-95 shadow-md shadow-orange-600/10 cursor-pointer"
                    >
                      Lock Ledger & End Shift
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 8. OFFLINE SYNC */}
              {activeTab === "offline" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                  
                  {/* Offline Settings Status */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {isOffline ? (
                          <div className="w-10 h-10 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded-2xl flex items-center justify-center"><WifiOff size={20} /></div>
                        ) : (
                          <div className="w-10 h-10 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-2xl flex items-center justify-center"><Wifi size={20} /></div>
                        )}
                        <div>
                          <h3 className="text-sm font-bold text-zinc-200">Offline Transit Mode</h3>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                            {isOffline ? "Currently working in disconnected mode" : "Synced to central database node"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsOffline(!isOffline);
                          playBeep(true);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${isOffline ? "bg-green-600 text-[#111827]" : "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]"}`}
                      >
                        {isOffline ? "Go Online" : "Go Offline"}
                      </button>
                    </div>
                  </div>

                  {/* Sync Queue */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-300 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600">Offline Queue Cache</h3>
                      <span className="text-[10px] bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 px-2 py-0.5 rounded font-mono text-zinc-600">
                        {offlineQueue.length} pending actions
                      </span>
                    </div>

                    {offlineQueue.length > 0 ? (
                      <div className="space-y-3">
                        {offlineQueue.map((item, idx) => (
                          <div key={idx} className="bg-zinc-955 p-3 rounded-xl border border-zinc-850 flex justify-between items-center text-xs">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 block mb-0.5">{item.type}</span>
                              <span className="font-mono text-zinc-300">{item.token || item.ticket?.ticketId}</span>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-mono">{new Date(item.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}

                        <button
                          onClick={handleSyncData}
                          disabled={isOffline || validating}
                          className="w-full py-4 mt-4 bg-orange-600 hover:bg-orange-700 text-[#111827] rounded-xl font-black uppercase tracking-widest text-[9px] active:scale-95 shadow-md shadow-orange-600/10 disabled:opacity-40 cursor-pointer"
                        >
                          {validating ? "Syncing..." : "Sync Offline Queue Now"}
                        </button>
                        {isOffline && <p className="text-center text-[9px] text-[#EF4444] font-bold uppercase tracking-wider">Cannot sync while offline mode is active.</p>}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-zinc-600 uppercase tracking-widest font-black text-[10px] space-y-2">
                        <Wifi size={24} className="mx-auto text-zinc-700" />
                        <p>No offline transactions in queue cache</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 9. REPORT ISSUE */}
              {activeTab === "issues" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-300 pb-3">Report Transit Incident</h3>
                    
                    <form onSubmit={handleReportIssue} className="space-y-4">
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">Incident Type</label>
                        <select
                          value={issueType}
                          onChange={(e) => setIssueType(e.target.value)}
                          className="w-full bg-zinc-955 border border-zinc-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900"
                        >
                          {["Vehicle Breakdown", "Traffic Delay", "Passenger Complaint", "Route Diversion", "Medical Emergency"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">Severity Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["Medium", "High", "Emergency"].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setIssueSeverity(s)}
                              className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${issueSeverity === s ? "bg-red-650/10 border-[#EF4444] text-[#EF4444]" : "bg-zinc-955 border-zinc-300 text-zinc-500"}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">Report Details</label>
                        <textarea
                          placeholder="Describe the vehicle breakdown, delays, or emergency details for the admin control room..."
                          value={issueDesc}
                          onChange={(e) => setIssueDesc(e.target.value)}
                          className="w-full bg-zinc-955 border border-zinc-300 rounded-xl p-4 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-zinc-200 h-24 placeholder:text-zinc-700"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-[#111827] rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-orange-600/15 cursor-pointer"
                      >
                        Dispatch Report to Control Room
                      </button>

                      {issueSuccess && (
                        <p className="text-[#22C55E] text-[9px] font-black uppercase tracking-wider text-center pt-2">Report dispatched successfully to Admin terminal!</p>
                      )}

                    </form>
                  </div>
                </motion.div>
              )}

              {/* TAB CONTENT: 10. ANNOUNCEMENTS */}
              {activeTab === "notifications" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-zinc-300 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-300 pb-3">Announcements Inbox</h3>
                    
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="bg-zinc-955 p-4 rounded-xl border border-zinc-850 space-y-2 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">{n.title}</span>
                            <span className="text-[9px] text-zinc-600 font-mono">{n.time}</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          {/* MOBILE BOTTOM NAVIGATION BAR */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border-t border-zinc-300 px-6 py-3.5 flex items-center justify-between z-50 safe-bottom shadow-lg">
             {[
               { id: "dashboard", label: "Home", icon: LayoutDashboard },
               { id: "scan", label: "Scanner", icon: QrCode },
               { id: "ticketing", label: "Tickets", icon: DollarSign },
               { id: "gps", label: "GPS Status", icon: MapPin },
               { id: "issues", label: "Report", icon: AlertTriangle }
             ].map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                 <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${isActive ? "text-orange-500 font-bold" : "text-zinc-500"}`}
                 >
                    <Icon size={18} />
                    <span className="text-[9px] uppercase tracking-tighter leading-none">{tab.label}</span>
                 </button>
               );
             })}
          </nav>

          {/* Biometric/Valid Feedback Ring Overlay */}
          <AnimatePresence>
            {scanResult && scanResult.success && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 pointer-events-none ring-[12px] md:ring-[20px] ring-[#22C55E]/20 z-[1100]"
              />
            )}
            {scanResult && !scanResult.success && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 pointer-events-none ring-[12px] md:ring-[20px] ring-[#EF4444]/20 z-[1100]"
              />
            )}
          </AnimatePresence>

          {/* Matrix Bus QR presenting modal */}
          <AnimatePresence>
            {showQR && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-zinc-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
              >
                 <button 
                   onClick={() => setShowQR(false)}
                   className="absolute top-8 right-8 w-12 h-12 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-zinc-700 rounded-full flex items-center justify-center text-[#111827] border border-zinc-750"
                 >
                   <X size={20} />
                 </button>
                 <BusMatrixQR busCode="1024" busId={busDbId || "bus1"} />
                 <p className="mt-8 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">Fleet Terminal 01 • Matrix Active</p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      </div>
    </SecureView>
  );
}

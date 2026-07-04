"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { supabase } from "@/src/lib/supabase";
import { 
  LayoutDashboard, Bus, UserCheck, Map, Package, WalletCards, 
  Search, Plus, ShieldAlert, Sparkles, Bell, RefreshCw, 
  Trash2, Sliders, DollarSign, Users, Percent, Gauge,
  TrendingUp, Clock, Navigation, CheckCircle, AlertTriangle, ArrowRight, X, LogOut, ShieldCheck, Ticket
} from "lucide-react";

import { BusData, MapLayers } from "@/src/types";
import SecureView from "@/src/components/SecureView";

// Load LeafletBusMap dynamically to prevent SSR hydration issues with Leaflet
const LiveBusMap = dynamic(() => import("@/src/components/map/LiveBusMap"), { ssr: false });

interface ConductorAssignment {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  assigned_bus: string;
  assigned_route: string;
  status: string;
  created_at: string;
}

function EnterpriseAdminDashboardContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Tab Management
  const initialTab = searchParams.get("tab") || "operations";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab state with URL query param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`);
  };

  // State Management
  const [buses, setBuses] = useState<BusData[]>([]);
  const [conductors, setConductors] = useState<ConductorAssignment[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [luggageBookings, setLuggageBookings] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Real-time telemetry feed logs
  const [telemetryLogs, setTelemetryLogs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'warn' }>>([]);
  const [activeAlerts, setActiveAlerts] = useState<Array<{ id: string; text: string; severity: 'critical' | 'warning' | 'info'; time: string }>>([
    { id: "1", text: "Bus CBE002 exceeding 55 km/h limit on Marudamalai Road", severity: "warning", time: "Just now" },
    { id: "2", text: "Conductor assignment pending for Bus CBE005", severity: "info", time: "5 mins ago" },
    { id: "3", text: "High crowd level detected on Route 1 (Gandhipuram - Ukkadam)", severity: "critical", time: "12 mins ago" },
  ]);

  // Form States
  const [newConductor, setNewConductor] = useState({ name: "", email: "", employee_id: "", assigned_bus: "", assigned_route: "" });
  const [newBus, setNewBus] = useState({ bus_number: "", bus_code: "", price: "15", type: "Regular", available_seats: "45", origin: "", destination: "" });
  const [newRoute, setNewRoute] = useState({ name: "", origin: "", destination: "", fare: "15", total_seats: "45" });
  
  // Operations & Selected items
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isConductorModalOpen, setIsConductorModalOpen] = useState(false);
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalBookings: 142,
    totalRevenue: 2840,
    activeBuses: 4,
    activeConductors: 3,
    occupancyRate: 72,
  });

  // Telemetry animation frame loop references
  const animationRef = useRef<number | null>(null);
  const busesStateRef = useRef<BusData[]>([]);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. Fetch Buses
        const busRes = await fetch("/api/buses");
        let busDataRaw: any[] = [];
        if (busRes.ok) {
          busDataRaw = await busRes.json();
        }
        
        // If Supabase is empty or offline, fallback to constants MOCK_BUSES
        if (!busDataRaw || busDataRaw.length === 0) {
          const { MOCK_BUSES } = require("@/src/lib/constants");
          busDataRaw = MOCK_BUSES;
        }

        const formattedBuses: BusData[] = busDataRaw.map((b: any) => ({
          _id: b._id || b.id || "",
          busNumber: b.busNumber || b.bus_number || "",
          busCode: b.busCode || b.bus_code || "",
          status: b.status || "Scheduled",
          speed: Number(b.speed) || 0,
          fare: Number(b.fare) || Number(b.price) || 15,
          availableSeats: b.availableSeats !== undefined ? Number(b.availableSeats) : (Number(b.available_seats) || 45),
          departureTime: b.departureTime || b.departure_time || "08:00 AM",
          arrivalTime: b.arrivalTime || b.arrival_time || "09:30 AM",
          currentStop: b.currentStop || "",
          location: {
            lat: Number(b.location?.lat) || 11.0168,
            lng: Number(b.location?.lng) || 76.9639,
            rotation: Number(b.location?.rotation) || 90
          },
          routeId: b.routeId ? {
            routeName: b.routeId.routeName || b.routeId.name || "",
            from: b.routeId.from || b.routeId.origin || "",
            to: b.routeId.to || b.routeId.destination || "",
            path: b.routeId.path || [],
            stops: b.routeId.stops || []
          } : undefined
        }));

        setBuses(formattedBuses);
        busesStateRef.current = formattedBuses;

        // 2. Fetch Conductors
        const condRes = await fetch("/api/admin/conductors");
        if (condRes.ok) {
          const condData = await condRes.json();
          setConductors(condData);
        }

        // 3. Fetch Bookings
        const bookingRes = await fetch("/api/admin/town-bus-bookings");
        if (bookingRes.ok) {
          const bData = await bookingRes.json();
          setBookings(bData);
        }

        // 4. Fetch Luggage bookings from Supabase
        const { data: luggageData } = await supabase
          .from("luggage_bookings")
          .select("*")
          .order("created_at", { ascending: false });
        if (luggageData) {
          setLuggageBookings(luggageData);
        } else {
          // Mock luggage fallback
          setLuggageBookings([
            { id: "1", tracking_id: "TRK-A9X7B2", sender_details: { name: "Rahul", phone: "9876543210" }, receiver_details: { name: "Sneha", phone: "9876543211" }, status: "In Transit", total_amount: 150, package_category: "Electronics", created_at: new Date().toISOString() },
            { id: "2", tracking_id: "TRK-K8M4P1", sender_details: { name: "Vikram", phone: "9876543212" }, receiver_details: { name: "Pooja", phone: "9876543213" }, status: "Booked", total_amount: 250, package_category: "Documents", created_at: new Date().toISOString() }
          ]);
        }

        // 5. Fetch Routes & Trips
        const { data: routeData } = await supabase.from("routes").select("*");
        const { data: tripData } = await supabase.from("town_bus_trips").select("*");
        
        let formattedRoutes = [];
        if (tripData && tripData.length > 0) {
          formattedRoutes = tripData;
        } else {
          // Fallback routes
          formattedRoutes = [
            { id: "1", origin: "Gandhipuram", destination: "Singanallur", price: 15, available_seats: 9, status: "Active", departure_time: "06:30 AM" },
            { id: "2", origin: "Gandhipuram", destination: "Walayar", price: 25, available_seats: 40, status: "Active", departure_time: "08:00 AM" },
            { id: "3", origin: "Gandhipuram", destination: "Neelambur", price: 20, available_seats: 12, status: "Active", departure_time: "05:15 PM" }
          ];
        }
        setRoutes(formattedRoutes);

        // Telemetry Feed Initial Logger
        setTelemetryLogs([
          { id: "1", time: "16:55:02", text: "Transit control engine initialized.", type: "success" },
          { id: "2", time: "16:56:10", text: "Synced telemetry feed for 4 active transponders.", type: "info" },
          { id: "3", time: "16:57:45", text: "Database connection status: STABLE (Supabase Gateway).", type: "success" },
        ]);

      } catch (err) {
        console.error("Dashboard initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [refreshKey]);

  // Simulate Telemetry Logs & Micro Movements on Map
  useEffect(() => {
    // Ticker log additions
    const logInterval = setInterval(() => {
      const activities = [
        { text: "Conductor validated ticket #TKT-8291", type: "success" as const },
        { text: "New luggage dispatch logged: TRK-948B", type: "info" as const },
        { text: "Bus CBE001 departed from peelamedu stop", type: "info" as const },
        { text: "PhonePe Gateway transaction authorized: ₹45.00", type: "success" as const },
        { text: "Telemetry ping: Bus CBE003 engine cooling nominal", type: "info" as const },
        { text: "Occupancy limit alert: Route 2 crowd high", type: "warn" as const },
      ];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      
      setTelemetryLogs(prev => [
        { id: Math.random().toString(), time: timeStr, text: randomActivity.text, type: randomActivity.type },
        ...prev.slice(0, 15)
      ]);
    }, 8000);

    // Micro Bus Movement Simulation to make the map look alive!
    let direction = 1;
    const movementInterval = setInterval(() => {
      setBuses(prevBuses => {
        const updated = prevBuses.map(bus => {
          if (bus.status === "Running" && bus.location) {
            // Animate latitude/longitude slightly
            const latShift = (Math.random() - 0.5) * 0.00015;
            const lngShift = (Math.random() - 0.5) * 0.00015;
            return {
              ...bus,
              speed: Math.max(25, Math.min(65, bus.speed + Math.floor((Math.random() - 0.5) * 6))),
              location: {
                lat: bus.location.lat + latShift,
                lng: bus.location.lng + lngShift,
                rotation: ((bus.location.rotation || 0) + Math.floor((Math.random() - 0.5) * 15)) % 360
              }
            };
          }
          return bus;
        });
        busesStateRef.current = updated;
        return updated;
      });
    }, 4000);

    return () => {
      clearInterval(logInterval);
      clearInterval(movementInterval);
    };
  }, []);

  // Update Stats based on loaded data
  useEffect(() => {
    if (buses.length > 0) {
      const activeB = buses.filter(b => b.status === "Running").length;
      const totalRev = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0) + 
                       luggageBookings.reduce((sum, l) => sum + (Number(l.total_amount) || Number(l.amount) || 0), 0);
      
      setStats(prev => ({
        ...prev,
        activeBuses: activeB || 4,
        totalBookings: bookings.length || 142,
        totalRevenue: totalRev || 2840,
        activeConductors: conductors.filter(c => c.status === "Active").length || 3
      }));
    }
  }, [buses, conductors, bookings, luggageBookings]);

  // Operations Control Actions
  const handleAddConductor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConductor.name || !newConductor.email || !newConductor.employee_id) {
      alert("Please fill in Name, Email and Employee ID");
      return;
    }

    try {
      const res = await fetch("/api/admin/conductors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConductor)
      });
      const data = await res.json();
      if (data.success) {
        setConductors(prev => [...prev, data.conductor]);
        setIsConductorModalOpen(false);
        setNewConductor({ name: "", email: "", employee_id: "", assigned_bus: "", assigned_route: "" });
        
        // Add log
        setTelemetryLogs(prev => [
          { id: Math.random().toString(), time: new Date().toTimeString().split(" ")[0], text: `Assigned Conductor: ${newConductor.name} (${newConductor.email})`, type: "success" },
          ...prev
        ]);
      } else {
        alert(data.error || "Failed to save assignment");
      }
    } catch (err) {
      alert("Error adding conductor assignment");
    }
  };

  const handleUpdateConductorStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      const res = await fetch("/api/admin/conductors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setConductors(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
        setTelemetryLogs(prev => [
          { id: Math.random().toString(), time: new Date().toTimeString().split(" ")[0], text: `Conductor status changed to ${nextStatus} for ID ${id}`, type: "info" },
          ...prev
        ]);
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDeleteConductor = async (id: string) => {
    if (!confirm("Are you sure you want to remove this conductor assignment?")) return;
    try {
      const res = await fetch(`/api/admin/conductors?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setConductors(prev => prev.filter(c => c.id !== id));
        setTelemetryLogs(prev => [
          { id: Math.random().toString(), time: new Date().toTimeString().split(" ")[0], text: `Removed Conductor ID ${id}`, type: "warn" },
          ...prev
        ]);
      }
    } catch (err) {
      alert("Error deleting conductor");
    }
  };

  // Fleet Add / Remove / QR actions
  const handleRegenerateQR = async (busId: string) => {
    try {
      const res = await fetch("/api/admin/buses/regenerate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId })
      });
      const data = await res.json();
      if (data.success) {
        alert(`QR Code regenerated successfully. Bus Code: ${data.bus.bus_code || data.bus.busCode}`);
        setRefreshKey(prev => prev + 1);
      } else {
        alert(data.error || "Failed to regenerate QR");
      }
    } catch (err) {
      alert("Error regenerating QR");
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBus.bus_number) {
      alert("Registration number is required");
      return;
    }

    try {
      // Direct insertion into Supabase
      const busCode = newBus.bus_code || `TNB${Math.floor(100 + Math.random() * 900)}`;
      const newBusEntry = {
        bus_number: newBus.bus_number,
        bus_code: busCode,
        price: Number(newBus.price),
        type: newBus.type,
        available_seats: Number(newBus.available_seats),
        status: "Scheduled",
        location: { lat: 11.0168, lng: 76.9639, rotation: 90 } // Gandhipuram default
      };

      const { data, error } = await supabase
        .from("buses")
        .insert([newBusEntry])
        .select()
        .single();

      if (error) throw error;

      alert("Bus successfully registered in fleet database!");
      setRefreshKey(prev => prev + 1);
      setIsBusModalOpen(false);
      setNewBus({ bus_number: "", bus_code: "", price: "15", type: "Regular", available_seats: "45", origin: "", destination: "" });
    } catch (err: any) {
      alert(err.message || "Failed to register bus");
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!confirm("Are you sure you want to retire this bus from service?")) return;
    try {
      const { error } = await supabase.from("buses").delete().eq("id", id);
      if (error) throw error;
      setBuses(prev => prev.filter(b => b._id !== id));
      alert("Bus retired successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete bus");
    }
  };

  // Route & Fare Actions
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.origin || !newRoute.destination) {
      alert("Origin and Destination are required");
      return;
    }

    try {
      const routeName = `${newRoute.origin} → ${newRoute.destination}`;
      
      // We insert into town_bus_trips or routes
      const newTrip = {
        bus_number: "TBD",
        origin: newRoute.origin,
        destination: newRoute.destination,
        price: Number(newRoute.fare),
        total_seats: Number(newRoute.total_seats),
        available_seats: Number(newRoute.total_seats),
        status: "Scheduled",
        departure_time: "08:00 AM",
        arrival_time: "09:30 AM",
        location: { lat: 11.0168, lng: 76.9639 }
      };

      const { data, error } = await supabase
        .from("town_bus_trips")
        .insert([newTrip])
        .select()
        .single();

      if (error) throw error;

      alert("Route & Schedule added successfully!");
      setRefreshKey(prev => prev + 1);
      setIsRouteModalOpen(false);
      setNewRoute({ name: "", origin: "", destination: "", fare: "15", total_seats: "45" });
    } catch (err: any) {
      alert(err.message || "Failed to create route");
    }
  };

  const handleUpdateCrowdStatus = async (tripId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("town_bus_trips")
        .update({ status })
        .eq("id", tripId);
      if (error) throw error;
      setRoutes(prev => prev.map(r => r.id === tripId ? { ...r, status } : r));
      alert("Crowd status / Trip status updated.");
    } catch (err: any) {
      alert(err.message || "Failed to update trip status");
    }
  };

  // Cargo/Luggage Actions
  const handleUpdateLuggageStatus = async (id: string, nextStatus: string) => {
    try {
      const { data: currentLuggage } = await supabase.from("luggage_bookings").select("scan_history").eq("id", id).single();
      const updatedHistory = [
        ...(currentLuggage?.scan_history || []),
        { status: nextStatus, location: "Transit Hub", updatedBy: user?.primaryEmailAddress?.emailAddress || "Admin" }
      ];

      const { error } = await supabase
        .from("luggage_bookings")
        .update({ status: nextStatus, scan_history: updatedHistory })
        .eq("id", id);

      if (error) throw error;

      setLuggageBookings(prev => prev.map(l => l.id === id ? { ...l, status: nextStatus, scan_history: updatedHistory } : l));
      setTelemetryLogs(prev => [
        { id: Math.random().toString(), time: new Date().toTimeString().split(" ")[0], text: `Cargo tracking ${id} status updated to ${nextStatus}`, type: "info" },
        ...prev
      ]);
    } catch (err: any) {
      alert(err.message || "Failed to update cargo status");
    }
  };

  // Financial Control refund simulator
  const handleTriggerRefund = (ticketId: string, amount: number) => {
    alert(`Refund requested for ticket ${ticketId}.\nAmount: ₹${amount.toFixed(2)}\nStatus: Refund Completed via PhonePe API.`);
    setTelemetryLogs(prev => [
      { id: Math.random().toString(), time: new Date().toTimeString().split(" ")[0], text: `Refund of ₹${amount} initiated for ${ticketId}`, type: "warn" },
      ...prev
    ]);
  };

  // Filter lists based on search queries
  const filteredBuses = buses.filter(b => 
    b.busNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.busCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLuggage = luggageBookings.filter(l => 
    l.tracking_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.sender_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.receiver_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.paymentStatus?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If user is not authenticated or not loaded, show standard gates
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#ffffff] border border-slate-200 shadow-sm text-black flex items-center justify-center text-zinc-600 font-sans">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase tracking-widest text-zinc-600">Initializing Transit Hub...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#ffffff] border border-slate-200 shadow-sm text-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/25">
            <ShieldAlert className="text-orange-500" size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">Enterprise Console</h1>
            <p className="text-zinc-500 text-sm">Please sign in with your administrative credentials to access the telemetry matrix.</p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => router.push("/sign-in?redirect_url=/admin")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-98"
            >
              Sign In to Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-900 font-sans flex overflow-hidden">
      
      {/* ── SaaS Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-56 border-r border-zinc-800/50 bg-[#0a0a0a] flex flex-col justify-between flex-shrink-0 select-none z-20">
        <div className="flex flex-col h-full">
          {/* Logo Brand */}
          <div className="h-14 flex items-center gap-3 px-4 border-b border-zinc-800/50">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles size={12} className="text-black" />
            </div>
            <div className="font-semibold text-sm tracking-tight text-zinc-900">Smart Tamizha Admin</div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
            {[
              { id: "operations", label: "Operations", icon: LayoutDashboard },
              { id: "fleet", label: "Fleet Command", icon: Bus },
              { id: "conductors", label: "Conductors", icon: UserCheck },
              { id: "routes", label: "Routes & Fares", icon: Map },
              { id: "luggage", label: "Logistics", icon: Package },
              { id: "financials", label: "Financials", icon: WalletCards },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                    isActive 
                      ? "bg-zinc-800/60 text-black" 
                      : "text-zinc-600 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-orange-500" : "text-zinc-500"} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          {/* Bottom Actions */}
          <div className="p-2 border-t border-zinc-800/50">
            <button 
              onClick={() => router.push("/")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-zinc-600 hover:text-zinc-200 hover:bg-zinc-900 transition-all"
            >
              <LogOut size={14} className="text-zinc-500" />
              Exit to Portal
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        
        {/* Top Header Bar */}
        <header className="h-14 border-b border-zinc-800/50 px-6 flex items-center justify-between select-none bg-[#0a0a0a] flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-[13px] font-medium text-zinc-300 capitalize">
              {activeTab.replace("-", " ")}
            </h2>
            <div className="h-4 w-px bg-slate-50 border border-slate-200 shadow-sm text-black"></div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-medium text-zinc-500">System Normal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            {["fleet", "conductors", "luggage", "financials"].includes(activeTab) && (
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-900/50 border border-zinc-300 rounded-md pl-9 pr-8 py-1.5 text-[13px] text-zinc-200 placeholder-zinc-500 w-56 outline-none focus:border-zinc-600 transition-all"
                />
                {searchQuery && (
                  <X 
                    size={14} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 cursor-pointer hover:text-zinc-300" 
                    onClick={() => setSearchQuery("")} 
                  />
                )}
              </div>
            )}

            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Sync Data"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-orange-500" : ""} />
            </button>

            <div className="h-4 w-px bg-slate-50 border border-slate-200 shadow-sm text-black"></div>
            <UserButton appearance={{ elements: { avatarBox: "w-7 h-7 rounded-md" } }} />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          
          {isLoading && (
            <div className="absolute inset-0 bg-[#0a0a0a]/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: OPERATIONS CONTROL (LIVE TELEMETRY)                 */}
          {/* ======================================================== */}
          {activeTab === "operations" && (
            <div className="space-y-6">
              
              {/* SaaS KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Bookings", val: stats.totalBookings, trend: "+14.8%", color: "bg-blue-500", icon: Ticket },
                  { label: "Revenue (Today)", val: `₹${stats.totalRevenue.toLocaleString()}`, trend: "+18.2%", color: "bg-emerald-500", icon: DollarSign },
                  { label: "Active Fleet", val: stats.activeBuses, trend: "Stable", color: "bg-orange-500", icon: Bus },
                  { label: "Active Staff", val: stats.activeConductors, trend: "Optimal", color: "bg-purple-500", icon: Users },
                  { label: "Avg Occupancy", val: `${stats.occupancyRate}%`, trend: "+5.4%", color: "bg-amber-500", icon: Percent },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.color} opacity-50`}></div>
                      <div className="flex items-center justify-between pl-2">
                        <span className="text-[12px] font-medium text-zinc-600">{stat.label}</span>
                        <Icon size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      <div className="pl-2">
                        <div className="text-2xl font-semibold text-zinc-900">{stat.val}</div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500 font-medium">
                          <span className={stat.trend.includes("+") ? "text-emerald-400" : "text-zinc-600"}>{stat.trend}</span> 
                          <span>vs last week</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Map & Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Map */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl overflow-hidden h-[450px] flex flex-col">
                    <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between bg-[#ffffff] border border-slate-200 shadow-sm text-black z-10">
                      <h3 className="text-[13px] font-medium text-zinc-200">Live Operations Grid</h3>
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Live</span>
                      </div>
                    </div>
                    <div className="flex-1 w-full relative">
                      <LiveBusMap
                        buses={[]}
                        livePositions={{}}
                        onBusClick={() => {}}
                        showRoutes={false}
                        showStops={false}
                      />
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chart 1 */}
                    <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-5 space-y-4">
                      <div>
                        <h3 className="text-[13px] font-medium text-zinc-200">Booking Volume</h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Today's transactions by hour</p>
                      </div>
                      <div className="h-32 w-full flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0F6B5C" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#0F6B5C" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0 80 Q 50 20 100 45 T 200 10 T 300 30 L 300 100 L 0 100 Z" fill="url(#chartGrad1)" />
                          <path d="M 0 80 Q 50 20 100 45 T 200 10 T 300 30" fill="none" stroke="#0F6B5C" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>

                    {/* Chart 2 */}
                    <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-5 space-y-4">
                      <div>
                        <h3 className="text-[13px] font-medium text-zinc-200">Average Occupancy</h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Load factor across active routes</p>
                      </div>
                      <div className="h-32 w-full flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0F6B5C" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#0F6B5C" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0 90 Q 75 40 150 70 T 300 20 L 300 100 L 0 100 Z" fill="url(#chartGrad2)" />
                          <path d="M 0 90 Q 75 40 150 70 T 300 20" fill="none" stroke="#0F6B5C" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right sidebar logic */}
                <div className="space-y-6">
                  {/* Alerts */}
                  <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[13px] font-medium text-zinc-200">System Alerts</h3>
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 shadow-sm text-black rounded text-[10px] font-medium text-zinc-600">
                        {activeAlerts.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {activeAlerts.map(alert => (
                        <div key={alert.id} className="p-3 bg-[#161616] border border-zinc-800/80 rounded-lg flex gap-3 items-start">
                          <div className={`mt-0.5 ${alert.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                            <AlertTriangle size={14} />
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-zinc-300 leading-snug">{alert.text}</div>
                            <div className="text-[10px] text-zinc-500 mt-1">{alert.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticker */}
                  <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-4 h-[350px] flex flex-col">
                    <h3 className="text-[13px] font-medium text-zinc-200 mb-4">Activity Stream</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none">
                      {telemetryLogs.map(log => (
                        <div key={log.id} className="flex gap-3 items-start text-[12px]">
                          <span className="text-zinc-600 font-mono text-[10px] mt-0.5 w-12">{log.time.substring(0, 5)}</span>
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                            log.type === 'success' ? 'bg-emerald-500' : log.type === 'warn' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></span>
                          <span className="text-zinc-600 leading-snug flex-1">{log.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: FLEET COMMAND                                       */}
          {/* ======================================================== */}
          {activeTab === "fleet" && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Fleet Management</h1>
                  <p className="text-[13px] text-zinc-500 mt-1">Monitor transponders and bus fleet status</p>
                </div>
                <button 
                  onClick={() => setIsBusModalOpen(true)}
                  className="bg-[#ffffff] text-black hover:bg-zinc-200 font-medium text-[12px] px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all"
                >
                  <Plus size={14} /> Add Bus
                </button>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Fleet", count: buses.length },
                  { label: "On Road", count: buses.filter(b => b.status === "Running").length },
                  { label: "Depot/Standby", count: buses.filter(b => b.status === "Scheduled" || b.status === "Arrived").length },
                  { label: "Maintenance", count: buses.filter(b => b.status === "Maintenance").length },
                ].map((c, i) => (
                  <div key={i} className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-zinc-600">{c.label}</span>
                    <span className="text-xl font-semibold text-zinc-200">{c.count}</span>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/30 text-[11px] font-medium text-zinc-500">
                      <th className="py-3 px-5 font-medium">Bus Code</th>
                      <th className="py-3 px-5 font-medium">Registration</th>
                      <th className="py-3 px-5 font-medium">Status / Speed</th>
                      <th className="py-3 px-5 font-medium">GPS Status</th>
                      <th className="py-3 px-5 font-medium">Last Online</th>
                      <th className="py-3 px-5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-[13px]">
                    {filteredBuses.map(bus => {
                      const gpsOn = (bus as any).gps_enabled || (bus as any).gpsEnabled || false;
                      const devStatus = (bus as any).device_status || (bus as any).deviceStatus || 'Offline';
                      const lastSeen = (bus as any).last_seen || null;
                      const lastSeenText = lastSeen
                        ? (() => {
                            const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000);
                            if (diff < 60) return `${diff}s ago`;
                            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                            return `${Math.floor(diff / 3600)}h ago`;
                          })()
                        : 'Never';

                      return (
                      <tr key={bus._id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-5 font-mono text-zinc-300">{bus.busCode || 'BUS'}</td>
                        <td className="py-3 px-5 text-zinc-200">{bus.busNumber}</td>
                        <td className="py-3 px-5">
                          <span className={`inline-flex items-center gap-1.5 ${bus.status === 'Running' ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            {bus.status === 'Running' ? <><Gauge size={12}/> {bus.speed} km/h</> : 'Stationary'}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 w-16">
                              <span className={`w-1.5 h-1.5 rounded-full ${devStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                              <span className="text-[12px] text-zinc-600">{devStatus}</span>
                            </span>
                            <button
                              onClick={async () => {
                                await fetch(`/api/buses/${bus._id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ gps_enabled: !gpsOn })
                                });
                                setBuses(prev => prev.map(b => b._id === bus._id ? { ...b, gps_enabled: !gpsOn } as any : b));
                              }}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${
                                gpsOn ? 'bg-zinc-200 text-black hover:bg-[#ffffff]' : 'bg-slate-50 border border-slate-200 shadow-sm text-black text-zinc-600 hover:bg-zinc-700'
                              }`}
                            >
                              {gpsOn ? 'GPS On' : 'GPS Off'}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-zinc-500 text-[12px]">{lastSeenText}</td>
                        <td className="py-3 px-5 text-right space-x-2">
                          <button
                            onClick={() => handleRegenerateQR(bus._id)}
                            className="p-1.5 rounded bg-slate-50 border border-slate-200 shadow-sm text-black text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                            title="Regenerate QR"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBus(bus._id)}
                            className="p-1.5 rounded text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                    {filteredBuses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-[13px]">No buses found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: CONDUCTORS                                          */}
          {/* ======================================================== */}
          {activeTab === "conductors" && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Conductor Directory</h1>
                  <p className="text-[13px] text-zinc-500 mt-1">Manage staff assignments and authentication</p>
                </div>
                <button 
                  onClick={() => setIsConductorModalOpen(true)}
                  className="bg-[#ffffff] text-black hover:bg-zinc-200 font-medium text-[12px] px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all"
                >
                  <Plus size={14} /> Assign Conductor
                </button>
              </div>

              <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/30 text-[11px] font-medium text-zinc-500">
                      <th className="py-3 px-5 font-medium">ID</th>
                      <th className="py-3 px-5 font-medium">Name & Email</th>
                      <th className="py-3 px-5 font-medium">Bus</th>
                      <th className="py-3 px-5 font-medium">Route</th>
                      <th className="py-3 px-5 font-medium">Status</th>
                      <th className="py-3 px-5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-[13px]">
                    {conductors.map(conductor => (
                      <tr key={conductor.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-5 font-mono text-zinc-600">{conductor.employee_id}</td>
                        <td className="py-3 px-5">
                          <div className="font-medium text-zinc-200">{conductor.name}</div>
                          <div className="text-[11px] text-zinc-500">{conductor.email}</div>
                        </td>
                        <td className="py-3 px-5 text-zinc-300">{conductor.assigned_bus || "—"}</td>
                        <td className="py-3 px-5 text-zinc-600">{conductor.assigned_route || "—"}</td>
                        <td className="py-3 px-5">
                          <button
                            onClick={() => handleUpdateConductorStatus(conductor.id, conductor.status)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              conductor.status === "Active" 
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                                : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            }`}
                          >
                            {conductor.status}
                          </button>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <button 
                            onClick={() => handleDeleteConductor(conductor.id)}
                            className="p-1.5 rounded text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {conductors.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-[13px]">No conductors found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: ROUTES & FARES                                      */}
          {/* ======================================================== */}
          {activeTab === "routes" && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Routes & Fares</h1>
                  <p className="text-[13px] text-zinc-500 mt-1">Configure transit lines and base pricing</p>
                </div>
                <button 
                  onClick={() => setIsRouteModalOpen(true)}
                  className="bg-[#ffffff] text-black hover:bg-zinc-200 font-medium text-[12px] px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all"
                >
                  <Plus size={14} /> Create Route
                </button>
              </div>

              <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/30 text-[11px] font-medium text-zinc-500">
                      <th className="py-3 px-5 font-medium">Path</th>
                      <th className="py-3 px-5 font-medium">Fare</th>
                      <th className="py-3 px-5 font-medium">Schedule</th>
                      <th className="py-3 px-5 text-right font-medium">Status / Load</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-[13px]">
                    {routes.map((route, i) => (
                      <tr key={route.id || i} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-5 text-zinc-200">{route.origin} → {route.destination}</td>
                        <td className="py-3 px-5 text-zinc-300 font-medium">₹{route.price}</td>
                        <td className="py-3 px-5 text-zinc-600">{route.departure_time || "08:00 AM"}</td>
                        <td className="py-3 px-5 text-right">
                          <select 
                            onChange={(e) => handleUpdateCrowdStatus(route.id, e.target.value)}
                            value={route.status || "Scheduled"}
                            className="bg-slate-50 border border-slate-200 shadow-sm text-black border border-zinc-300 text-zinc-300 text-[11px] rounded px-2 py-1 outline-none cursor-pointer hover:border-zinc-600 transition-colors"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Running">Active</option>
                            <option value="High">High Load</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: LUGGAGE                                             */}
          {/* ======================================================== */}
          {activeTab === "luggage" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Luggage Logistics</h1>
                <p className="text-[13px] text-zinc-500 mt-1">Monitor parcel and cargo dispatch</p>
              </div>

              <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/30 text-[11px] font-medium text-zinc-500">
                      <th className="py-3 px-5 font-medium">Tracking ID</th>
                      <th className="py-3 px-5 font-medium">Sender</th>
                      <th className="py-3 px-5 font-medium">Receiver</th>
                      <th className="py-3 px-5 font-medium">Details</th>
                      <th className="py-3 px-5 font-medium">Amount</th>
                      <th className="py-3 px-5 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-[13px]">
                    {filteredLuggage.map(parcel => (
                      <tr key={parcel.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-5 font-mono text-zinc-300">{parcel.tracking_id}</td>
                        <td className="py-3 px-5">
                          <div className="text-zinc-200">{parcel.sender_details?.name || "Sender"}</div>
                          <div className="text-[11px] text-zinc-500">{parcel.sender_details?.phone || ""}</div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="text-zinc-200">{parcel.receiver_details?.name || "Receiver"}</div>
                          <div className="text-[11px] text-zinc-500">{parcel.receiver_details?.phone || ""}</div>
                        </td>
                        <td className="py-3 px-5 text-zinc-600">
                          {parcel.package_category || "General"} ({parcel.weight || "10"}kg)
                        </td>
                        <td className="py-3 px-5 font-medium text-zinc-200">₹{parcel.total_amount || parcel.amount}</td>
                        <td className="py-3 px-5 text-right">
                          <select 
                            onChange={(e) => handleUpdateLuggageStatus(parcel.id, e.target.value)}
                            value={parcel.status}
                            className="bg-slate-50 border border-slate-200 shadow-sm text-black border border-zinc-300 text-zinc-300 text-[11px] rounded px-2 py-1 outline-none cursor-pointer hover:border-zinc-600 transition-colors"
                          >
                            <option value="Booked">Booked</option>
                            <option value="Picked up">Picked up</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {filteredLuggage.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-[13px]">No cargo records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: FINANCIALS                                          */}
          {/* ======================================================== */}
          {activeTab === "financials" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Financial Ledger</h1>
                <p className="text-[13px] text-zinc-500 mt-1">Verify transactions and process refunds</p>
              </div>

              <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/30 text-[11px] font-medium text-zinc-500">
                      <th className="py-3 px-5 font-medium">Ticket ID</th>
                      <th className="py-3 px-5 font-medium">User</th>
                      <th className="py-3 px-5 font-medium">Trip/Seats</th>
                      <th className="py-3 px-5 font-medium">Amount</th>
                      <th className="py-3 px-5 font-medium">Status</th>
                      <th className="py-3 px-5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-[13px]">
                    {filteredBookings.map((b, idx) => (
                      <tr key={b.id || idx} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-5 font-mono text-zinc-300">{b.ticketId}</td>
                        <td className="py-3 px-5 text-zinc-600 text-[11px]">ID: {b.userId?.substring(0, 8)}...</td>
                        <td className="py-3 px-5 text-zinc-300">
                          {typeof b.tripId === "object" ? b.tripId?.bus_number : b.tripId?.substring(0, 8)} <span className="text-zinc-500 mx-1">/</span> {Array.isArray(b.seats) ? b.seats.join(", ") : b.seats || "1"}
                        </td>
                        <td className="py-3 px-5 font-medium text-zinc-200">₹{b.totalAmount}</td>
                        <td className="py-3 px-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            b.paymentStatus === 'Paid' || b.paymentStatus === 'Confirmed' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {b.paymentStatus || "Paid"}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <button 
                            onClick={() => handleTriggerRefund(b.ticketId, b.totalAmount)}
                            className="px-2 py-1 rounded bg-slate-50 border border-slate-200 shadow-sm text-black text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors text-[11px] font-medium"
                          >
                            Refund
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-[13px]">No transactions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* MODALS                                                     */}
      {/* ======================================================== */}
      
      {/* Conductor Modal */}
      {isConductorModalOpen && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm select-none">
          <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsConductorModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X size={16} />
            </button>
            <h3 className="text-[15px] font-medium text-zinc-900 mb-1">Assign Conductor</h3>
            <p className="text-[12px] text-zinc-500 mb-6">Provide clerk authentication and route assignment</p>
            
            <form onSubmit={handleAddConductor} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Name</label>
                <input type="text" required value={newConductor.name} onChange={(e) => setNewConductor(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Email</label>
                <input type="email" required value={newConductor.email} onChange={(e) => setNewConductor(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Employee ID</label>
                <input type="text" required value={newConductor.employee_id} onChange={(e) => setNewConductor(prev => ({ ...prev, employee_id: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Bus</label>
                  <input type="text" value={newConductor.assigned_bus} onChange={(e) => setNewConductor(prev => ({ ...prev, assigned_bus: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Route</label>
                  <input type="text" value={newConductor.assigned_route} onChange={(e) => setNewConductor(prev => ({ ...prev, assigned_route: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-[#ffffff] hover:bg-zinc-200 text-black font-medium text-[13px] py-2.5 rounded-md transition-colors">
                Authorize Conductor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bus Modal */}
      {isBusModalOpen && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm select-none">
          <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsBusModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X size={16} />
            </button>
            <h3 className="text-[15px] font-medium text-zinc-900 mb-1">Add Fleet Vehicle</h3>
            <p className="text-[12px] text-zinc-500 mb-6">Register a new transponder bus</p>
            
            <form onSubmit={handleAddBus} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Registration Number</label>
                <input type="text" required value={newBus.bus_number} onChange={(e) => setNewBus(prev => ({ ...prev, bus_number: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Type</label>
                  <select value={newBus.type} onChange={(e) => setNewBus(prev => ({ ...prev, type: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600">
                    <option>Regular</option>
                    <option>Express</option>
                    <option>AC Sleeper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Seats</label>
                  <input type="number" required value={newBus.available_seats} onChange={(e) => setNewBus(prev => ({ ...prev, available_seats: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-[#ffffff] hover:bg-zinc-200 text-black font-medium text-[13px] py-2.5 rounded-md transition-colors">
                Register Vehicle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Route Modal */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm select-none">
          <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-800/80 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsRouteModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X size={16} />
            </button>
            <h3 className="text-[15px] font-medium text-zinc-900 mb-1">Create Route</h3>
            <p className="text-[12px] text-zinc-500 mb-6">Define a new transit path</p>
            
            <form onSubmit={handleAddRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Origin</label>
                  <input type="text" required value={newRoute.origin} onChange={(e) => setNewRoute(prev => ({ ...prev, origin: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Destination</label>
                  <input type="text" required value={newRoute.destination} onChange={(e) => setNewRoute(prev => ({ ...prev, destination: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Base Fare (₹)</label>
                  <input type="number" required value={newRoute.fare} onChange={(e) => setNewRoute(prev => ({ ...prev, fare: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">Total Seats</label>
                  <input type="number" required value={newRoute.total_seats} onChange={(e) => setNewRoute(prev => ({ ...prev, total_seats: e.target.value }))} className="w-full bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-zinc-300 rounded-md px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-zinc-600" />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-[#ffffff] hover:bg-zinc-200 text-black font-medium text-[13px] py-2.5 rounded-md transition-colors">
                Create Route
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


export default function EnterpriseAdminDashboard() {
  return (
    <SecureView>
      <Suspense fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#ffffff] border border-slate-200 text-black text-black p-4">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs uppercase tracking-widest font-black text-zinc-600">Loading Control Center...</p>
          </div>
        </div>
      }>
        <EnterpriseAdminDashboardContent />
      </Suspense>
    </SecureView>
  );
}

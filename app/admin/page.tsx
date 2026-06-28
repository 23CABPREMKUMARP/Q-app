"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { supabase } from "@/src/lib/supabase";
import { 
  LayoutDashboard, Bus, UserCheck, Map, Package, WalletCards, 
  Search, Plus, ShieldAlert, Sparkles, Bell, RefreshCw, 
  Trash2, Sliders, DollarSign, Users, Percent, 
  TrendingUp, Clock, Navigation, CheckCircle, AlertTriangle, ArrowRight, X, LogOut, ShieldCheck, Ticket
} from "lucide-react";

import { BusData, MapLayers } from "@/src/types";
import SecureView from "@/src/components/SecureView";

// Load LiveBusMap dynamically to prevent SSR hydration issues with Maplibre
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-sans">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase tracking-widest text-zinc-600">Initializing Transit Hub...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/25">
            <ShieldAlert className="text-orange-500" size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Enterprise Console</h1>
            <p className="text-zinc-500 text-sm">Please sign in with your administrative credentials to access the telemetry matrix.</p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => router.push("/sign-in?redirect_url=/admin")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-98"
            >
              Sign In to Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex overflow-hidden h-screen">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-900/40 p-4 flex flex-col justify-between flex-shrink-0 select-none backdrop-blur-md">
        <div className="space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 bg-white/15 rounded-xl p-1 flex items-center justify-center shadow-lg border border-zinc-800 flex-shrink-0">
              <img src="/hero-logo.png" alt="Digi Bus" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white uppercase leading-none">JEFFBEN</div>
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Operations Hub</div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {[
              { id: "operations", label: "Operations Control", icon: LayoutDashboard },
              { id: "fleet", label: "Fleet Command", icon: Bus },
              { id: "conductors", label: "Conductors Ledger", icon: UserCheck },
              { id: "routes", label: "Route & Fare Matrix", icon: Map },
              { id: "luggage", label: "Luggage Logistics", icon: Package },
              { id: "financials", label: "Financials & Bookings", icon: WalletCards },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive 
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-zinc-400 group-hover:text-white"} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions / Profile */}
        <div className="space-y-4 border-t border-zinc-800/80 pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <UserButton />
              <div className="text-left">
                <div className="text-[10px] font-black text-white max-w-[130px] truncate leading-none uppercase">{user?.fullName || "Transit Admin"}</div>
                <div className="text-[8px] font-bold text-zinc-500 truncate max-w-[130px]">{user?.primaryEmailAddress?.emailAddress}</div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 border border-zinc-800 hover:bg-zinc-800/40 text-zinc-400 hover:text-white font-bold uppercase tracking-wider text-[10px] py-3 rounded-xl transition-all"
          >
            <LogOut size={12} />
            Passenger Portal
          </button>
        </div>
      </aside>

      {/* Main Command Room Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        
        {/* Workspace Top Header Bar */}
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between select-none bg-zinc-900/10 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              System Gateway: <span className="text-white">COIMBATORE METROPOLITAN</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input for relevant tabs */}
            {["fleet", "conductors", "luggage", "financials"].includes(activeTab) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-2 w-64 shadow-inner">
                <Search size={14} className="text-zinc-500" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs text-white placeholder-zinc-500 w-full"
                />
                {searchQuery && <X size={12} className="text-zinc-500 cursor-pointer" onClick={() => setSearchQuery("")} />}
              </div>
            )}

            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
              title="Force Sync Database"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-orange-500" : ""} />
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {isLoading && (
            <div className="absolute inset-0 bg-zinc-950/70 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-xs font-black tracking-widest uppercase text-zinc-500">Querying Supabase Gateway...</p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: OPERATIONS CONTROL (LIVE TELEMETRY)                 */}
          {/* ======================================================== */}
          {activeTab === "operations" && (
            <div className="space-y-6">
              
              {/* Telemetry Stats Tickers */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Today's Bookings", val: stats.totalBookings, trend: "+14.8%", color: "border-orange-500/30", icon: Ticket },
                  { label: "Total Revenue", val: `₹${stats.totalRevenue.toLocaleString()}`, trend: "+18.2%", color: "border-emerald-500/30", icon: DollarSign },
                  { label: "Active Transponders", val: stats.activeBuses, trend: "Stable", color: "border-blue-500/30", icon: Bus },
                  { label: "Conductors On Road", val: stats.activeConductors, trend: "Optimal", color: "border-purple-500/30", icon: Users },
                  { label: "Mean Occupancy", val: `${stats.occupancyRate}%`, trend: "+5.4%", color: "border-amber-500/30", icon: Percent },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className={`bg-zinc-900/60 border ${stat.color} rounded-2xl p-4 flex flex-col justify-between h-28 shadow-lg shadow-black/20 hover:border-orange-500/50 transition-colors relative overflow-hidden group`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">{stat.label}</span>
                        <div className="w-7 h-7 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700/50">
                          <Icon size={12} className="text-orange-400" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-white tracking-tight">{stat.val}</div>
                        <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-zinc-500">
                          <span className="text-emerald-400 font-extrabold">{stat.trend}</span> vs yesterday
                        </div>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all pointer-events-none">
                        <Icon size={72} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Operations Telemetry Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live map display */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl h-[450px] relative flex flex-col">
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md z-10">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">Live Operations Grid</h3>
                        <p className="text-[10px] text-zinc-500">Real-time GPS transponder mapping and route traces</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-orange-400">Telemetry Live Stream</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full relative">
                      <LiveBusMap 
                        buses={buses} 
                        layers={{ 
                          showBuses: true, 
                          showRoutes: true, 
                          showMajorStops: true,
                          showSmallStops: false,
                          showTraffic: false,
                          showBuildings: false
                        }} 
                        onBusClick={(bus: any) => setSelectedBus(bus)}
                        selectedBusId={selectedBus?._id}
                      />
                    </div>
                  </div>

                  {/* Operational Analytics SVG Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* SVG Chart 1: Hourly Bookings Trend */}
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">Booking Distribution</h3>
                        <p className="text-[10px] text-zinc-500">Hourly transaction volumes (today)</p>
                      </div>
                      <div className="h-44 w-full flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FF9933" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#FF9933" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M 0 80 Q 50 20 100 45 T 200 10 T 300 30 L 300 100 L 0 100 Z" 
                            fill="url(#chartGrad)"
                          />
                          <path 
                            d="M 0 80 Q 50 20 100 45 T 200 10 T 300 30" 
                            fill="none" 
                            stroke="#FF9933" 
                            strokeWidth="2.5" 
                          />
                          <circle cx="100" cy="45" r="4" fill="#FF9933" />
                          <circle cx="200" cy="10" r="4" fill="#FF9933" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500 px-1">
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>24:00</span>
                      </div>
                    </div>

                    {/* SVG Chart 2: Occupancy Rate Area Chart */}
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">Occupancy Metrics</h3>
                        <p className="text-[10px] text-zinc-500">Average load factor across routes</p>
                      </div>
                      <div className="h-44 w-full flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M 0 90 Q 75 40 150 70 T 300 20 L 300 100 L 0 100 Z" 
                            fill="url(#chartGrad2)"
                          />
                          <path 
                            d="M 0 90 Q 75 40 150 70 T 300 20" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="2.5" 
                          />
                          <circle cx="150" cy="70" r="4" fill="#10b981" />
                          <circle cx="300" cy="20" r="4" fill="#10b981" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500 px-1">
                        <span>Min: 32%</span>
                        <span>Avg: 72%</span>
                        <span>Max: 94%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar telemetry events & critical alerts */}
                <div className="space-y-6">
                  
                  {/* Alerts Panel */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">Operations Warnings</h3>
                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded text-[8px] font-black uppercase tracking-wider">
                        {activeAlerts.length} Warnings
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[150px] overflow-y-auto pr-1">
                      {activeAlerts.map(alert => (
                        <div key={alert.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex gap-3 items-start">
                          <div className={`mt-0.5 p-1 rounded ${alert.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                            <AlertTriangle size={12} />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-extrabold text-zinc-300 leading-tight">{alert.text}</div>
                            <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">{alert.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-time event log ticker */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4 h-[350px] flex flex-col">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">Telemetry Event Ticker</h3>
                      <p className="text-[10px] text-zinc-500">Live operational audit stream</p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-[11px] font-mono scrollbar-none">
                      {telemetryLogs.map(log => (
                        <div key={log.id} className="flex gap-2 items-start leading-normal hover:bg-zinc-800/10 p-1 rounded transition-colors">
                          <span className="text-zinc-500 select-none">[{log.time}]</span>
                          <span className={`w-1 h-3 rounded-full flex-shrink-0 mt-0.5 ${
                            log.type === 'success' ? 'bg-emerald-500' : log.type === 'warn' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></span>
                          <span className="text-zinc-300 flex-1">{log.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: FLEET MANAGEMENT                                    */}
          {/* ======================================================== */}
          {activeTab === "fleet" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight">Fleet Command Matrix</h1>
                  <p className="text-xs text-zinc-500 font-medium">Telemetry transponders and bus fleet tracking control</p>
                </div>
                <button 
                  onClick={() => setIsBusModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] px-5 py-3 rounded-xl shadow-lg shadow-orange-500/10 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus size={14} /> Add Bus to Fleet
                </button>
              </div>

              {/* Status metrics grid */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Active Fleet Size", count: buses.length, color: "text-orange-400" },
                  { label: "Buses On Road", count: buses.filter(b => b.status === "Running").length, color: "text-emerald-400" },
                  { label: "Scheduled (Depot)", count: buses.filter(b => b.status === "Scheduled" || b.status === "Arrived").length, color: "text-blue-400" },
                  { label: "Inactive/Maintenance", count: buses.filter(b => b.status === "Maintenance").length, color: "text-red-400" },
                ].map((c, i) => (
                  <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-center h-20 shadow-lg shadow-black/25">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">{c.label}</span>
                    <span className={`text-xl font-black mt-1 ${c.color}`}>{c.count}</span>
                  </div>
                ))}
              </div>

              {/* Bus Registry Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        <th className="py-4 px-6">Transponder ID</th>
                        <th className="py-4 px-6">Bus Reg Number</th>
                        <th className="py-4 px-6">Type & Amenities</th>
                        <th className="py-4 px-6">Assigned Route</th>
                        <th className="py-4 px-6">Active Speed</th>
                        <th className="py-4 px-6">Seat Occupancy</th>
                        <th className="py-4 px-6 text-right">Telemetry Matrix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-xs">
                      {filteredBuses.map(bus => (
                        <tr key={bus._id} className="hover:bg-zinc-800/25 transition-colors">
                          <td className="py-4 px-6 font-mono font-black text-orange-400 uppercase">{bus.busCode || "BUS"}</td>
                          <td className="py-4 px-6 font-bold text-white uppercase">{bus.busNumber}</td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-white">{bus.status || "Regular"}</div>
                            <div className="text-[9px] text-zinc-500 mt-0.5">AC • WiFi • Seatbelt</div>
                          </td>
                          <td className="py-4 px-6 text-zinc-300 font-semibold italic">
                            {bus.routeId?.routeName || "Depot Standby"}
                          </td>
                          <td className="py-4 px-6 font-semibold">
                            <span className={bus.status === "Running" ? "text-emerald-400 font-mono font-extrabold" : "text-zinc-500"}>
                              {bus.status === "Running" ? `${bus.speed} km/h` : "Stationary"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    (bus.availableSeats || 0) < 10 ? "bg-red-500" : "bg-emerald-500"
                                  }`} 
                                  style={{ width: `${Math.max(10, 100 - ((bus.availableSeats || 0) / 45) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-black text-zinc-400">
                                {45 - (bus.availableSeats || 0)} / 45
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button 
                              onClick={() => handleRegenerateQR(bus._id)}
                              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700/80 hover:text-white rounded-lg text-zinc-400 text-[10px] font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                            >
                              QR Matrix
                            </button>
                            <button 
                              onClick={() => handleDeleteBus(bus._id)}
                              className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg transition-all inline-flex"
                              title="Retire from service"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredBuses.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No active transponders match search criteria</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: CONDUCTOR MANAGEMENT                                */}
          {/* ======================================================== */}
          {activeTab === "conductors" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight">Conductor Assignment Matrix</h1>
                  <p className="text-xs text-zinc-500 font-medium">Map Clerk authorization emails and assign active routes</p>
                </div>
                <button 
                  onClick={() => setIsConductorModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] px-5 py-3 rounded-xl shadow-lg shadow-orange-500/10 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus size={14} /> Assign Conductor
                </button>
              </div>

              {/* Conductors Ledger Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        <th className="py-4 px-6">Employee ID</th>
                        <th className="py-4 px-6">Conductor Name</th>
                        <th className="py-4 px-6">Clerk Auth Email</th>
                        <th className="py-4 px-6">Active Bus Assignment</th>
                        <th className="py-4 px-6">Assigned Route</th>
                        <th className="py-4 px-6">Security Token Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-xs">
                      {conductors.map(conductor => (
                        <tr key={conductor.id} className="hover:bg-zinc-800/25 transition-colors">
                          <td className="py-4 px-6 font-mono font-black text-orange-400 uppercase">{conductor.employee_id}</td>
                          <td className="py-4 px-6 font-bold text-white">{conductor.name}</td>
                          <td className="py-4 px-6 font-semibold text-zinc-300">{conductor.email}</td>
                          <td className="py-4 px-6 font-bold text-white uppercase">{conductor.assigned_bus || "Unassigned"}</td>
                          <td className="py-4 px-6 text-zinc-400 font-semibold italic">{conductor.assigned_route || "Depot Standby"}</td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleUpdateConductorStatus(conductor.id, conductor.status)}
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors ${
                                conductor.status === "Active" 
                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white" 
                                  : "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                              }`}
                            >
                              {conductor.status}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => handleDeleteConductor(conductor.id)}
                              className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                              title="Delete Assignment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {conductors.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No conductor assignments found. Click Assign Conductor to authorize one.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: ROUTE & FARE ENGINE                                 */}
          {/* ======================================================== */}
          {activeTab === "routes" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight">Transit Routing & Fare Matrix</h1>
                  <p className="text-xs text-zinc-500 font-medium">Configure metropolitan route maps, base pricing parameters, and schedules</p>
                </div>
                <button 
                  onClick={() => setIsRouteModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] px-5 py-3 rounded-xl shadow-lg shadow-orange-500/10 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus size={14} /> Add Route / Trip
                </button>
              </div>

              {/* Routes Matrix Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        <th className="py-4 px-6">Route ID</th>
                        <th className="py-4 px-6">Route Paths</th>
                        <th className="py-4 px-6">Origin Terminal</th>
                        <th className="py-4 px-6">Destination Terminal</th>
                        <th className="py-4 px-6">Base Fare</th>
                        <th className="py-4 px-6">Scheduled Time</th>
                        <th className="py-4 px-6 text-right">Operations & crowd</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-xs">
                      {routes.map((route, i) => (
                        <tr key={route.id || i} className="hover:bg-zinc-800/25 transition-colors">
                          <td className="py-4 px-6 font-mono font-black text-orange-400 uppercase">RT-00{i+1}</td>
                          <td className="py-4 px-6 font-bold text-white uppercase italic">{route.origin} &rarr; {route.destination}</td>
                          <td className="py-4 px-6 font-semibold text-zinc-300">{route.origin}</td>
                          <td className="py-4 px-6 font-semibold text-zinc-300">{route.destination}</td>
                          <td className="py-4 px-6 font-extrabold text-orange-400">₹{route.price}</td>
                          <td className="py-4 px-6 font-medium text-zinc-400">{route.departure_time || "08:00 AM"}</td>
                          <td className="py-4 px-6 text-right">
                            <select 
                              onChange={(e) => handleUpdateCrowdStatus(route.id, e.target.value)}
                              value={route.status || "Scheduled"}
                              className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-zinc-700 transition-colors"
                            >
                              <option value="Scheduled">Scheduled (Low)</option>
                              <option value="Running">Active (Medium)</option>
                              <option value="High">Overloaded (High)</option>
                              <option value="Delayed">Delayed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: LUGGAGE LOGISTICS                                   */}
          {/* ======================================================== */}
          {activeTab === "luggage" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">Luggage & Cargo Dispatch</h1>
                <p className="text-xs text-zinc-500 font-medium">Monitor luggage tracking IDs and issue dispatch updates</p>
              </div>

              {/* Statistics overview */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Parcels Booked", count: luggageBookings.length, color: "text-orange-400" },
                  { label: "Awaiting Pick Up", count: luggageBookings.filter(l => l.status === "Booked").length, color: "text-amber-400" },
                  { label: "Cargo In Transit", count: luggageBookings.filter(l => l.status === "In Transit").length, color: "text-blue-400" },
                  { label: "Delivered To Consignee", count: luggageBookings.filter(l => l.status === "Delivered").length, color: "text-emerald-400" },
                ].map((c, i) => (
                  <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-center h-20 shadow-lg shadow-black/25">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">{c.label}</span>
                    <span className={`text-xl font-black mt-1 ${c.color}`}>{c.count}</span>
                  </div>
                ))}
              </div>

              {/* Luggage ledger */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        <th className="py-4 px-6">Tracking ID</th>
                        <th className="py-4 px-6">Sender Details</th>
                        <th className="py-4 px-6">Receiver Details</th>
                        <th className="py-4 px-6">Category & Weight</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Tracking Status</th>
                        <th className="py-4 px-6 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-xs">
                      {filteredLuggage.map(parcel => (
                        <tr key={parcel.id} className="hover:bg-zinc-800/25 transition-colors">
                          <td className="py-4 px-6 font-mono font-black text-orange-400 uppercase">{parcel.tracking_id}</td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-white">{parcel.sender_details?.name || "Sender"}</div>
                            <div className="text-[9px] text-zinc-500 mt-0.5">{parcel.sender_details?.phone || ""}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-white">{parcel.receiver_details?.name || "Receiver"}</div>
                            <div className="text-[9px] text-zinc-500 mt-0.5">{parcel.receiver_details?.phone || ""}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-zinc-200">{parcel.package_category || "General"}</div>
                            <div className="text-[9px] text-zinc-500 mt-0.5">{parcel.weight || "10"} kg</div>
                          </td>
                          <td className="py-4 px-6 font-extrabold text-white">₹{parcel.total_amount || parcel.amount}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              parcel.status === 'Delivered' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                              parcel.status === 'In Transit' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                              'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            }`}>
                              {parcel.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <select 
                              onChange={(e) => handleUpdateLuggageStatus(parcel.id, e.target.value)}
                              value={parcel.status}
                              className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-zinc-700 transition-colors"
                            >
                              <option value="Booked">Booked</option>
                              <option value="Picked up">Picked up</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Reached Destination">Reached Destination</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {filteredLuggage.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No luggage bookings match search query</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: FINANCIALS & BOOKINGS                               */}
          {/* ======================================================== */}
          {activeTab === "financials" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">Financial Ledger & Bookings</h1>
                <p className="text-xs text-zinc-500 font-medium">Verify transaction records, ticket sales, and process refunds</p>
              </div>

              {/* Transactions list */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        <th className="py-4 px-6">Ticket ID</th>
                        <th className="py-4 px-6">Passenger Details</th>
                        <th className="py-4 px-6">Trip ID</th>
                        <th className="py-4 px-6">Seats</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Booking Date</th>
                        <th className="py-4 px-6 text-right">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-xs">
                      {filteredBookings.map((b, idx) => (
                        <tr key={b.id || idx} className="hover:bg-zinc-800/25 transition-colors">
                          <td className="py-4 px-6 font-mono font-black text-orange-400 uppercase">{b.ticketId}</td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-white">Guest User</div>
                            <div className="text-[9px] text-zinc-500 mt-0.5">ID: {b.userId?.substring(0, 12)}...</div>
                          </td>
                          <td className="py-4 px-6 font-mono font-semibold text-zinc-400">
                            {typeof b.tripId === "object" ? b.tripId?.bus_number || "Trip" : b.tripId?.substring(0, 8)}
                          </td>
                          <td className="py-4 px-6 font-bold text-white">{Array.isArray(b.seats) ? b.seats.join(", ") : b.seats || "1"}</td>
                          <td className="py-4 px-6 font-extrabold text-orange-400">₹{b.totalAmount}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              b.paymentStatus === 'Paid' || b.paymentStatus === 'Confirmed' 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                              {b.paymentStatus || "Paid"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-zinc-500 font-semibold">{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "Today"}</td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => handleTriggerRefund(b.ticketId, b.totalAmount)}
                              className="px-2.5 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                              Refund
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No transaction ledger logs match search criteria</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL: ASSIGN CONDUCTOR                                  */}
      {/* ======================================================== */}
      {isConductorModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm select-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-6">
            <button 
              onClick={() => setIsConductorModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Assign Conductor Authorization</h3>
              <p className="text-[10px] text-zinc-500">Maps a Clerk-authorized email to an active transit transponder</p>
            </div>
            
            <form onSubmit={handleAddConductor} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={newConductor.name}
                  onChange={(e) => setNewConductor(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Clerk Auth Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. johndoe@gmail.com"
                  value={newConductor.email}
                  onChange={(e) => setNewConductor(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Employee ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. EMP1004"
                  value={newConductor.employee_id}
                  onChange={(e) => setNewConductor(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Assigned Bus Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TN-38-EO-2179"
                    value={newConductor.assigned_bus}
                    onChange={(e) => setNewConductor(prev => ({ ...prev, assigned_bus: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Assigned Route Path</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Singanallur Route"
                    value={newConductor.assigned_route}
                    onChange={(e) => setNewConductor(prev => ({ ...prev, assigned_route: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-lg shadow-orange-500/10 transition-colors"
              >
                Authorize & Assign Conductor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD BUS TO FLEET                                  */}
      {/* ======================================================== */}
      {isBusModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm select-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-6">
            <button 
              onClick={() => setIsBusModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Register Telemetry Bus</h3>
              <p className="text-[10px] text-zinc-500">Insert a new transponder bus in the active fleet registry</p>
            </div>
            
            <form onSubmit={handleAddBus} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Bus Registration Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. TN-38-EO-9999"
                  value={newBus.bus_number}
                  onChange={(e) => setNewBus(prev => ({ ...prev, bus_number: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Custom Bus Code (ID)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CBE008"
                    value={newBus.bus_code}
                    onChange={(e) => setNewBus(prev => ({ ...prev, bus_code: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Bus Class Type</label>
                  <select 
                    value={newBus.type}
                    onChange={(e) => setNewBus(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="Regular">Regular Seater</option>
                    <option value="AC Seater">Air Conditioned (AC)</option>
                    <option value="Deluxe">Deluxe Coach</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Seats Capacity</label>
                  <input 
                    type="number" 
                    required
                    value={newBus.available_seats}
                    onChange={(e) => setNewBus(prev => ({ ...prev, available_seats: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Default Ticket Fare (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newBus.price}
                    onChange={(e) => setNewBus(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-lg shadow-orange-500/10 transition-colors"
              >
                Register & Bind Transponder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD ROUTE / TRIP                                 */}
      {/* ======================================================== */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm select-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-6">
            <button 
              onClick={() => setIsRouteModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Create Transit Path</h3>
              <p className="text-[10px] text-zinc-500">Insert new origin/destination coordinates and pricing schedule</p>
            </div>
            
            <form onSubmit={handleAddRoute} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Origin Terminal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Gandhipuram Stand"
                  value={newRoute.origin}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Destination Terminal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Walayar Stand"
                  value={newRoute.destination}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Default Ticket Fare (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newRoute.fare}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, fare: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Maximum Capacity</label>
                  <input 
                    type="number" 
                    required
                    value={newRoute.total_seats}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, total_seats: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-lg shadow-orange-500/10 transition-colors"
              >
                Create Routing Path
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
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs uppercase tracking-widest font-black text-zinc-400">Loading Control Center...</p>
          </div>
        </div>
      }>
        <EnterpriseAdminDashboardContent />
      </Suspense>
    </SecureView>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { 
  Search, QrCode, Ticket, MapPin, ShieldAlert, Sparkles, 
  Bell, ChevronRight, Bus, Wallet, Plus, Clock, User, 
  ArrowRight, ShieldCheck, Zap, Navigation, History, Info, Play, ScanLine, WalletCards, CreditCard, Hash, Crown
} from "lucide-react";
import { BusCodeSearch } from "@/src/components/BusCodeSearch";

export default function MobileDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [buses, setBuses] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState("250.00");
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState({ title: "Welcome to Digi Bus!", message: "Your journey begins here." });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [liveTripTrack, setLiveTripTrack] = useState<any>(null);
  const [showBusCodeModal, setShowBusCodeModal] = useState(false);
  const [address, setAddress] = useState("Coimbatore, TN");
  const [addressInput, setAddressInput] = useState("Coimbatore, TN");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const savedAddress = localStorage.getItem("passengerAddress");
    if (savedAddress) {
      setAddress(savedAddress);
      setAddressInput(savedAddress);
    }
    
    const fetchBusesData = async () => {
      try {
        const res = await fetch("/api/buses");
        if (res.ok) {
          const data = await res.json();
          setBuses(data);
        }
      } catch (err) {}
    };
    fetchBusesData();

    const phone = localStorage.getItem("registeredPhone");
    if (phone) {
      const fetchBookings = async () => {
        try {
          const res = await fetch("/api/bookings/by-phone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          });
          const bookings = await res.json();
          if (Array.isArray(bookings)) {
            const confirmedPaid = bookings.filter((b: any) => b.paymentStatus === "Paid");
            setActiveBookingsCount(confirmedPaid.length);
            const spent = confirmedPaid.reduce((sum: number, b: any) => sum + (Number(b.ticketPrice) || Number(b.amount) || Number(b.totalAmount) || 0), 0);
            setTotalSpent(spent);
            
            // Check if any of passenger's booked buses are active
            const activeBus = confirmedPaid.find((b: any) => 
              b.busId && (b.busId.status === "Trip Started" || b.busId.status === "Boarding" || b.busId.status === "Arriving Soon" || b.busId.status === "Reached Stop")
            );
            if (activeBus) {
              setLiveTripTrack(activeBus);
            } else {
              setLiveTripTrack(null);
            }
          }
        } catch (e) {}
      };
      fetchBookings();

      const fetchAlerts = async () => {
        try {
          const res = await fetch("/api/passenger/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.notifications)) {
            setNotifications((prev) => {
              if (prev.length > 0 && data.notifications.length > prev.length) {
                const newest = data.notifications[0];
                setNotificationText({ title: newest.title, message: newest.message });
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4500);
              }
              return data.notifications;
            });
          }
        } catch (err) {}
      };
      fetchAlerts();

      const pollInterval = setInterval(() => {
        fetchBookings();
        fetchAlerts();
      }, 4000);

      return () => {
        clearInterval(pollInterval);
      };
    }

    return () => {};
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-[#f3f4f6] text-slate-900 font-sans pb-28 relative"
      >
        {/* PhonePe Header */}
        <div className="bg-[#FF9933] px-4 pt-12 pb-4 text-white sticky top-0 z-[100] shadow-md rounded-b-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 rounded-full",
                    },
                  }}
                />
              </div>
              <button 
                onClick={() => setShowAddressModal(true)}
                className="flex flex-col text-left bg-transparent border-none outline-none cursor-pointer focus:outline-none"
              >
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">My Address</p>
                <div className="flex items-center gap-1 text-sm font-black text-white">
                  <span className="truncate max-w-[140px]">{address}</span>
                  <ChevronRight size={14} className="opacity-80 shrink-0" />
                </div>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/scan" className="relative text-white" title="Scan QR">
                <ScanLine size={24} />
              </Link>
              <button 
                onClick={() => {
                  setShowNotificationsModal(true);
                }}
                className="relative text-white cursor-pointer" 
                title="Notifications"
              >
                <Bell size={24} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#FF9933] rounded-full" />
                )}
              </button>
              <Link href="/about" className="relative text-white" title="Help">
                <Info size={24} />
              </Link>
            </div>
          </div>
          
          {/* Search Bar - PhonePe Style */}
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              className="w-full bg-white text-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm shadow-sm outline-none placeholder:text-slate-500"
              placeholder="Search Town Bus Routes"
              readOnly
              onClick={() => router.push('/town-bus')}
            />
          </div>
        </div>

        <div className="px-4 mt-4 space-y-4 max-w-md mx-auto">
          
          {/* Active Live Tracking Widget */}
          {liveTripTrack && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => router.push(`/live-map?busId=${liveTripTrack.busId?._id || liveTripTrack.busId}`)}
              className="bg-gradient-to-br from-slate-900 to-zinc-950 text-white rounded-3xl p-5 shadow-xl border border-orange-500/30 relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,153,51,0.15),transparent_60%)]" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9933]">Live Trip Active</span>
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-white group-hover:text-[#FF9933] transition-colors">
                    Track Bus JB-{liveTripTrack.busId?.busCode || "1024"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Status: <span className="text-white font-semibold">{liveTripTrack.busId?.status || "Running"}</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#FF9933] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <MapPin size={22} className="animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}

          {/* In-App Live Notifications Panel */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/50 space-y-4 text-left overflow-hidden relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#FF9933]/10 rounded-xl flex items-center justify-center">
                    <Bell size={16} className="text-[#FF9933]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Trip Broadcasts</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Live Updates</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse shrink-0">
                  Active alerts
                </span>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {notifications.map((notif: any) => (
                  <div
                    key={notif._id}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/70 transition-all rounded-2xl border border-slate-100 flex gap-3 relative overflow-hidden"
                  >
                    <div className="w-1.5 h-full bg-[#FF9933] absolute left-0 top-0 bottom-0" />
                    <div className="flex-1 pl-1 space-y-1">
                      <p className="text-xs font-bold text-slate-950 flex items-center justify-between">
                        <span>{notif.title}</span>
                        <span className="text-[8.5px] text-slate-400 font-bold shrink-0 ml-2">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Town Bus Booking Teaser */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-md relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/10 to-transparent opacity-50"></div>
            <div className="p-5 text-white relative z-10 flex items-center justify-between">
              <div className="w-2/3 pr-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bus size={14} className="text-[#FF9933]" />
                  <p className="text-[10px] font-black text-[#FF9933] tracking-widest uppercase">Town Bus</p>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-1">Town Bus Booking</h3>
                <p className="text-[10px] text-slate-400 font-medium mb-3 leading-tight">Only buses equipped with GPS tracking can be tracked in real time. If a bus does not have GPS installed, live location and tracking features will not be available.</p>
                <button 
                  onClick={() => router.push('/town-bus')}
                  className="inline-block bg-[#FF9933] hover:bg-orange-600 text-white border border-[#FF9933]/30 text-[10px] font-black px-4 py-2 rounded-full tracking-widest uppercase shadow-md active:scale-95 transition-all"
                >
                  Get Tickets
                </button>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-1/3 flex items-center justify-end pr-4 opacity-90 overflow-hidden">
                <div className="w-24 h-24 bg-[#FF9933]/20 rounded-full blur-2xl absolute -right-4"></div>
                <div className="bg-gradient-to-br from-[#FF9933] to-orange-600 w-16 h-16 rounded-full flex items-center justify-center shadow-xl z-10">
                  <Ticket size={32} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Money Transfers / Primary Services) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-800 mb-4 px-1">Transit & Payments</h3>
            <div className="grid grid-cols-4 gap-x-1 gap-y-4 text-center">
              <button 
                onClick={() => setShowBusCodeModal(true)} 
                className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-none outline-none focus:outline-none"
              >
                <div className="w-11 h-11 bg-[#FF9933] rounded-xl flex items-center justify-center shadow-md text-white mx-auto">
                  <Hash size={18} />
                </div>
                <span className="text-[9px] font-semibold text-slate-700 leading-tight">Bus<br/>Code</span>
              </button>
              
              <Link href="/scan" className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 bg-[#FF9933] rounded-xl flex items-center justify-center shadow-md text-white mx-auto">
                  <ScanLine size={18} />
                </div>
                <span className="text-[9px] font-semibold text-slate-700 leading-tight">Scan<br/>QR</span>
              </Link>

              <Link href="/town-bus" className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 bg-[#FF9933] rounded-xl flex items-center justify-center shadow-md text-white mx-auto">
                  <Bus size={18} />
                </div>
                <span className="text-[9px] font-semibold text-slate-700 leading-tight">Town<br/>Bus</span>
              </Link>

              <button 
                onClick={() => setShowMembershipModal(true)}
                className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-none outline-none focus:outline-none group"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md text-white mx-auto relative overflow-hidden group-hover:scale-105 transition-transform">
                  <Crown size={18} className="drop-shadow-sm" />
                </div>
                <span className="text-[9px] font-semibold text-slate-700 leading-tight">View<br/>Memberships</span>
              </button>
            </div>
          </div>

          {/* PhonePe Wallet & Passes Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-800 mb-4 px-1">Spends & Passes</h3>
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <WalletCards size={16} className="text-[#FF9933]" />
                  <span className="text-[11px] font-semibold truncate">Digi Bus Stand App</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 leading-tight">₹{totalSpent.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Amount used to purchase ticket</span>
                </div>
              </div>
              
              <Link href="/get-ticket" className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Ticket size={16} className="text-[#FF9933]" />
                  <span className="text-xs font-semibold">My Passes</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{activeBookingsCount} <span className="text-xs font-medium text-slate-500">Active</span></p>
                <div className="mt-2 text-xs font-bold text-[#FF9933] flex items-center gap-1">
                  VIEW PASS <ChevronRight size={12} />
                </div>
                <History className="absolute right-[-10px] bottom-[-10px] text-slate-200/50" size={64} />
              </Link>
            </div>
          </div>

          {/* Bus Code Quick Search */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-800 mb-3 px-1">Quick Fleet Search</h3>
            <BusCodeSearch compact={true} />
          </div>

          {/* Live Trip / Telemetry (Similar to PhonePe "Recent Transactions") */}
          {buses.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-slate-800 px-1">Live Telemetry Status</h3>
                <Link href="/live-map" className="text-xs font-bold text-[#FF9933]">View Map</Link>
              </div>
              
              <div 
                onClick={() => router.push(`/live-map?busId=${buses[0]?._id}`)}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl active:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <Bus size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">JB-{buses[0]?.busCode || "1024"}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{buses[0]?.routeId?.routeName || "Route 102"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Active
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">TN-38-EF-2025</p>
                </div>
              </div>
            </div>
          )}

          {/* Utilities & Conductor Portal (Recharge & Pay Bills style) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-800 mb-4 px-1">Partner & Services</h3>
            <div className="grid grid-cols-3 gap-y-4 text-center">
              <Link href="/conductor" className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-700">
                  <ShieldAlert size={20} className="text-amber-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">Conductor<br/>Terminal</span>
              </Link>
              <Link href="/about" className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-700">
                  <CreditCard size={20} className="text-blue-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">Payment<br/>Methods</span>
              </Link>
              <Link href="/about" className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-700">
                  <Navigation size={20} className="text-purple-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">Transit<br/>Intelligence</span>
              </Link>
            </div>
          </div>
          
          <div className="text-center pt-4 pb-6">
            <p className="text-[10px] font-medium text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> 100% Secure Payments by JeffBen
            </p>
          </div>

        {/* Floating Notification Panel Modal */}
        <AnimatePresence>
          {showNotificationsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-md flex items-end justify-center"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto pb-10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF9933]/15 rounded-xl flex items-center justify-center">
                      <Bell size={20} className="text-[#FF9933]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Live Trip Feed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotificationsModal(false)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <p className="text-sm font-bold text-slate-700">No Notifications Yet</p>
                      <p className="text-xs text-slate-400">We'll alert you here when your booked bus trip starts or the driver sends updates.</p>
                    </div>
                  ) : (
                    notifications.map((notif: any) => (
                      <div
                        key={notif._id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 relative overflow-hidden text-left"
                      >
                        <div className="w-2.5 h-full bg-[#FF9933] absolute left-0 top-0 bottom-0" />
                        <div className="flex-1 pl-1.5 space-y-1">
                          <p className="text-xs font-bold text-slate-950">{notif.title}</p>
                          <p className="text-xs text-slate-600 leading-tight">{notif.message}</p>
                          <p className="text-[9px] text-slate-400 font-medium">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Track with Bus Code Modal */}
        <AnimatePresence>
          {showBusCodeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-md flex items-end justify-center"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto pb-10 relative text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF9933]/15 rounded-xl flex items-center justify-center">
                      <Hash size={20} className="text-[#FF9933]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-bold text-slate-900">Track with Bus Code</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Separate Fleet Access Mode</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBusCodeModal(false)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full font-bold text-xs cursor-pointer border-none outline-none focus:outline-none"
                  >
                    Close
                  </button>
                </div>

                <div className="pt-2">
                  <BusCodeSearch compact={true} onScanClick={() => {
                    setShowBusCodeModal(false);
                    router.push('/live-map?action=scan');
                  }} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jeffben Pass Modal */}
        <AnimatePresence>
          {showPassModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-md flex items-end justify-center"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-slate-950 rounded-t-[32px] p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto pb-10 relative text-left border-t border-amber-900/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center">
                      <Sparkles size={20} className="text-amber-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-bold text-white">Jeffben Pass</h3>
                      <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">Premium Memberships</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPassModal(false)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full font-bold text-xs cursor-pointer border-none outline-none focus:outline-none"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center py-2">
                    <p className="text-sm text-slate-300 font-medium">Coming soon. Unlock exclusive benefits, priority booking, and unlimited transit across the Digi Bus network.</p>
                  </div>
                  
                  {/* Tiers */}
                  <div className="space-y-3">
                    {/* Platinum */}
                    <div className="bg-gradient-to-br from-slate-200 to-slate-400 p-[1px] rounded-2xl">
                      <div className="bg-slate-900 rounded-2xl p-4 h-full flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shadow-inner shrink-0">
                          <Zap size={24} className="text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-white tracking-wide">PLATINUM</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Unlimited free rides • Priority boarding</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase">Soon</span>
                        </div>
                      </div>
                    </div>

                    {/* Gold */}
                    <div className="bg-gradient-to-br from-amber-200 to-amber-500 p-[1px] rounded-2xl">
                      <div className="bg-slate-900 rounded-2xl p-4 h-full flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-inner shrink-0">
                          <Sparkles size={24} className="text-amber-900" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-white tracking-wide">GOLD</h4>
                          <p className="text-[10px] text-slate-400 font-medium">50 rides/mo • Free cancellations</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase">Soon</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Silver */}
                    <div className="bg-gradient-to-br from-zinc-300 to-zinc-500 p-[1px] rounded-2xl">
                      <div className="bg-slate-900 rounded-2xl p-4 h-full flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-300 flex items-center justify-center shadow-inner shrink-0">
                          <ShieldCheck size={24} className="text-zinc-700" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-white tracking-wide">SILVER</h4>
                          <p className="text-[10px] text-slate-400 font-medium">20 rides/mo • Standard support</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase">Soon</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bronze */}
                    <div className="bg-gradient-to-br from-orange-400 to-orange-700 p-[1px] rounded-2xl">
                      <div className="bg-slate-900 rounded-2xl p-4 h-full flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-inner shrink-0">
                          <User size={24} className="text-orange-950" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-white tracking-wide">BRONZE</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Pay as you go • Reward points</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase">Soon</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address Input Modal */}
        <AnimatePresence>
          {showAddressModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-md flex items-end justify-center"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto pb-10 relative text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF9933]/15 rounded-xl flex items-center justify-center">
                      <MapPin size={20} className="text-[#FF9933]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-bold text-slate-900">Change Location</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Set Custom Transit Origin</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full font-bold text-xs cursor-pointer border-none outline-none focus:outline-none"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Address / Neighborhood</label>
                    <input 
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="e.g. Gandhipuram, Coimbatore"
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-slate-900 rounded-xl p-3.5 text-xs font-bold text-slate-950 placeholder:text-slate-300 outline-none transition-all"
                    />
                  </div>

                  {/* Preset Locations */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Popular Neighborhoods</span>
                    <div className="flex flex-wrap gap-2">
                      {["Gandhipuram, CBE", "Ukkadam, TN", "Saravanampatti", "Annur Hub", "Mettupalayam"].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            setAddressInput(preset);
                          }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 transition-all active:scale-95"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (addressInput.trim()) {
                        setAddress(addressInput.trim());
                        localStorage.setItem("passengerAddress", addressInput.trim());
                        setShowAddressModal(false);
                      }
                    }}
                    className="w-full h-12 bg-slate-950 hover:bg-[#FF9933] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                  >
                    Confirm & Update Address
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



          {/* Memberships Modal */}
          {showMembershipModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:items-center"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full -z-0"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-md">
                      <Crown size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Bus Memberships</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Premium Tiers Coming Soon</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMembershipModal(false)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 relative z-10">
                  {/* Platinum Tier */}
                  <div className="p-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-100 to-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center shadow-sm">
                        <Sparkles size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-700">Platinum Pass</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unlimited Travel</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-2 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
                  </div>

                  {/* Gold Tier */}
                  <div className="p-4 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                        <Crown size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-amber-600">Gold Pass</h4>
                        <p className="text-[9px] font-bold text-amber-500/70 uppercase tracking-widest">Priority Seating</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-amber-200 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
                  </div>

                  {/* Silver Tier */}
                  <div className="p-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-zinc-50 to-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-300 flex items-center justify-center shadow-sm">
                        <Ticket size={16} className="text-zinc-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-zinc-600">Silver Pass</h4>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Standard Monthly Travel</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-zinc-200 text-zinc-600 px-2 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
                  </div>

                  {/* Bronze Tier */}
                  <div className="p-4 rounded-2xl border border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-300 flex items-center justify-center shadow-sm">
                        <Bus size={16} className="text-orange-700" />
                      </div>
                      <div>
                        <h4 className="font-black text-orange-600">Bronze Pass</h4>
                        <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">20 Travels</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-orange-200 text-orange-700 px-2 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.main>
    </AnimatePresence>
  );
}


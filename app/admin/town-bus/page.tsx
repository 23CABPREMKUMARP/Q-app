"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Bus, MapPin, Users, User, FileText, CreditCard, BarChart2, Bell, Settings } from 'lucide-react';
import Sidebar from '@/app/admin/components/Sidebar';
import Header from '@/app/admin/components/Header';
import DashboardTab from '@/app/admin/components/DashboardTab';
import FleetTab from '@/app/admin/components/FleetTab';
import RoutesTab from '@/app/admin/components/RoutesTab';
import BookingsTab from '@/app/admin/components/BookingsTab';
import PaymentsTab from '@/app/admin/components/PaymentsTab';
import GpsTab from '@/app/admin/components/GpsTab';
import ConductorsTab from '@/app/admin/components/ConductorsTab';
import PassengersTab from '@/app/admin/components/PassengersTab';
import AnalyticsTab from '@/app/admin/components/AnalyticsTab';
import BroadcastTab from '@/app/admin/components/BroadcastTab';
import SettingsTab from '@/app/admin/components/SettingsTab';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fleet', label: 'Fleet Manager', icon: Bus },
  { id: 'routes', label: 'Routes', icon: MapPin },
  { id: 'bookings', label: 'Bookings', icon: FileText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'gps', label: 'GPS Center', icon: MapPin },
  { id: 'conductors', label: 'Conductors', icon: Users },
  { id: 'passengers', label: 'Passengers', icon: User },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'broadcast', label: 'Broadcast', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminTownBusPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'fleet':
        return <FleetTab />;
      case 'routes':
        return <RoutesTab />;
      case 'bookings':
        return <BookingsTab />;
      case 'payments':
        return <PaymentsTab />;
      case 'gps':
        return <GpsTab />;
      case 'conductors':
        return <ConductorsTab />;
      case 'passengers':
        return <PassengersTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'broadcast':
        return <BroadcastTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-100">
      <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}

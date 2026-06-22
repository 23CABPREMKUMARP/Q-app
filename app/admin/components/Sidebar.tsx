"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export default function Sidebar({ tabs, activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0d1117] border-r border-slate-800/60 flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-slate-800/60">
        <h1 className="text-2xl font-bold text-[#FF9933]">DigiAdmin</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors 
                ${isActive ? 'bg-orange-500/15 border-l-2 border-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800/30'}
              `}
            >
              <Icon size={18} className="mr-3" />
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-600" />
          <div className="flex flex-col">
            <span className="text-sm text-slate-200">Admin User</span>
            <span className="text-xs text-slate-500">Super Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

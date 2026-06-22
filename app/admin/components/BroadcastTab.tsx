"use client";
import React, { useState } from 'react';
import { Bell, Users, Route, Send } from 'lucide-react';

const history = [
  { title: "Bus TN63-1001 delayed", body: "Expected 15 min delay on Route 1", target: "Route 1 Users", time: "10:22 AM", sent: 142 },
  { title: "New Route Launched", body: "Saibaba Colony → Airport now available", target: "All Users", time: "Yesterday", sent: 3421 },
  { title: "Scheduled Maintenance", body: "Bus TN63-1003 off-duty on 23 Jun", target: "Route 3 Users", time: "2 days ago", sent: 89 },
];

export default function BroadcastTab() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('All Users');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Notification Center</h2>
        <p className="text-sm text-slate-500 mt-0.5">Broadcast alerts to users, conductors & routes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Compose Notification</h3>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Target Audience</label>
            <select
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
            >
              <option>All Users</option>
              <option>Route 1 Users</option>
              <option>Route 2 Users</option>
              <option>Route 3 Users</option>
              <option>All Conductors</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Notification Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Service Update"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Message Body</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              placeholder="Type your message here..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {[{ label: "Push", icon: Bell }, { label: "SMS", icon: Users }, { label: "Email", icon: Route }].map(ch => (
              <label key={ch.label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-orange-500 w-4 h-4" />
                <ch.icon size={13} className="text-slate-400" />
                <span className="text-xs text-slate-400">{ch.label}</span>
              </label>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 rounded-xl transition-colors">
            <Send size={15} /> Send Notification
          </button>
        </div>

        {/* History */}
        <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Broadcast History</h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="bg-slate-800/30 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{h.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{h.body}</p>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0 ml-2">{h.time}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Users size={11} />{h.target}</span>
                  <span className="flex items-center gap-1"><Send size={11} />{h.sent} sent</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

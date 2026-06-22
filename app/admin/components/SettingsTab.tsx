"use client";
import React, { useState } from 'react';
import { Settings, CreditCard, Wifi, IndianRupee, Shield, User } from 'lucide-react';

const Section = ({ title, icon: Icon, children }: any) => (
  <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-6 space-y-4">
    <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
      <Icon size={16} className="text-orange-400" />
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, defaultValue, type = "text" }: any) => (
  <div>
    <label className="block text-xs text-slate-500 mb-1">{label}</label>
    <input
      type={type}
      defaultValue={defaultValue}
      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
    />
  </div>
);

const Toggle = ({ label, sub, defaultChecked }: any) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-orange-500' : 'bg-slate-700'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
};

const roles = [
  { role: "Super Admin", desc: "Full access to all modules", count: 1 },
  { role: "Operations Admin", desc: "Fleet, Routes, GPS management", count: 2 },
  { role: "Finance Admin", desc: "Payments and revenue only", count: 1 },
  { role: "Fleet Manager", desc: "Bus and conductor management", count: 3 },
  { role: "Support Admin", desc: "Passenger and booking support", count: 2 },
];

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">App configuration & admin role management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="App Settings" icon={Settings}>
          <Field label="App Name" defaultValue="Digi Bus Stand" />
          <Field label="Support Email" defaultValue="support@digibus.in" />
          <Field label="Support Phone" defaultValue="+91 94430 00000" />
          <Toggle label="Maintenance Mode" sub="Disables public access temporarily" defaultChecked={false} />
          <Toggle label="New Registrations" sub="Allow new user sign-ups" defaultChecked={true} />
        </Section>

        <Section title="Fare Settings" icon={IndianRupee}>
          <Field label="Base Fare (₹)" defaultValue="10" type="number" />
          <Field label="Per KM Rate (₹)" defaultValue="1.50" type="number" />
          <Field label="GST (%)" defaultValue="5" type="number" />
          <Toggle label="Dynamic Pricing" sub="Adjust fares based on demand" defaultChecked={false} />
          <Toggle label="Student Concession" sub="50% discount with valid ID" defaultChecked={true} />
        </Section>

        <Section title="GPS Settings" icon={Wifi}>
          <Field label="Update Interval (seconds)" defaultValue="10" type="number" />
          <Field label="Geofence Radius (meters)" defaultValue="500" type="number" />
          <Toggle label="Auto GPS Enable" sub="Enable GPS when trip starts" defaultChecked={true} />
          <Toggle label="Passenger Tracking Visible" sub="Show live bus to passengers" defaultChecked={true} />
        </Section>

        <Section title="Payment Settings" icon={CreditCard}>
          <Field label="Razorpay Key ID" defaultValue="rzp_live_SpI48tdYMmTx3A" />
          <Field label="PhonePe Merchant ID" defaultValue="DIGIBUSPROD" />
          <Toggle label="Test Mode" sub="Use sandbox credentials" defaultChecked={false} />
          <Toggle label="Auto Refund on Cancel" sub="Refund within 24 hours" defaultChecked={true} />
        </Section>
      </div>

      {/* Role-Based Access Control */}
      <Section title="Admin Roles & Access Control" icon={Shield}>
        <div className="overflow-hidden rounded-xl border border-slate-800/60">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-800/60">
                {["Role", "Description", "Admins", "Actions"].map(h => (
                  <th key={h} className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.role} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-orange-400" />
                      <span className="text-sm font-bold text-white">{r.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">{r.desc}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-bold">{r.count}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-xs text-slate-400 hover:text-orange-400 transition-colors font-semibold">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="flex justify-end">
        <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
          Save All Settings
        </button>
      </div>
    </div>
  );
}

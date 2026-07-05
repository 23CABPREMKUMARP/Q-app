"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, ArrowRight, User, Phone, MapPin, Scale, Box, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SecureView from "@/src/components/SecureView";

export default function LuggageBookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    senderName: '', senderPhone: '',
    receiverName: '', receiverPhone: '',
    pickupPoint: '', dropPoint: '',
    category: 'Medium', weight: '',
    length: '', width: '', height: ''
  });

  const calculateFare = () => {
    let base = 50;
    if (formData.category === 'Large') base += 100;
    if (formData.category === 'Express') base += 200;
    if (formData.category === 'Fragile') base += 50;
    
    const weightVal = parseFloat(formData.weight) || 0;
    return base + (weightVal * 10);
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulating API call and checkout
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4); // Success step
    }, 2000);
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-xl font-black uppercase tracking-widest text-[#111827] mb-6 flex items-center gap-2">
        <MapPin className="text-[#F28500]" /> Route Details
      </h2>
      
      <div className="space-y-4">
        <div className="bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] p-4 rounded-2xl border border-[#E5E7EB]">
          <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Pickup Point</label>
          <input 
            type="text" 
            placeholder="E.g. Gandhipuram Terminus"
            value={formData.pickupPoint}
            onChange={(e) => setFormData({...formData, pickupPoint: e.target.value})}
            className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500] transition-colors"
          />
        </div>
        <div className="bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] p-4 rounded-2xl border border-[#E5E7EB]">
          <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Drop Point</label>
          <input 
            type="text" 
            placeholder="E.g. Ukkadam Stand"
            value={formData.dropPoint}
            onChange={(e) => setFormData({...formData, dropPoint: e.target.value})}
            className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500] transition-colors"
          />
        </div>
      </div>
      
      <button 
        onClick={handleNext}
        disabled={!formData.pickupPoint || !formData.dropPoint}
        className="w-full mt-8 bg-[#F28500] text-[#111827] py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
      >
        Next Step <ArrowRight size={16} />
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-xl font-black uppercase tracking-widest text-[#111827] mb-6 flex items-center gap-2">
        <Package className="text-[#F28500]" /> Package Details
      </h2>
      
      <div className="space-y-4">
        <div className="bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] p-4 rounded-2xl border border-[#E5E7EB]">
          <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-4">Category</label>
          <div className="grid grid-cols-2 gap-3">
            {['Small', 'Medium', 'Large', 'Fragile', 'Express'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFormData({...formData, category: cat})}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-colors ${
                  formData.category === cat ? 'bg-[#F28500] text-[#111827] border-[#F28500]' : 'bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#6B7280] border-[#E5E7EB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] p-4 rounded-2xl border border-[#E5E7EB]">
            <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 flex items-center gap-1"><Scale size={12}/> Weight (kg)</label>
            <input 
              type="number" 
              placeholder="0.0"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500] transition-colors"
            />
          </div>
          <div className="flex-[2] bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] p-4 rounded-2xl border border-[#E5E7EB]">
            <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest block mb-2 flex items-center gap-1"><Box size={12}/> L x W x H (cm)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="L" className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500]" value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value})} />
              <input type="number" placeholder="W" className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500]" value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value})} />
              <input type="number" placeholder="H" className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500]" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={handleBack} className="w-1/3 bg-[#ffffff] border border-[#E5E7EB] text-[#111827] text-[#111827] py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors active:scale-95">Back</button>
        <button 
          onClick={handleNext}
          disabled={!formData.weight || !formData.length}
          className="flex-1 bg-[#F28500] text-[#111827] py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-xl font-black uppercase tracking-widest text-[#111827] mb-6 flex items-center gap-2">
        <User className="text-[#F28500]" /> Contact Details
      </h2>
      
      <div className="space-y-6">
        <div className="bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] p-5 rounded-3xl border border-[#E5E7EB]">
          <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-widest mb-4">Sender</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Name" value={formData.senderName} onChange={e=>setFormData({...formData, senderName: e.target.value})} className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500]" />
            <input type="tel" placeholder="Phone" value={formData.senderPhone} onChange={e=>setFormData({...formData, senderPhone: e.target.value})} className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500]" />
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] p-5 rounded-3xl border border-[#E5E7EB]">
          <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-widest mb-4">Receiver</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Name" value={formData.receiverName} onChange={e=>setFormData({...formData, receiverName: e.target.value})} className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500]" />
            <input type="tel" placeholder="Phone" value={formData.receiverPhone} onChange={e=>setFormData({...formData, receiverPhone: e.target.value})} className="w-full bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-3 rounded-xl outline-none border border-[#E5E7EB] focus:border-[#F28500]" />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] border border-[#F28500]/30 p-5 rounded-3xl flex justify-between items-center">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Total Fare</div>
          <div className="text-2xl font-black text-[#F28500]">₹{calculateFare()}</div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={handleBack} className="w-1/3 bg-[#ffffff] border border-[#E5E7EB] text-[#111827] text-[#111827] py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors active:scale-95">Back</button>
        <button 
          onClick={handleSubmit}
          disabled={!formData.senderName || !formData.receiverName || isProcessing}
          className="flex-1 bg-[#F28500] text-[#111827] py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isProcessing ? <div className="w-5 h-5 border-2 border-[#ffffff]/30 border-t-[#ffffff] rounded-full animate-spin"></div> : 'Pay & Book'}
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
      <div className="w-24 h-24 bg-[#F28500]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={48} className="text-[#F28500]" />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-tighter text-[#111827] mb-2">Booking Confirmed</h2>
      <p className="text-[#6B7280] text-sm mb-8">Your luggage has been booked successfully.</p>
      
      <div className="bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] border border-[#E5E7EB] p-6 rounded-3xl mb-8 text-left">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tracking ID</div>
        <div className="text-xl font-black tracking-widest text-[#111827] mb-6">TRK-A9X7B2</div>
        
        <div className="flex justify-between items-center border-t border-[#E5E7EB] pt-4">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivery OTP</div>
          <div className="text-lg font-black tracking-widest text-[#F28500]">4829</div>
        </div>
      </div>

      <button onClick={() => router.push('/track/luggage')} className="w-full bg-[#F28500] text-[#111827] py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors">
        Track Luggage
      </button>
    </motion.div>
  );

  return (
    <SecureView>
      <div className="min-h-screen bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] font-sans text-[#111827] pb-12">
      {/* Header */}
      <div className="bg-[#F28500] px-6 pt-12 pb-16 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Luggage</h1>
            <p className="text-[#111827]/80 font-medium text-sm tracking-wide">Fast & Secure Parcels</p>
          </div>
          <div className="bg-[#ffffff]/20 p-3 rounded-2xl backdrop-blur-md">
            <Truck size={32} className="text-[#111827]" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-10 relative z-20">
        <div className="bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] border border-[#E5E7EB] rounded-[32px] p-6 shadow-2xl shadow-black/50">
          
          {step < 4 && (
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-[#F28500]' : 'bg-[#ffffff] border border-[#E5E7EB] text-[#111827]'}`}></div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </SecureView>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Armchair, ChevronLeft, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SeatSelectionProps {
    busId: string;
    pricePerSeat: number;
    onProceed: (selectedSeats: string[], totalAmount: number) => void;
    onBack: () => void;
}

export function SeatSelection({ busId, pricePerSeat, onProceed, onBack }: SeatSelectionProps) {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    // Simulated booked seats
    const bookedSeats = useMemo(() => ["A1", "B2", "C4", "D1"], []);

    const seats = useMemo(() => {
        const layout = [];
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        for (const row of rows) {
            for (let i = 1; i <= 4; i++) {
                layout.push(`${row}${i}`);
            }
        }
        return layout;
    }, []);

    const toggleSeat = (id: string) => {
        if (bookedSeats.includes(id)) return;
        setSelectedSeats(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const totalAmount = selectedSeats.length * pricePerSeat;

    return (
        <div className="w-full max-w-5xl mx-auto mt-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

                {/* Left: Seat Layout */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-white/20"
                >
                    <div className="flex items-center justify-between mb-12">
                        <button onClick={onBack} className="p-3 bg-[#f8f8f8] hover:bg-[#FF6B00] hover:text-white rounded-2xl transition-all group active:scale-95">
                            <ChevronLeft className="size-6" />
                        </button>
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-[#333333]">Choose Your Seat</h2>
                            <p className="text-[#777777] font-bold text-xs uppercase tracking-widest mt-1">Semi-Sleeper Coach 2+2 Layout</p>
                        </div>
                        <div className="size-11" /> {/* Spacer */}
                    </div>

                    <div className="relative max-w-sm mx-auto bg-[#f8f8f8] p-10 rounded-[50px] border-4 border-white shadow-inner">
                        {/* Bus Front */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#333333] px-8 py-2 rounded-xl text-white text-[10px] font-black tracking-[0.3em] uppercase">
                            DRIVERS CABIN
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            {seats.map((id, index) => {
                                const isBooked = bookedSeats.includes(id);
                                const isSelected = selectedSeats.includes(id);
                                // Aisle is the 3rd column (index % 4 === 2)
                                const showAisle = index % 4 === 2;

                                return (
                                    <React.Fragment key={id}>
                                        {showAisle && <div className="w-full flex items-center justify-center">
                                            <div className="w-px h-full bg-black/5 border-l border-dashed border-black/10" />
                                        </div>}
                                        <button
                                            onClick={() => toggleSeat(id)}
                                            disabled={isBooked}
                                            className={cn(
                                                "relative aspect-square rounded-xl transition-all transform active:scale-90 flex items-center justify-center p-2 group",
                                                isBooked ? "bg-[#eeeeee] text-[#cccccc] cursor-not-allowed" :
                                                    isSelected ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/30" :
                                                        "bg-white border-2 border-[#eeeeee] text-[#333333] hover:border-[#FF6B00] hover:text-[#FF6B00]"
                                            )}
                                        >
                                            <Armchair className={cn("size-full", isSelected ? "fill-white" : "")} />
                                            <span className="absolute -top-1 -right-1 text-[8px] font-black bg-current px-1 rounded text-white-invert">
                                                {id}
                                            </span>
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="size-5 rounded-md border-2 border-[#eeeeee] bg-white" />
                            <span className="text-xs font-black text-[#777777] uppercase tracking-widest">Available</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="size-5 rounded-md bg-[#FF6B00]" />
                            <span className="text-xs font-black text-[#777777] uppercase tracking-widest">Selected</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="size-5 rounded-md bg-[#eeeeee]" />
                            <span className="text-xs font-black text-[#777777] uppercase tracking-widest">Booked</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Booking Summary */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-10 rounded-[40px] shadow-2xl border border-white/20 sticky top-10"
                    >
                        <h3 className="text-xl font-black text-[#333333] mb-8 uppercase tracking-widest flex items-center gap-3">
                            <Info className="size-5 text-[#FF6B00]" /> Selection
                        </h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-black/5">
                                <span className="text-[#777777] font-bold text-xs uppercase tracking-widest">Seats Selected</span>
                                <span className="text-[#333333] font-black text-lg">
                                    {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-black/5">
                                <span className="text-[#777777] font-bold text-xs uppercase tracking-widest">Price per seat</span>
                                <span className="text-[#333333] font-black text-lg">₹{pricePerSeat}</span>
                            </div>

                            <div className="pt-6">
                                <div className="flex justify-between items-end mb-8">
                                    <span className="text-[#777777] font-black text-xs uppercase tracking-[0.2em]">Total Amount</span>
                                    <span className="text-4xl font-black text-[#FF6B00]">₹{totalAmount}</span>
                                </div>

                                <button
                                    disabled={selectedSeats.length === 0}
                                    onClick={() => onProceed(selectedSeats, totalAmount)}
                                    className={cn(
                                        "w-full h-18 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 group",
                                        selectedSeats.length > 0
                                            ? "bg-[#333333] text-white hover:bg-[#FF6B00] shadow-[#FF6B00]/20"
                                            : "bg-[#f8f8f8] text-[#333333]/20 cursor-not-allowed border border-black/5"
                                    )}
                                >
                                    <CheckCircle2 className="size-6" />
                                    <span>Confirm Seats</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <div className="bg-[#FF8C33]/20 p-6 rounded-3xl border border-white/20">
                        <p className="text-xs text-center font-bold text-white/70">
                            * Maximum 6 seats per booking. For group bookings, contact our helpline.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

export interface BookingData {
  _id?: string;
  id?: string;
  busId?: any;
  seats?: string[];
  passengers?: any[];
  boardingPoint?: string;
  destination?: string;
  bookingDate?: string | Date;
  totalAmount?: number;
  phonepeTransactionId?: string;
  qrToken?: string;
  ticketId?: string;
  paymentStatus?: string;
  busNumber?: string;
  busCode?: string;
}

export function PremiumBoardingPass({ 
  booking, 
  currentTime = Date.now(),
  isPrinting = false
}: { 
  booking: BookingData;
  currentTime?: number;
  isPrinting?: boolean;
}) {
  const [localTime, setLocalTime] = useState(currentTime);
  useEffect(() => {
    const timer = setInterval(() => setLocalTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bookingTime = booking.bookingDate ? new Date(booking.bookingDate).getTime() : Date.now();
  const expiryTime = bookingTime + 7200000; // 2 hours
  const isExpired = localTime > expiryTime;
  const timeRemainingMs = expiryTime - localTime;
  let timeRemainingStr = "";
  if (!isExpired) {
     const hours = Math.floor(timeRemainingMs / 3600000);
     const mins = Math.floor((timeRemainingMs % 3600000) / 60000);
     const secs = Math.floor((timeRemainingMs % 60000) / 1000);
     if (hours > 0) timeRemainingStr = `${hours}h ${mins}m ${secs}s`;
     else timeRemainingStr = `${mins}m ${secs}s`;
  }
  
  // Parse bus number
  const busNumber = booking.busNumber || (typeof booking.busId === 'object' && booking.busId ? booking.busId.busNumber : "TN-38");
  const busCode = booking.busCode || (typeof booking.busId === 'object' && booking.busId ? booking.busId.busCode : "N/A");

  // Parse boarding and dropping
  const isCombined = booking.boardingPoint === "Combined Journey";
  const isMultiStop = booking.destination === "Multi-Stop";
  
  const boardingLocations = isCombined && booking.passengers
    ? Array.from(new Set(booking.passengers.map((p: any) => p.boarding).filter(Boolean)))
    : [booking.boardingPoint || "Point A"];
    
  const droppingLocations = isMultiStop && booking.passengers
    ? Array.from(new Set(booking.passengers.map((p: any) => p.destination).filter(Boolean)))
    : [booking.destination || "Point B"];

  // Determine Primary Passenger Name
  const passengerCount = booking.seats?.length || booking.passengers?.length || 1;
  const primaryPassenger = passengerCount > 1 
    ? `Group (${passengerCount} PAX)` 
    : "Guest Commuter";

  const dateObj = booking.bookingDate ? new Date(booking.bookingDate) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const qrValue = booking.qrToken ? `https://jeffben.org/ticket/${booking.qrToken}` : (booking.ticketId ? `https://jeffben.org/ticket/${booking.ticketId}` : "INVALID");
  const ticketNo = booking.ticketId?.toUpperCase() || "PENDING";

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className={`relative w-[800px] max-w-full md:max-w-4xl mx-auto flex flex-row shadow-[0_20px_50px_-10px_rgba(212,175,55,0.4)] rounded-lg overflow-hidden ${isExpired ? "grayscale-[0.5]" : ""} ${isPrinting ? "print-active-ticket" : ""}`}
           style={{
             background: "linear-gradient(135deg, #FFD700 0%, #FFF3B0 25%, #D4AF37 50%, #FFE55C 75%, #DAA520 100%)",
             color: "#000000",
             fontFamily: "Georgia, serif",
             border: isExpired ? "3px solid #DC2626" : "3px solid #16A34A"
           }}>
           
          {/* Cutouts for dashed line (Desktop only) using transparent divs on the container edges */}
          <div className="absolute top-[-12px] left-[70%] -translate-x-1/2 w-6 h-6 bg-[#FAFAFA] rounded-full shadow-inner z-20"></div>
          <div className="absolute bottom-[-12px] left-[70%] -translate-x-1/2 w-6 h-6 bg-[#FAFAFA] rounded-full shadow-inner z-20"></div>
          
          {/* Dashed line */}
          <div className="absolute top-2 bottom-2 left-[70%] -translate-x-1/2 border-l-[3px] border-dashed border-[#000000]/30 z-10"></div>

          {/* LEFT SECTION */}
          <div className="w-[70%] relative p-3 sm:p-4 md:p-5 flex flex-col justify-center ">
            
            {/* Elegant Inner Border */}
            <div className="absolute inset-2 md:inset-3 border border-[#000000]/30 rounded pointer-events-none z-0">
              <div className="absolute inset-1 border border-[#000000]/10 rounded pointer-events-none z-0"></div>
            </div>

            <div className="relative z-10 px-2 md:px-4">
              {/* Header with Logos */}
              <div className="text-center mb-2">
                <div className="flex justify-center items-center gap-4 mb-1">
                  {/* digi bus logo */}
                  <Image src="/hero-logo.png" alt="Logo" width={60} height={18} className="object-contain" />
                  <div className="h-5 w-px bg-black/30"></div>
                  {/* jeff ben logo (assumed to be a different logo, using placeholder or same if not available. Using hero-logo for now) */}
                  <Image src="/logo2.png" alt="Jeff Ben" width={50} height={15} className="object-contain" />
                </div>
                
                <div className="flex items-center justify-center gap-3 md:gap-4 mt-4">
                  <div className="h-[2px] w-8 md:w-16 bg-[#000000] relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rotate-45 border-t border-r border-[#000000]"></div></div>
                  <h1 className="text-base md:text-lg font-bold tracking-widest text-[#000000]">E-TICKET</h1>
                  <div className="h-[2px] w-8 md:w-16 bg-[#000000] relative"><div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rotate-45 border-b border-l border-[#000000]"></div></div>
                </div>
              </div>

              {/* Content Lines */}
              <div className="space-y-1 md:space-y-2 text-xs md:text-base mt-2 md:mt-3">
                {/* Passenger */}
                <div className="flex items-end border-b border-[#000000]/20 pb-1">
                  <span className="w-24 md:w-32 text-[#000000]/80 text-[10px] md:text-xs">Passenger:</span>
                  <span className="font-bold text-[#000000] flex-1 text-[11px] md:text-xs">{primaryPassenger}</span>
                </div>

                {/* Bus & Code */}
                <div className="flex items-end border-b border-[#000000]/20 pb-1">
                  <div className="flex items-end flex-1">
                    <span className="w-24 md:w-32 text-[#000000]/80 text-[10px] md:text-xs">Bus No:</span>
                    <span className="font-bold text-[#000000] text-[11px] md:text-xs">{busNumber}</span>
                  </div>
                  <div className="flex items-end ml-4">
                    <span className="w-20 md:w-24 text-[#000000]/80 text-[10px] md:text-xs">Bus Code:</span>
                    <span className="font-bold text-[#000000] text-[11px] md:text-xs">{busCode}</span>
                  </div>
                </div>

                {/* From & To (Vertical List) */}
                <div className="flex items-start border-b border-[#000000]/20 pb-1">
                  <div className="flex items-start flex-1">
                    <span className="w-20 md:w-24 text-[#000000]/80 text-[10px] md:text-xs flex items-center gap-1 mt-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                      From:
                    </span>
                    <div className="flex flex-col flex-1 pr-2">
                      {boardingLocations.map((loc, idx) => (
                        <div key={idx} className="font-bold text-[#000000] mb-1 flex items-start leading-tight">
                          <span className="mr-1 shrink-0">📍</span>
                          <span className="break-words">{loc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start flex-1">
                    <span className="w-12 md:w-16 text-[#000000]/80 text-[10px] md:text-xs ml-2 mt-1">To:</span>
                    <div className="flex flex-col flex-1">
                      {droppingLocations.map((loc, idx) => (
                        <div key={idx} className="font-bold text-[#000000] mb-1 flex items-start leading-tight">
                          <span className="mr-1 shrink-0">📍</span>
                          <span className="break-words">{loc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Departure & Amount */}
                <div className="flex items-end border-b border-[#000000]/20 pb-1">
                  <div className="flex items-center flex-1">
                    <span className="w-24 md:w-32 text-[#000000]/80 text-[10px] md:text-xs flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Departure:
                    </span>
                    <span className="font-bold text-[#000000]">{dateStr} | {timeStr}</span>
                  </div>
                  <div className="flex items-center ml-4">
                    <span className="w-12 md:w-16 text-[#000000]/80 text-[10px] md:text-xs">Fare:</span>
                    <span className="font-bold text-[#000000]">₹{booking.totalAmount}</span>
                  </div>
                </div>
                
                {/* PhonePe TXN (Made more prominent) */}
                {booking.phonepeTransactionId && (
                  <div className="flex items-center pt-2">
                    <span className="w-24 md:w-32 text-[#000000]/80 text-[10px] md:text-xs flex items-center gap-1 font-bold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      PhonePe TXN:
                    </span>
                    <span className="font-mono font-bold text-[#000000] text-[11px] md:text-xs tracking-wider bg-[#ffffff]/30 px-2 py-0.5 rounded shadow-sm">{booking.phonepeTransactionId}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-3 md:mt-4 flex items-center justify-center gap-2 md:gap-4">
                <div className="h-px w-12 md:w-24 bg-[#000000]"></div>
                <span className="text-lg md:text-xl text-[#000000]" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive" }}>Enjoy Your Trip!</span>
                <div className="h-px w-12 md:w-24 bg-[#000000]"></div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="w-[30%] relative p-3 sm:p-4 md:p-5 flex flex-col items-center justify-center ">
            
            {/* Elegant Inner Border */}
            <div className="absolute inset-2 md:inset-3 border border-[#000000]/30 rounded pointer-events-none z-0">
              <div className="absolute inset-1 border border-[#000000]/10 rounded pointer-events-none z-0"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
              {isExpired && (
                <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-[#111827] text-[#F28500] text-sm font-black uppercase px-3 py-1 rounded shadow-lg -rotate-12 border-2 border-[#F28500]">EXPIRED</span>
                </div>
              )}
              
              {/* Status / Timer with Border */}
              <div className={`mb-2 text-center flex flex-col items-center gap-1 border-2 p-1.5 rounded-lg shadow-sm bg-[#ffffff]/40 ${!isExpired ? 'border-[#22C55E]' : 'border-[#F28500]'}`}>
                {!isExpired && (
                   <span className="bg-green-600 text-[#111827] text-sm font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                     Active 
                   </span>
                )}
                {!isExpired ? (
                  <span className="text-[11px] md:text-xs font-black text-green-700 uppercase tracking-widest whitespace-nowrap">{timeRemainingStr}</span>
                ) : (
                  <span className="text-[11px] md:text-xs font-black text-[#F28500] uppercase tracking-widest bg-[#ffffff] px-2 py-0.5 rounded whitespace-nowrap">Validity Ended</span>
                )}
              </div>

              <div className="flex gap-4 items-center">
                <QRCodeSVG 
                  value={qrValue} 
                  size={100} 
                  fgColor="#000000" 
                  bgColor="transparent"
                  level="H"
                  className="w-20 h-20 md:w-28 md:h-28"
                />
                {/* Barcode lines simulation on the side */}
                <div className="flex flex-col gap-[2px] opacity-80 mix-blend-multiply">
                   {Array(30).fill(null).map((_, i) => (
                     <div key={i} className="bg-[#000000] h-[3px]" style={{ width: `${Math.random() * 12 + 8}px` }} />
                   ))}
                   <div className="text-[6px] rotate-90 transform origin-left whitespace-nowrap mt-2 ml-1 text-[#000000] font-mono tracking-tighter">
                      {ticketNo}
                   </div>
                </div>
              </div>

              <div className="mt-8 text-center text-[#000000]">
                <span className="text-sm">Ticket No: </span>
                <span className="font-bold text-lg ml-1 tracking-wider">{ticketNo}</span>
              </div>
            </div>
          </div>

      </div>
    </div>
  );
}

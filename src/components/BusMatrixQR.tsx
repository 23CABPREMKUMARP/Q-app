"use client";

import React from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";

interface BusMatrixQRProps {
  busCode: string;
  busId: string;
}

export const BusMatrixQR = ({ busCode, busId }: BusMatrixQRProps) => {
  // The URL that the QR code will point to
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/live-map?busId=${busId}`;

  return (
    <div className="w-full max-w-sm mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full aspect-[716/1024] rounded-3xl overflow-hidden shadow-2xl bg-black"
      >
        {/* Background Template */}
        <Image 
          src="/bus-qr-template.jpeg" 
          alt="Smart Tamizha Bus QR" 
          fill 
          className="object-cover"
          priority
        />

        {/* QR Code Container (positioned over the white square) */}
        <div className="absolute top-[26%] right-[11.5%] w-[42%] aspect-square flex items-center justify-center p-1 bg-white">
          <QRCodeSVG 
            value={bookingUrl}
            size={1024} // large enough to scale down smoothly
            level="H"
            includeMargin={false}
            className="w-full h-full"
          />
        </div>

        {/* Bus Code Container (positioned over the white ticket stub) */}
        <div className="absolute bottom-[13.5%] right-[9%] w-[46%] h-[4.5%] flex items-center justify-center">
           <span className="text-[#1A0B00] font-black text-lg md:text-xl xl:text-2xl tracking-[0.2em]">{busCode}</span>
        </div>
      </motion.div>
    </div>
  );
};

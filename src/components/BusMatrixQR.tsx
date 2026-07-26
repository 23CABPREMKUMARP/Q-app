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
  const bookingUrl = typeof window !== 'undefined' ? `${window.location.origin}/live-map?busId=${busId}` : '';

  return (
    <div className="w-full max-w-sm mx-auto flex justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full aspect-[714/1024] rounded-2xl overflow-hidden shadow-2xl bg-[#FF6D00]"
      >
        <Image 
          src="/qr-template.jpeg" 
          alt="Scan QR to Book" 
          fill 
          className="object-cover"
          priority
        />
        
        {/* QR Code Container - Positioned over the white square */}
                      <div className="absolute overflow-hidden" style={{ top: "26.3%", right: "8.5%", width: "40.5%", aspectRatio: "1/1" }}>
                        <div className="w-full h-full bg-white p-[6%]">
                          <QRCodeSVG 
                            value={bookingUrl}
                            style={{ width: "100%", height: "100%" }}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                      </div>

        {/* Bus Code Text - Positioned over the white rectangle in the ticket */}
                      <div className="absolute flex items-center justify-center" style={{ top: "80.5%", right: "6%", width: "43%", height: "5.5%" }}>
                        <span className="text-[#1A0B00] font-black tracking-widest text-[clamp(12px,4vw,22px)] text-center w-full">
                          {busCode}
                        </span>
                      </div>
      </motion.div>
    </div>
  );
};

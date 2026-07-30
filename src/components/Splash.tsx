"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Splash() {
  return (
    <div className="fixed inset-0 z-[5000] bg-[#000000] flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Desktop Video */}
        <video 
          src="/videos/web-loading.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="hidden md:block w-full h-full object-cover pointer-events-none" 
          style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
        />
        {/* Mobile Video - Use transparent poster to prevent play button flash */}
        <div className="block md:hidden w-full h-full relative flex items-center justify-center bg-black">
          <video 
            src="/upscaled-video (3).mp4" 
            autoPlay 
            muted 
            loop 
            playsInline
            controls={false}
            preload="auto"
            poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            className="w-full h-full object-cover object-[60%_center] pointer-events-none [&::-webkit-media-controls]:hidden" 
            style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
          />
        </div>
      </motion.div>
    </div>
  );
}

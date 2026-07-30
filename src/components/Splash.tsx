"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Splash() {
  const [playFailed, setPlayFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise.catch(error => {
          // Autoplay was blocked, usually by Low Power Mode.
          // Hide the video immediately to prevent the big play button.
          setPlayFailed(true);
        });
      }
    }
  }, []);

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
        {/* Mobile View */}
        <div className="block md:hidden w-full h-full relative flex items-center justify-center bg-black">
          {playFailed ? (
            <div className="flex flex-col items-center justify-center animate-pulse">
              <Image src="/smart-tamizha-logo.png" alt="Smart Tamizha" width={180} height={180} className="object-contain" priority />
            </div>
          ) : (
            <video 
              ref={videoRef}
              src="/upscaled-video.mp4" 
              autoPlay 
              muted 
              loop 
              playsInline 
              controls={false}
              className="w-full h-full object-cover object-[60%_center] pointer-events-none" 
              style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
            />
          )}
        </div>
        <style jsx global>{`
          video::-webkit-media-controls {
            display: none !important;
          }
          video::-webkit-media-controls-start-playback-button {
            display: none !important;
            -webkit-appearance: none !important;
          }
        `}</style>
      </motion.div>
    </div>
  );
}

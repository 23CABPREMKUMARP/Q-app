"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Image as ImageIcon, Flashlight, Camera, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const mountedRef = useRef(true);
  const scannerRef = useRef<any>(null);
  const isStartingRef = useRef(false);

  useEffect(() => {
    let html5QrCode: any = null;
    mountedRef.current = true;

    const startScanner = async () => {
      if (!mountedRef.current || isStartingRef.current) return;
      
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {}
        scannerRef.current = null;
      }

      isStartingRef.current = true;
      setError(null);
      
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        const config = { 
          fps: 15, 
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
          }
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            if (mountedRef.current) {
               onScan(decodedText);
               if (scanner.isScanning) {
                 scanner.stop().catch(() => {});
               }
            }
          },
          () => {} 
        );
      } catch (err: any) {
        if (!mountedRef.current) return;
        if (err?.name === "NotAllowedError" || err?.toString().includes("Permission denied")) {
          setError("CAMERA PERMISSION DENIED");
        } else {
          const errMsg = err?.toString() || "";
          if (!errMsg.includes("interrupted by a call to pause") && err?.name !== "AbortError") {
            setError("HARDWARE ERROR");
            setTimeout(() => { if (mountedRef.current) startScanner(); }, 5000);
          }
        }
      } finally {
        isStartingRef.current = false;
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      const html5QrCode = scannerRef.current;
      if (html5QrCode) {
        const shutdown = async () => {
          try {
            if (html5QrCode?.isScanning) {
              await html5QrCode.stop();
              html5QrCode.clear();
            }
          } catch (e) {}
          scannerRef.current = null;
        };
        shutdown();
      }
    };
  }, [onScan]);

  const toggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const isTorchOn = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: isTorchOn }]
      });
      setTorchOn(isTorchOn);
    } catch (err) {
      console.error("Torch not supported", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      alert("No QR code found in this image.");
      if (mountedRef.current && scannerRef.current) {
        scannerRef.current.start({ facingMode: "environment" }, { fps: 15 }, onScan, () => {});
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] bg-[#ffffff] border border-[#E5E7EB] text-[#F28500] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Full Screen Camera View */}
      <div id="reader" className="absolute inset-0 w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
      
      {/* Dark Overlay using box-shadow on the scan area */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        {/* Transparent Scan Area with massive shadow for overlay */}
        <div className="relative w-[280px] h-[280px] shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded-[32px]">
          {/* Saffron Corners */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-[6px] border-l-[6px] border-[#F28500] rounded-tl-[32px]" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-[6px] border-r-[6px] border-[#F28500] rounded-tr-[32px]" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[6px] border-l-[6px] border-[#F28500] rounded-bl-[32px]" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[6px] border-r-[6px] border-[#F28500] rounded-br-[32px]" />
          
          {/* Animated Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#F28500] shadow-[0_0_20px_rgba(255,153,51,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
        </div>
      </div>

      {error && (
        <div className="absolute z-20 flex flex-col items-center justify-center bg-[#ffffff]/90 backdrop-blur-md backdrop-blur-md rounded-2xl p-6 text-center gap-4 m-8">
          <Camera size={32} className="text-[#F28500]" />
          <p className="text-sm font-bold text-[#F28500] max-w-[200px]">{error}</p>
          <button onClick={onClose} className="px-6 py-2 bg-[#F28500] text-[#F28500] rounded-full font-black text-xs uppercase tracking-widest">Close</button>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-12 right-6 z-20">
        <button 
          onClick={onClose}
          className="w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-[#E5E7EB]"
        >
          <X size={24} className="text-[#F28500]" />
        </button>
      </div>
      
      {/* Top Left: Logo & Manual Entry */}
      <div className="absolute top-12 left-6 z-20 flex flex-col gap-4 items-start">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-[#E5E7EB]">
          <img src="/logo2.png" alt="Digi Bus" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#F28500] leading-none tracking-tight">DIGI <span className="text-[#F28500]">BUS</span></span>
            <span className="text-[8px] font-bold text-[#F28500]/70 tracking-widest uppercase">Scanner</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowManual(!showManual)}
          className="h-10 px-4 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center gap-2 transition-all border border-[#E5E7EB] text-[#F28500] font-bold text-[10px] uppercase tracking-widest"
        >
          <Keyboard size={14} />
          {showManual ? "Hide" : "Bus Code"}
        </button>
      </div>

      {/* Manual Input Overlay */}
      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-28 left-6 right-6 z-30"
          >
            <div className="bg-[#ffffff]/80 backdrop-blur-md backdrop-blur-md p-4 rounded-2xl border border-[#E5E7EB]">
              <input 
                type="text"
                autoFocus
                placeholder="ENTER BUS CODE (e.g. 1024)"
                className="w-full bg-[#ffffff] border border-[#E5E7EB] text-[#F28500] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#F28500] font-black text-sm uppercase tracking-widest placeholder:text-[#F28500]/40 focus:outline-none focus:border-[#F28500] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) onScan(val);
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="absolute bottom-16 z-20 w-full px-16 flex justify-between items-center max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-3">
          <label className="w-16 h-16 bg-[#ffffff] border border-[#E5E7EB] text-[#F28500] hover:bg-[#ffffff]/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all cursor-pointer border border-[#E5E7EB]">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <ImageIcon size={24} className="text-[#F28500]" />
          </label>
          <span className="text-[#F28500] text-xs font-bold tracking-widest uppercase">Upload QR</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button 
            onClick={toggleTorch}
            className={`w-16 h-16 \${torchOn ? 'bg-[#ffffff] text-[#F28500]' : 'bg-[#ffffff] border border-[#E5E7EB] text-[#F28500] text-[#F28500]'} hover:bg-[#ffffff]/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-[#E5E7EB]`}
          >
            <Flashlight size={24} />
          </button>
          <span className="text-[#F28500] text-xs font-bold tracking-widest uppercase">Torch</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QRScanner;

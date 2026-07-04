import React from 'react';

export const WatermarkOverlay = ({ text = "JEFFBEN PROTECTED" }: { text?: string }) => {
  // We generate an array of texts to tile the background
  const tileArray = Array(50).fill(text);
  
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none flex flex-wrap justify-center items-center opacity-[0.03] overflow-hidden mix-blend-overlay">
      <div className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 transform -rotate-45 flex flex-wrap gap-8 justify-center items-center pointer-events-none">
        {tileArray.map((t, i) => (
          <span 
            key={i} 
            className="text-[#ffffff] text-2xl font-black uppercase tracking-[0.5em] whitespace-nowrap"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

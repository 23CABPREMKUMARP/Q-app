const fs = require('fs');

const files = [
  'app/town-bus/page.tsx',
  'src/components/BusMatrixQR.tsx',
  'app/town-bus/[tripId]/seat-selection/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix QR Code Container
  content = content.replace(
    /\{\/\* QR Code Container[\s\S]*?<QRCodeSVG[\s\S]*?\/>\s*<\/div>\s*<\/div>/g,
    `{/* QR Code Container - Positioned over the white square */}
                      <div className="absolute overflow-hidden" style={{ top: "26.3%", right: "8.5%", width: "40.5%", aspectRatio: "1/1" }}>
                        <div className="w-full h-full bg-white p-[6%]">
                          <QRCodeSVG 
                            value={${file.includes('BusMatrixQR') ? 'bookingUrl' : '`https://jeffben.org/bus/${trip?.busCode || trip?.busNumber || tripId || trip.busId.busCode}`'}}
                            style={{ width: "100%", height: "100%" }}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                      </div>`
  );
  
  // Fix Bus Code text
  content = content.replace(
    /\{\/\* Bus Code Text[\s\S]*?<\/span>\s*<\/div>/g,
    `{/* Bus Code Text - Positioned over the white rectangle in the ticket */}
                      <div className="absolute flex items-center justify-center" style={{ top: "80.5%", right: "6%", width: "43%", height: "5.5%" }}>
                        <span className="text-[#1A0B00] font-black tracking-widest text-[clamp(12px,4vw,22px)] text-center w-full">
                          {${file.includes('BusMatrixQR') ? 'busCode' : 'trip?.busCode || trip?.busNumber || tripId || trip.busId.busCode'}}
                        </span>
                      </div>`
  );

  fs.writeFileSync(file, content);
}
console.log("Fixed files!");

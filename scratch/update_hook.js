const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src/hooks/useBusRealtime.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetSubscribe = `    if (busId) {
      // Single bus tracking
      subscribeToChannel(busId);

      // Initial poll to get last known position immediately
      pollGPSStatus(busId);

      // Fallback poll in case realtime is down
      pollTimerRef.current = setInterval(() => {
        if (!isConnected) {
          pollGPSStatus(busId);
        }
      }, pollFallbackMs);
    }`;

const replacementSubscribe = `    if (busId) {
      // Single bus tracking
      subscribeToChannel(busId);

      // Initial poll to get last known position immediately
      pollGPSStatus(busId);

      // Fallback poll in case realtime is down
      pollTimerRef.current = setInterval(() => {
        if (!isConnected) {
          pollGPSStatus(busId);
        }
      }, pollFallbackMs);
    } else {
      // Fleet tracking
      subscribeToChannel("fleet");
      
      // We don't poll /api/gps/status for all buses constantly to avoid spam.
      // But we can do an initial fetch for all buses if needed, or rely on the main page fetching /api/buses once.
    }`;

content = content.replace(targetSubscribe, replacementSubscribe);

fs.writeFileSync(filePath, content);
console.log("Done updating useBusRealtime");

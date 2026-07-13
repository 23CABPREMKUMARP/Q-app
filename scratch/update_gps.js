const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src/hooks/useGPS.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('@capacitor/geolocation')) {
  // Add imports
  content = `import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
` + content;
}

// In the useEffect where we start watching:
//     if (!("geolocation" in navigator)) {
//       setGpsState((prev) => ({ ...prev, status: "error", errorMessage: "Geolocation not supported" }));
//       onError?.("Geolocation not supported by this device.");
//       return;
//     }
// 
//     // Start watching position
//     watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {

const targetBlock = `    if (!("geolocation" in navigator)) {
      setGpsState((prev) => ({ ...prev, status: "error", errorMessage: "Geolocation not supported" }));
      onError?.("Geolocation not supported by this device.");
      return;
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: GPS_TIMEOUT_MS,
      maximumAge: GPS_MAX_AGE_MS,
    });`;

const replacementBlock = `    const startWatching = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const perm = await Geolocation.checkPermissions();
          if (perm.location !== 'granted') {
            const req = await Geolocation.requestPermissions();
            if (req.location !== 'granted') {
              handleError({ code: 1, message: 'Permission denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as any);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Capacitor Geolocation check failed, falling back to HTML5", e);
      }

      if (!("geolocation" in navigator)) {
        setGpsState((prev) => ({ ...prev, status: "error", errorMessage: "Geolocation not supported" }));
        onError?.("Geolocation not supported by this device.");
        return;
      }

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        timeout: GPS_TIMEOUT_MS,
        maximumAge: GPS_MAX_AGE_MS,
      });
    };
    
    startWatching();`;

content = content.replace(targetBlock, replacementBlock);

fs.writeFileSync(filePath, content);
console.log('Done');

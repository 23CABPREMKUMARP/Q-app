const fs = require('fs');

const pageFile = '/Users/premkumar/Downloads/webpage of jeff ben copy 2/app/live-map/page.tsx';
let page = fs.readFileSync(pageFile, 'utf8');

// 1. Remove setLoading calls
page = page.replace(/setLoading\(false\);/g, '');
page = page.replace(/if \(loading\) return <MapLoadingSkeleton \/>;/g, '');

// 2. Remove showNearbyOnly usages
page = page.replace(/setShowNearbyOnly\(false\);/g, '');
// Replace filteredBuses logic
const filteredBusesRegex = /const filteredBuses = useMemo\(\(\) => \{[\s\S]*?\}, \[buses, userLocation, showNearbyOnly, nearbyRadius\]\);/m;
page = page.replace(filteredBusesRegex, `const filteredBuses = buses;
  const nearbyBusIds = useMemo(() => {
    if (!userLocation) return [];
    return buses.filter(bus => 
      getDistance(userLocation.lat, userLocation.lng, bus.location.lat, bus.location.lng) <= nearbyRadius
    ).map(b => b._id);
  }, [buses, userLocation, nearbyRadius]);`);

// 3. Remove showNearbyOnly from the Auto-Navigate useEffect
page = page.replace(/if \(showNearbyOnly && userLocation && nearestBus && !isNavigating\) \{/g, `if (userLocation && nearestBus && !isNavigating && !navTarget) {`);
page = page.replace(/\}, \[showNearbyOnly, userLocation, nearestBus, isNavigating\]\);/g, `}, [userLocation, nearestBus, isNavigating, navTarget]);`);

// 4. Update LiveBusMap props to pass nearbyBusIds
page = page.replace(/selectedBusId=\{selectedBus\?._id\}/, `selectedBusId={selectedBus?._id}\n            nearbyBusIds={nearbyBusIds}`);

// 5. Remove the bottom navigation block (Lines around 913 to 1010)
// It starts with {/* Bottom Navigation Panel (Overhauled Map Mode) */}
const bottomNavRegex = /\{\/\* Bottom Navigation Panel \(Overhauled Map Mode\) \*\/\}[\s\S]*?(?=\{\/\* Nearest Bus Intelligence Card \*\/\})/m;
page = page.replace(bottomNavRegex, '');

// 6. Fix Right Side Controls Reset button
page = page.replace(/\(showNearbyOnly \|\| isNavigating \|\| selectedBus\)/, `(isNavigating || selectedBus)`);

// 7. Add Location Permission Wrapper around the return
const returnRegex = /return \([\s\S]*?<motion\.main[\s\S]*?className="h-\[100dvh\] w-full flex flex-col bg-zinc-50 overflow-hidden font-sans text-zinc-900 relative"[\s\S]*?>/;

if (page.includes('!isAuthorizedToTrack')) {
  page = page.replace(/if \(!isAuthorizedToTrack\) \{[\s\S]*?return \([\s\S]*?\}[\s\S]*?return \(/, `
  if (!isAuthorizedToTrack) {
    return (
      <main className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.1),transparent_60%)]" />
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-500 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">Access Restricted</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[#FF9933]">Confirmed Passengers Only</p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time live location tracking and telemetry details for this vehicle are private. Please book a pass or verify your payment status to retrieve active live positioning coordinates.
          </p>
          <div className="pt-4 space-y-2">
            <Link 
              href="/"
              className="w-full py-4 bg-[#FF9933] hover:bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
            >
              Go to Home Screen
            </Link>
            <Link 
              href="/get-ticket"
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Retrieve Ticket Pass
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!hasLocationPermission) {
    return (
      <main className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_60%)]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl relative z-10"
        >
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
            <Navigation size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">Location Required</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Allow location access to find nearby buses and improve live tracking.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      setCenterOn({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 15, pitch: 45, bearing: 0 });
                      setHasLocationPermission(true);
                    },
                    (err) => {
                      setHasLocationPermission(true); // Proceed anyway on error, map will handle it
                    }
                  );
                } else {
                  setHasLocationPermission(true);
                }
              }}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
            >
              Enable Location
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (`);
}

fs.writeFileSync(pageFile, page);

// Update LiveBusMap.tsx
const mapFile = '/Users/premkumar/Downloads/webpage of jeff ben copy 2/src/components/map/LiveBusMap.tsx';
let mapContent = fs.readFileSync(mapFile, 'utf8');

// Add nearbyBusIds to props
mapContent = mapContent.replace(/selectedBusId\?: string \| null,/g, `selectedBusId?: string | null, nearbyBusIds?: string[],`);
mapContent = mapContent.replace(/selectedBusId\?: string \| null;/g, `selectedBusId?: string | null; nearbyBusIds?: string[];`);

// Update marker rendering
mapContent = mapContent.replace(/const isSelected = selectedBusId === bus._id;/g, `const isSelected = selectedBusId === bus._id;
      const isNearby = nearbyBusIds?.includes(bus._id) || false;`);

mapContent = mapContent.replace(/<BusMarker rotationDegrees=\{bus.location.rotation\} isRunning=\{isRunning\} busNumber=\{bus.busNumber\} isSelected=\{isSelected\} mapBearing=\{mapBearing\}/g, `<BusMarker rotationDegrees={bus.location.rotation} isRunning={isRunning} busNumber={bus.busNumber} isSelected={isSelected} isNearby={isNearby} mapBearing={mapBearing}`);

mapContent = mapContent.replace(/cache\.isSelected !== isSelected \|\|/g, `cache.isSelected !== isSelected || cache.isNearby !== isNearby ||`);
mapContent = mapContent.replace(/cache\.isSelected = isSelected;/g, `cache.isSelected = isSelected; cache.isNearby = isNearby;`);
mapContent = mapContent.replace(/isSelected=\{isSelected\}/g, `isSelected={isSelected} isNearby={isNearby}`);

// Update BusMarker signature and styling
mapContent = mapContent.replace(/const BusMarker = React.memo\(\(\{ isRunning, busNumber, isSelected,/g, `const BusMarker = React.memo(({ isRunning, busNumber, isSelected, isNearby,`);
mapContent = mapContent.replace(/\{isSelected \? "scale-110 drop-shadow-xl" : "scale-100"\}/g, `{isSelected ? "scale-110 drop-shadow-xl" : isNearby ? "scale-105 drop-shadow-lg" : "scale-100"}`);

// Add nearby highlight ring
mapContent = mapContent.replace(/\{isSelected && \(\s*<div className="absolute -inset-1 rounded-full border-\[3px\] border-orange-500 shadow-\[0_0_20px_rgba\(255,107,0,0\.5\)\] md:shadow-\[0_0_40px_rgba\(255,107,0,0\.8\)\] animate-pulse" \/>\s*\)\}/, `{isSelected && (
          <div className="absolute -inset-1 rounded-full border-[3px] border-orange-500 shadow-[0_0_20px_rgba(255,107,0,0.5)] md:shadow-[0_0_40px_rgba(255,107,0,0.8)] animate-pulse" />
        )}
        {!isSelected && isNearby && (
          <div className="absolute -inset-1 rounded-full border-[2px] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
        )}`);

// Remove Synchronizing loading state
const syncRegex = /\{\!mapLoaded && \([\s\S]*?<\/div>[\s\S]*?\)\}/m;
mapContent = mapContent.replace(syncRegex, '');

fs.writeFileSync(mapFile, mapContent);
console.log("Updated files!");

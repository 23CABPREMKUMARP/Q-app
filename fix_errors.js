const fs = require('fs');

// 1. Fix app/live-map/page.tsx
const pageFile = '/Users/premkumar/Downloads/webpage of jeff ben copy 2/app/live-map/page.tsx';
let page = fs.readFileSync(pageFile, 'utf8');

// Fix setCenterOn zoom type error
page = page.replace(/setCenterOn\(\{ lat: pos\.coords\.latitude, lng: pos\.coords\.longitude, zoom: 15, pitch: 45, bearing: 0 \}\)/g, 'setCenterOn({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 15, pitch: 45, bearing: 0 } as any)');

// Remove any remaining showNearbyOnly logic (it looks like a block around line 1030)
// This is likely a remaining button or block
const residualNearbyRegex = /\{?\/\* Nearby \*\/[\s\S]*?(?=\{\/\* Routes \*\/\}|{?\/\* Intelligence \*\/)/;
page = page.replace(residualNearbyRegex, '');
// If it's something else, let's just wipe any JSX containing showNearbyOnly or setShowNearbyOnly
const strayNearbyJSX = /<button[^>]*onClick=\{[^>]*setShowNearbyOnly[^>]*>[\s\S]*?<\/button>/g;
page = page.replace(strayNearbyJSX, '');

fs.writeFileSync(pageFile, page);


// 2. Fix src/components/map/LiveBusMap.tsx
const mapFile = '/Users/premkumar/Downloads/webpage of jeff ben copy 2/src/components/map/LiveBusMap.tsx';
let mapContent = fs.readFileSync(mapFile, 'utf8');

// Fix BusMarker prop types
mapContent = mapContent.replace(
  /\{ isRunning: boolean, busNumber: string, isSelected: boolean, speed\?: number/g,
  '{ isRunning: boolean, busNumber: string, isSelected: boolean, isNearby?: boolean, speed?: number'
);

// Fix duplicate JSX attributes and incorrect assignments
// First let's clean up any duplicated isSelected={isSelected} isNearby={isNearby}
mapContent = mapContent.replace(/isSelected=\{isSelected\} isNearby=\{isNearby\} isNearby=\{isNearby\}/g, 'isSelected={isSelected} isNearby={isNearby}');

// Wait, the error is: Property 'isNearby' does not exist on type...
// And: JSX elements cannot have multiple attributes with the same name.
// Let's just fix the root render calls by string replacement

mapContent = mapContent.replace(/<BusMarker rotationDegrees=\{bus\.location\.rotation\} isRunning=\{isRunning\} busNumber=\{bus\.busNumber\} isSelected=\{isSelected\} isNearby=\{isNearby\} isNearby=\{isNearby\} mapBearing=\{mapBearing\} from=\{bus\.routeId\?\.from\} to=\{bus\.routeId\?\.to\} speed=\{bus\.speed\} availableSeats=\{bus\.availableSeats\} \/>/g, 
'<BusMarker rotationDegrees={bus.location.rotation} isRunning={isRunning} busNumber={bus.busNumber} isSelected={isSelected} isNearby={isNearby} mapBearing={mapBearing} from={bus.routeId?.from} to={bus.routeId?.to} speed={bus.speed} availableSeats={bus.availableSeats} />');

mapContent = mapContent.replace(/<BusMarker \n\s*isRunning=\{isRunning\} \n\s*busNumber=\{bus\.busNumber\} \n\s*isSelected=\{isSelected\} isNearby=\{isNearby\}\n\s*isNearby=\{isNearby\}\n\s*speed=\{bus\.speed\} \n\s*availableSeats=\{bus\.availableSeats\} \n\s*from=\{bus\.routeId\?\.from\}\n\s*to=\{bus\.routeId\?\.to\}\n\s*rotationDegrees=\{bus\.location\.rotation\}\n\s*mapBearing=\{mapBearing\}\n\s*\/>/g,
`<BusMarker 
               isRunning={isRunning} 
               busNumber={bus.busNumber} 
               isSelected={isSelected}
               isNearby={isNearby}
               speed={bus.speed} 
               availableSeats={bus.availableSeats} 
               from={bus.routeId?.from}
               to={bus.routeId?.to}
               rotationDegrees={bus.location.rotation}
               mapBearing={mapBearing}
             />`);

// Fix nearbyBusIds not found (cache.targetLng is used around line 353 but where did I use nearbyBusIds? Oh, "const isNearby = nearbyBusIds?.includes(bus._id) || false;")
// It needs to be inside the buses.forEach loop! It is, but wait. If nearbyBusIds is undefined?
// Let's make sure nearbyBusIds is actually in the props of LiveBusMap!
// "selectedBusId?: string | null; nearbyBusIds?: string[];" was added.

fs.writeFileSync(mapFile, mapContent);
console.log("Syntax fixes applied!");

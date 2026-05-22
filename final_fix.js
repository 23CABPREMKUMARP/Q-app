const fs = require('fs');

// 1. Fix app/live-map/page.tsx
const pageFile = '/Users/premkumar/Downloads/webpage of jeff ben copy 2/app/live-map/page.tsx';
let page = fs.readFileSync(pageFile, 'utf8');

// The Nearby button is inside the bottom navigation which I thought I removed entirely?
// Let's force remove the exact lines that contain showNearbyOnly
const lines = page.split('\n');
const newLines = lines.filter(line => !line.includes('showNearbyOnly') && !line.includes('setShowNearbyOnly'));
fs.writeFileSync(pageFile, newLines.join('\n'));

// 2. Fix src/components/map/LiveBusMap.tsx
const mapFile = '/Users/premkumar/Downloads/webpage of jeff ben copy 2/src/components/map/LiveBusMap.tsx';
let mapContent = fs.readFileSync(mapFile, 'utf8');

// Add nearbyBusIds to the destructuring
mapContent = mapContent.replace(/selectedBusId, layers/g, 'selectedBusId, nearbyBusIds, layers');

fs.writeFileSync(mapFile, mapContent);
console.log("Final syntax fixes applied!");

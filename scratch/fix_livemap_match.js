const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src/components/map/LiveBusMap.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// We need to replace:
// const live = livePositions[b._id];
// With:
// const live = livePositions[b._id] || livePositions[b.busCode] || livePositions[b.busNumber];

content = content.replace(
  `        const live = livePositions[b._id];`,
  `        const live = livePositions[b._id] || livePositions[b.busCode as string] || livePositions[b.busNumber as string];`
);

// We need to replace:
// livePos={livePositions[bus._id] || null}
// With:
// livePos={livePositions[bus._id] || livePositions[bus.busCode as string] || livePositions[bus.busNumber as string] || null}

content = content.replace(
  `              livePos={livePositions[bus._id] || null}`,
  `              livePos={livePositions[bus._id] || livePositions[bus.busCode as string] || livePositions[bus.busNumber as string] || null}`
);

fs.writeFileSync(filePath, content);
console.log("Done");

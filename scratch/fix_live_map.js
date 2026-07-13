const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'app/live-map/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Replace: const [buses] = useState<BusData[]>([]); // buses intentionally empty on live map
// With:
const searchString = `const [buses] = useState<BusData[]>([]); // buses intentionally empty on live map`;
const replacementString = `const [buses, setBuses] = useState<BusData[]>([]); // Real buses fetched from DB`;

content = content.replace(searchString, replacementString);

// 2. We need to add the useEffect to fetch buses. We'll add it right before the useBusRealtime hook, or after.
// Let's find: const liveCount = Object.values(livePositions).filter((p) => p.deviceStatus === "Online").length;
const fetchHookTarget = `  const liveCount = Object.values(livePositions).filter((p) => p.deviceStatus === "Online").length;`;
const fetchHookReplacement = `  const liveCount = Object.values(livePositions).filter((p) => p.deviceStatus === "Online").length;

  // ── Fetch Buses ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch("/api/buses");
        const data = await res.json();
        if (Array.isArray(data)) {
          setBuses(data);
        }
      } catch (err) {
        console.error("Failed to fetch buses for live map:", err);
      }
    };
    fetchBuses();
  }, []);
`;

content = content.replace(fetchHookTarget, fetchHookReplacement);

fs.writeFileSync(targetPath, content);
console.log('Done');

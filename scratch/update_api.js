const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app/api/gps/update/route.ts');
let content = fs.readFileSync(filePath, 'utf8');

const target = `    // Broadcast via Supabase Realtime to all listening passengers
    await supabase.channel(\`gps:\${busId}\`).send({
      type: "broadcast",
      event: "location",
      payload: {
        busId,
        ...locationPayload,
        timestamp: now,
        deviceStatus: "Online",
      },
    });`;

const replacement = `    // Broadcast via Supabase Realtime to all listening passengers
    const payload = {
      busId,
      ...locationPayload,
      timestamp: now,
      deviceStatus: "Online",
    };

    await supabase.channel(\`gps:\${busId}\`).send({
      type: "broadcast",
      event: "location",
      payload
    });

    // Also broadcast to the global fleet channel
    await supabase.channel(\`gps:fleet\`).send({
      type: "broadcast",
      event: "location",
      payload
    });`;

content = content.replace(target, replacement);

fs.writeFileSync(filePath, content);
console.log("Done updating API route");

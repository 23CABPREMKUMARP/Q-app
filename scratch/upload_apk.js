const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// We need to parse .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function upload() {
  const filePath = path.join(__dirname, '..', 'public', 'DigiBus-App.apk');
  const file = fs.readFileSync(filePath);
  
  console.log("Uploading to 'downloads' bucket...");
  const { data, error } = await supabase.storage.from('downloads').upload('DigiBus-App.apk', file, {
    contentType: 'application/vnd.android.package-archive',
    upsert: true
  });
  
  if (error) {
    console.error("Upload error:", error);
  } else {
    console.log("Upload success:", data);
  }
}
upload();

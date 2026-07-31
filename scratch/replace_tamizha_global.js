const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', '.git', '.next', 'scratch', 'android/app/build', 'DigiBusStandNativeApp/android'];
const FILES_TO_PROCESS_IN_ROOT = ['package.json', 'README.md', 'capacitor.config.ts', 'proxy.ts', 'app.json'];

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.some(ignored => fullPath.includes(ignored))) {
        processDirectory(fullPath);
      }
    } else {
      if (entry.name.endsWith('.js') || entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || 
          entry.name.endsWith('.json') || entry.name.endsWith('.html') || entry.name.endsWith('.xml') ||
          entry.name.endsWith('.md') || entry.name.endsWith('.webmanifest')) {
        processFile(fullPath);
      }
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace text
  content = content.replace(/Smart Thamizha/g, 'Smart Tamizha');
  content = content.replace(/SMART THAMIZHA/g, 'SMART TAMIZHA');
  content = content.replace(/smart-thamizha/g, 'smart-tamizha');

  // Replace logo
  content = content.replace(/logo2\.png/g, 'smart-tamizha-logo.png');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Process specific root files
FILES_TO_PROCESS_IN_ROOT.forEach(file => {
  if (fs.existsSync(file)) {
    processFile(file);
  }
});

// Process directories
['app', 'src', 'public', 'DigiBusStandNativeApp', 'android/app/src/main/res/values'].forEach(dir => {
  processDirectory(dir);
});

console.log("Done.");

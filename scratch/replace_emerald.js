const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== 'scratch' && f !== 'android' && f !== 'DigiBusStandNativeApp') {
        walk(dirPath, callback);
      }
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css')) {
        callback(dirPath);
      }
    }
  });
};

const exactMap = {
  '#10B981': '#F28500',
  '#10b981': '#F28500',
  '#8B1E2E': '#F28500',
  '#8b1e2e': '#F28500',
  '#800000': '#F28500',
  '#800000': '#F28500'
};

let filesModified = 0;

const applyReplacements = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Exact hex mapping
  for (const [key, value] of Object.entries(exactMap)) {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedKey, 'g');
    content = content.replace(regex, value);
  }

  // Tailwind emerald mapping
  content = content.replace(/emerald-500/g, '[#F28500]');
  content = content.replace(/emerald-400/g, '[#F28500]');
  content = content.replace(/emerald-600/g, '[#F28500]');
  
  // Tailwind maroon mapping (if any)
  content = content.replace(/rose-900/g, '[#F28500]');
  content = content.replace(/red-900/g, '[#F28500]');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
};

walk('./app', applyReplacements);
walk('./src', applyReplacements);

console.log(`Modified ${filesModified} files.`);

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
  '#0F172A': '#10B981',
  '#0f172a': '#10B981'
};

let filesModified = 0;

walk('./app', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Perform exact string replacements
  for (const [key, value] of Object.entries(exactMap)) {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedKey, 'g');
    content = content.replace(regex, value);
  }

  // Replace blue tailwind colors with Gold
  content = content.replace(/blue-500/g, '[#F59E0B]');
  content = content.replace(/blue-400/g, '[#F59E0B]');
  content = content.replace(/blue-600/g, '[#F59E0B]');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});

walk('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [key, value] of Object.entries(exactMap)) {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedKey, 'g');
    content = content.replace(regex, value);
  }
  
  content = content.replace(/blue-500/g, '[#F59E0B]');
  content = content.replace(/blue-400/g, '[#F59E0B]');
  content = content.replace(/blue-600/g, '[#F59E0B]');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});

console.log(`Modified ${filesModified} files.`);

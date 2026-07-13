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
  '#E8622C': '#F28500',
  '#e8622c': '#F28500',
  '#1E293B': '#0F172A',
  '#1e293b': '#0F172A'
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

  // Also replace Tailwind colors if they were used
  content = content.replace(/green-500/g, '[#22C55E]');
  content = content.replace(/green-400/g, '[#22C55E]');
  content = content.replace(/red-500/g, '[#EF4444]');
  content = content.replace(/red-400/g, '[#EF4444]');
  content = content.replace(/#10B981/ig, '#22C55E');

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
  
  content = content.replace(/green-500/g, '[#22C55E]');
  content = content.replace(/green-400/g, '[#22C55E]');
  content = content.replace(/red-500/g, '[#EF4444]');
  content = content.replace(/red-400/g, '[#EF4444]');
  content = content.replace(/#10B981/ig, '#22C55E');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});

console.log(`Modified ${filesModified} files.`);

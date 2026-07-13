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
  '#18D2C7': '#E8622C',
  '#18d2c7': '#E8622C',
  'text-black': 'text-[#111827]',
  'text-slate-700': 'text-[#6B7280]',
  'text-slate-600': 'text-[#6B7280]',
  'border-slate-200': 'border-[#E5E7EB]',
  'border-slate-300': 'border-[#E5E7EB]',
  'bg-[#ffffff]': 'bg-[#F8FAFC]'
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

  // Ensure body background is pure white in layout.tsx
  if (filePath.endsWith('layout.tsx')) {
    content = content.replace(/bg-\[#F8FAFC\]/, 'bg-[#ffffff]');
  }

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

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});

console.log(`Modified ${filesModified} files.`);

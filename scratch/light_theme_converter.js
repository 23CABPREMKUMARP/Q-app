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
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
};

const map = {
  // Backgrounds -> Light with borders
  'bg-slate-950': 'bg-[#ffffff] border border-slate-200 shadow-sm text-black',
  'bg-slate-900': 'bg-[#ffffff] border border-slate-200 shadow-sm text-black',
  'bg-zinc-950': 'bg-[#ffffff] border border-slate-200 shadow-sm text-black',
  'bg-zinc-900': 'bg-[#ffffff] border border-slate-200 shadow-sm text-black',
  'bg-zinc-800': 'bg-slate-50 border border-slate-200 shadow-sm text-black',
  'bg-[#111]': 'bg-[#ffffff] border border-slate-200 shadow-sm text-black',
  'bg-slate-800': 'bg-slate-50 border border-slate-200 text-black',
  'bg-black': 'bg-[#ffffff] border border-slate-200 text-black',
  'bg-[#ffffff]/5': 'bg-[#ffffff] border border-slate-200 shadow-sm text-black',
  'bg-[#ffffff]/10': 'bg-slate-50 border border-slate-200 text-black',
  
  // Backgrounds with opacity variations in the UI
  'bg-black/60': 'bg-[#ffffff]/80 backdrop-blur-md',
  'bg-black/80': 'bg-[#ffffff]/90 backdrop-blur-md',

  // Text colors
  'text-[#ffffff]': 'text-black',
  'text-slate-300': 'text-slate-700',
  'text-slate-400': 'text-slate-600',
  'text-zinc-100': 'text-zinc-900',
  'text-zinc-400': 'text-zinc-600',
  'text-white': 'text-black',
  
  // Borders
  'border-slate-800': 'border-slate-300',
  'border-slate-700': 'border-slate-300',
  'border-zinc-800': 'border-zinc-300',
  'border-zinc-700': 'border-zinc-300',
  'border-[#ffffff]/10': 'border-slate-200',
  'border-[#ffffff]/20': 'border-slate-300',
  'border-white/10': 'border-slate-200',
  'border-white/20': 'border-slate-300'
};

let filesModified = 0;

walk('./app', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // For complex Tailwind replacements, we can just replace the strings globally.
  // Because these are very specific Tailwind classes, it's generally safe.
  
  for (const [key, value] of Object.entries(map)) {
    // We use a regex with word boundaries for things like text-white, but some contain slashes.
    // A simple global replace works best for Tailwind classes since they are usually space-separated in className="..."
    
    // Create an escaped regex for the key
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?<=['"\`\\s])${escapedKey}(?=['"\`\\s])`, 'g');
    content = content.replace(regex, value);
  }

  // Also replace any bg-slate-50 which is root background with bg-[#ffffff]
  if (filePath.endsWith('layout.tsx')) {
     content = content.replace(/bg-slate-50/g, 'bg-[#ffffff] text-black');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});

walk('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [key, value] of Object.entries(map)) {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?<=['"\`\\s])${escapedKey}(?=['"\`\\s])`, 'g');
    content = content.replace(regex, value);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesModified++;
  }
});

console.log(`Modified ${filesModified} files.`);

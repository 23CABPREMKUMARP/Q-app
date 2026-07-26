const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /#FF5F1F/gi, replacement: '#FF6D00' },
  { regex: /#ffffff/gi, replacement: '#FFF5E6' },
  { regex: /#111827/gi, replacement: '#1A0B00' },
  { regex: /#0f172a/gi, replacement: '#1A0B00' },
  { regex: /slate-900/gi, replacement: '[#1A0B00]' },
  { regex: /zinc-900/gi, replacement: '[#1A0B00]' },
  { regex: /slate-950/gi, replacement: '[#1A0B00]' },
  { regex: /zinc-950/gi, replacement: '[#1A0B00]' },
  { regex: /gray-900/gi, replacement: '[#1A0B00]' },
  { regex: /#333333/gi, replacement: '#1A0B00' },
  { regex: /white/gi, replacement: '[#FFF5E6]' } // Wait, replacing "white" might break class names like "whitespace-nowrap" or "bg-white".
];

// Let's refine the "white" replacement:
const preciseReplacements = [
  { regex: /#FF5F1F/gi, replacement: '#FF6D00' },
  { regex: /#ffffff/gi, replacement: '#FFF5E6' },
  { regex: /#111827/gi, replacement: '#1A0B00' },
  { regex: /#0f172a/gi, replacement: '#1A0B00' },
  { regex: /text-slate-900/g, replacement: 'text-[#1A0B00]' },
  { regex: /bg-slate-900/g, replacement: 'bg-[#1A0B00]' },
  { regex: /text-zinc-900/g, replacement: 'text-[#1A0B00]' },
  { regex: /bg-zinc-900/g, replacement: 'bg-[#1A0B00]' },
  { regex: /text-slate-950/g, replacement: 'text-[#1A0B00]' },
  { regex: /bg-slate-950/g, replacement: 'bg-[#1A0B00]' },
  { regex: /text-zinc-950/g, replacement: 'text-[#1A0B00]' },
  { regex: /bg-zinc-950/g, replacement: 'bg-[#1A0B00]' },
  { regex: /#333333/gi, replacement: '#1A0B00' },
  { regex: /text-white/g, replacement: 'text-[#FFF5E6]' },
  { regex: /bg-white/g, replacement: 'bg-[#FFF5E6]' },
  { regex: /border-white/g, replacement: 'border-[#FFF5E6]' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'build' && file !== 'dist') {
        processDirectory(fullPath);
      }
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.xml') || fullPath.endsWith('.json')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        for (const { regex, replacement } of preciseReplacements) {
          content = content.replace(regex, replacement);
        }
        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Updated:', fullPath);
        }
      }
    }
  }
}

processDirectory('./app');
processDirectory('./src');
processDirectory('./android/app/src/main/res/values');
processDirectory('./'); // For capacitor.config.ts and tailwind.config.ts etc


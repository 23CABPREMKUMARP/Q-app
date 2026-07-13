const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      if (isDirectory && f !== 'node_modules' && f !== '.next' && f !== 'dist' && f !== '.expo' && f !== 'android' && f !== 'ios') {
        walk(dirPath, callback);
      } else if (!isDirectory) {
        if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.json')) {
          callback(dirPath);
        }
      }
    });
  }
};

const applyReplacements = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace CSS variables and raw hex codes
  content = content.replace(/--background:\s*#FAF6F0/gi, '--background: #ffffff');
  content = content.replace(/#FAF6F0/gi, '#ffffff');
  content = content.replace(/#F8FAFC/gi, '#ffffff');
  
  // Replace tailwind classes
  content = content.replace(/\bbg-slate-50\b/g, 'bg-white');
  content = content.replace(/\bbg-zinc-50\b/g, 'bg-white');
  content = content.replace(/\bbg-gray-50\b/g, 'bg-white');
  content = content.replace(/\bbg-neutral-50\b/g, 'bg-white');
  
  // Note: we can keep muted or secondary variables in css, but let's change them if they're used directly as background
  // Or maybe #f3f4f6 (gray-100) also needs changing if they consider it off-white, but "off white" usually means 50s.
  // I will replace bg-slate-100 and bg-zinc-100 as well since they are light greys, but wait, they said "off white", not grey. 
  // #F8FAFC is slate-50 which is definitely off-white.

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Modified', filePath);
  }
};

walk('./app', applyReplacements);
walk('./src', applyReplacements);
walk('./DigiBusStandNativeApp', applyReplacements);

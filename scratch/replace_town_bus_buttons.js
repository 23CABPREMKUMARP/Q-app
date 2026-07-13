const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      if (isDirectory) {
        walk(dirPath, callback);
      } else {
        if (f.endsWith('.tsx')) {
          callback(dirPath);
        }
      }
    });
  }
};

const applyReplacements = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace hover:bg-orange-600 with hover:bg-[#EF4444] active:bg-[#EF4444]
  // if it already has active:bg-[#EF4444] it might duplicate, so we clean it up
  content = content.replace(/hover:bg-orange-600(\s+active:bg-\[\#EF4444\])?/g, 'hover:bg-[#EF4444] active:bg-[#EF4444]');
  content = content.replace(/hover:bg-\[\#e07b1a\](\s+active:bg-\[\#EF4444\])?/g, 'hover:bg-[#EF4444] active:bg-[#EF4444]');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Modified', filePath);
  }
};

walk('./app/town-bus', applyReplacements);


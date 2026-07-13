const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replacements
      content = content.replace(/#FF9933/ig, '#8B1E2E');
      content = content.replace(/#f97316/ig, '#D4A017');
      content = content.replace(/#3b82f6/ig, '#0F6B5C');
      content = content.replace(/#10b981/ig, '#0F6B5C'); // Use Teal for both charts or use Gold for one
      content = content.replace(/#22c55e/ig, '#0F6B5C'); // Success green to Teal
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('app');
replaceInDir('src');
console.log('Hex replacements done.');

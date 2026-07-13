const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
  }
};

const replaceInFile = (filePath) => {
  if (
    filePath.endsWith('.tsx') || 
    filePath.endsWith('.ts') || 
    filePath.endsWith('.js') || 
    filePath.endsWith('.html') || 
    filePath.endsWith('.xml') || 
    filePath.endsWith('.json') ||
    filePath.endsWith('.md')
  ) {
    if (filePath.includes('node_modules') || filePath.includes('.next')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix spelling
    let newContent = content.replace(/Smart Tamizha/g, 'Smart Thamizha');
    newContent = newContent.replace(/SMART TAMIZHA/g, 'SMART THAMIZHA');

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
};

const dirsToSearch = ['app', 'src', 'public', 'android', 'DigiBusStandNativeApp', '.'];
dirsToSearch.forEach(dir => {
  if (dir === '.') {
    // Only search root files
    fs.readdirSync('.').forEach(f => {
      const p = path.join('.', f);
      if (fs.statSync(p).isFile()) {
        replaceInFile(p);
      }
    });
  } else {
    walk(dir, replaceInFile);
  }
});
console.log("Done fixing Smart Thamizha spelling.");

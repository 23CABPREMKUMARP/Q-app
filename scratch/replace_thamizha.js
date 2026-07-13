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
    
    // Replace specific casings first for exact match (to handle uppercase properly)
    let newContent = content.replace(/DIGI BUS STAND/g, 'SMART THAMIZHA');
    newContent = newContent.replace(/Digi Bus Stand/g, 'Smart Thamizha');
    newContent = newContent.replace(/digi bus stand/gi, 'Smart Thamizha');
    
    newContent = newContent.replace(/DIGI BUS/g, 'SMART THAMIZHA');
    newContent = newContent.replace(/Digi Bus/g, 'Smart Thamizha');
    newContent = newContent.replace(/digi bus/gi, 'Smart Thamizha');

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
console.log("Done replacing Digi Bus with Smart Thamizha.");

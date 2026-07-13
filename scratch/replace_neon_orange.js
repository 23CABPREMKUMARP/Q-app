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
    filePath.endsWith('.css') || 
    filePath.endsWith('.js') || 
    filePath.endsWith('.json')
  ) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace all occurrences of #F28500 with #FF5F1F
    const newContent = content.replace(/#F28500/gi, '#FF5F1F');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
};

const dirsToSearch = ['app', 'src', 'public', '.'];
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
console.log("Done replacing tangerine with neon orange.");

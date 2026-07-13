const fs = require('fs');
const filePath = './app/scan/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/orange-600/g, '[#F28500]');
content = content.replace(/orange-500/g, '[#F28500]');
content = content.replace(/rgba\(234,88,12,0.8\)/g, 'rgba(242,133,0,0.8)');

fs.writeFileSync(filePath, content);
console.log('Done');

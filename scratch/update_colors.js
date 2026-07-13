const fs = require('fs');

const path = 'app/globals.css';
let content = fs.readFileSync(path, 'utf8');

// Replace standard variables
content = content.replace(/--background: #f3f4f6;/g, '--background: #FAF6F0;');
content = content.replace(/--foreground: #111827;/g, '--foreground: #333333;');
content = content.replace(/--primary: #FF9933;/g, '--primary: #8B1E2E;');
content = content.replace(/--dark-saffron: #FF9933;/g, '--dark-saffron: #8B1E2E;');
content = content.replace(/--ring: #FF9933;/g, '--ring: #D4A017;');

// Insert color overrides into the @theme inline block
const themeOverrides = `
  /* Smart Tamizha Color Overrides */
  --color-orange-50: #fae8eb;
  --color-orange-100: #f2c7ce;
  --color-orange-200: #e79da9;
  --color-orange-300: #da6a7e;
  --color-orange-400: #c63f58;
  --color-orange-500: #8B1E2E; /* Primary Maroon */
  --color-orange-600: #7a1826;
  --color-orange-700: #65121e;
  --color-orange-800: #54101a;
  --color-orange-900: #461118;

  --color-blue-50: #e2f4f1;
  --color-blue-100: #b8e4dc;
  --color-blue-200: #89cfc3;
  --color-blue-300: #5bb6a8;
  --color-blue-400: #339d8d;
  --color-blue-500: #0F6B5C; /* Supporting Teal */
  --color-blue-600: #0c594c;
  --color-blue-700: #09473d;
  --color-blue-800: #07372f;
  --color-blue-900: #052923;

  --color-slate-50: #FAF6F0; /* Warm sand background */
  --color-slate-100: #f0e9df;
  --color-slate-200: #e3d7c7;
  --color-slate-300: #d4c2ab;
  --color-slate-400: #a9967f;
  --color-slate-500: #82725e;
  --color-slate-600: #635646;
  --color-slate-700: #4f4438;
  --color-slate-800: #3d352b;
  --color-slate-900: #333333; /* Dark Charcoal text */
  --color-slate-950: #222222;

  --color-yellow-400: #e8b84b;
  --color-yellow-500: #D4A017; /* Temple Gold */
  --color-yellow-600: #b8860b;
`;

content = content.replace(/@theme inline \{/, `@theme inline {${themeOverrides}`);

fs.writeFileSync(path, content);
console.log("globals.css updated");

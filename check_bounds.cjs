const fs = require('fs');
const path = require('path');
const svgMatch = /<path d="([^"]+)"/g; // Simplified for basic paths

const files = ['folder.svg', 'grid.svg', 'document.svg', 'clipboard.svg', 'trending.svg', 'check-circle.svg', 'edit.svg', 'clock.svg'];
files.forEach(f => {
  const file = path.join('src/assets/home-icons', f);
  if(!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  console.log(f + ': ' + content.substring(0, 150));
});

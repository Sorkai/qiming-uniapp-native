const fs = require('fs');
const content = fs.readFileSync('/Users/fengrr/Desktop/vue-pure-admin-max/src/views/home/index.vue', 'utf8');
const lines = content.split('\n');
let stack = [];
let styleStart = -1;
let styleEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<style')) styleStart = i;
  if (lines[i].includes('</style')) styleEnd = i;
}

if (styleStart !== -1 && styleEnd !== -1) {
  for (let i = styleStart; i <= styleEnd; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '{') {
        stack.push({ line: i + 1, col: j + 1 });
      } else if (line[j] === '}') {
        if (stack.length === 0) {
          console.log(`Unmatched } at line ${i + 1}, col ${j + 1}`);
        } else {
          stack.pop();
        }
      }
    }
  }
}
if (stack.length > 0) {
  console.log(`Unclosed { at:`);
  stack.forEach(s => console.log(`  line ${s.line}, col ${s.col}`));
} else {
  console.log('Braces are balanced in style tag');
}

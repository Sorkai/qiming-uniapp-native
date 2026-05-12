import fs from 'fs';
import path from 'path';

const mapping = {
  'IconDocument': 'Document',
  'IconFolder': 'Folder',
  'IconCheckCircle': 'CircleCheck',
  'IconEdit': 'Edit',
  'IconClock': 'Clock',
  'IconGrid': 'Grid',
  'IconClipboard': 'Tickets',
  'IconUsers': 'User',
  'IconChart': 'PieChart',
  'IconTrending': 'TrendCharts'
};

const mapImports = {
  'document': 'Document',
  'folder': 'Folder',
  'check-circle': 'CircleCheck',
  'edit': 'Edit',
  'clock': 'Clock',
  'grid': 'Grid',
  'clipboard': 'Tickets',
  'users': 'User',
  'chart': 'PieChart',
  'trending': 'TrendCharts'
};

const files = [
  'src/views/exam-paper/grading/detail.vue',
  'src/views/exam-paper/grading/index.vue',
  'src/views/exam-paper/my-papers/index.vue',
  'src/views/exam-paper/question-bank/index.vue',
  'src/views/exam-paper/statistics/index.vue',
  'src/views/exam-paper/templates/index.vue'
];

files.forEach(filepath => {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  
  // 1. Collect all home-icons imports
  const importRegex = /import\s+(Icon[A-Za-z]+)\s+from\s+['"]@\/assets\/home-icons\/([^.]+)\.svg\?component['"];?/g;
  let match;
  let toImportEP = new Set();
  
  while ((match = importRegex.exec(content)) !== null) {
      if (mapImports[match[2]]) {
          toImportEP.add(mapImports[match[2]]);
      }
  }
  
  if (toImportEP.size > 0) {
      // Add missing EP imports to the @element-plus/icons-vue block
      const epImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@element-plus\/icons-vue['"]/g;
      const epImportMatch = epImportRegex.exec(content);
      
      if (epImportMatch) {
          let existingImports = epImportMatch[1].split(',').map(s => s.trim());
          toImportEP.forEach(imp => {
              if (!existingImports.includes(imp)) {
                  existingImports.push(imp);
              }
          });
          const newEpImport = import {\n  \n} from "@element-plus/icons-vue";
          content = content.replace(epImportMatch[0], newEpImport);
      } else {
          // No existing EP imports
          const newEpImport = import {  } from "@element-plus/icons-vue";\n;
          // Find the first import and put it before
          content = content.replace(/import\s/, newEpImport + 'import ');
      }
      
      // Remove home-icons imports
      content = content.replace(importRegex, '');
      
      // 2. Replace the tags in template
      Object.keys(mapping).forEach(iconComp => {
          const epName = mapping[iconComp];
          const tagRegex = new RegExp(<\\s*(.*?)\\s*(?:/>|>\\s*</>), 'g');
          content = content.replace(tagRegex, <el-icon src/views/exam-paper/**/*.vue1>< /></el-icon>);
      });
      
      // 3. Update CSS rules: replace :deep(> svg) with :deep(.el-icon) in specific blocks
      ['header-icon', 'stat-icon', 'paper-icon'].forEach(cls => {
          const cssRegex = new RegExp(\\.\\s*\\{[^}]*:deep\\((>\\s*svg|svg)\\)\\s*\\{([^}]+)\\}, 'g');
          content = content.replace(cssRegex, . {
      :deep(.el-icon) {
        font-size: 28px; /* Ä¬ÈÏ, stat-icon ¿É¸²Ð´Îª 26px */
      });
      });
      
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(Updated );
  }
});

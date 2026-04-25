const fs = require('fs');

const path = require('path');

const targetDir = 'c:/Users/Darshan Km/.gemini/antigravity/scratch/job-portal/frontend/src';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      content = content.replace(/user\.email === 'kmthecoder@gmail\.com'/g, "user.role === 'main_admin'");
      content = content.replace(/u\.email !== 'kmthecoder@gmail\.com'/g, "u.role !== 'main_admin'");
      content = content.replace(/profile\.email === 'kmthecoder@gmail\.com'/g, "profile.role === 'main_admin'");
      if (original !== content) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir(targetDir);

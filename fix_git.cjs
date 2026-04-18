const fs = require('fs');
const path = require('path');

const gitLogPath1 = path.join(__dirname, '.git', 'logs', 'HEAD');
const gitLogPath2 = path.join(__dirname, '.git', 'logs', 'refs', 'heads', 'main');
const mainRefPath = path.join(__dirname, '.git', 'refs', 'heads', 'main');

const lastValidSha = '45d3e1bf42099e4b23c056581c01eaed12844e4d';

function cleanLogFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  // Remove lines containing null bytes (\x00)
  const lines = content.split('\n').filter(line => !line.includes('\x00') && line.trim() !== '');
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
  console.log(`Cleaned: ${filePath}`);
}

cleanLogFile(gitLogPath1);
cleanLogFile(gitLogPath2);

// Restore the main branch reference
fs.writeFileSync(mainRefPath, lastValidSha + '\n');
console.log(`Restored main ref to: ${lastValidSha}`);

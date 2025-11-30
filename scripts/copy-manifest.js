// Copy manifest.json into dist in a cross-platform way.
// Ensures dist exists and reports progress so users see the file was emitted.
const { copyFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const source = join(process.cwd(), 'manifest.json');
const targetDir = join(process.cwd(), 'dist');
const target = join(targetDir, 'manifest.json');

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
console.log(`Copied manifest to ${target}`);

// Generates placeholder PNG icons from embedded base64 to avoid storing binary files in Git.
// The manifest expects these files at build/runtime; this script materializes them post-install.
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const iconData = {
  16: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGUlEQVR42mOwbvr2nxLMMGrAqAGjBgwXAwCGGLIfg2DiTgAAAABJRU5ErkJggg==',
  32: 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVR42u3OIQEAAAgDMKJSjpIYiHEzMb/q2UsqAQEBAQEBAQEBAQEBAQGBdOAB06D4puBMYikAAAAASUVORK5CYII=',
  48: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAARElEQVR42u3PQREAAAQAMEVUkl8bKvi622MBFlk9n4WAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwNUCB61TLUVvMTQAAAAASUVORK5CYII=',
  128: 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAA80lEQVR42u3SMQ0AAAjAMBTg3wDiUAE2SOgxA0sjq0d/CxMAMAIAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAAQAACYAYAQAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIButHV9ybs9Oxs3AAAAAElFTkSuQmCC',
};

const targetDir = join(process.cwd(), 'public', 'icons');
mkdirSync(targetDir, { recursive: true });

Object.entries(iconData).forEach(([size, base64]) => {
  const filename = join(targetDir, `icon-${size}.png`);
  writeFileSync(filename, Buffer.from(base64, 'base64'));
  // Log relative path for debugging convenience
  console.log(`Generated ${filename}`);
});

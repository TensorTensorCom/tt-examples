/*
 * generate-sample.js
 *
 * Generates a deterministic sample vector file for use with the TensorTensor
 * build API. Output is a raw float32, row-major binary file.
 *
 * Run from this directory:
 *   node generate-sample.js
 *
 * Output: sample-1k-768d.bin  (1000 vectors x 768 dims = ~3 MB)
 *
 * File format: raw float32, row-major, native byte order (little-endian on all
 * common platforms). To recover vector count: rows = fileSize / (dims * 4).
 */

const fs   = require('fs');
const path = require('path');

const COUNT = 1000;
const DIMS  = 768;
const SEED  = 42;
const OUT   = path.join(__dirname, `sample-${COUNT / 1000}k-${DIMS}d.bin`);

function seededRandom(seed){

  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };

}

function generate(){

  const rng    = seededRandom(SEED);
  const buffer = Buffer.alloc(COUNT * DIMS * 4);
  const view   = new Float32Array(buffer.buffer, buffer.byteOffset, COUNT * DIMS);

  for (let i = 0; i < COUNT * DIMS; i++){
    view[i] = rng() * 2 - 1;
  }

  fs.writeFileSync(OUT, buffer);
  return buffer.length;

}

const start  = Date.now();
const bytes  = generate();
const sizeMB = (bytes / (1024 * 1024)).toFixed(2);
const ms     = Date.now() - start;

console.log(`Wrote ${OUT}`);
console.log(`  ${COUNT} vectors x ${DIMS}d float32 = ${bytes.toLocaleString()} bytes (${sizeMB} MB)`);
console.log(`  generation time: ${ms} ms`);

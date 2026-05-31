import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'public/models/ghibli/polypizza';
const files = readdirSync(dir).filter(f => f.endsWith('.glb'));

function parseGLB(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  // header
  const magic = dv.getUint32(0, true);
  const version = dv.getUint32(4, true);
  const length = dv.getUint32(8, true);
  // chunk 0 = JSON
  const jsonLen = dv.getUint32(12, true);
  const jsonType = dv.getUint32(16, true);
  const jsonBytes = new Uint8Array(buf.buffer, buf.byteOffset + 20, jsonLen);
  const json = JSON.parse(new TextDecoder().decode(jsonBytes));
  return { json, length };
}

for (const f of files) {
  const buf = readFileSync(join(dir, f));
  const { json } = parseGLB(buf);
  // Find bounding box from accessors with POSITION min/max
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const mesh of json.meshes || []) {
    for (const prim of mesh.primitives || []) {
      const posAccIdx = prim.attributes?.POSITION;
      if (posAccIdx == null) continue;
      const acc = json.accessors[posAccIdx];
      if (acc.min && acc.max) {
        minX = Math.min(minX, acc.min[0]); minY = Math.min(minY, acc.min[1]); minZ = Math.min(minZ, acc.min[2]);
        maxX = Math.max(maxX, acc.max[0]); maxY = Math.max(maxY, acc.max[1]); maxZ = Math.max(maxZ, acc.max[2]);
      }
    }
  }
  const sx = maxX - minX, sy = maxY - minY, sz = maxZ - minZ;
  console.log(`${f.padEnd(25)} size=${sx.toFixed(2)}x${sy.toFixed(2)}x${sz.toFixed(2)}  min_y=${minY.toFixed(2)}  max_y=${maxY.toFixed(2)}`);
}

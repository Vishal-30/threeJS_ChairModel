import { execFile } from 'node:child_process';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const input = path.resolve('public/assets/models/chair.glb');
const output = path.resolve('public/assets/models/chair.optimized.glb');

await execFileAsync('npx', [
  'gltf-transform',
  'optimize',
  input,
  output,
  '--compress',
  'quantize',
  '--flatten',
  'false',
  '--join',
  'false',
  '--instance',
  'false',
  '--palette',
  'false',
  '--texture-compress',
  'false',
  '--simplify',
  'false'
]);

const originalSize = (await stat(input)).size;
const optimizedSize = (await stat(output)).size;

console.log(
  `Optimized model written to ${output}. Original remains unchanged. ${originalSize} -> ${optimizedSize} bytes`
);

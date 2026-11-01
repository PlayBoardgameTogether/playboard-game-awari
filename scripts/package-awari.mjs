import { Buffer } from 'node:buffer';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { zipSync } from 'fflate';
import { awariFiles } from './awari-package.mjs';

const files = await awariFiles();
const descriptor = JSON.parse(files['game.json'].toString('utf8'));
descriptor.presentation = {};
for (const kind of ['icon', 'cover', 'background']) {
  const png = await readFile(new URL('../game-packages/awari/art/' + kind + '.png', import.meta.url));
  if (png.length > 320 * 1024) throw new Error(kind + ' exceeds artwork limit');
  descriptor.presentation[kind] = 'data:image/png;base64,' + png.toString('base64');
}
files['game.json'] = Buffer.from(JSON.stringify(descriptor));
const output = new URL('../dist/game-packages/awari-1.0.1.zip', import.meta.url);
await mkdir(new URL('.', output), { recursive: true });
const bytes = zipSync(files, { mtime: new Date('2026-10-24T00:00:00Z'), level: 9 });
await writeFile(output, bytes);
console.log(`Awari ZIP: ${output.pathname} (${bytes.length} bytes)`);

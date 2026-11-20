// Entry point for the gta6-trophy-guide-01 submission (Node 22, standard library only).
//
// What this program does, in order:
//   1. resolves the output directory (MAKEFUN_OUTPUT_DIR when set, otherwise /output),
//   2. copies the static guide app (app/) and the screenshot set (screenshots/) into it,
//   3. asks the vendored make.fun library to summarise the output into dossier.json,
//      under the scorer's caps, and reports the size of what was written.
//
// The guide itself is plain static files with no build step: serve app/ with
// `node serve.ts`, open http://localhost:8080, and it runs fully offline.
// vendor/makefun-frontend.ts is the official library and stays untouched: the
// scorer requires dossier.json to be byte for byte what its own copy writes.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, mirrored here so an oversized entry fails at run time
// instead of at judging time.
const CAPS = {
  textBytes: 163_840,
  screenshotCount: 4,
  screenshotBytes: 262_144,
  appFiles: 993,
  appBytes: 50_331_648,
} as const;

function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

copyTree(join(rootDir, 'app'), join(outputDir, 'app'));
if (existsSync(join(rootDir, 'screenshots'))) {
  copyTree(join(rootDir, 'screenshots'), join(outputDir, 'screenshots'));
} else {
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
}

const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outputDir, {
    text_max_bytes: CAPS.textBytes,
    screenshots: { max: CAPS.screenshotCount, max_bytes: CAPS.screenshotBytes },
    app_max_files: CAPS.appFiles,
    app_max_bytes: CAPS.appBytes,
  }),
);

const shotCount = readdirSync(join(outputDir, 'screenshots')).length;
console.log(`handed in: app/ + ${shotCount} screenshot(s) copied, dossier.json written (${statSync(dossierPath).size} bytes) -> ${outputDir}`);

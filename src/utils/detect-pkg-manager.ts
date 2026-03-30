import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type PkgManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export interface PkgManagerInfo {
  name: PkgManager;
  addDev: string; // e.g. "npm install --save-dev" or "pnpm add -D"
  run: string;    // e.g. "npm run" or "pnpm"
}

export function detectPkgManager(projectDir: string): PkgManagerInfo {
  if (existsSync(join(projectDir, 'bun.lockb')) || existsSync(join(projectDir, 'bun.lock'))) {
    return { name: 'bun', addDev: 'bun add -D', run: 'bun run' };
  }
  if (existsSync(join(projectDir, 'pnpm-lock.yaml'))) {
    return { name: 'pnpm', addDev: 'pnpm add -D', run: 'pnpm' };
  }
  if (existsSync(join(projectDir, 'yarn.lock'))) {
    return { name: 'yarn', addDev: 'yarn add -D', run: 'yarn' };
  }
  // Default to npm
  return { name: 'npm', addDev: 'npm install --save-dev', run: 'npm run' };
}

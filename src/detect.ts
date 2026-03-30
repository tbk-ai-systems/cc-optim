import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { detectPkgManager, type PkgManagerInfo } from './utils/detect-pkg-manager.js';

export type ProjectLanguage = 'node' | 'python' | 'rust' | 'go' | 'java' | 'unknown';

export interface ProjectInfo {
  path: string;
  name: string;
  language: ProjectLanguage;
  framework: string | null;
  pkgManager: PkgManagerInfo;
  existing: {
    claudeMd: boolean;
    architectureMd: boolean;
    claudeignore: boolean;
    repomixignore: boolean;
    repomixConfig: boolean;
    specRegistry: boolean;
    planRegistry: boolean;
    githooks: boolean;
    packageJson: boolean;
  };
}

export function detectProject(projectDir: string): ProjectInfo {
  const language = detectLanguage(projectDir);
  const framework = detectFramework(projectDir, language);
  const pkgManager = detectPkgManager(projectDir);

  return {
    path: projectDir,
    name: basename(projectDir),
    language,
    framework,
    pkgManager,
    existing: {
      claudeMd: existsSync(join(projectDir, 'CLAUDE.md')),
      architectureMd: existsSync(join(projectDir, 'docs', 'ARCHITECTURE.md')),
      claudeignore: existsSync(join(projectDir, '.claudeignore')),
      repomixignore: existsSync(join(projectDir, '.repomixignore')),
      repomixConfig: existsSync(join(projectDir, 'repomix.config.json')),
      specRegistry: existsSync(join(projectDir, 'docs', 'spec-registry.md')),
      planRegistry: existsSync(join(projectDir, 'docs', 'plan-registry.md')),
      githooks: existsSync(join(projectDir, '.githooks', 'pre-commit')),
      packageJson: existsSync(join(projectDir, 'package.json')),
    },
  };
}

function detectLanguage(dir: string): ProjectLanguage {
  if (existsSync(join(dir, 'package.json'))) return 'node';
  if (existsSync(join(dir, 'pyproject.toml')) || existsSync(join(dir, 'requirements.txt')) || existsSync(join(dir, 'setup.py'))) return 'python';
  if (existsSync(join(dir, 'Cargo.toml'))) return 'rust';
  if (existsSync(join(dir, 'go.mod'))) return 'go';
  if (existsSync(join(dir, 'pom.xml')) || existsSync(join(dir, 'build.gradle'))) return 'java';
  return 'unknown';
}

function detectFramework(dir: string, language: ProjectLanguage): string | null {
  if (language !== 'node') return null;

  try {
    const pkg = JSON.parse(require('node:fs').readFileSync(join(dir, 'package.json'), 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps['next']) return 'Next.js';
    if (deps['nuxt']) return 'Nuxt';
    if (deps['@angular/core']) return 'Angular';
    if (deps['vue']) return 'Vue';
    if (deps['react']) return 'React';
    if (deps['express']) return 'Express';
    if (deps['fastify']) return 'Fastify';
    if (deps['hono']) return 'Hono';
    if (deps['svelte']) return 'Svelte';
  } catch {}

  return null;
}

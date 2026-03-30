import { join } from 'node:path';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import type { ProjectInfo } from '../detect.js';
import { run } from '../utils/exec.js';
import { writeFile, ensureDir } from '../utils/fs.js';
import { generatePreCommitHook, type HookMode } from '../templates/git-hooks.js';

const green = chalk.hex('#73C030');

export interface MemoryConfig {
  hookMode: HookMode;
}

export async function askMemoryConfig(): Promise<MemoryConfig> {
  const hookMode = await select<HookMode>({
    message: 'Git pre-commit hook behavior?',
    choices: [
      { value: 'auto', name: 'Auto — regenerate repomix on substantial source changes' },
      { value: 'reminder', name: 'Reminder — echo reminder to update docs' },
      { value: 'none', name: 'None — no git hook' },
    ],
    default: 'auto',
  });

  return { hookMode };
}

export async function applyMemoryLayer(
  project: ProjectInfo,
  config: MemoryConfig
): Promise<void> {
  const dir = project.path;

  // Install Grov as devDependency
  const cmd = project.pkgManager.addDev.split(' ');
  await run(cmd[0], [...cmd.slice(1), 'grov'], {
    label: 'Adding Grov as dev dependency',
    cwd: dir,
  });

  // Initialize Grov
  await run('npx', ['grov', 'init'], {
    label: 'Initializing Grov',
    cwd: dir,
    silent: false,
  });

  // Set up git hook
  const hookContent = generatePreCommitHook(config.hookMode);
  if (hookContent) {
    const hooksDir = join(dir, '.githooks');
    ensureDir(hooksDir);

    const hookPath = join(hooksDir, 'pre-commit');
    await writeFile(hookPath, hookContent, { executable: true, askOverwrite: true });

    // Configure git to use the hooks directory
    await run('git', ['config', 'core.hooksPath', '.githooks'], {
      cwd: dir,
      silent: true,
    });

    console.log(green('  ✔') + ` Set up git hook (.githooks/pre-commit — ${config.hookMode} mode)`);
  } else {
    console.log(chalk.dim('  Skipped git hook (none selected)'));
  }
}

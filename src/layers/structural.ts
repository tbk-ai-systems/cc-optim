import { join } from 'node:path';
import { confirm, select } from '@inquirer/prompts';
import type { ProjectInfo } from '../detect.js';
import { run } from '../utils/exec.js';
import { writeFile } from '../utils/fs.js';
import { generateClaudeignore } from '../templates/claudeignore.js';
import { generateRepomixignore } from '../templates/repomixignore.js';
import { generateRepomixConfig, type RepomixFormat } from '../templates/repomix-config.js';

export interface StructuralConfig {
  installRepomix: boolean;
  configureMcp: boolean;
  outputFormat: RepomixFormat;
}

export async function askStructuralConfig(): Promise<StructuralConfig> {
  const installRepomix = await confirm({
    message: 'Add Repomix as dev dependency?',
    default: true,
  });

  const configureMcp = await confirm({
    message: 'Configure Repomix as MCP server for Claude Code?',
    default: true,
  });

  const outputFormat = await select<RepomixFormat>({
    message: 'Repomix output format?',
    choices: [
      { value: 'xml', name: 'XML (recommended — best for Claude)' },
      { value: 'markdown', name: 'Markdown' },
      { value: 'plain', name: 'Plain text' },
    ],
    default: 'xml',
  });

  return { installRepomix, configureMcp, outputFormat };
}

export async function applyStructuralLayer(
  project: ProjectInfo,
  config: StructuralConfig
): Promise<void> {
  const dir = project.path;

  // Install Repomix as devDependency
  if (config.installRepomix) {
    const cmd = project.pkgManager.addDev.split(' ');
    await run(cmd[0], [...cmd.slice(1), 'repomix'], {
      label: 'Adding Repomix as dev dependency',
      cwd: dir,
    });
  }

  // Configure MCP server
  if (config.configureMcp) {
    await run('claude', ['mcp', 'add', 'repomix', '--', 'npx', '-y', 'repomix', '--mcp'], {
      label: 'Configuring Repomix MCP server',
      cwd: dir,
      silent: false,
    });
  }

  // Generate ignore files and config
  await writeFile(
    join(dir, '.claudeignore'),
    generateClaudeignore(project.language),
  );
  console.log('  \x1b[32m✔\x1b[0m Generated .claudeignore');

  await writeFile(
    join(dir, '.repomixignore'),
    generateRepomixignore(project.language),
  );
  console.log('  \x1b[32m✔\x1b[0m Generated .repomixignore');

  await writeFile(
    join(dir, 'repomix.config.json'),
    generateRepomixConfig(config.outputFormat),
  );
  console.log('  \x1b[32m✔\x1b[0m Generated repomix.config.json');
}

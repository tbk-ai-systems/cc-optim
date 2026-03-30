import { join } from 'node:path';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import type { ProjectInfo } from '../detect.js';
import { run, commandExists } from '../utils/exec.js';
import { writeFile, readFileIfExists, ensureDir } from '../utils/fs.js';
import { generateClaudeMd } from '../templates/claude-md.js';
import { generateArchitectureMd } from '../templates/architecture-md.js';
import { generateSpecRegistryMd } from '../templates/spec-registry-md.js';
import { generatePlanRegistryMd } from '../templates/plan-registry-md.js';
import { generatePlanTemplateMd } from '../templates/plan-template-md.js';

const green = chalk.hex('#73C030');

export interface SemanticConfig {
  projectName: string;
  description: string;
  language: string;
  framework: string | null;
  testCommand: string | null;
  lintCommand: string | null;
  multiPlanning: boolean;
  autoGenArchitecture: boolean;
}

export async function askSemanticConfig(project: ProjectInfo): Promise<SemanticConfig> {
  const projectName = await input({
    message: 'Project name:',
    default: project.name,
  });

  const description = await input({
    message: 'Brief project description:',
  });

  const langDisplay = project.framework
    ? `${project.language} + ${project.framework}`
    : project.language;

  const language = await input({
    message: 'Main language/framework:',
    default: langDisplay,
  });

  const testCommand = await input({
    message: 'Test command (leave empty to skip):',
  }) || null;

  const lintCommand = await input({
    message: 'Lint command (leave empty to skip):',
  }) || null;

  const multiPlanning = await confirm({
    message: 'Generate multi-planning structure (spec-registry + plans/)?',
    default: true,
  });

  const autoGenArchitecture = await confirm({
    message: 'Auto-generate ARCHITECTURE.md using Claude Code?',
    default: false,
  });

  return {
    projectName,
    description,
    language,
    framework: project.framework,
    testCommand,
    lintCommand,
    multiPlanning,
    autoGenArchitecture,
  };
}

export async function applySemanticLayer(
  project: ProjectInfo,
  config: SemanticConfig
): Promise<void> {
  const dir = project.path;

  // Generate CLAUDE.md
  const claudeMd = generateClaudeMd({
    projectName: config.projectName,
    description: config.description,
    language: config.language,
    framework: config.framework,
    testCommand: config.testCommand,
    lintCommand: config.lintCommand,
    hasMultiPlanning: config.multiPlanning,
  });
  await writeFile(join(dir, 'CLAUDE.md'), claudeMd);
  console.log(green('  ✔') + ' Generated CLAUDE.md');

  // Generate ARCHITECTURE.md
  const docsDir = join(dir, 'docs');
  ensureDir(docsDir);

  if (config.autoGenArchitecture) {
    await generateArchitectureWithClaude(project, config);
  } else {
    const archMd = generateArchitectureMd({
      projectName: config.projectName,
      language: config.language,
      framework: config.framework,
    });
    await writeFile(join(docsDir, 'ARCHITECTURE.md'), archMd);
    console.log(green('  ✔') + ' Generated docs/ARCHITECTURE.md (skeleton — fill in TODO sections)');
  }

  // Generate registries and plans
  if (config.multiPlanning) {
    await writeFile(join(docsDir, 'spec-registry.md'), generateSpecRegistryMd());
    console.log(green('  ✔') + ' Generated docs/spec-registry.md');

    await writeFile(join(docsDir, 'plan-registry.md'), generatePlanRegistryMd());
    console.log(green('  ✔') + ' Generated docs/plan-registry.md');

    const plansDir = join(docsDir, 'plans');
    ensureDir(plansDir);
    await writeFile(
      join(plansDir, '_template.md'),
      generatePlanTemplateMd(),
      { askOverwrite: false },
    );
    console.log(green('  ✔') + ' Created docs/plans/ (with _template.md)');
  }
}

async function generateArchitectureWithClaude(
  project: ProjectInfo,
  config: SemanticConfig
): Promise<void> {
  const docsDir = join(project.path, 'docs');
  const archPath = join(docsDir, 'ARCHITECTURE.md');

  // Check if Claude CLI is available
  const hasClaude = await commandExists('claude');
  if (!hasClaude) {
    console.log(chalk.yellow('  ⚠ Claude Code CLI not found. Falling back to skeleton template.'));
    const archMd = generateArchitectureMd({
      projectName: config.projectName,
      language: config.language,
      framework: config.framework,
    });
    await writeFile(archPath, archMd);
    console.log(green('  ✔') + ' Generated docs/ARCHITECTURE.md (skeleton)');
    return;
  }

  // Verify Claude is responsive
  const versionCheck = await run('claude', ['--version'], { silent: true });
  if (versionCheck.exitCode !== 0) {
    console.log(chalk.yellow('  ⚠ Claude Code not responding. Falling back to skeleton template.'));
    const archMd = generateArchitectureMd({
      projectName: config.projectName,
      language: config.language,
      framework: config.framework,
    });
    await writeFile(archPath, archMd);
    console.log(green('  ✔') + ' Generated docs/ARCHITECTURE.md (skeleton)');
    return;
  }

  // Check for existing ARCHITECTURE.md
  const existingContent = readFileIfExists(archPath);
  const mergeNote = existingContent
    ? `\n\nExisting ARCHITECTURE.md content to merge/incorporate:\n\`\`\`\n${existingContent}\n\`\`\``
    : '';

  if (existingContent) {
    console.log(chalk.dim('  Found existing ARCHITECTURE.md — will merge with auto-generated content'));
  }

  const spinner = ora({ text: 'Generating ARCHITECTURE.md with Claude Code...', color: 'green' }).start();

  const prompt = `Read the codebase (use the Repomix MCP server or read files directly) and generate a comprehensive ARCHITECTURE.md for the project "${config.projectName}".

Include these sections: Overview, Tech Stack, Directory Structure, Data Flow, Key Patterns, Conventions, Dependencies.

The project uses ${config.language}${config.framework ? ` with ${config.framework}` : ''}.
${config.description ? `Description: ${config.description}` : ''}${mergeNote}

Output ONLY the markdown content, nothing else.`;

  // Use stdio: inherit so user can interact if Claude needs login
  const result = await run('claude', ['-p', prompt], {
    cwd: project.path,
    inherit: true,
    silent: true,
  });

  if (result.exitCode === 0 && result.stdout.trim()) {
    await writeFile(archPath, result.stdout, { askOverwrite: false });
    spinner.succeed(green('Generated docs/ARCHITECTURE.md with Claude Code'));
  } else {
    spinner.warn('Claude Code generation failed. Using skeleton template.');
    const archMd = generateArchitectureMd({
      projectName: config.projectName,
      language: config.language,
      framework: config.framework,
    });
    await writeFile(archPath, archMd, { askOverwrite: false });
    console.log(green('  ✔') + ' Generated docs/ARCHITECTURE.md (skeleton)');
  }
}

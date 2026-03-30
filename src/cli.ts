import chalk from 'chalk';
import { checkbox } from '@inquirer/prompts';
import { detectProject } from './detect.js';
import { askStructuralConfig, applyStructuralLayer } from './layers/structural.js';
import { askSemanticConfig, applySemanticLayer } from './layers/semantic.js';
import { askMemoryConfig, applyMemoryLayer } from './layers/memory.js';

const green = chalk.hex('#73C030');
const dim = chalk.dim;

type Layer = 'structural' | 'semantic' | 'memory';

export async function cli(projectDir: string): Promise<void> {
  // Banner
  const border = green('─'.repeat(50));
  console.log();
  console.log(green('╭') + border + green('╮'));
  console.log(green('│') + '  Claude Code Optimization Setup' + ' '.repeat(18) + green('│'));
  console.log(green('│') + '  Three-layer context optimization system' + ' '.repeat(9) + green('│'));
  console.log(green('╰') + border + green('╯'));
  console.log();

  // Detect project
  const project = detectProject(projectDir);

  const langDisplay = project.framework
    ? `${project.language} + ${project.framework}`
    : project.language;

  console.log(green('✔') + ` Detected: ${langDisplay} project`);
  console.log(dim(`  Path: ${project.path}`));

  const existingItems = [];
  if (project.existing.claudeMd) existingItems.push('CLAUDE.md');
  if (project.existing.architectureMd) existingItems.push('ARCHITECTURE.md');
  if (project.existing.claudeignore) existingItems.push('.claudeignore');
  if (project.existing.githooks) existingItems.push('.githooks');
  if (existingItems.length > 0) {
    console.log(dim(`  Existing: ${existingItems.join(', ')}`));
  }
  console.log();

  // Layer selection
  const layers = await checkbox<Layer>({
    message: 'Which layers do you want to set up?',
    choices: [
      { value: 'structural', name: 'Structural Layer — Repomix + ignore files (code packaging for LLMs)', checked: true },
      { value: 'semantic', name: 'Semantic Layer   — CLAUDE.md, ARCHITECTURE.md, registries (living docs)', checked: true },
      { value: 'memory', name: 'Memory Layer     — Grov + git hooks (persistent context between sessions)', checked: true },
    ],
  });

  if (layers.length === 0) {
    console.log(chalk.yellow('\nNo layers selected. Nothing to do.'));
    return;
  }

  console.log();

  // Collect config for each selected layer
  const structuralConfig = layers.includes('structural')
    ? await askStructuralConfig()
    : null;

  const semanticConfig = layers.includes('semantic')
    ? await askSemanticConfig(project)
    : null;

  const memoryConfig = layers.includes('memory')
    ? await askMemoryConfig()
    : null;

  // Apply layers
  console.log();
  console.log(green('Applying layers...'));
  console.log();

  if (structuralConfig) {
    await applyStructuralLayer(project, structuralConfig);
    console.log();
  }

  if (semanticConfig) {
    await applySemanticLayer(project, semanticConfig);
    console.log();
  }

  if (memoryConfig) {
    await applyMemoryLayer(project, memoryConfig);
    console.log();
  }

  // Next steps
  console.log();
  console.log(green('Done!') + ' Next steps:');
  console.log(dim('  1. Review and customize CLAUDE.md'));
  console.log(dim('  2. Fill in TODO sections in docs/ARCHITECTURE.md'));
  console.log(dim('  3. Run: npx repomix'));
  console.log(dim('  4. Start: npx grov claude'));
  console.log();
}

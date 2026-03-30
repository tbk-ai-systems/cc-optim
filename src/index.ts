import { resolve } from 'node:path';
import { cli } from './cli.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
cc-optim - Claude Code Optimization Setup

Usage:
  npx cc-optim [project-dir]

Sets up an optimized Claude Code environment with three layers:
  - Structural: Repomix + ignore files (code packaging for LLMs)
  - Semantic:   CLAUDE.md, ARCHITECTURE.md, registries (living docs)
  - Memory:     Grov + git hooks (persistent context between sessions)

Options:
  --help, -h     Show this help message
  --version, -v  Show version

Examples:
  npx cc-optim           # Set up in current directory
  npx cc-optim ./my-app  # Set up in specific directory
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log('0.1.0');
  process.exit(0);
}

const projectDir = resolve(args[0] ?? '.');

cli(projectDir).catch((err) => {
  if (err.name === 'ExitPromptError') {
    // User pressed Ctrl+C
    console.log('\nAborted.');
    process.exit(0);
  }
  console.error('Error:', err.message);
  process.exit(1);
});

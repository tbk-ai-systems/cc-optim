import type { ProjectLanguage } from '../detect.js';

export function generateClaudeignore(language: ProjectLanguage): string {
  const common = `# Build artifacts and generated files
*.lock
repomix-output.*

# Version control
.git/
`;

  const nodeIgnore = `# Node.js
node_modules/
dist/
build/
.next/
.nuxt/
.output/
coverage/
.turbo/
`;

  const pythonIgnore = `# Python
__pycache__/
*.pyc
*.pyo
.venv/
venv/
.eggs/
*.egg-info/
.mypy_cache/
.pytest_cache/
`;

  const rustIgnore = `# Rust
target/
`;

  const goIgnore = `# Go
vendor/
`;

  const javaIgnore = `# Java
target/
build/
.gradle/
*.class
`;

  const languageSpecific: Record<ProjectLanguage, string> = {
    node: nodeIgnore,
    python: pythonIgnore,
    rust: rustIgnore,
    go: goIgnore,
    java: javaIgnore,
    unknown: '',
  };

  return common + (languageSpecific[language] ?? '');
}

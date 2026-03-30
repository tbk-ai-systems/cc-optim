import type { ProjectLanguage } from '../detect.js';

export function generateRepomixignore(language: ProjectLanguage): string {
  const common = `# Large files and binaries
*.png
*.jpg
*.jpeg
*.gif
*.svg
*.ico
*.woff
*.woff2
*.ttf
*.eot
*.mp3
*.mp4
*.zip
*.tar.gz
*.pdf

# Generated output (avoid recursion)
repomix-output.*

# Version control
.git/

# Lock files (too large, not useful for context)
*.lock
package-lock.json
pnpm-lock.yaml
yarn.lock
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
__tests__/
*.test.*
*.spec.*
test/fixtures/
`;

  const pythonIgnore = `# Python
__pycache__/
*.pyc
.venv/
venv/
.eggs/
*.egg-info/
.mypy_cache/
.pytest_cache/
tests/fixtures/
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

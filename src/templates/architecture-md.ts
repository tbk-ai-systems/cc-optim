export interface ArchitectureMdConfig {
  projectName: string;
  language: string;
  framework: string | null;
}

export function generateArchitectureMd(config: ArchitectureMdConfig): string {
  const stackLine = config.framework
    ? `- **Framework**: ${config.framework}`
    : '';

  return `# Architecture: ${config.projectName}

## Overview
<!-- TODO: Describe what this project does and its main purpose -->

## Tech Stack
- **Language**: ${config.language}
${stackLine}
<!-- TODO: Add databases, APIs, infrastructure, etc. -->

## Directory Structure
<!-- TODO: Describe the main directories and their purposes -->
\`\`\`
src/
  ...
\`\`\`

## Data Flow
<!-- TODO: Describe how data flows through the system (e.g., request → controller → service → database) -->

## Key Patterns
<!-- TODO: Describe design patterns used (e.g., MVC, Repository, Event-driven) -->

## Conventions
<!-- TODO: Describe naming conventions, code style, import ordering, etc. -->

## Dependencies
<!-- TODO: List key dependencies and why they were chosen -->
`;
}

export interface ClaudeMdConfig {
  projectName: string;
  description: string;
  language: string;
  framework: string | null;
  testCommand: string | null;
  lintCommand: string | null;
  hasMultiPlanning: boolean;
}

export function generateClaudeMd(config: ClaudeMdConfig): string {
  const langLine = config.framework
    ? `**Stack**: ${config.language} + ${config.framework}`
    : `**Language**: ${config.language}`;

  const testLine = config.testCommand ? `- Run: \`${config.testCommand}\`` : '';
  const lintLine = config.lintCommand ? `- Run: \`${config.lintCommand}\`` : '';

  const planningRules = config.hasMultiPlanning
    ? `- For new features or tasks described by the user:
  - **Be extensively proactive**: ask clarifying questions, request details, suggest improvements, and take initiative in gathering information — especially if the user is being brief or vague. Do not assume. Ask.
  - Create an entry in \`docs/spec-registry.md\` for the feature
  - Create one or more plan files in \`docs/plans/{feature}-plan.md\` using the \`_template.md\` format. A single spec-registry entry can have **MULTIPLE** plan files — either because the work is naturally separable into independent units, or because it is convenient to split a large plan into parts (e.g., by user request or by logical phases). This is the whole point of the multi-planning system.
  - Copy/adapt the plan steps as checkboxes into \`docs/plan-registry.md\` for the active sprint
  - Work through steps sequentially, marking \`[x]\` as completed
- When resuming work on a feature from spec-registry.md:
  1. Read the detailed plan(s) in \`docs/plans/{feature}-plan.md\`
  2. Ensure the current steps are reflected in \`docs/plan-registry.md\`
  3. Continue from the first unchecked \`[ ]\` step`
    : `- For new features: describe the approach before implementing`;

  return `# Project: ${config.projectName}

${config.description}

${langLine}

## Rules

### Before Starting Work
1. Read \`docs/ARCHITECTURE.md\` to understand the system architecture
2. Read \`docs/spec-registry.md\` to see the feature roadmap
3. Read \`docs/plan-registry.md\` to see current active tasks
4. Do NOT explore the codebase blindly — use the docs first

### During Work
- Follow the conventions described in \`docs/ARCHITECTURE.md\`
${planningRules}
- Use Plan Mode (Shift+Tab) for complex changes

### Before Committing
- Update \`docs/plan-registry.md\` (mark completed steps with \`[x]\`, add new \`[ ]\` if needed)
- If architecture changed: update \`docs/ARCHITECTURE.md\`
- If new feature added: update \`docs/spec-registry.md\`
${testLine}
${lintLine}

### Plan Registry Cleanup
- Keep completed \`[x]\` tasks in \`docs/plan-registry.md\` for context while the feature is in progress
- Once a feature is fully shipped (all steps \`[x]\`), delete its completed tasks to keep the file lean
- Only active sprint tasks should remain in plan-registry.md

### Context Sources
- Full codebase snapshot: \`repomix-output.xml\` (use Repomix MCP server if available)
- Architecture & conventions: \`docs/ARCHITECTURE.md\`
- Feature roadmap: \`docs/spec-registry.md\`
- Current tasks: \`docs/plan-registry.md\`
`;
}

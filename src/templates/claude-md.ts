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
    ? `${config.language} + ${config.framework}`
    : config.language;

  const testLine = config.testCommand ? `- Run: \`${config.testCommand}\`` : '';
  const lintLine = config.lintCommand ? `- Run: \`${config.lintCommand}\`` : '';

  const planningRules = config.hasMultiPlanning
    ? `- For new features or tasks:
  - Create an entry in \`docs/spec-registry.md\`
  - Create plan file(s) in \`docs/plans/{feature}-plan.md\` using \`_template.md\` format. One spec-registry entry can have multiple plan files (separable units or phases).
  - Copy steps as checkboxes into \`docs/plan-registry.md\` for the active sprint
  - Work through steps sequentially, marking \`[x]\` as completed
- When resuming work: read plan(s) in \`docs/plans/\`, check \`docs/plan-registry.md\`, continue from first unchecked \`[ ]\``
    : `- For new features: describe the approach before implementing`;

  return `${config.description}

**Stack**: ${langLine}

See \`docs/ARCHITECTURE.md\` for architecture, conventions, and structure.

## Init
- Use Repomix MCP for codebase context instead of reading files individually
- Do NOT explore the codebase blindly — use Repomix MCP and \`docs/ARCHITECTURE.md\` first
${config.hasMultiPlanning ? `- Check \`docs/spec-registry.md\` for the feature roadmap and \`docs/plan-registry.md\` for active tasks` : ''}

## During Work
- Follow the conventions in \`docs/ARCHITECTURE.md\`
- Be proactive: ask clarifying questions before assuming — especially if the description is brief or vague
${planningRules}
- Use Plan Mode (Shift+Tab) for complex changes

## Before Committing
${config.hasMultiPlanning ? `- Update \`docs/plan-registry.md\` (mark \`[x]\` completed, add new \`[ ]\` if needed)
- If new feature added: update \`docs/spec-registry.md\`
- Once a feature is fully shipped (all steps \`[x]\`), remove its tasks from plan-registry to keep it lean` : ''}
- If architecture changed: ask the user (via AskUserQuestion) what changed and why before updating \`docs/ARCHITECTURE.md\` — don't auto-update silently
${testLine}
${lintLine}
`;
}

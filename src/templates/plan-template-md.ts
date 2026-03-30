export function generatePlanTemplateMd(): string {
  return `# Feature: {name}

## Objective
{What this feature does and why it's needed}

## Steps
- [ ] 1. {First implementation step}
- [ ] 2. {Second implementation step}
- [ ] 3. {Third implementation step}

## Acceptance Criteria
- {Criterion 1}
- {Criterion 2}

## Notes
- {Any relevant context, dependencies, or constraints}
`;
}

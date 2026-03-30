export type HookMode = 'auto' | 'reminder' | 'none';

export function generatePreCommitHook(mode: HookMode): string | null {
  if (mode === 'none') return null;

  if (mode === 'reminder') {
    return `#!/usr/bin/env bash
echo "cc-optim: Remember to run 'npx repomix' and update docs/ARCHITECTURE.md if structure changed"
`;
  }

  // Auto mode with stash trick for clean staged-only scanning
  return `#!/usr/bin/env bash
# cc-optim pre-commit hook (auto mode)
# Only regenerates repomix when substantial source files change.
# Uses stash trick to ensure repomix only sees staged content.

SOURCE_CHANGES=$(git diff --cached --name-only | grep -vE '^(docs/|tests?/|__tests__/|\\..*ignore|.*\\.md|.*\\.json|.*\\.lock)$')

if [ -n "$SOURCE_CHANGES" ]; then
  echo "cc-optim: Source files changed, regenerating repomix..."

  # 1. Stash unstaged changes so repomix only sees what's being committed
  git commit -m "temp" --no-verify > /dev/null 2>&1
  HAS_UNSTAGED=false
  if ! git diff-index --quiet HEAD --; then
      HAS_UNSTAGED=true
      git stash push -k -q -m "cc-optim-temp-stash"
  fi
  git reset --soft HEAD~1 > /dev/null 2>&1

  # 2. Run repomix on clean staged content only
  npx repomix

  # 3. Stage the regenerated output
  git add repomix-output.xml 2>/dev/null || git add repomix-output.md 2>/dev/null || git add repomix-output.txt 2>/dev/null
  echo "cc-optim: repomix output updated and staged"

  # 4. Restore user's unstaged changes
  if [ "$HAS_UNSTAGED" = true ]; then
      git stash pop -q
  fi
fi
`;
}

# cc-optim

CLI tool that sets up an optimized Claude Code environment in any project. Eliminates the "Context Tax" — the wasted tokens and time Claude spends re-reading files it doesn't need.

## Quick Start

```bash
npx cc-optim
```

Run in any project directory. The interactive TUI guides you through setting up three optimization layers.

## What It Does

### Layer 1: Structural (Code Map)
Packages your codebase into a single structured file using [Repomix](https://github.com/yamadashy/repomix). Claude reads this cached snapshot instead of opening files one by one.

- Installs Repomix as devDependency
- Generates `.repomixignore`, `.claudeignore`, `repomix.config.json`
- Optionally configures Repomix as MCP server

### Layer 2: Semantic (Rules & Plans)
Creates living documentation that Claude reads **before** touching code. Defines rules, architecture, and a structured planning system.

- `CLAUDE.md` — System prompt with strict rules (read automatically by Claude Code)
- `docs/ARCHITECTURE.md` — Architecture overview (skeleton or auto-generated)
- `docs/spec-registry.md` — Feature index (links to detailed plans)
- `docs/plan-registry.md` — Active sprint checklist
- `docs/plans/` — Per-feature plan files with structured format

### Layer 3: Memory (Persistent Context)
Ensures Claude remembers context between sessions using [Grov](https://github.com/TonyStef/Grov) + git hooks.

- Installs Grov as devDependency
- Configures git pre-commit hook (auto/reminder/none)
- Auto mode uses stash trick to only scan staged files

## How the Planning System Works

```
CLAUDE.md (auto-read on session start)
  -> docs/spec-registry.md (feature roadmap: what exists)
  -> docs/plan-registry.md (active sprint: what to do now)
  -> docs/plans/feature.md (detailed steps: how to do it)
```

Claude reads the plan, executes step-by-step, marks `[x]` as completed, and updates the registry before committing.

## Recommendations

- **Start every session** with `npx grov claude` for persistent memory
- **Use Plan Mode** (Shift+Tab) for complex changes
- **Run `npx repomix`** after major code changes to refresh the snapshot
- **Review CLAUDE.md** after setup and customize the rules for your project
- **Fill in ARCHITECTURE.md** — the more context you provide, the less Claude explores blindly

## Requirements

- Node.js >= 18
- npm, pnpm, yarn, or bun (auto-detected)

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenSpecTrace is a Claude Code skill/command generator that extends the OpenSpec framework with business logic archiving and retrieval capabilities. It produces two skills (`opst-code-anysic`, `opst-business-search`) and their corresponding slash commands, installed as `.claude/skills/` and `.claude/commands/` files in target workspaces.

## Build & Run

```bash
# Build TypeScript to dist/
npm run build

# Watch mode during development
npm run dev

# Install generated skills into current workspace's .claude/ directory
npm run install-skills

# Initialize a project (knowledge base skeleton + skills + commands)
node dist/cli/install.js init

# Install/update skills only (no knowledge base)
node dist/cli/install.js install

# Dry-run (preview file paths without writing)
node dist/cli/install.js --dry-run
```

No test framework is configured. No linter is configured.

## Architecture

The project is a **CLI tool** that generates Markdown skill files from TypeScript templates. There is no runtime server or library API.

### Data Flow

```
SkillTemplate / CommandTemplate (TypeScript objects)
    ↓ generateSkillContent() / generateCommandContent()
YAML frontmatter + Markdown string
    ↓ generateOpstSkills()
.claude/skills/<name>/SKILL.md  +  .claude/commands/opst/<id>.md
```

### Key Modules

- `src/core/templates/types.ts` — `SkillTemplate` and `CommandTemplate` interfaces
- `src/core/templates/workflows/*.ts` — Template content for each workflow (the skill instructions are natural-language prompts, not executable code)
- `src/core/templates/skill-templates.ts` — Barrel re-export of all workflow templates
- `src/core/skill-generation.ts` — Registry (`getSkillTemplates()`, `getCommandTemplates()`), content rendering (YAML frontmatter generation), and file I/O (`generateOpstSkills()`)
- `src/cli/install.ts` — CLI entry with `init` (creates knowledge base skeleton + installs skills) and `install` (skills only) subcommands

### Adding a New Workflow

1. Create `src/core/templates/workflows/<name>.ts` exporting `get<Name>SkillTemplate()` and `get<Name>CommandTemplate()`
2. Re-export from `src/core/templates/skill-templates.ts`
3. Register in `src/core/skill-generation.ts` → `getSkillTemplates()` and `getCommandTemplates()`

### Knowledge Base Structure (generated in target projects)

```
openspec/openspec-trace/
├── GLOBAL_INDEX.md          # Cross-module keyword index
└── <domain>/<module>/
    ├── INDEX.md             # Module overview
    ├── CHANGELOG.md         # Version history
    └── v<N>-<date>.md       # Versioned design documents
```

## Conventions

- ESM-only (`"type": "module"` in package.json, `NodeNext` module resolution)
- Target: ES2022, Node.js >= 20.19.0
- Zero runtime dependencies — only `typescript` and `@types/node` as devDependencies
- All documentation and skill instructions are written in Chinese
- OpenSpec workflow used for contributions: `/opsx:propose` → `/opsx:apply` → `/opsx:archive` → `/opst:code-anysic`

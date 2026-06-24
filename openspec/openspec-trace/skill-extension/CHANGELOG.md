# 变更日志：Skill 扩展实现

## v1 — 2026-06-24

**变更**：extend-core-flow-skills

初始实现。参考 OpenSpec 源码架构（`@fission-ai/openspec` v1.4.1），建立 TypeScript 代码生成层，将 Skill 定义从手写 SKILL.md 转变为由代码驱动的生成产物。

新增：
- `src/core/templates/types.ts`：`SkillTemplate`、`CommandTemplate` 类型定义
- `src/core/templates/workflows/code-anysic.ts`：`/opst:code-anysic` workflow 模板
- `src/core/templates/workflows/business-search.ts`：`/opst:business-search` workflow 模板
- `src/core/templates/skill-templates.ts`：统一导出 facade
- `src/core/skill-generation.ts`：注册表、`generateSkillContent`、`generateCommandContent`、`generateOpstSkills`
- `src/cli/install.ts`：CLI 入口，支持 `--workspace`、`--dry-run` 选项

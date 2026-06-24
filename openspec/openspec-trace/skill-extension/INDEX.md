# Skill 扩展实现 — 模块索引

> 领域：openspec-trace | 最后更新：2026-06-24

## 模块概览

OpenSpecTrace 的 Skill 扩展实现模块。基于 OpenSpec 源码架构思想，通过 TypeScript 代码层定义 Skill 模板，由 CLI 工具（`opst install`）生成 `.claude/skills/` 和 `.claude/commands/` 下的 Skill 文件，而非手写 SKILL.md。

核心价值：Skill 定义的真正来源在 `src/core/templates/workflows/` 的 TypeScript 文件中，SKILL.md 是生成产物，可随时重新生成和更新。

## 版本历史

| 版本 | 日期 | 变更 | 文档 |
|------|------|------|------|
| v1 | 2026-06-24 | extend-core-flow-skills | [查看](v1-2026-06-24.md) |

## 入口点

| 方法 | 路径 | 说明 |
|------|------|------|
| CLI | `node dist/cli/install.js` | 安装/更新 skills 到 .claude/ |
| npm | `npm run install-skills` | 同上，通过 npm 脚本调用 |
| 函数 | `generateOpstSkills(workspaceRoot)` | 编程方式调用生成逻辑 |

## 已知业务规则

- 每个 workflow 对应 `src/core/templates/workflows/` 下一个 `.ts` 文件，导出 `get<Name>SkillTemplate()` 和 `get<Name>CommandTemplate()` 两个函数
- 新增 workflow 只需：新建 `.ts` 文件 → 在 `skill-templates.ts` 添加 export → 在 `skill-generation.ts` 注册表追加条目
- SKILL.md 的 `generatedBy` 字段嵌入版本号，用于检测过期 skill
- YAML frontmatter 中 `description` 使用 block scalar（`>`）以兼容中文特殊字符
- `--dry-run` 模式仅打印生成路径，不写入文件

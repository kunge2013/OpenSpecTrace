---
change: extend-core-flow-skills
status: proposed
created: 2026-06-24
---

# 变更：扩展 OpenSpec 核心流程技能

## 为什么

OpenSpec 标准工作流（`/opsx:propose` → `/opsx:apply` → `/opsx:archive`）存在两个关键缺口：

1. **代码逻辑归档缺失**：`apply` 阶段完成后，业务逻辑散落在各个源文件中，没有集中式的知识归档。新团队成员和 AI 代理每次都必须从头重新理解。

2. **业务知识难以检索**：随着多次迭代变更，理解某个功能模块的完整逻辑变得越来越困难。OpenSpec 的 `specs/` 目录只保存需求规范，不保存代码级别的业务逻辑实现细节。

现有的 `code2doc-kunge2013` 技能可以从 Java/Spring Controller 代码生成设计文档，但它是独立的单次工具，没有集成到 OpenSpec 变更生命周期中。

## 变更内容

本次变更不只是创建 Skill 定义文件，而是**基于 OpenSpec 源码架构思想**，完整实现两个可执行技能，形成 **"代码生成 → 逻辑归档 → 业务检索"** 的闭环。

### 核心设计思想（借鉴 OpenSpec 源码架构）

参考 `@fission-ai/openspec` 的架构模式：

1. **Schema 驱动**：如同 OpenSpec 的 `spec-driven` schema 定义 artifact DAG，新技能也通过结构化的 schema 驱动知识库的组织方式
2. **三层解析**：借鉴 OpenSpec 的 schema 解析优先级（项目 > 用户 > 包），知识检索也按领域 > 模块 > 版本三层检索
3. **Delta 增量**：如同 OpenSpec 的 delta spec 系统（ADDED/MODIFIED/REMOVED），业务逻辑归档也支持版本增量更新
4. **CLI + Skill 双层**：如同 OpenSpec 的 `dist/cli/` + `.claude/skills/` 双层架构，新技能也提供 CLI 命令入口 + Skill 定义
5. **JSON 输出**：如同 OpenSpec 的 `--json` 标志供 AI 消费，新技能的检索结果也提供结构化 JSON 输出

### 1. `/opst:code-anysic`（代码分析与归档）

**不仅仅是 Skill 定义，而是包含：**

- **CLI 命令脚本**：`.claude/commands/opst/code-anysic.md` 中定义完整的命令工作流（类似 `openspec-archive-change` 的 SKILL.md 模式）
- **代码分析引擎**：继承 `code2doc-kunge2013` 的五段式文档生成逻辑，通过 Bash + Grep + Glob 工具链实现
- **知识库写入**：自动在 `openspec/specs/<领域>/<模块>/` 下创建版本化文档
- **元数据管理**：YAML frontmatter + INDEX.md + CHANGELOG.md + GLOBAL_INDEX.md 三级索引
- **Delta 增量支持**：同一模块多次归档时，生成 `v<N>-<日期>.md` 新版本，并在 CHANGELOG 中追加记录

### 2. `/opst:business-search`（业务逻辑检索）

**不仅仅是 Skill 定义，而是包含：**

- **CLI 命令脚本**：`.claude/commands/opst/business-search.md` 中定义完整的检索工作流
- **检索引擎**：通过 Grep + Glob + Read 工具链扫描 `openspec/specs/` 目录
- **结构化输出**：检索结果以结构化格式展示（领域、模块、版本、关键词、入口点）
- **多模式检索**：
  - 关键词检索：匹配 GLOBAL_INDEX.md 中的关键词列
  - 浏览模式：展示领域树结构
  - 精确查看：读取指定模块的 INDEX.md 或指定版本文档
- **JSON 输出模式**：支持 `--json` 标志输出结构化检索结果（供其他技能消费）

## 影响范围

- **新增目录**：`.claude/commands/opst/` 和 `.claude/skills/opst-code-anysic/`、`.claude/skills/opst-business-search/`
- **新增文件**：`openspec/specs/GLOBAL_INDEX.md`（知识库索引骨架）
- **知识库结构**：`openspec/specs/<领域>/<模块>/` 下的版本化文档
- **风险等级**：低 —— 纯增量变更，不修改现有 OpenSpec 技能、CLI 或 `openspec/changes/` 结构

## 非目标

- 不修改现有的 `/opsx:*` 命令或技能
- 不修改 OpenSpec 的 `spec-driven` schema 或 artifact 系统
- 不在 `/opsx:apply` 过程中自动添加代码分析（仅手动触发）
- 初始版本不支持 Java/Spring + MyBatis 以外的语言（后续可扩展）
- 不实现完整的 LLM Wiki 服务器 —— 使用 `openspec/specs/` 下的文件方案
- 不替代现有的 `code2doc-kunge2013` 全局技能（新技能是独立的增强版本）

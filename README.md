# OpenSpecTrace

> OpenSpec 闭环开发增强套件 —— 基于 OpenSpec 框架的二次开发，为规范驱动开发注入知识管理能力。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![OpenSpec](https://img.shields.io/badge/OpenSpec-1.3.1-green)](https://github.com/Fission-AI/OpenSpec)

---

## 📖 目录

- [背景](#背景)
- [核心能力](#核心能力)
- [闭环工作流](#闭环工作流)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [Skill 详解](#skill-详解)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 🎯 背景

[OpenSpec](https://github.com/Fission-AI/OpenSpec) 是目前主流的规范驱动开发框架，通过 `/opsx:propose` → `/opsx:apply` → `/opsx:archive` 三阶段工作流实现需求到代码的闭环管理。但在实际落地中，存在两个常见痛点：

- **代码逻辑归档缺失**：`apply` 阶段完成后，新功能代码的业务逻辑散落在各个源文件中，缺少集中式的逻辑归档，后续检索困难
- **业务知识难以检索**：随着变更增多，过往的业务逻辑分散在代码和规范中，新成员或 AI 无法快速理解某个功能模块的完整逻辑

**OpenSpecTrace** 通过在 OpenSpec 框架基础上新增两个 Skill，实现 **"代码生成 → 逻辑归档 → 业务检索"** 的完整闭环。

---

## 📦 核心能力

### 1. 代码逻辑归档（`/opst:code-anysic`）

在 `/opsx:archive` 完成后，手动触发分析已归档变更的代码，提取业务逻辑并自动归档至 `openspec/openspec-trace/<领域>/<模块>/` 目录，生成版本化的结构化知识库。

**核心特性：**
- 自动识别变更范围，读取 `proposal.md`、`design.md`、`tasks.md` 和 git diff
- 继承 `code2doc-kunge2013` 的五段式文档生成（接口、流程图、逻辑、ER 图、源码清单）
- 按领域/模块组织归档，每次变更生成 `v<N>-<日期>.md` 版本化文档
- 自动维护三级索引：`INDEX.md`（模块概览）、`CHANGELOG.md`（版本历史）、`GLOBAL_INDEX.md`（全局检索）
- 基于 OpenSpec 的 delta spec 增量思想，支持同一模块多次迭代归档

### 2. 业务逻辑检索（`/opst:business-search`）

通过关键词自然语言检索已归档的业务规则、功能逻辑和代码入口，快速定位历史实现，辅助新功能开发与问题排查。

**核心特性：**
- 支持三种模式：关键词检索、领域浏览、精确模块查看
- 搜索 `GLOBAL_INDEX.md` 及各模块 `INDEX.md`，按相关性排序
- 摘要预览 + 深度查看，按需读取完整设计文档
- 支持 `--json` 结构化输出，供其他技能消费
- 知识库为空时自动引导用户先执行 `/opst:code-anysic`

---

## 🔄 闭环工作流

```
┌─────────────────────────────────────────────────────────────────┐
│                    标准 OpenSpec 工作流                           │
│                                                                 │
│  /opsx:propose  ──→  /opsx:apply  ──→  /opsx:archive            │
│  （提案 + 设计）      （代码实现）        （归档变更）              │
│                                              │                   │
└──────────────────────────────────────────────┼──────────────────┘
                                               │
                          ┌────────────────────▼──────────────────┐
                          │         OpenSpecTrace 扩展层           │
                          │                                        │
                          │  /opst:code-anysic                    │
                          │  （分析代码 → 归档业务逻辑）            │
                          │              │                         │
                          │              ▼                         │
                          │  openspec/openspec-trace/<领域>/<模块>/   │
                          │  ├── GLOBAL_INDEX.md                   │
                          │  ├── INDEX.md                          │
                          │  ├── CHANGELOG.md                      │
                          │  └── v<N>-<日期>.md                    │
                          │              │                         │
                          │              ▼                         │
                          │  /opst:business-search <关键词>        │
                          │  （检索业务逻辑知识库）                  │
                          └────────────────────────────────────────┘
```

### 完整使用示例

```bash
# 1. 规划变更
/opsx:propose add-payment-cancel

# 2. 实现代码
/opsx:apply add-payment-cancel

# 3. 归档变更
/opsx:archive add-payment-cancel

# 4. 提取业务逻辑归档到知识库
/opst:code-anysic add-payment-cancel

# 5. 下次开发前检索已有实现
/opst:business-search payment cancel
/opst:business-search 列出所有
/opst:business-search billing/payment-processing
```

---

## 🚀 快速开始

### 安装

```bash
npm install -g openspec-trace
```

### 初始化项目

```bash
cd your-project

# 一步完成：知识库骨架 + skills + commands
opst init
```

### 使用

```bash
# 在 Claude Code 中
/opst:code-anysic           # 分析代码并归档业务逻辑
/opst:business-search       # 检索已归档的业务逻辑
```

> 完整的安装选项、CLI 参数和常见问题，请参阅 [docs/usage.md](docs/usage.md)。

---

## 📁 目录结构

```
OpenSpecTrace/
├── bin/
│   └── opst.js                          # CLI 入口（shebang）
├── src/
│   ├── cli/
│   │   └── install.ts                   # CLI 主逻辑（init / install）
│   └── core/
│       ├── skill-generation.ts          # 注册表 + 内容生成 + 文件写入
│       └── templates/
│           ├── types.ts                 # SkillTemplate / CommandTemplate 接口
│           ├── skill-templates.ts       # 统一 re-export 入口
│           └── workflows/
│               ├── code-anysic.ts       # /opst:code-anysic 模板
│               └── business-search.ts   # /opst:business-search 模板
├── dist/                                # 编译产物（npm run build）
├── docs/
│   └── usage.md                         # 安装与使用指南
├── package.json
├── tsconfig.json
├── openspec/                            # opst init 在目标项目中生成的知识库
│   ├── config.yaml                      # OpenSpec 项目配置
│   ├── changes/
│   │   └── archive/                     # 已归档变更
│   └── openspec-trace/                  # 业务逻辑知识库
│       ├── GLOBAL_INDEX.md              # 全局检索索引
│       └── <领域>/
│           └── <模块>/
│               ├── INDEX.md             # 模块概览
│               ├── CHANGELOG.md         # 版本历史
│               └── v<N>-<日期>.md       # 五段式设计文档
└── .claude/                             # opst init 在目标项目中生成的技能文件
    ├── commands/
    │   └── opst/
    │       ├── code-anysic.md           # /opst:code-anysic 命令
    │       └── business-search.md       # /opst:business-search 命令
    └── skills/
        ├── opst-code-anysic/
        │   └── SKILL.md                 # 代码分析与归档技能
        └── opst-business-search/
            └── SKILL.md                 # 业务逻辑检索技能
```

---

## 📚 Skill 详解

### `/opst:code-anysic`（代码分析与归档）

**触发条件**：执行 `/opsx:archive` 归档变更后手动触发。

**工作流**：
1. 确定分析目标（默认最近归档变更，可指定）
2. 读取 proposal.md、design.md、tasks.md 提取上下文
3. 通过 git diff 获取变更文件，分类分析 Controller/Service/Mapper/XML
4. 从 Java 包名推导业务领域和模块（用户确认）
5. 生成五段式设计文档（接口定义、流程图、逻辑详情、ER 图、源码清单）
6. 写入 `openspec/openspec-trace/<领域>/<模块>/v<N>-<日期>.md`
7. 更新 INDEX.md、CHANGELOG.md、GLOBAL_INDEX.md 三级索引

**输出文档格式**（五段式，继承 code2doc-kunge2013）：
```
## 1. 接口定义
## 2. 业务流程图（mermaid）
## 3. 业务逻辑详情（SQL + Java）
## 4. 表结构 ER 图（mermaid）
## 5. 源码文件清单
```

---

### `/opst:business-search`（业务逻辑检索）

**触发条件**：需要了解某模块历史实现、查找代码入口、或开始新功能前理解现有逻辑。

**三种检索模式**：

| 模式 | 命令示例 | 说明 |
|------|----------|------|
| 关键词检索 | `/opst:business-search payment cancel` | 在 GLOBAL_INDEX 和各 INDEX.md 中匹配关键词 |
| 浏览模式 | `/opst:business-search 列出所有` | 展示完整领域树 |
| 精确查看 | `/opst:business-search billing/payment` | 直接读取指定模块 INDEX.md |

---

## 🤝 贡献指南

本项目基于 OpenSpec 工作流开发，使用 `/opsx:propose` 提交变更提案。

---

## 📄 许可证

MIT License
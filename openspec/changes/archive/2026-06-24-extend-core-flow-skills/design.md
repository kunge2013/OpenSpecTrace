# 设计：扩展 OpenSpec 核心流程技能

## 架构概览

本设计借鉴 OpenSpec（`@fission-ai/openspec` v1.3.1）的源码架构模式，在其之上构建扩展技能层。

### OpenSpec 源码架构对照

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenSpec 源码架构                              │
│                                                                 │
│  bin/openspec.js                                                │
│  └── dist/cli/index.js (Commander.js CLI 框架)                   │
│       ├── dist/core/init.js          ← 初始化命令                │
│       ├── dist/core/archive.js       ← 归档命令                  │
│       ├── dist/core/list.js          ← 列表命令                  │
│       ├── dist/commands/workflow/    ← 工作流命令簇               │
│       │    ├── new-change.js         ← 创建变更                  │
│       │    ├── status.js             ← 状态检查                  │
│       │    ├── instructions.js       ← 指令生成                  │
│       │    └── templates.js          ← 模板管理                  │
│       ├── dist/core/artifact-graph/  ← Artifact 图引擎           │
│       │    ├── graph.js             ← DAG 拓扑排序               │
│       │    ├── state.js             ← 完成状态检测               │
│       │    └── instruction-loader.js ← 指令加载器                │
│       └── dist/core/specs-apply.js   ← Delta 规范合并            │
│                                                                 │
│  schemas/spec-driven/                                           │
│  ├── schema.yaml          ← 工作流 Schema 定义                   │
│  └── templates/           ← Artifact 模板                        │
│       ├── proposal.md, design.md, tasks.md, spec.md             │
│                                                                 │
│  .claude/skills/openspec-*/     ← AI 技能层（调用 CLI）          │
│  .claude/commands/opsx/         ← 斜杠命令层（引用技能）          │
└─────────────────────────────────────────────────────────────────┘
```

### 扩展层架构（本变更）

```
┌─────────────────────────────────────────────────────────────────┐
│                    扩展技能层 (opst)                              │
│                                                                 │
│  .claude/commands/opst/                                         │
│  ├── code-anysic.md        ← /opst:code-anysic 命令定义          │
│  │   （完整工作流：识别变更 → 分析代码 → 生成文档 → 更新索引）     │
│  └── business-search.md    ← /opst:business-search 命令定义      │
│      （完整工作流：解析查询 → 检索索引 → 展示结果 → 查看文档）     │
│                                                                 │
│  .claude/skills/                                                │
│  ├── opst-code-anysic/                                          │
│  │   └── SKILL.md          ← 技能定义 + 工具链编排               │
│  │       ├── 代码分析：Bash(git diff) + Grep(注解) + Glob(文件)  │
│  │       ├── 文档生成：Read(源码) → Write(设计文档)              │
│  │       └── 索引更新：Read(INDEX) → Edit(追加) → Write         │
│  └── opst-business-search/                                      │
│      └── SKILL.md          ← 技能定义 + 检索引擎                 │
│          ├── 检索：Grep(关键词) + Glob(文件模式)                 │
│          ├── 解析：Read(YAML frontmatter)                        │
│          └── 展示：结构化输出 / JSON 输出                        │
│                                                                 │
│  openspec/specs/            ← 知识库（文件存储）                  │
│  ├── GLOBAL_INDEX.md        ← 全局检索索引                       │
│  └── <领域>/<模块>/         ← 模块化知识库                       │
│      ├── INDEX.md           ← 模块概览（类似 OpenSpec 的 spec.md）│
│      ├── CHANGELOG.md       ← 版本历史（类似 delta spec 追踪）    │
│      └── v<N>-<日期>.md     ← 归档设计文档                       │
└─────────────────────────────────────────────────────────────────┘
```

## 与 OpenSpec 架构的对应关系

| OpenSpec 概念 | 扩展层对应实现 | 说明 |
|---------------|---------------|------|
| `spec-driven` schema | 知识库目录结构 | `specs/<领域>/<模块>/` 类似 `specs/<capability>/` |
| Artifact DAG | 文档版本链 | `v1 → v2 → v3` 的版本演进链 |
| Delta spec (ADDED/MODIFIED) | CHANGELOG.md 追加 | 每次归档追加一条变更记录 |
| `openspec status --json` | GLOBAL_INDEX.md 检索 | 结构化输出供 AI 消费 |
| `openspec instructions apply` | INDEX.md 入口点 | 提供代码入口和实现指引 |
| 三层 schema 解析 | 三层知识检索 | 领域 → 模块 → 版本 |
| Commander.js CLI | Claude Code 命令 | `.claude/commands/` 替代 Commander |
| ArtifactGraph DAG | 工具链编排 | Bash → Grep → Glob → Read → Write 的顺序执行 |

## 目录结构

```
D:\github.io\OpenSpecTrace\
├── openspec/
│   ├── config.yaml
│   ├── changes/
│   │   ├── <活跃变更>/
│   │   └── archive/
│   └── specs/                          ← 知识库根目录
│       ├── GLOBAL_INDEX.md             ← 全局检索索引
│       └── <领域>/                      ← 如 billing、account-management
│           └── <模块>/                  ← 如 payment-processing
│               ├── INDEX.md            ← 模块概览与入口点
│               ├── CHANGELOG.md        ← 版本迭代历史
│               └── v<N>-<日期>.md      ← 归档设计文档
├── .claude/
│   ├── commands/
│   │   ├── opsx/                       ← 现有 OpenSpec 命令
│   │   │   ├── propose.md
│   │   │   ├── apply.md
│   │   │   └── archive.md
│   │   └── opst/                       ← 新增扩展命令
│   │       ├── code-anysic.md
│   │       └── business-search.md
│   └── skills/
│       ├── openspec-*/                 ← 现有 OpenSpec 技能
│       ├── opst-code-anysic/           ← 新增：代码分析与归档
│       │   └── SKILL.md
│       └── opst-business-search/       ← 新增：业务逻辑检索
│           └── SKILL.md
```

## 技能 1：`/opst:code-anysic`（代码分析与归档）

### 命令定义（`.claude/commands/opst/code-anysic.md`）

```yaml
---
name: "OPST: Code Analysis"
description: 分析已归档变更的代码，提取业务逻辑并归档到知识库
category: Workflow
tags: [workflow, analysis, archival]
---
```

### 工作流实现

命令文件中定义完整的执行步骤（类似 `openspec-archive-change` 的 SKILL.md 模式）：

```
步骤 1：确定分析目标
  ├── 默认：最近一次已归档的变更（openspec/changes/archive/ 下最新）
  ├── 或：用户指定变更名称
  └── Bash: ls -t openspec/changes/archive/ | head -1

步骤 2：读取变更上下文
  ├── Read: archive/<变更>/proposal.md
  ├── Read: archive/<变更>/design.md
  └── Read: archive/<变更>/tasks.md

步骤 3：获取代码变更 diff
  ├── Bash: git diff <base-commit>..<head-commit> --name-only
  ├── 过滤 Java 文件：*.java, *.xml
  ├── 分类文件类型：
  │   ├── Controller: *Controller.java
  │   ├── Service: *Service.java, *ServiceImpl.java
  │   ├── Mapper: *Mapper.java
  │   └── XML: *Mapper.xml
  └── 提取注解：
      ├── Grep: @TableName → 数据表映射
      ├── Grep: @RequestMapping → API 路径
      └── Grep: @PostMapping/@GetMapping → HTTP 方法

步骤 4：确定领域与模块
  ├── 从 Java 包名提取：com.tianyuan.bill → billing（领域）
  ├── 从子包名提取：com.tianyuan.bill.service.payment → payment（模块）
  ├── 从 proposal.md 上下文确认
  └── 用户确认或覆盖

步骤 5：生成设计文档（复用 code2doc-kunge2013 模式）
  ├── Read: Controller 源文件 → 提取接口定义
  ├── Read: Service 源文件 → 追踪业务逻辑
  ├── Read: Entity 源文件 → 提取表结构
  ├── Read: XML Mapper → 提取 SQL
  ├── 生成五段式文档：
  │   ├── 1. 接口定义（URL、方法、入参/出参 JSON）
  │   ├── 2. 流程图（mermaid）
  │   ├── 3. 业务逻辑详情（SQL + Java 代码）
  │   ├── 4. ER 图（mermaid）
  │   └── 5. 源码文件清单
  └── 生成 YAML frontmatter 元数据

步骤 6：写入知识库
  ├── 确定版本号：Glob openspec/specs/<领域>/<模块>/v*.md → 取最大 N → N+1
  ├── Write: openspec/specs/<领域>/<模块>/v<N>-<日期>.md
  ├── 创建/更新 INDEX.md：
  │   ├── 新模块：创建完整 INDEX.md
  │   └── 已有模块：追加版本到版本表
  └── 追加 CHANGELOG.md

步骤 7：更新全局索引
  ├── Read: openspec/specs/GLOBAL_INDEX.md
  ├── 添加新模块到"按领域"分区（如新）
  ├── 添加关键词到"按关键词"分区
  └── Write: 更新后的 GLOBAL_INDEX.md
```

### 知识库文档格式

#### 归档设计文档（`v<N>-<日期>.md`）

```markdown
---
domain: billing
module: payment-processing
version: 1
date: 2026-06-24
change: extend-core-flow-skills
keywords:
  - payment
  - write-off
  - customization
code-entry:
  controller: com.tianyuan.bill.controller.PaymentController
  service: com.tianyuan.bill.service.PaymentService
---

# 支付销账处理 - v1

## 1. 接口定义
...

## 2. 业务流程图
...

## 3. 业务逻辑详情
...

## 4. 表结构 ER 图
...

## 5. 源码文件清单
...
```

#### INDEX.md（模块概览）

```markdown
# 模块：支付销账处理

**领域**：计费（billing）
**代码入口**：`PaymentController`
**关联规范**：`billing/payment-processing`

## 概述

支付销账模块，支持定制、预开、关联等多种账单类型的销账处理。

## 版本

| 版本 | 日期 | 变更 | 摘要 |
|------|------|------|------|
| v1 | 2026-06-24 | extend-core-flow-skills | 初始归档：支付销账逻辑 |

## 入口点

| 接口 | URL | 方法 | 文件 |
|------|-----|------|------|
| 销账 | `POST /bill/cancel` | `cancelZq()` | `PaymentController.java:42` |

## 核心业务规则

- 支持定制账单（type=0）和预开账单（type=1）两种销账方式
- 销账时自动更新账户余额和账单状态
```

#### CHANGELOG.md（版本历史）

```markdown
# 变更日志：支付销账处理

## v1 - 2026-06-24

- **变更**：extend-core-flow-skills
- **摘要**：初始归档支付销账逻辑
- **文档**：[v1-2026-06-24.md](./v1-2026-06-24.md)
- **变更文件**：PaymentController.java, PaymentServiceImpl.java, PaymentMapper.xml
```

#### GLOBAL_INDEX.md（全局索引）

```markdown
# 全局业务逻辑索引

> 自动生成，请勿手动编辑。使用 /opst:code-anysic 更新。

## 按领域

### billing（计费）

| 模块 | 入口点 | 最后更新 | 关键词 |
|------|--------|----------|--------|
| [payment-processing](./billing/payment-processing/INDEX.md) | PaymentController | 2026-06-24 | payment, write-off |

## 按关键词

| 关键词 | 领域 | 模块 | 链接 |
|--------|------|------|------|
| payment | billing | payment-processing | [链接](./billing/payment-processing/INDEX.md) |
```

## 技能 2：`/opst:business-search`（业务逻辑检索）

### 命令定义（`.claude/commands/opst/business-search.md`）

```yaml
---
name: "OPST: Business Search"
description: 检索已归档的业务逻辑知识库
category: Workflow
tags: [workflow, search, knowledge]
---
```

### 工作流实现

```
步骤 1：解析查询
  ├── 从用户输入提取关键词
  ├── 判断模式：
  │   ├── 检索模式：用户提供了具体关键词 → 搜索匹配
  │   ├── 浏览模式："列出所有"、"展示领域" → 展示完整领域树
  │   └── 精确查看：指定模块名 → 直接读取 INDEX.md
  └── 提取的关键词用于后续 Grep 匹配

步骤 2：执行检索
  ├── 检索模式：
  │   ├── Grep: 关键词 → openspec/specs/GLOBAL_INDEX.md
  │   ├── 匹配"按关键词"表中的关键词列
  │   ├── 匹配"按领域"表中的模块名称
  │   ├── Glob: openspec/specs/**/INDEX.md
  │   └── Grep: 关键词 → 各 INDEX.md 文件
  ├── 浏览模式：
  │   └── Read: openspec/specs/GLOBAL_INDEX.md → 展示完整内容
  └── 精确查看：
      └── Read: openspec/specs/<领域>/<模块>/INDEX.md

步骤 3：展示结果
  ├── 检索模式：展示匹配模块列表
  │   ├── 模块名称与领域
  │   ├── 匹配的关键词（高亮）
  │   ├── 最后更新日期
  │   ├── 版本数量
  │   ├── 入口点
  │   └── 提供后续操作选项：
  │       ├── 查看完整 INDEX
  │       ├── 查看版本历史
  │       └── 阅读指定版本文档
  ├── 浏览模式：展示完整领域树
  └── 精确查看：展示 INDEX.md 完整内容

步骤 4（可选）：JSON 输出
  └── 如用户要求 --json 输出：
      ├── 将检索结果格式化为 JSON
      ├── 包含字段：domain, module, versions, keywords, entry_points
      └── 输出供其他技能或脚本消费
```

### 检索输出格式

**检索模式输出**：

```
检索关键词："payment write-off"

找到 2 个匹配模块：

### billing/payment-processing（计费/支付销账处理）
  领域：billing
  入口：PaymentController（POST /bill/cancel）
  版本：v1（2026-06-24）
  关键词：payment, write-off, customization, acct_item
  摘要：支付销账逻辑，支持定制、预开、关联等多种账单类型。
  [查看 INDEX] [查看 CHANGELOG] [阅读 v1 文档]

### billing/invoice-calculation（计费/发票计算）
  领域：billing
  入口：InvoiceController（POST /invoice/calculate）
  版本：v1（2026-06-20）
  关键词：invoice, calculation, payment
  摘要：发票金额计算，与支付记录关联。
  [查看 INDEX] [查看 CHANGELOG] [阅读 v1 文档]
```

**JSON 输出模式**：

```json
{
  "query": "payment write-off",
  "results": [
    {
      "domain": "billing",
      "module": "payment-processing",
      "index_path": "openspec/specs/billing/payment-processing/INDEX.md",
      "versions": [{"version": 1, "date": "2026-06-24", "change": "extend-core-flow-skills"}],
      "keywords": ["payment", "write-off", "customization", "acct_item"],
      "entry_points": [{"url": "POST /bill/cancel", "method": "cancelZq()"}]
    }
  ]
}
```

## 技术决策

1. **文件型知识库**：使用 `openspec/specs/` 下的 markdown 文件，借鉴 OpenSpec 的文件存储模式。所有内容纳入 git 版本控制，支持基于 diff 的版本追踪，无需额外基础设施。

2. **YAML frontmatter**：借鉴 OpenSpec 的 `.openspec.yaml` 元数据模式，每个归档文档包含结构化元数据用于检索。

3. **版本化文档**：每次归档创建新的 `v<N>-<日期>.md` 文件而非覆盖，借鉴 OpenSpec 的变更归档模式（`archive/YYYY-MM-DD-<name>/`）。

4. **继承 code2doc-kunge2013**：五段式文档格式保持不变，增强点在于自动归档、元数据和可检索性。

5. **CLI + Skill 双层架构**：借鉴 OpenSpec 的 `dist/cli/` + `.claude/skills/` 架构，命令文件（`.md`）定义工作流，技能文件（`SKILL.md`）提供执行细节。

6. **工具链编排**：不引入新的编程语言或框架，纯靠 Claude Code 的 Bash/Grep/Glob/Read/Write/Edit 工具链实现，与 OpenSpec 的 AI-as-first-class-consumer 设计一致。

## 文件位置清单

| 文件 | 位置 | 类型 |
|------|------|------|
| `/opst:code-anysic` 命令 | `.claude/commands/opst/code-anysic.md` | 命令定义 |
| `/opst:code-anysic` 技能 | `.claude/skills/opst-code-anysic/SKILL.md` | 技能定义 |
| `/opst:business-search` 命令 | `.claude/commands/opst/business-search.md` | 命令定义 |
| `/opst:business-search` 技能 | `.claude/skills/opst-business-search/SKILL.md` | 技能定义 |
| 全局索引骨架 | `openspec/specs/GLOBAL_INDEX.md` | 知识库索引 |

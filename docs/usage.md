# OpenSpecTrace — 安装与使用指南

## 安装

### 前置要求

- Node.js >= 20.19.0
- npm >= 9
- git

### 全局安装（推荐）

```bash
npm install -g openspec-trace
```

安装完成后，`opst` 命令即可在命令行中直接使用。

### 从源码安装

```bash
git clone https://github.com/your-org/OpenSpecTrace.git
cd OpenSpecTrace
npm run build
npm install -g .
```

### 验证安装

```bash
opst --version
# openspec-trace v1.0.0
```

---

## CLI 命令

```
openspec-trace v1.0.0 — opst skill installer & knowledge base initializer

用法：
  opst init      [options]   初始化项目（知识库骨架 + skills + commands）
  opst [install] [options]   仅安装/更新 skills 和 commands（不含知识库）

选项：
  --workspace, -w <path>   指定工作区根目录（默认：当前目录）
  --dry-run                仅预览将要生成的文件，不实际写入（仅 install）
  --version, -v            显示版本号
  --help, -h               显示帮助
```

---

## 子命令详解

### `opst init`

在目标项目中一次性完成全部初始化：创建知识库骨架 + 安装 skills 和 commands 到 `.claude/`。

```bash
# 在当前目录初始化
opst init

# 指定目标项目
opst init --workspace /path/to/your/project
```

**输出示例：**

```
openspec-trace v1.0.0 — 初始化项目到 D:\your\project

项目初始化完成
工作区：D:\your\project

知识库：
  ✓ 已创建  openspec\openspec-trace\GLOBAL_INDEX.md

Skills（.claude/skills/）:
  ✓ 已创建  .claude\skills\opst-code-anysic\SKILL.md
  ✓ 已创建  .claude\skills\opst-business-search\SKILL.md

Commands（.claude/commands/opst/）:
  ✓ 已创建  .claude\commands\opst\code-anysic.md
  ✓ 已创建  .claude\commands\opst\business-search.md

可用命令：
  /opst:code-anysic        — 分析已归档变更，提取业务逻辑并归档到知识库
  /opst:business-search    — 检索 openspec/openspec-trace/ 知识库中的业务逻辑文档
```

重复执行是安全的：知识库已存在时不会覆盖，skills 会更新到最新版本。

---

### `opst install`

将 `opst-code-anysic` 和 `opst-business-search` 的 SKILL.md 及 command.md 生成到目标工作区的 `.claude/` 目录。

```bash
# 在当前目录安装（默认子命令，可省略 install）
opst

# 指定目标项目
opst install --workspace /path/to/your/project

# 预览模式，不实际写入
opst --dry-run
```

**输出示例：**

```
openspec-trace v1.0.0 — 安装 opst skills 到 D:\your\project

Skills 安装完成
工作区：D:\your\project

Skills（.claude/skills/）:
  ✓ 已创建  .claude\skills\opst-code-anysic\SKILL.md
  ✓ 已创建  .claude\skills\opst-business-search\SKILL.md

Commands（.claude/commands/opst/）:
  ✓ 已创建  .claude\commands\opst\code-anysic.md
  ✓ 已创建  .claude\commands\opst\business-search.md

可用命令：
  /opst:code-anysic        — 分析已归档变更，提取业务逻辑并归档到知识库
  /opst:business-search    — 检索 openspec/openspec-trace/ 知识库中的业务逻辑文档
```

---

## 典型工作流

```bash
# 1. 初始化项目（首次使用，一步到位）
cd your-project
opst init

# 2. 在 Claude Code 中使用
/opst:code-anysic           # 分析代码并归档业务逻辑
/opst:business-search       # 检索已归档的业务逻辑
```

### 与 OpenSpec 标准流程配合

```bash
# OpenSpec 标准流程
/opsx:propose add-payment-cancel
/opsx:apply add-payment-cancel
/opsx:archive add-payment-cancel

# OpenSpecTrace 扩展（archive 后执行）
/opst:code-anysic add-payment-cancel

# 后续开发前检索
/opst:business-search payment cancel
/opst:business-search 列出所有
/opst:business-search billing/payment-processing
```

---

## 生成的目录结构

执行 `opst init` 后，项目中新增以下文件：

```
your-project/
├── openspec/
│   └── openspec-trace/
│       └── GLOBAL_INDEX.md          # 全局检索索引（init 创建，code-anysic 维护）
└── .claude/
    ├── skills/
    │   ├── opst-code-anysic/
    │   │   └── SKILL.md             # 代码分析与归档技能
    │   └── opst-business-search/
    │       └── SKILL.md             # 业务逻辑检索技能
    └── commands/
        └── opst/
            ├── code-anysic.md       # /opst:code-anysic 命令
            └── business-search.md   # /opst:business-search 命令
```

归档业务逻辑后，知识库会自动扩展：

```
openspec/
└── openspec-trace/
    ├── GLOBAL_INDEX.md
    └── <领域>/
        └── <模块>/
            ├── INDEX.md             # 模块概览
            ├── CHANGELOG.md         # 版本历史
            └── v<N>-<YYYY-MM-DD>.md # 五段式设计文档
```

---

## 常见问题

### Git Bash 中 opst 命令无输出

Windows 的 Git Bash 对 `.cmd` 文件的 stdout 处理有兼容性问题。解决方式：

1. 使用 CMD 或 PowerShell（推荐）
2. 或直接用 node 运行：`node $(npm prefix -g)/node_modules/openspec-trace/bin/opst.js init`

### 安装后 opst 命令找不到

确保 npm 全局 bin 目录在系统 PATH 中：

```bash
# 查看 npm 全局前缀
npm prefix -g

# 将该路径加入 PATH（Windows 在系统环境变量中添加）
```

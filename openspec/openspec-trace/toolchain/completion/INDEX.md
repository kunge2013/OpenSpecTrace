# Shell 补全 — 模块索引

> 领域：toolchain | 最后更新：2026-06-24

## 模块概览

为 `opst` CLI 提供 shell 自动补全脚本生成功能。支持 Bash、Zsh、Fish 三种 shell，通过 `opst completion [shell]` 子命令输出对应的补全脚本，用户可 `eval` 或写入 profile 文件启用。

## 版本历史

| 版本 | 日期 | 变更 | 文档 |
|------|------|------|------|
| v1 | 2026-06-24 | cli-tab-completion | [查看](v1-2026-06-24.md) |

## 入口点

| 命令 | 路径 | 说明 |
|------|------|------|
| `opst completion` | `src/cli/install.ts` → completion 分支 | 无参数时输出使用说明 |
| `opst completion bash` | → `src/core/completion/bash.ts` | 输出 Bash 补全脚本 |
| `opst completion zsh` | → `src/core/completion/zsh.ts` | 输出 Zsh 补全脚本 |
| `opst completion fish` | → `src/core/completion/fish.ts` | 输出 Fish 补全脚本 |

## 已知业务规则

- 补全脚本为静态字符串模板，硬编码子命令和选项列表
- 新增子命令或选项时需同步更新各 shell 模板
- 不支持 PowerShell / Windows CMD（设计时明确排除）
- 不自动修改用户 shell 配置文件

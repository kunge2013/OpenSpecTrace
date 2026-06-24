## Context

当前 `opst` CLI 仅注册了 `install` 和 `init` 两个子命令，通过 `bin/opst.js` 作为全局命令暴露。用户在终端输入 `opst` 后需要手动记忆可用子命令和选项，没有任何 shell 补全支持。

现有 CLI 架构基于手工参数解析（`parseArgs`），不依赖 commander/yargs 等框架，因此补全脚本需要独立实现，而非依赖框架内置的补全功能。

## Goals / Non-Goals

**Goals:**

- 提供 `opst completion [bash|zsh|fish]` 子命令，输出对应 shell 的补全脚本
- 补全覆盖所有子命令：`install`、`init`、`completion`
- 补全覆盖所有全局选项：`--workspace`、`--dry-run`、`--version`、`--help`
- 零运行时依赖，补全脚本为纯字符串模板
- 用户可通过 `eval "$(opst completion bash)"` 或写入 profile 文件方式启用

**Non-Goals:**

- 不支持 PowerShell / Windows CMD 补全
- 不实现 `--workspace` 参数的动态目录路径补全
- 不自动修改用户的 shell 配置文件
- 不支持子命令特定选项的上下文感知补全（第一期所有选项统一提供）

## Decisions

### 1. 补全脚本生成方式：静态模板 vs 动态生成

**选择**：静态字符串模板

**理由**：
- `opst` 的命令集较小且固定，无需动态注册
- 静态模板可直接输出，无需运行时解析命令树
- 避免引入额外依赖（如 omelette、tabtab）
- 调试和维护更简单

**备选方案**：
- 使用 `tabtab` 库：引入运行时依赖，与零依赖原则冲突
- 使用 commander 内置 completion：需要重构整个 CLI 到 commander

### 2. 模块组织方式

**选择**：新建 `src/core/completion/` 目录

```
src/core/completion/
├── index.ts          # 导出 getCompletionScript(shell)
├── bash.ts           # Bash 补全脚本模板
├── zsh.ts            # Zsh 补全脚本模板
└── fish.ts           # Fish 补全脚本模板
```

**理由**：
- 与现有 `src/core/templates/` 平级，职责清晰
- 各 shell 脚本独立文件，便于单独维护和测试
- `index.ts` 提供统一接口，CLI 层只需调用一处

### 3. CLI 集成方式

**选择**：在现有 `parseArgs` 中新增 `completion` 子命令分支

**理由**：
- 保持现有架构一致性
- 改动最小，只需在 `main()` 中增加一个 `if` 分支
- 补全脚本输出到 stdout，不需要文件 I/O

### 4. 补全脚本的命令和选项来源

**选择**：硬编码在模板中

**理由**：
- 命令集小且稳定（3 个子命令 + 4 个选项）
- 避免过度抽象（从类型定义动态生成模板会增加复杂度）
- 新增命令时只需同步更新补全模板，与更新 help 文本一致

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 新增子命令时忘记更新补全脚本 | 在 "添加新工作流" 文档中补充提醒；未来可考虑自动化检查 |
| Zsh/Fish 脚本在不同版本 shell 中兼容性差异 | 使用最通用的补全 API（`compdef` for Zsh, `complete` for Fish），避免版本特有功能 |
| 用户不知道如何启用补全 | `opst completion` 无参数时输出使用说明；README 补充文档 |

## Open Questions

- 是否需要在 `opst init` 执行完成后提示用户启用补全？（建议：是，但仅输出提示文字，不自动执行）

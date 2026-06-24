## Why

用户通过 `npm install -g openspec-trace` 全局安装后，每次都需要手动输入完整的 `opst` 命令及其子命令（如 `install`、`init`）。缺少 shell 自动补全支持，降低了使用效率，且用户无法快速发现可用的子命令和选项。

## What Changes

- 新增 shell 补全脚本生成功能，支持 Bash、Zsh、Fish 三种主流 shell
- 新增 `opst completion` 子命令，用于输出对应 shell 的补全脚本
- 补全范围覆盖：子命令（`install`、`init`）、选项（`--workspace`、`--dry-run`、`--version`、`--help`）
- 安装后提示用户如何启用补全（输出 `eval` 指令或写入 profile 文件的说明）

## 非目标

- 不支持 PowerShell / Windows CMD 补全（后续可扩展）
- 不自动修改用户的 shell 配置文件（仅输出脚本，由用户自行决定是否写入）
- 不实现动态文件路径补全（`--workspace` 的路径参数暂不做目录补全）

## Capabilities

### New Capabilities

- `shell-completion`: 提供 `opst completion [bash|zsh|fish]` 子命令，生成对应 shell 的补全脚本，支持子命令和选项的 Tab 补全

### Modified Capabilities

（无需修改已有 spec）

## Impact

- **代码变更**：`src/cli/install.ts` 新增 `completion` 子命令分支；新增 `src/core/completion/` 模块生成各 shell 补全脚本
- **CLI 接口**：新增 `opst completion [bash|zsh|fish]` 命令
- **依赖**：零新增运行时依赖（补全脚本为纯字符串模板）
- **文档**：README 需补充补全安装指引

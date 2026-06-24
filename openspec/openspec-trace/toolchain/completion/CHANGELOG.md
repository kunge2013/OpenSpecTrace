## v1 — 2026-06-24

**变更**：cli-tab-completion

新增 `opst completion [bash|zsh|fish]` 子命令，为 opst CLI 提供 shell Tab 补全支持。采用静态字符串模板方式生成补全脚本，覆盖所有子命令（install、init、completion）和全局选项（--workspace、--dry-run、--version、--help）。用户可通过 `eval "$(opst completion bash)"` 快速启用。

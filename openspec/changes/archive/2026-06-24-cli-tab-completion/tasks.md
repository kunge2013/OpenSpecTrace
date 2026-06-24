## 1. 补全脚本模块

- [x] 1.1 创建 `src/core/completion/bash.ts`，导出 `getBashCompletionScript(): string` 函数，返回 Bash 补全脚本
- [x] 1.2 创建 `src/core/completion/zsh.ts`，导出 `getZshCompletionScript(): string` 函数，返回 Zsh 补全脚本
- [x] 1.3 创建 `src/core/completion/fish.ts`，导出 `getFishCompletionScript(): string` 函数，返回 Fish 补全脚本
- [x] 1.4 创建 `src/core/completion/index.ts`，导出统一接口 `getCompletionScript(shell: string): string`，分发到各 shell 模块

## 2. CLI 集成

- [x] 2.1 在 `src/cli/install.ts` 的 `CliOptions` 中新增 `completion` 子命令支持
- [x] 2.2 在 `parseArgs` 中识别 `completion` 子命令及其 shell 参数
- [x] 2.3 在 `main()` 中新增 `completion` 分支：无参数输出使用说明，有参数输出对应脚本
- [x] 2.4 处理不支持的 shell 参数，输出错误信息并 `process.exit(1)`

## 3. 帮助文本更新

- [x] 3.1 在 `printHelp()` 中补充 `opst completion [bash|zsh|fish]` 的说明
- [x] 3.2 编写 `printCompletionUsage()` 函数，输出各 shell 的安装指引

## 4. 构建验证

- [x] 4.1 执行 `npm run build` 确认 TypeScript 编译通过
- [x] 4.2 手动执行 `node dist/cli/install.js completion bash` 验证输出正确的补全脚本
- [x] 4.3 手动执行 `node dist/cli/install.js completion` 验证输出使用说明
- [x] 4.4 手动执行 `node dist/cli/install.js completion powershell` 验证错误处理

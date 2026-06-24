# Shell Completion

> opst CLI 的 shell 自动补全能力规格

### Requirement: 输出 Bash 补全脚本

系统 SHALL 提供 `opst completion bash` 命令，输出有效的 Bash 补全脚本到 stdout。该脚本被 `eval` 执行后，SHALL 对 `opst` 命令启用 Tab 补全。

#### Scenario: 生成 Bash 补全脚本

- **WHEN** 用户执行 `opst completion bash`
- **THEN** 系统输出一段可被 `eval` 执行的 Bash completion 脚本到 stdout，退出码为 0

#### Scenario: Bash 补全子命令

- **WHEN** 用户输入 `opst <Tab>` 并已启用补全脚本
- **THEN** shell 显示可用子命令列表：`install`、`init`、`completion`

#### Scenario: Bash 补全选项

- **WHEN** 用户输入 `opst --<Tab>` 并已启用补全脚本
- **THEN** shell 显示可用选项列表：`--workspace`、`--dry-run`、`--version`、`--help`

### Requirement: 输出 Zsh 补全脚本

系统 SHALL 提供 `opst completion zsh` 命令，输出有效的 Zsh 补全脚本到 stdout。

#### Scenario: 生成 Zsh 补全脚本

- **WHEN** 用户执行 `opst completion zsh`
- **THEN** 系统输出一段兼容 Zsh compdef 的补全脚本到 stdout，退出码为 0

#### Scenario: Zsh 补全子命令

- **WHEN** 用户输入 `opst <Tab>` 并已启用 Zsh 补全
- **THEN** shell 显示可用子命令及其描述

### Requirement: 输出 Fish 补全脚本

系统 SHALL 提供 `opst completion fish` 命令，输出有效的 Fish 补全脚本到 stdout。

#### Scenario: 生成 Fish 补全脚本

- **WHEN** 用户执行 `opst completion fish`
- **THEN** 系统输出一段使用 Fish `complete` 内置命令的补全脚本到 stdout，退出码为 0

#### Scenario: Fish 补全子命令

- **WHEN** 用户输入 `opst <Tab>` 并已启用 Fish 补全
- **THEN** shell 显示可用子命令及其描述

### Requirement: 无参数时输出使用说明

系统 SHALL 在用户执行 `opst completion`（不带 shell 参数）时，输出补全安装指引。

#### Scenario: 无参数调用 completion

- **WHEN** 用户执行 `opst completion` 不带任何参数
- **THEN** 系统输出各 shell 的安装说明（包含 `eval` 示例和写入 profile 文件的方法），退出码为 0

### Requirement: 无效 shell 参数时报错

系统 SHALL 在用户提供不支持的 shell 名称时，输出错误信息并以非零退出码退出。

#### Scenario: 不支持的 shell 名称

- **WHEN** 用户执行 `opst completion powershell`
- **THEN** 系统输出错误信息提示支持的 shell 列表（bash、zsh、fish），退出码为 1

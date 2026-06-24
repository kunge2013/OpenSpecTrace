// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24

// [AGC:START] tool=Cc author=fangkun
export function getZshCompletionScript(): string {
  return `#compdef opst

_opst() {
  local -a commands options

  commands=(
    'install:安装/更新 skills 和 commands'
    'init:初始化项目（知识库骨架 + skills + commands）'
    'completion:输出 shell 补全脚本'
  )

  options=(
    '--workspace[指定工作区根目录]:directory:_directories'
    '-w[指定工作区根目录]:directory:_directories'
    '--dry-run[仅预览将要生成的文件]'
    '--version[显示版本号]'
    '-v[显示版本号]'
    '--help[显示帮助]'
    '-h[显示帮助]'
  )

  if (( CURRENT == 2 )); then
    _describe -t commands 'opst commands' commands
    _arguments -s \$options
  elif (( CURRENT == 3 )); then
    case "\${words[2]}" in
      completion)
        local -a shells
        shells=('bash:Bash shell' 'zsh:Zsh shell' 'fish:Fish shell')
        _describe -t shells 'shell' shells
        ;;
    esac
  fi
}

_opst "\$@"
`;
}
// [AGC:END]

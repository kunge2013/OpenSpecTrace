// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24

// [AGC:START] tool=Cc author=fangkun
export function getFishCompletionScript(): string {
  return `# Fish completion for opst

# Disable file completions by default
complete -c opst -f

# Subcommands
complete -c opst -n '__fish_use_subcommand' -a 'install' -d '安装/更新 skills 和 commands'
complete -c opst -n '__fish_use_subcommand' -a 'init' -d '初始化项目（知识库骨架 + skills + commands）'
complete -c opst -n '__fish_use_subcommand' -a 'completion' -d '输出 shell 补全脚本'

# Global options
complete -c opst -l workspace -s w -d '指定工作区根目录' -r -F
complete -c opst -l dry-run -d '仅预览将要生成的文件'
complete -c opst -l version -s v -d '显示版本号'
complete -c opst -l help -s h -d '显示帮助'

# completion subcommand arguments
complete -c opst -n '__fish_seen_subcommand_from completion' -a 'bash' -d 'Bash shell'
complete -c opst -n '__fish_seen_subcommand_from completion' -a 'zsh' -d 'Zsh shell'
complete -c opst -n '__fish_seen_subcommand_from completion' -a 'fish' -d 'Fish shell'
`;
}
// [AGC:END]

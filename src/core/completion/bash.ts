// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24

// [AGC:START] tool=Cc author=fangkun
export function getBashCompletionScript(): string {
  return `#!/usr/bin/env bash

_opst_completions() {
  local cur prev commands options

  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  commands="install init completion"
  options="--workspace --dry-run --version --help"

  case "\${prev}" in
    completion)
      COMPREPLY=($(compgen -W "bash zsh fish" -- "\${cur}"))
      return 0
      ;;
    --workspace|-w)
      COMPREPLY=($(compgen -d -- "\${cur}"))
      return 0
      ;;
  esac

  if [[ "\${cur}" == -* ]]; then
    COMPREPLY=($(compgen -W "\${options}" -- "\${cur}"))
  else
    COMPREPLY=($(compgen -W "\${commands}" -- "\${cur}"))
  fi

  return 0
}

complete -F _opst_completions opst
`;
}
// [AGC:END]

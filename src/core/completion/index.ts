// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24
import { getBashCompletionScript } from './bash.js';
import { getZshCompletionScript } from './zsh.js';
import { getFishCompletionScript } from './fish.js';

// [AGC:START] tool=Cc author=fangkun
export const SUPPORTED_SHELLS = ['bash', 'zsh', 'fish'] as const;
export type SupportedShell = typeof SUPPORTED_SHELLS[number];

export function isSupportedShell(shell: string): shell is SupportedShell {
  return SUPPORTED_SHELLS.includes(shell as SupportedShell);
}

export function getCompletionScript(shell: SupportedShell): string {
  switch (shell) {
    case 'bash':
      return getBashCompletionScript();
    case 'zsh':
      return getZshCompletionScript();
    case 'fish':
      return getFishCompletionScript();
  }
}
// [AGC:END]

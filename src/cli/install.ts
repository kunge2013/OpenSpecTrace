// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24
/**
 * OpenSpecTrace CLI 入口
 *
 * 用法：
 *   node dist/cli/install.js [install] [--workspace <path>] [--dry-run]
 *   node dist/cli/install.js init      [--workspace <path>]
 *   npm run install-skills
 *   opst install                  (全局安装后)
 *   opst init                     (初始化知识库骨架)
 *
 * install 子命令：将 opst-code-anysic 和 opst-business-search 的 SKILL.md / command.md
 *   生成到目标工作区的 .claude/ 目录，对齐 OpenSpec workspace skills 模式。
 *
 * init 子命令：在目标工作区初始化 openspec/openspec-trace/GLOBAL_INDEX.md 骨架。
 */
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import { generateOpstSkills, type GenerationReport, getSkillTemplates, getCommandTemplates } from '../core/skill-generation.js';

const require = createRequire(import.meta.url);
const { version: OPST_VERSION } = require('../../package.json') as { version: string };

// ─────────────────────────────────────────────
// CLI 参数解析
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
interface CliOptions {
  subcommand: 'install' | 'init';
  workspace: string;
  dryRun: boolean;
  showVersion: boolean;
  showHelp: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const opts: CliOptions = {
    subcommand: 'install',
    workspace: process.cwd(),
    dryRun: false,
    showVersion: false,
    showHelp: false,
  };

  let i = 0;
  // 检测可选的子命令（第一个非 flag 参数）
  if (args.length > 0 && !args[0].startsWith('-')) {
    const sub = args[0];
    if (sub === 'install' || sub === 'init') {
      opts.subcommand = sub;
      i = 1;
    }
  }

  for (; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--workspace' || arg === '-w') {
      const next = args[i + 1];
      if (!next || next.startsWith('--')) {
        console.error('错误：--workspace 需要提供路径参数');
        process.exit(1);
      }
      opts.workspace = path.resolve(next);
      i++;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--version' || arg === '-v') {
      opts.showVersion = true;
    } else if (arg === '--help' || arg === '-h') {
      opts.showHelp = true;
    }
  }

  return opts;
}
// [AGC:END]

// ─────────────────────────────────────────────
// 输出格式化
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
function printHelp(): void {
  console.log(`
openspec-trace v${OPST_VERSION} — opst skill installer & knowledge base initializer

用法：
  opst init      [options]   初始化项目（知识库骨架 + skills + commands）
  opst [install] [options]   仅安装/更新 skills 和 commands（不含知识库）

选项：
  --workspace, -w <path>   指定工作区根目录（默认：当前目录）
  --dry-run                仅预览将要生成的文件，不实际写入（仅 install）
  --version, -v            显示版本号
  --help, -h               显示帮助

示例：
  opst init                         初始化项目（推荐首次使用）
  opst init --workspace /path       在指定目录初始化项目
  opst install                      仅更新 skills（知识库已存在时）
  opst --dry-run                    预览 install 生成的文件路径
`);
}

function printReport(report: GenerationReport, workspace: string, dryRun: boolean): void {
  const prefix = dryRun ? '[dry-run] ' : '';

  console.log('');
  console.log(`${prefix}Skills 安装完成`);
  console.log(`工作区：${workspace}`);
  console.log('');

  console.log('Skills（.claude/skills/）:');
  for (const item of report.skills) {
    const rel = path.relative(workspace, item.path);
    const tag = item.status === 'created' ? '✓ 已创建' : '↺ 已更新';
    console.log(`  ${tag}  ${rel}`);
  }

  console.log('');
  console.log('Commands（.claude/commands/opst/）:');
  for (const item of report.commands) {
    const rel = path.relative(workspace, item.path);
    const tag = item.status === 'created' ? '✓ 已创建' : '↺ 已更新';
    console.log(`  ${tag}  ${rel}`);
  }

  console.log('');
  console.log('可用命令：');
  console.log('  /opst:code-anysic        — 分析已归档变更，提取业务逻辑并归档到知识库');
  console.log('  /opst:business-search    — 检索 openspec/openspec-trace/ 知识库中的业务逻辑文档');
}
// [AGC:END]

// ─────────────────────────────────────────────
// dry-run 模式（仅打印路径，不写入）
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
function dryRun(workspace: string): GenerationReport {
  const report: GenerationReport = { skills: [], commands: [] };

  for (const { dirName } of getSkillTemplates()) {
    report.skills.push({
      path: path.join(workspace, '.claude', 'skills', dirName, 'SKILL.md'),
      status: 'created',
    });
  }

  for (const { id } of getCommandTemplates()) {
    report.commands.push({
      path: path.join(workspace, '.claude', 'commands', 'opst', `${id}.md`),
      status: 'created',
    });
  }

  return report;
}
// [AGC:END]

// ─────────────────────────────────────────────
// init 子命令（初始化知识库骨架）
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
const GLOBAL_INDEX_TEMPLATE = `# OpenSpec Trace — 全局检索索引

> 由 \`opst init\` 初始化，由 \`/opst:code-anysic\` 自动维护。

## 按领域

| 领域 | 模块 | 入口点 | 最后更新 | 关键词 |
|------|------|--------|----------|--------|

## 按关键词

| 关键词 | 领域 | 模块 | 索引 |
|--------|------|------|------|
`;

interface InitResult {
  globalIndexPath: string;
  globalIndexStatus: 'created' | 'exists';
  skillReport: GenerationReport;
}

async function initProject(workspace: string): Promise<InitResult> {
  // 1. 初始化知识库骨架
  const traceDir = path.join(workspace, 'openspec', 'openspec-trace');
  const globalIndexPath = path.join(traceDir, 'GLOBAL_INDEX.md');

  let globalIndexStatus: 'created' | 'exists';
  if (fs.existsSync(globalIndexPath)) {
    globalIndexStatus = 'exists';
  } else {
    fs.mkdirSync(traceDir, { recursive: true });
    fs.writeFileSync(globalIndexPath, GLOBAL_INDEX_TEMPLATE, 'utf8');
    globalIndexStatus = 'created';
  }

  // 2. 安装 skills 和 commands 到 .claude/
  const skillReport = await generateOpstSkills(workspace);

  return { globalIndexPath, globalIndexStatus, skillReport };
}

function printInitResult(result: InitResult, workspace: string): void {
  console.log('');
  console.log('项目初始化完成');
  console.log(`工作区：${workspace}`);
  console.log('');

  // 知识库
  const indexRel = path.relative(workspace, result.globalIndexPath);
  const indexTag = result.globalIndexStatus === 'created' ? '✓ 已创建' : '● 已存在';
  console.log('知识库：');
  console.log(`  ${indexTag}  ${indexRel}`);
  console.log('');

  // Skills
  console.log('Skills（.claude/skills/）:');
  for (const item of result.skillReport.skills) {
    const rel = path.relative(workspace, item.path);
    const tag = item.status === 'created' ? '✓ 已创建' : '↺ 已更新';
    console.log(`  ${tag}  ${rel}`);
  }
  console.log('');

  // Commands
  console.log('Commands（.claude/commands/opst/）:');
  for (const item of result.skillReport.commands) {
    const rel = path.relative(workspace, item.path);
    const tag = item.status === 'created' ? '✓ 已创建' : '↺ 已更新';
    console.log(`  ${tag}  ${rel}`);
  }
  console.log('');

  console.log('可用命令：');
  console.log('  /opst:code-anysic        — 分析已归档变更，提取业务逻辑并归档到知识库');
  console.log('  /opst:business-search    — 检索 openspec/openspec-trace/ 知识库中的业务逻辑文档');
  console.log('');
}
// [AGC:END]

// ─────────────────────────────────────────────
// 主流程
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
async function main(): Promise<void> {
  const opts = parseArgs(process.argv);

  if (opts.showVersion) {
    console.log(`openspec-trace v${OPST_VERSION}`);
    return;
  }

  if (opts.showHelp) {
    printHelp();
    return;
  }

  // ── init 子命令 ──────────────────────────────
  if (opts.subcommand === 'init') {
    console.log(`openspec-trace v${OPST_VERSION} — 初始化项目到 ${opts.workspace}`);
    try {
      const result = await initProject(opts.workspace);
      printInitResult(result, opts.workspace);
    } catch (err) {
      console.error('初始化失败：', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
    return;
  }

  // ── install 子命令（默认）────────────────────
  console.log(`openspec-trace v${OPST_VERSION} — 安装 opst skills 到 ${opts.workspace}`);

  let report: GenerationReport;

  if (opts.dryRun) {
    report = dryRun(opts.workspace);
  } else {
    try {
      report = await generateOpstSkills(opts.workspace);
    } catch (err) {
      console.error('安装失败：', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  }

  printReport(report, opts.workspace, opts.dryRun);
}

main().catch((err) => {
  console.error('未预期的错误：', err);
  process.exit(1);
});
// [AGC:END]

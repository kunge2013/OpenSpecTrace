// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24
/**
 * OpenSpecTrace Skill Generation
 *
 * 对齐 OpenSpec 的 skill-generation.ts 模式：
 * - SkillTemplateEntry / CommandTemplateEntry 注册表
 * - generateSkillContent()  生成带 YAML frontmatter 的 SKILL.md 内容
 * - generateCommandContent() 生成带 YAML frontmatter 的 command.md 内容
 * - generateOpstSkills()     将所有 skill/command 文件写入 .claude/ 目录
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createRequire } from 'node:module';

import {
  getOpstCodeAnysicSkillTemplate,
  getOpstCodeAnysicCommandTemplate,
  getOpstBusinessSearchSkillTemplate,
  getOpstBusinessSearchCommandTemplate,
  type SkillTemplate,
  type CommandTemplate,
} from './templates/skill-templates.js';

const require = createRequire(import.meta.url);
const { version: OPST_VERSION } = require('../../package.json') as { version: string };

// ─────────────────────────────────────────────
// 类型定义（对齐 OpenSpec SkillTemplateEntry）
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
/** Skill 注册条目 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  /** .claude/skills/<dirName>/SKILL.md 中的目录名 */
  dirName: string;
  /** workflow 标识符，用于过滤 */
  workflowId: string;
}

/** Command 注册条目 */
export interface CommandTemplateEntry {
  template: CommandTemplate;
  /** .claude/commands/opst/<id>.md 中的文件名（不含扩展名） */
  id: string;
}
// [AGC:END]

// ─────────────────────────────────────────────
// 注册表
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
/**
 * 返回所有已注册的 skill 模板条目。
 * 新增 workflow 时在此处追加即可。
 */
export function getSkillTemplates(): SkillTemplateEntry[] {
  return [
    {
      template: getOpstCodeAnysicSkillTemplate(),
      dirName: 'opst-code-anysic',
      workflowId: 'code-anysic',
    },
    {
      template: getOpstBusinessSearchSkillTemplate(),
      dirName: 'opst-business-search',
      workflowId: 'business-search',
    },
  ];
}

/**
 * 返回所有已注册的 command 模板条目。
 * 新增 workflow 时在此处追加即可。
 */
export function getCommandTemplates(): CommandTemplateEntry[] {
  return [
    {
      template: getOpstCodeAnysicCommandTemplate(),
      id: 'code-anysic',
    },
    {
      template: getOpstBusinessSearchCommandTemplate(),
      id: 'business-search',
    },
  ];
}
// [AGC:END]

// ─────────────────────────────────────────────
// 内容生成（对齐 OpenSpec generateSkillContent）
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
/**
 * 生成 SKILL.md 文件内容（YAML frontmatter + instructions）。
 * 格式与 OpenSpec generateSkillContent() 输出一致，保持 AI 读取兼容性。
 */
export function generateSkillContent(template: SkillTemplate): string {
  return `---
name: ${template.name}
description: >
  ${template.description}
license: ${template.license ?? 'MIT'}
compatibility: ${template.compatibility ?? 'Requires openspec CLI.'}
metadata:
  author: ${template.metadata?.author ?? 'fangkun'}
  version: "${template.metadata?.version ?? '1.0'}"
  generatedBy: "openspec-trace@${OPST_VERSION}"
---

${template.instructions}
`;
}

/**
 * 生成 command.md 文件内容（YAML frontmatter + body）。
 * 格式与 OpenSpec Claude adapter formatFile() 输出一致。
 */
export function generateCommandContent(template: CommandTemplate): string {
  const tags = template.tags.map((t) => escapeYamlValue(t)).join(', ');
  return `---
name: ${escapeYamlValue(template.name)}
description: ${escapeYamlValue(template.description)}
category: ${escapeYamlValue(template.category)}
tags: [${tags}]
---

${template.content}
`;
}

/** YAML 值转义（对齐 OpenSpec claude adapter 逻辑） */
function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}
// [AGC:END]

// ─────────────────────────────────────────────
// 文件写入
// ─────────────────────────────────────────────

// [AGC:START] tool=Cc author=fangkun
/** 写入结果条目 */
export interface GeneratedFileResult {
  path: string;
  status: 'created' | 'updated';
}

/** 生成报告 */
export interface GenerationReport {
  skills: GeneratedFileResult[];
  commands: GeneratedFileResult[];
}

/**
 * 将所有 skill/command 模板生成为文件，写入目标工作区目录。
 *
 * @param workspaceRoot - 工作区根目录（默认为 process.cwd()）
 */
export async function generateOpstSkills(
  workspaceRoot: string = process.cwd()
): Promise<GenerationReport> {
  const report: GenerationReport = { skills: [], commands: [] };

  // 写入 skills
  for (const { template, dirName } of getSkillTemplates()) {
    const skillDir = path.join(workspaceRoot, '.claude', 'skills', dirName);
    const skillFile = path.join(skillDir, 'SKILL.md');
    await fs.mkdir(skillDir, { recursive: true });
    const existed = await fileExists(skillFile);
    await fs.writeFile(skillFile, generateSkillContent(template), 'utf8');
    report.skills.push({ path: skillFile, status: existed ? 'updated' : 'created' });
  }

  // 写入 commands
  for (const { template, id } of getCommandTemplates()) {
    const commandDir = path.join(workspaceRoot, '.claude', 'commands', 'opst');
    const commandFile = path.join(commandDir, `${id}.md`);
    await fs.mkdir(commandDir, { recursive: true });
    const existed = await fileExists(commandFile);
    await fs.writeFile(commandFile, generateCommandContent(template), 'utf8');
    report.commands.push({ path: commandFile, status: existed ? 'updated' : 'created' });
  }

  return report;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
// [AGC:END]

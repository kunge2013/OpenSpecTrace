// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24
/**
 * OpenSpecTrace 核心模板类型
 *
 * 对齐 OpenSpec 的 SkillTemplate / CommandTemplate 接口，
 * 确保生成的 SKILL.md 和 command.md 格式与 OpenSpec 一致。
 */

// [AGC:START] tool=Cc author=fangkun
/** Skill 模板：对应 .claude/skills/<dirName>/SKILL.md */
export interface SkillTemplate {
  /** skill 的 name 字段（YAML frontmatter） */
  name: string;
  /** skill 的 description 字段（YAML frontmatter） */
  description: string;
  /** SKILL.md 的正文内容（工作流步骤、格式规范等） */
  instructions: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
}

/** Command 模板：对应 .claude/commands/opst/<id>.md */
export interface CommandTemplate {
  /** 人类可读的命令名称（YAML frontmatter name 字段） */
  name: string;
  /** 命令简短描述（YAML frontmatter description 字段） */
  description: string;
  /** 分组分类（YAML frontmatter category 字段） */
  category: string;
  /** 标签列表（YAML frontmatter tags 字段） */
  tags: string[];
  /** 命令正文内容（用户调用时 AI 读取的指令） */
  content: string;
}
// [AGC:END]

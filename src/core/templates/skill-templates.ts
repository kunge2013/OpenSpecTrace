// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24
/**
 * OpenSpecTrace Skill Templates
 *
 * 统一导出所有 workflow 模板，对齐 OpenSpec 的 skill-templates.ts 模式。
 * 新增 workflow 时在此处添加导出即可被 skill-generation.ts 自动注册。
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export {
  getOpstCodeAnysicSkillTemplate,
  getOpstCodeAnysicCommandTemplate,
} from './workflows/code-anysic.js';

export {
  getOpstBusinessSearchSkillTemplate,
  getOpstBusinessSearchCommandTemplate,
} from './workflows/business-search.js';

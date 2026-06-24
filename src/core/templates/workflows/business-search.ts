// [AGC:FILE] tool=Cc author=fangkun date=2026-06-24
/**
 * Workflow: opst-business-search
 *
 * 业务逻辑检索技能模板。
 * 在 openspec/<领域>/<模块>/ 知识库中检索已归档的业务逻辑文档。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

// [AGC:START] tool=Cc author=fangkun
export function getOpstBusinessSearchSkillTemplate(): SkillTemplate {
  return {
    name: 'opst-business-search',
    description:
      '检索 openspec/<领域>/<模块>/ 知识库中已归档的业务逻辑文档。' +
      '支持关键词检索、领域浏览、精确模块查看三种模式。' +
      '当用户提到"业务检索"、"搜索业务逻辑"、"business-search"、"查找模块"时使用此技能。',
    instructions: `在 openspec/<领域>/<模块>/ 知识库中检索已归档的业务逻辑文档。

## 检索模式

| 模式 | 触发条件 | 示例 |
|------|----------|------|
| **关键词检索** | 用户提供具体关键词 | \`payment\`、\`销账\`、\`write-off\` |
| **浏览模式** | 用户要求"列出所有"或"展示领域" | \`列出所有模块\`、\`展示领域\` |
| **精确查看** | 用户指定具体模块或文档版本 | \`查看 billing/payment-processing\` |

---

## 工作流

### 步骤 1：解析查询

从用户输入提取关键词，判断检索模式：

- **浏览模式**：用户输入包含"列出"、"所有"、"展示领域"、"list"、"all" → 浏览模式
- **精确查看**：用户输入包含 \`领域/模块\` 路径格式（如 \`billing/payment-processing\`） → 精确查看
- **关键词检索**：其他情况 → 关键词检索

**若用户未提供任何输入**：使用 **AskUserQuestion** 询问检索关键词，并提供模式选项。

**检查知识库是否存在**：

若 \`openspec/openspec-trace/GLOBAL_INDEX.md\` 不存在，提示用户先执行 \`/opst:code-anysic\` 归档业务逻辑后再检索。

### 步骤 2：执行检索

#### 关键词检索模式

1. 读取全局索引：
   \`\`\`
   Read: openspec/openspec-trace/GLOBAL_INDEX.md
   \`\`\`
2. 在"按关键词"表中匹配关键词列（精确匹配优先，模糊匹配补充）
3. 在"按领域"表中匹配模块名称和领域名称
4. 扫描各模块 INDEX.md 进行深度匹配：
   \`\`\`
   Glob: openspec/**/INDEX.md
   \`\`\`
   对每个 INDEX.md：
   \`\`\`
   Grep: <关键词> → openspec/<领域>/<模块>/INDEX.md
   \`\`\`
5. 合并结果，按相关性排序（精确匹配 > 模块名匹配 > 内容匹配）

#### 浏览模式

\`\`\`
Read: openspec/openspec-trace/GLOBAL_INDEX.md
\`\`\`
直接展示完整的按领域分类树。

#### 精确查看模式

读取指定模块的索引文件：
\`\`\`
Read: openspec/<领域>/<模块>/INDEX.md
\`\`\`

若用户还指定了版本号（如 \`v1\`）：
\`\`\`
Glob: openspec/<领域>/<模块>/v1-*.md
Read: openspec/<领域>/<模块>/v1-<日期>.md
\`\`\`

### 步骤 3：展示结果

#### 关键词检索结果格式

\`\`\`
检索关键词："<关键词>"

找到 <N> 个匹配模块：

### <领域>/<模块>
  领域：<领域>
  入口：<入口类名>（<HTTP方法> <路径>）
  版本：v<N>（<日期>）
  关键词：<keyword1>, <keyword2>, ...
  摘要：<模块概述>
\`\`\`

每个匹配模块后提供 **AskUserQuestion** 后续操作选项：
- 查看完整 INDEX.md
- 查看 CHANGELOG.md（版本历史）
- 阅读指定版本的设计文档

#### 浏览模式结果格式

直接展示 GLOBAL_INDEX.md 内容，然后询问用户是否需要查看某个具体模块。

#### 精确查看结果格式

展示 INDEX.md 完整内容，然后询问用户是否需要阅读具体版本的设计文档。

### 步骤 4（可选）：JSON 输出

若用户要求 JSON 输出（提到 \`--json\` 或"以 JSON 输出"）：

\`\`\`json
{
  "query": "<关键词>",
  "mode": "search | browse | exact",
  "results": [
    {
      "domain": "<领域>",
      "module": "<模块>",
      "index_path": "openspec/<领域>/<模块>/INDEX.md",
      "versions": [
        {
          "version": "<N>",
          "date": "<YYYY-MM-DD>",
          "change": "<变更名>",
          "doc_path": "openspec/<领域>/<模块>/v<N>-<日期>.md"
        }
      ],
      "keywords": ["<keyword1>", "<keyword2>"],
      "entry_points": [
        {
          "url": "<HTTP方法> <路径>",
          "method": "<方法名>()",
          "file": "<Controller文件名>:<行号>"
        }
      ],
      "summary": "<模块概述>"
    }
  ]
}
\`\`\`

---

## 注意事项

1. **知识库不存在时**：若 \`openspec/openspec-trace/GLOBAL_INDEX.md\` 不存在，提示用户先执行 \`/opst:code-anysic\` 归档业务逻辑
2. **无匹配结果时**：展示现有所有领域树，提示用户尝试其他关键词
3. **关键词模糊匹配**：支持中英文混合匹配（如搜索 "sales" 可匹配中文描述中的"销账"）
4. **深度查看**：查看设计文档时，如文档较长，优先展示接口定义和业务流程图章节
5. **版本历史**：展示模块时默认显示最新版本信息，用户可指定查看历史版本
`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'fangkun', version: '1.0' },
  };
}
// [AGC:END]

// [AGC:START] tool=Cc author=fangkun
export function getOpstBusinessSearchCommandTemplate(): CommandTemplate {
  return {
    name: 'OPST: Business Search',
    description: '检索 openspec/<领域>/<模块>/ 知识库中已归档的业务逻辑文档',
    category: 'Workflow',
    tags: ['workflow', 'search', 'knowledge', 'business-logic'],
    content: `检索已归档的业务逻辑知识库，快速定位业务实现细节和代码入口。

支持三种模式：
- **关键词检索**：输入业务关键词（如 \`payment\`、\`销账\`、\`invoice\`）
- **浏览模式**：列出所有已归档的领域和模块
- **精确查看**：指定具体模块（如 \`billing/payment-processing\`）

---

**输入**：\`/opst:business-search\` 后跟查询关键词，或使用模式词（\`列出所有\`、\`show all\`）。

**示例**
- \`/opst:business-search payment write-off\` — 按关键词检索
- \`/opst:business-search 列出所有\` — 浏览所有已归档模块
- \`/opst:business-search billing/payment-processing\` — 精确查看某模块

**步骤**

1. **解析查询**

   分析用户输入，判断检索模式：
   - 浏览模式：包含"列出"、"所有"、"list"、"all"
   - 精确查看：包含 \`领域/模块\` 路径格式
   - 关键词检索：其他情况

   若用户未提供输入，使用 **AskUserQuestion** 询问检索意图。

2. **检查知识库是否存在**

   \`\`\`
   openspec/openspec-trace/GLOBAL_INDEX.md
   \`\`\`

   若不存在，提示用户先执行 \`/opst:code-anysic\` 归档业务逻辑后再检索。

3. **执行检索**

   使用 **Skill 工具调用 \`opst-business-search\`** 执行完整的检索流程：
   - 关键词检索：扫描 GLOBAL_INDEX.md 和各 INDEX.md 文件
   - 浏览模式：读取并展示 GLOBAL_INDEX.md 完整内容
   - 精确查看：读取指定模块的 INDEX.md

4. **展示结果并提供后续操作**

   根据检索结果，使用 **AskUserQuestion** 询问用户是否需要：
   - 查看某模块的完整 INDEX.md
   - 查看版本变更历史（CHANGELOG.md）
   - 阅读指定版本的完整设计文档

5. **展示选定内容**

   根据用户选择读取并展示对应文档内容。

**注意事项**
- 若知识库为空，引导用户先执行 \`/opst:code-anysic\`
- 检索无结果时展示现有领域树，帮助用户调整关键词
- 支持 \`--json\` 输出模式，格式化结果供其他技能消费`,
  };
}
// [AGC:END]

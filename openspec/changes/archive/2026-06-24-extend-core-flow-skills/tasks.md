# 任务：扩展 OpenSpec 核心流程技能

## 阶段一：创建目录结构与知识库骨架

- [x] 1.1 创建 `.claude/commands/opst/` 目录
  - 用于存放扩展命令定义文件

- [x] 1.2 创建 `.claude/skills/opst-code-anysic/` 目录
  - 代码分析与归档技能目录

- [x] 1.3 创建 `.claude/skills/opst-business-search/` 目录
  - 业务逻辑检索技能目录

- [x] 1.4 创建 `openspec/specs/` 目录（如不存在）
  - 知识库根目录

- [x] 1.5 创建 `openspec/specs/GLOBAL_INDEX.md` 骨架文件
  - 包含"按领域"和"按关键词"两个空分区
  - 头部注明由 `/opst:code-anysic` 自动生成

## 阶段二：实现 `/opst:code-anysic` 技能（代码分析与归档）

- [x] 2.1 创建 `.claude/skills/opst-code-anysic/SKILL.md`
  - 技能元数据（name、description、触发条件）
  - 完整的 7 步工作流定义（见 design.md）
  - 工具链编排：Bash → Grep → Glob → Read → Write → Edit
  - 继承 code2doc-kunge2013 的五段式文档生成逻辑
  - 参考现有 `openspec-archive-change/SKILL.md` 的编写模式

- [x] 2.2 创建 `.claude/commands/opst/code-anysic.md`
  - YAML frontmatter（name、description、category、tags）
  - 命令入口逻辑：解析用户参数（变更名称或默认最近归档）
  - 调用 openspec CLI 获取变更列表和状态
  - 引导用户确认分析目标
  - 引用技能文件执行完整工作流

- [x] 2.3 实现变更识别逻辑（SKILL.md 中定义）
  - Bash: `ls -t openspec/changes/archive/ | head -1` 获取最近归档
  - 支持用户指定变更名称
  - Read: proposal.md、design.md、tasks.md 提取上下文
  - 提取关键词：功能描述、技术领域、模块名称

- [x] 2.4 实现代码变更分析（SKILL.md 中定义）
  - Bash: `git diff <base>..<head> --name-only` 获取变更文件列表
  - 过滤和分类：
    - Controller: `*Controller.java`
    - Service: `*Service.java`, `*ServiceImpl.java`
    - Mapper: `*Mapper.java`
    - XML: `*Mapper.xml`
  - Grep 提取注解：
    - `@TableName` → 数据表映射
    - `@RequestMapping` → API 路径前缀
    - `@PostMapping`/`@GetMapping` → HTTP 方法
  - 从 Java 包名推导领域和模块（如 `com.tianyuan.bill` → `billing`）

- [x] 2.5 实现设计文档生成（SKILL.md 中定义）
  - Read 各层源码文件（Controller → Service → Entity → XML）
  - 生成 YAML frontmatter（domain、module、version、date、change、keywords、code-entry）
  - 生成五段式文档：
    1. 接口定义（URL、方法、入参/出参 JSON）
    2. 业务流程图（mermaid）
    3. 业务逻辑详情（SQL + Java 代码详解）
    4. 表结构 ER 图（mermaid）
    5. 源码文件清单
  - 版本号确定：Glob `openspec/specs/<领域>/<模块>/v*.md` → 取最大 N → N+1

- [x] 2.6 实现知识库写入（SKILL.md 中定义）
  - Write: `openspec/specs/<领域>/<模块>/v<N>-<日期>.md`
  - 新模块：创建 INDEX.md（模块概览、版本表、入口点、业务规则）
  - 已有模块：Edit INDEX.md 追加版本行到版本表
  - Append: CHANGELOG.md 追加变更记录

- [x] 2.7 实现全局索引更新（SKILL.md 中定义）
  - Read: `openspec/specs/GLOBAL_INDEX.md`
  - 新模块：在"按领域"分区添加新行
  - 在"按关键词"分区为每个关键词添加新行
  - Write: 更新后的文件

## 阶段三：实现 `/opst:business-search` 技能（业务逻辑检索）

- [x] 3.1 创建 `.claude/skills/opst-business-search/SKILL.md`
  - 技能元数据（name、description、触发条件）
  - 完整的 4 步工作流定义（见 design.md）
  - 检索引擎：Grep + Glob + Read 工具链
  - 支持三种模式：检索、浏览、精确查看
  - 支持 JSON 输出模式

- [x] 3.2 创建 `.claude/commands/opst/business-search.md`
  - YAML frontmatter（name、description、category、tags）
  - 命令入口逻辑：解析用户查询参数
  - 判断模式：检索 vs 浏览 vs 精确查看
  - 引用技能文件执行完整工作流

- [x] 3.3 实现检索引擎（SKILL.md 中定义）
  - 检索模式：
    - Grep: 关键词 → `openspec/specs/GLOBAL_INDEX.md`
    - 匹配"按关键词"表和"按领域"表
    - Glob: `openspec/specs/**/INDEX.md`
    - Grep: 关键词 → 各 INDEX.md 文件
    - 按相关性排序（精确匹配 > 模糊匹配）
  - 浏览模式：
    - Read: `openspec/specs/GLOBAL_INDEX.md` 展示完整领域树
  - 精确查看：
    - Read: `openspec/specs/<领域>/<模块>/INDEX.md`
    - 或 Read: `openspec/specs/<领域>/<模块>/v<N>-<日期>.md`

- [x] 3.4 实现结果展示（SKILL.md 中定义）
  - 结构化输出：领域、模块、版本、关键词、入口点、摘要
  - 提供后续操作选项（查看 INDEX、查看 CHANGELOG、阅读版本文档）
  - JSON 输出模式：格式化为结构化 JSON（供其他技能消费）

## 阶段四：测试与验证

- [x] 4.1 验证目录结构
  - 确认 `.claude/commands/opst/` 包含 2 个命令文件
  - 确认 `.claude/skills/opst-code-anysic/` 包含 SKILL.md
  - 确认 `.claude/skills/opst-business-search/` 包含 SKILL.md
  - 确认 `openspec/specs/GLOBAL_INDEX.md` 存在且格式正确

- [x] 4.2 模拟归档流程测试（手动执行 code-anysic 工作流）
  - 选择一个已有的归档变更（或创建一个测试变更）
  - 执行 `/opst:code-anysic` 完整工作流
  - 验证 `openspec/specs/<领域>/<模块>/v1-<日期>.md` 已创建
  - 验证 INDEX.md 已创建且格式正确
  - 验证 CHANGELOG.md 已创建且格式正确
  - 验证 GLOBAL_INDEX.md 已更新

- [x] 4.3 模拟检索流程测试（手动执行 business-search 工作流）
  - 执行 `/opst:business-search` 检索模式（使用测试模块的关键词）
  - 验证匹配结果正确展示
  - 执行浏览模式，验证领域树展示
  - 执行精确查看，验证 INDEX.md 内容正确展示

## 阶段五：文档与优化

- [x] 5.1 更新 README.md
  - 补充 `/opst:code-anysic` 和 `/opst:business-search` 的说明
  - 添加使用示例
  - 更新闭环工作流图示

- [x] 5.2 验证中文文档规范
  - 确认所有生成文档使用中文
  - 确认技能定义中的提示和说明使用中文
  - 确认知识库文档格式符合中文习惯

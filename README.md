# OpenSpecTrace

> OpenSpec 闭环开发增强套件 —— 基于 OpenSpec 框架的二次开发，为规范驱动开发注入知识管理能力。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![OpenSpec](https://img.shields.io/badge/OpenSpec-0.16.0-green)](https://github.com/Fission-AI/OpenSpec)

---

## 📖 目录

- [背景](#背景)
- [核心能力](#核心能力)
- [闭环工作流](#闭环工作流)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [Skill 详解](#skill-详解)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 🎯 背景

[OpenSpec](https://github.com/Fission-AI/OpenSpec) 是目前主流的规范驱动开发框架，通过 `/opsx:propose` → `/opsx:apply` → `/opsx:archive` 三阶段工作流实现需求到代码的闭环管理。但在实际落地中，存在两个常见痛点：

- **代码逻辑归档缺失**：`apply` 阶段完成后，新功能代码的业务逻辑散落在各个源文件中，缺少集中式的逻辑归档，后续检索困难
- **业务知识难以检索**：随着变更增多，过往的业务逻辑分散在代码和规范中，新成员或 AI 无法快速理解某个功能模块的完整逻辑

**OpenSpecTrace** 通过在 OpenSpec 框架基础上新增两个 Skill，实现 **"代码生成 → 逻辑归档 → 业务检索"** 的完整闭环。

---

## 📦 核心能力

### 1. 代码逻辑归档（`/opst:code-anysic`）

每次 `/opst:apply` 后自动或手动分析变更代码，按功能模块将业务逻辑归档至 `business-logic/` 目录，沉淀为结构化的业务知识库。

**核心特性：**
- ✅ 自动识别变更范围，读取 `proposal.md`、`tasks.md` 和 Delta Specs
- ✅ 分析代码变更，提取核心业务逻辑与规则
- ✅ 按功能模块（而非文件结构）组织归档文档
- ✅ 自动更新全局索引，支持快速检索
- ✅ 保持与 Spec 的双向追溯关系

### 2. 业务逻辑检索（`/opst:business-search`）

通过关键词自然语言检索已归档的业务规则、功能逻辑和代码入口，快速定位历史实现，辅助新功能开发与问题排查。

**核心特性：**
- ✅ 支持功能名称、字段名称、场景关键词等多维度检索
- ✅ 智能匹配全局索引，快速定位相关模块
- ✅ 摘要预览 + 深度查看，按需加载详细信息
- ✅ 展示关联模块与代码入口，辅助开发决策

---

## 🔄 闭环工作流

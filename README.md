# Cool's Blog

个人技术博客，基于 [AstroPaper](https://github.com/satnaing/astro-paper) 主题构建。

## 📚 内容分类

- **Java 系列**：零基础到实战应用
- **.NET Core 系列**：核心组件、EF Core、ASP.NET Core
- **学习方法**：高效学习、时间管理、知识管理
- **程序员软技能**：职业发展、面试技巧、技术负债

## 🚀 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产版本
pnpm run preview
```

## 📝 添加文章

1. 在 `src/data/blog/` 对应分类文件夹下创建 `.md` 文件
2. 添加 frontmatter：

```yaml
---
title: 文章标题
description: 文章描述
pubDatetime: 2024-12-29T00:00:00+08:00
tags:
  - 标签1
  - 标签2
draft: false
featured: false # 设为 true 可在首页精选展示
---
```

3. 编写正文内容

## 📂 目录结构

```
src/data/blog/
├── _docs-reference/  # 参考文档（不会发布）
├── java/            # Java 相关文章
├── dotnet/          # .NET Core 相关文章
├── learning/        # 学习方法
├── soft-skills/     # 程序员软技能
└── computer-tips/   # 电脑操作技巧
```

## ⚙️ 配置说明

- **网站配置**：`src/config.ts`
- **社交链接**：`src/constants.ts`（已注释，需要时取消注释）
- **内容加载**：`src/content.config.ts`

## 🎨 主题特性

- ✅ 响应式设计
- ✅ 深色/浅色模式
- ✅ SEO 友好
- ✅ 静态搜索
- ✅ RSS 订阅
- ✅ 自动生成 OG 图片

## 📄 License

基于 AstroPaper 主题，遵循 MIT License。

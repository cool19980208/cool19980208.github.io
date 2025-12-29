const fs = require('fs');
const path = require('path');

// 转换 Hexo frontmatter 到 AstroPaper 格式
function convertFrontmatter(content, filePath) {
  // 提取 frontmatter
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    console.log(`⚠️  跳过（无 frontmatter）: ${filePath}`);
    return null;
  }

  const frontmatter = match[1];
  const bodyContent = content.slice(match[0].length);

  // 解析原始 frontmatter
  const lines = frontmatter.split('\n');
  let title = '';
  let date = '';
  let tags = [];
  let categories = [];

  let currentKey = '';
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('title:')) {
      title = trimmed.replace('title:', '').trim();
    } else if (trimmed.startsWith('date:')) {
      date = trimmed.replace('date:', '').trim();
    } else if (trimmed.startsWith('tags:')) {
      currentKey = 'tags';
      const inlineTag = trimmed.replace('tags:', '').trim();
      if (inlineTag) tags.push(inlineTag);
    } else if (trimmed.startsWith('categories:')) {
      currentKey = 'categories';
    } else if (trimmed.startsWith('-')) {
      const value = trimmed.replace('-', '').trim();
      if (currentKey === 'tags') {
        tags.push(value);
      } else if (currentKey === 'categories') {
        categories.push(value);
      }
    }
  }

  // 转换日期格式
  let pubDatetime = '';
  if (date) {
    // 处理格式：2024-07-25 10:26:26 或 2024-07-24
    const dateMatch = date.match(/(\d{4}-\d{2}-\d{2})(\s+(\d{2}:\d{2}:\d{2}))?/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const timeStr = dateMatch[3] || '00:00:00';
      pubDatetime = `${dateStr}T${timeStr}+08:00`;
    }
  }

  // 生成描述（从文件路径和标题推断）
  const fileName = path.basename(filePath, '.md');
  let description = `${title}`;
  
  // 根据分类添加更详细的描述
  if (categories.includes('Java')) {
    description = `Java 学习笔记 - ${title}`;
  } else if (categories.includes('.NET Core')) {
    description = `.NET Core 学习笔记 - ${title}`;
  } else if (categories.includes('学习方法')) {
    description = `学习方法论 - ${title}`;
  }

  // 合并 tags（去重）
  const allTags = [...new Set([...tags, ...categories])];

  // 移除正文开头的重复标题（如果存在）
  let cleanedBody = bodyContent;
  const firstLineMatch = cleanedBody.match(/^#\s+(.+?)\r?\n/);
  if (firstLineMatch) {
    const firstTitle = firstLineMatch[1].trim();
    // 如果第一行标题和 frontmatter 的 title 相似，就删除
    if (firstTitle === title || firstTitle.includes(title.replace(/^P\d+-\d+\s+/, ''))) {
      cleanedBody = cleanedBody.replace(/^#\s+.+?\r?\n/, '');
    }
  }

  // 生成新的 frontmatter
  const newFrontmatter = `---
title: ${title}
description: ${description}
pubDatetime: ${pubDatetime}
tags:
${allTags.map(tag => `  - ${tag}`).join('\n')}
draft: false
---
`;

  return newFrontmatter + cleanedBody;
}

// 递归处理目录
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let converted = 0;
  let skipped = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 跳过参考文档目录
      if (entry.name === '_docs-reference') {
        console.log(`⏭️  跳过目录: ${entry.name}`);
        continue;
      }
      const result = processDirectory(fullPath);
      converted += result.converted;
      skipped += result.skipped;
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = convertFrontmatter(content, fullPath);

      if (newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`✅ 转换成功: ${path.relative(process.cwd(), fullPath)}`);
        converted++;
      } else {
        skipped++;
      }
    }
  }

  return { converted, skipped };
}

// 主函数
function main() {
  const blogDir = path.join(__dirname, 'src', 'data', 'blog');
  
  console.log('🚀 开始转换 frontmatter...\n');
  
  const { converted, skipped } = processDirectory(blogDir);
  
  console.log('\n📊 转换完成！');
  console.log(`✅ 成功转换: ${converted} 个文件`);
  console.log(`⏭️  跳过: ${skipped} 个文件`);
}

main();

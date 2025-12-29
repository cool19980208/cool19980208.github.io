---
title: P1-3  编写第一个Java程序
description: Java 学习笔记 - P1-3  编写第一个Java程序
pubDatetime: 2024-07-30T22:02:26+08:00
tags:
  - Java学习
  - Java
  - 零基础玩Java-Part1
draft: false
---

# 编写第一个Java程序

- 学编程不了解底层怎么办？
  - 所谓的底层知识的学习是自然而然的过程，不是刻意去学的
  - 你一定是先会用再去研究底层，而不是一上来就研究底层


## 建JAVA项目步骤

> 统一同Maven方式组织代码
> 无论普通项目、Maven、gradle，代码都是一样的
> IDEA中快速输入System/out.printin（）的方法
- 不会讲解太多快捷键、代码生成等
  - 代码生成工具是帮助熟练的人更快的写代码，而不是让初学者变成傻叉的

- 创建Maven项目卡住了~ 2024 太新了 os：解决了
  - 解决步骤
  - 选择Maven，设置JDK版本，选择maven项目的模板
    org.apache.maven.archetypes:maven-archetype-quickstart就是普通Maven项目面板
  - ![Maven](https://github.com/cool19980208/picx-images-hosting/raw/master/20240731/Maven.361h863o5k.webp)
- 课件地址
  - https://github.com/yangzhongke/yzk18/tree/main/%E8%AF%BE%E7%A8%8B%E8%AF%BE%E4%BB%B6%E4%BB%A3%E7%A0%81%E7%AD%89/Part1

创建项目步骤
- 在src-main-java的文件创建class（类）
  - ![新建1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240730/新建1.3rb4tq0emu.webp)
- 输入class的名字，然后点击回车
  - ![名字](https://github.com/cool19980208/picx-images-hosting/raw/master/20240730/名字.syuq7s55e.webp)
- 写完hello代码后run编译运行
  - ![Run](https://github.com/cool19980208/picx-images-hosting/raw/master/20240730/Run.3uuqrfthc8.webp)

### 键盘
- 出现了一个从来没想到的问题，键盘的大写A怎么输入~  
  - 之前都是先按CapsLk按键，然后在按a
  - 没想到直接Shift+字母键就可以打出大写字母了（快捷输入大写字母）

### 关于缩进和大括号
- 1、和Python不一样，Java中的缩进不是强制的，不过缩进强制可以让代码更清晰
- Java中{}有同一行、换行两种习惯，没有区别，我喜欢换行（C#的格式）
- ![同一行与换行](https://github.com/cool19980208/picx-images-hosting/raw/master/20240730/同一行与换行.6f0l42tfys.webp)

### 常见错误
编程是很严谨的。代码有错如何在IDEA中发现
- 1、标点符号用的是中文（全角）符号
- 2、大小写敏感
- 3、少了分号  别;:、o0、1l分不清
- 4、代码写错了位置
- 5、拼写错误  面的故事（main）
- 6、忘记了写结尾的分号，每一个**逻辑行**都要以分号结尾

![常见错误](https://github.com/cool19980208/picx-images-hosting/raw/master/20240730/常见错误.58h9vh4jd9.webp)

> **严谨的语言更适合去工程化使用**
> 比如Java，C#就比较严谨
> 比如Python，Basic就不太严谨，所以建议先学严谨的编程语言，后在按照需求去学习其他的

### 问题
无论是开发控制台程序、窗口程序、网站、APP......代码其实都没变，只是调用不同的库而已。
---
title: P4-8 使用Word模板简化文件创建
date: 2024-08-16 14:46:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# 使用Word模板简化文件创建
---

## Word格式说明
- 1、研究WordTemplateRenderer的使用
- 2、Word中其实有更专业的“模板”功能，但是对于普通Word用户来讲操作太复杂了。所以这个类使用的普通占位符
- 3、演示基本使用


```java
public static void main(String[] args) {
String yFile="D:/JavaTest1/WordTest1/通知书模板.docx";
String newFile ="D:/JavaTest1/WordTest1/Test.docx";
HashMap<String,Object> data =new HashMap<>();
data.put("{姓名}","张三");
data.put("{专业名称}","飞天学");
data.put("[照片]","无敌");
WordTemplateRenderer.render(yFile, data,newFile);
}
```


![成功](https://github.com/cool19980208/picx-images-hosting/raw/master/20240816/成功.1hs4y3mps5.webp)
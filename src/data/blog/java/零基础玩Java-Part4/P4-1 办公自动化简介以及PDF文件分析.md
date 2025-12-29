---
title: P4-1 办公自动化简介以及PDF文件分析
date: 2024-08-12 14:41:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# 办公自动化简介以及PDF文件分析
---

## 什么是办公自动化
- 非IT专业人员打交道最多的三种文件：Word、Excel、PDF
  - Excel中的VBA脚本，用的是Basic的语言，非常小众了现在
> 办公自动化就是把人工手动的操作方法通过编程自动化去完成
> 这个阶段讲：Word、Excel、PDF文件的读写，图表，简化日常工作

## 使用YZK-Docs
- 1、Maven中引入yzk18-docs
- 2、看文档研究PDFHelpers的用法。 
  - 就是对PDFbox的简单封装，没有封装的方法直接参考PDFbox的文档即可
- 3、案例：把一个PDF文件中的文字提取到一个文本文档中，图片保存到同级目录下，文件名用递增序号

思路
- 1.PDF文档的不同：
  - 扫描版
  - 加密版
  - 文字版(开源一般都只对文字版管用)
  - 限制
    - 1、有的是纯扫描版文件，全都是图片，无法简单的提取文字，需要调用OCR等功能。OCR精度较高，所以都是收费的
    - 2、一些被加密等PDF文件需要特殊处理
    - 3、PDF的不可替代性的格式。所以用代码去实现提取PDF中的文字，无法达到完美的还原出来里面所有的内容


```java
//案例：把一个PDF文件中的文字提取到一个文本文档中，图片保存到同级目录下，文件名用递增序号
PDDocument doc = PDFHelpers.openFile("D:/JavaTest1/PDFtest/03 1.1 提升信息敏感度的三种方法，成为信息收集的「有心人」.pdf");  //读取对应路径的pdf文件
int docNumbr = doc.getNumberOfPages();//获取pdf多少页
String text = PDFHelpers.parseText(doc);//pdf的txt文本提取成字符串
IOHelpers.writeAllText("D:/JavaTest1/PDFtest/有心人.txt",text);//字符串写入txt
for (int i =0;i<docNumbr;i++)
{
    PDPage page = doc.getPage(i);//获取页数
    List<byte[]> bytes = PDFHelpers.parseImages(page,"png");//获取当前页的图片信息
    for (byte[] bytes1 :bytes)
    {
        IOHelpers.writeAllBytes("D:/JavaTest1/PDFtest/图片/"+i+".png",bytes1);//写入图片
    }
}

PDFHelpers.close(doc);//关闭pdf
```
---
title: P4-7 案例：PDF转Word
date: 2024-08-16 10:50:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# 案例：PDF转Word
---
## 程序员的工作
程序员的工作其无非就是把一堆零件，有读写的PDF零件，有读写Word的零件，有读写Excel的零件等等，然后根据不同的项目把这些零件组装起来，按照不同的项目需求进行不同的拼装，从而就能够开发出来千变万化的程序

## 需求
- 1.把一个普通的PDF文件(可能含有图片)转换为Word格式

思路
>1.打开PDF文件
2.遍历每一页的文本和图片，写入到Word格式，比如XWPFRun、XWPFParagraph(段落)、XWPFDocument
3.然后保存到Word


```java
public static void main(String[] args) {
PDDocument PDF = PDFHelpers.openFile("D:/JavaTest1/PDFTest3/03 1.1 提升信息敏感度的三种方法，成为信息收集的「有心人」.pdf");
XWPFDocument docx = WordHelpers.createDocxDocument();//创建docx文件
int PDFNumber=PDF.getNumberOfPages();//获取pdf多少页
System.out.println(PDFNumber);
for (int i =0;i<PDFNumber;i++)
{
    PDPage page = PDF.getPage(i);//获取页数
    String s= parseText(page);//提取文本
    XWPFRun run = WordHelpers.createRun(docx, s);//文本插入word
    //run.setFontSize(30);
    //run.setItalic(true);
    List<byte[]> bytes = PDFHelpers.parseImages(page,"png");//获取当前页的图片信息
    for (byte[] bytes1 :bytes)
    {
            WordHelpers.addPicture(docx,bytes1);//在run里面写入图片
    }
}
WordHelpers.saveToFile(docx,"D:/JavaTest1/PDFTest3/666.docx");//保存docx文件
WordHelpers.close(docx);
PDFHelpers.close(PDF);//关闭PDF
}
```
### 报错
- 问题1.String s= parseText(page);//提取文本   提取文件报错。
  - 分析：1.代码和杨中科老师一模一样，但是就是运行出错，
  - 2.前几天写的代码运行还正常，但今天去运行就报错。
  - 3.百度上查结果也找不到
  - 最后我想 前几天和今天哪里有变化，我想起来中间有加过PDFBox的库，然后尝试去掉后，就可以了。
  - 总结：有可能是封装的库和PDFBox的库冲突了。
- ![to报错1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240816/to报错1.pf9g4r0eu.webp)
- ![库冲突](https://github.com/cool19980208/picx-images-hosting/raw/master/20240816/库冲突.7sn4vqwfyv.webp)
---
title: P4-3 案例：PDF合并
date: 2024-08-14 14:38:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# PDF合并
---

## 需求说明
> 有一堆英语考试真题(PDF格式)，要求把他们合并成一个PDF文件
>
> 无准备的写代码哦，可以看看真实的程序员解决问题的过程

思路
- 把文件夹中所有的PDF遍历一遍，然后读取二进制内容
- 然后逐个的去写入一个新的PDF中



---

### 自己的写法

```java
String[] PDFFiles= IOHelpers.getFilesRecursively("D:/JavaTest1/PDFTest3","pdf");//读取文件夹下pdf格式的文件
PDDocument newdoc = new PDDocument();//新的PDF文件
for (String PDFFile : PDFFiles)
{
    PDDocument doc = PDFHelpers.openFile(PDFFile);  //读取对应路径的pdf文件
    for (int i=0;i<doc.getNumberOfPages();i++)
    {
        PDPage page = doc.getPage(i);//获取文件中的每一页
        newdoc.addPage(page);//添加到新的PDF文件中
    }
    //PDFHelpers.close(doc);//关闭pdf
}
try {
    newdoc.save("D:/JavaTest1/PDFTest3/1.pdf");//保存到这个文件中
} catch (IOException e) {
    throw new RuntimeException(e);
}
```
#### 遇到的问题总结

- 报错： COSStream has been closed and cannot be read. Perhaps its enclosing PDDocument has been closed? 
  - 翻译：COSStream已关闭，无法读取。也许它的附件PDDocument已经关闭了?
  - 解决方法：//PDFHelpers.close(doc);//关闭pdf 注释关闭的代码就解决了

- 保存的PDF中 11-238页都是空白
  - 解决方法：更新版本(2.0.32)就好了,但是如果用最新版(3.0.3)时，报错了
  - 遇到了依赖不行，可以用三步走（印象笔记上搜索  Dependency ‘XXX:‘ not found，三步解决 ）
    - 分析：有可能是yzk18-docs 的PDFHelpers 不兼容最新版

![版本](https://github.com/cool19980208/picx-images-hosting/raw/master/20240814/版本.6m3tki2dkk.png)

报错：![版本报错1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240814/版本报错1.9rjbjg4vft.webp)

---

遇到问题的处理过程
- 1.搜索：编程语言+用的库+自己的目的  比如： java pdfbox 空白页
  - 百度---中文社区
  - 谷歌---英文社区
- 2.如果是之前的旧方法现在又代替的方法了，就替换最新的
- 3.库的版本问题，看看新版修复了没



---

### 杨中科老师的写法
- 背景介绍：录课的时候是2021-06-10  那时候我上述写的这个被锁定的问题还没有修复
  
```java
public static void main(String[] args) throws IOException {
    PDFMergerUtility merger = new PDFMergerUtility();
    String[] pdfFiles = IOHelpers.getFilesRecursively("F:\\网友提供的阅读\\已经使用\\广东自考学位真题","pdf");
    //String[] pdfFiles = IOHelpers.getFilesRecursively("F:\\网友提供的阅读\\已经使用\\考研英语阅读1997-2015","pdf");
    for(String pdfFile : pdfFiles)
    {
        merger.addSource(pdfFile);
    }
    merger.setDestinationFileName("d:/1.pdf");
    merger.mergeDocuments(MemoryUsageSetting.setupMainMemoryOnly());
}
```
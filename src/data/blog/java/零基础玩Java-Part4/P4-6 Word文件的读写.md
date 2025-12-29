---
title: P4-6 Word文件的读写
date: 2024-08-16 09:08:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# Word文件的读写
---

## Word格式说明
- 1、Word有doc、docx两种格式，推荐使用docx
- 2、整个Word文件是一个XWPFDocument，由多给段落(XWPFParagraph)组成，每个XWPFParagraph由多个XWPFRun组成。
- ![Word](https://github.com/cool19980208/picx-images-hosting/raw/master/20240815/Word.45lsrkwiw.webp)
  - 字体，颜色，背景；只要变了样式，就会开启一个新的run，不变样式，那整体都是一个run

### WordHelpers使用
- 1、看文档研究WordHelpers。它是对poi库的简单封装，更多功能看poi的文档
- 2、案例：调用poi的方法完成Word文件提取文本以及图片的功能。类似PDF的那个
- 3、练习：实现类似PDF的那个词频分析


### 案例：调用poi的方法完成Word文件提取文本以及图片的功能


```java
XWPFDocument docx = WordHelpers.openDocx("D:/JavaTest1/ExcelTest2/1.docx");
String str=  WordHelpers.readAllText("D:/JavaTest1/ExcelTest2/1.docx");
System.out.println(str);
for (XWPFPictureData docxs : docx.getAllPictures())
{
    byte[] date = docxs.getData();
    IOHelpers.writeAllBytes("D:/JavaTest1/ExcelTest2/pic/"+docxs.getFileName(),date);//保存到本地
}
WordHelpers.clone(docx);//关闭docx
```


### 练习：实现类似PDF的那个词频分析

```java
public static void main(String[] args) {
        LinkedHashMap<String,Integer> map =new LinkedHashMap<>();
        String[] docxFiles= IOHelpers.getFilesRecursively("D:/JavaTest1/ExcelTest2","docx");//获取文件夹下所有的pdf文件
        for (String docxFile:docxFiles)
        {
           String str = WordHelpers.readAllText(docxFile);
           String[] texts = str.toLowerCase().split("\\s|\\.|\\,|\\:|\\!|\\?|;|\\(|\\)");//符号转成小写并分割
            for (String text :texts)
            {
                if (!isEnglishWord(text))//如果这个word不是英语单词，则跳过
                {
                    continue;//处理下一个单词
                }

                if (text.equals(""))
                {
                    continue;
                }
                Integer frqe =map.get(text);//获得当前的词频
                if (frqe==null)//如果为null就证明不存在
                {
                    map.put(text,1);
                }
                else
                {
                    map.put(text,frqe+1);//存在就词频+1

                }


            }
            String outputString ="";
            for (String word:map.keySet())//keyset()是map中所有key的集合
            {
                int freq =map.get(word);
                outputString =outputString+word+"="+freq+"\r\n";

            }
            //System.out.println(outputString);
            IOHelpers.writeAllText("D:/JavaTest1/ExcelTest2/1.txt",outputString);


        }

    }
    //判断字符串中是否是一个英文单词(全部由英文字母组成)
    public  static  boolean isEnglishWord(String s)
    {
        int numbers=s.length();
        for (int i =0;i<numbers;i++)
        {
            char ch =s.charAt(i);
            if (Character.isLowerCase(ch)==false)//只要碰到一个非字母，函数就返回false
            {
                return  false;
            }
        }
        return  true;//如果运行到这里，就说明每个都是字母
    }
```
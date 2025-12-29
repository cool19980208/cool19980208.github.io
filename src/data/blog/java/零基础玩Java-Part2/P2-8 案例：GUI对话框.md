---
title: P2-8 GUI对话框
description: Java 学习笔记 - P2-8 GUI对话框
pubDatetime: 2024-08-06T11:15:26+08:00
tags:
  - Java学习
  - Java
  - 零基础玩Java-Part2
draft: false
---
---

## 关于GUI
- 1、GUI：图形化界面。广义上桌面程序、APP、网页等都算是GUI，狭义上就是桌面程序
- 2、Java中有Swint、SWT等GUI技术，桌面程序开发不是Java开发的重点，因此除非有需要，否则不用研究。
  - Java去开发桌面程序不是主流
  - 个人觉得C#去做桌面程序开发很合适
- 3、为了方便常规的GUI需求，在yzk18-GUI库中提供了一些简化GUI程序编写的方法，
  - 如果不够用的话，可以自己研究GUI技术，比如SWT技术~
- 任何编程语言都会被淘汰，只是时间问题而已。在时间长河中只算作是一粒沙子而已，学会解决问题的思路才是核心。

## YZK18-GUI
- 看文档探索yzk18-GUI的使用
- 这些对话框是“模态”对话框，也就是窗口关闭之后，才能继续往下执行代码
- 进度条是非模态对话框，不用等对话框关闭，代码就继续往后执行
  - Java：大部分情况，main函数执行结束了程序就退出了



> 无需死记硬背每个库的函数用法及其参数
> 在工作中，当需要用到某个库时，可以随时查阅其官方文档。
> 重要的是，**了解该库的大致功能和用途**，以及它的**优缺点**。这样，在需要实现特定功能时，能够迅速回忆起哪个库能够胜任，并直接查阅文档来具体实现。
> 比如，如果你需要处理GUI界面，你只需记得有这样一个库能够支持该功能，并在需要时查阅如何使用它。同样，对于操作PowerPoint文件的库，即使不记得具体用法，只要知道之前用过这个库并且知道它能满足需求，就可以在需要时快速查阅并应用。
> 总的来说，关键在于掌握库的功能和用途，具体用法则可以**随用随查**。


```
你不用去记住这些库的每个函数是怎么用的，有什么参数等等
不用记那个东西，没必要记，用的时候在去查文档就行了

工作之后也是如此：
假如：你需要用到一个库，你临时去查这个文档。
然后等你用过这个库后，你知道这个库大概可以用来干什么，大体有什么功能这就够了，不需要把它的用法记住，因为记不住
以后在用的时候，你知道要的这个功能在哪个库中有，拿来使用即可， 比如说一个gui功能的这个库，库里面正好有你需要的功能，那直接把它拿过来用就可以了

学习库后，你只要知道这个库能干什么，它的优点缺点是什么就可以了，别的不用管，随用随查
```



```java

//buttonsBox：关闭窗口 X ；返回null。点击对应按钮，显示按钮的名字
String s= GUI.buttonsBox("你喜欢哪个歌手？","周杰伦","陈奕迅","张杰");
System.out.println(s);

//choiceBox:下拉框的选择。new String[] 区分参数类型，要不然会”java: 对choiceBox的引用不明确“
String s =GUI.choiceBox("吃什么？",new String[]{"鸡蛋","西红柿"});
System.out.println(s);


//弹出日期选择对话框  LocalDate.of设置初始时间点
//这些对话框是“模态”对话框，也就是窗口关闭之后，才能继续往下执行代码
 LocalDate l = GUI.dateBox("选择你的生日", LocalDate.of(1998,2,8));
System.out.println(l);

//弹出日期时间选择对话框  LocalDateTime.now()设置初始日期/时间
LocalDateTime ldt = GUI.datetimeBox("选择日期和时间",LocalDateTime.now());
System.out.println(ldt);

//弹出目录打开对话框
String s =GUI.dirOpenBox("请选择对应的文件夹");
System.out.println(s);

//弹出目录保存的对话框，如果目录已经存在，则提示【是否覆盖】
String  s =  GUI.dirSaveBox("D:\\JavaTest1\\output");
System.out.println(s);

//只能输入数字
double d = GUI.doubleBox("请输入你的体重");
System.out.println(d);

//弹出报错消息对话框。
//GUI.errorBox("报错测试");

//弹出文件打开对话框
/tring s =GUI.fileOpenBox("D:\\新建文件夹\\http\\HTTP.png");
System.out.println(s);
//fileSaveBox:弹出保存文件对话框，如果选择的文件已经存在，则提示【是否覆盖】


//屏幕高度/宽度
int i = GUI.getScreenHeight();
int i1 =GUI.getScreenWidth();
System.out.println(i);
System.out.println(i1);

//弹出显示图片的对话框
String s = GUI.imgBox("你觉得这个壁纸好看吗？","D:/新建文件夹/http/HTTP.png","好看","不好看");
System.out.println(s);

//弹出输入框，让用户输入
String s =GUI.inputBox("请输入你想看到的信息","你真帅");
System.out.println(s);

//弹出QQ登录界面
String[] strs = GUI.loginBox("请输入账号：");
System.out.println(Arrays.toString(strs));

//弹出密码对话框 密码加密了 明码看不到
String s=GUI.passwordBox("请输入密码");
System.out.println(s);

//弹窗提示
GUI.msgBox("你好，这是一条信息");

//弹出有多个输入内容的对话框
String[] strs = GUI.multiInputBox("请输入你的想法，我为你保存","生活越来越好","家人健健康康","平平安安");
System.out.println(Arrays.toString(strs));

//弹出包含【确认】、【取消】两个按钮的消息对话框
boolean b = GUI.okCancelBox("你还好吗？");
System.out.println(b);


//显示“非确定性”进度对话框，非模态对话框,导入状态显示
//非模态对话框，不用等对话框关闭，代码就继续往后执行
//Java：大部分情况，main函数执行结束了程序就退出了
try {
    System.out.println("暂停开始前: " + System.currentTimeMillis());
    GUI.showIndeterminateProgressDialog("正在导入");
    // 暂停10秒钟
    Thread.sleep(10000);

    System.out.println("暂停结束后: " + System.currentTimeMillis());
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}

//显示进度显示对话框，非模态对话框。
try {
    System.out.println("暂停开始前: " + System.currentTimeMillis());
    GUI.showProgressDialog("导入中",10,1);
    // 暂停10秒钟
    Thread.sleep(10000);

    System.out.println("暂停结束后: " + System.currentTimeMillis());
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}

```
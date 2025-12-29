---
title: P6-1 ASP.NET Core MVC项目
description: .NET Core 学习笔记 - P6-1 ASP.NET Core MVC项目
pubDatetime: 2024-09-29T11:01:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第6章：ASP.NET Core Web API基础
draft: false
---
---
## 什么是ASP.NET Core
- 1、ASP.NET Core是.NET中做Web开发的框架。
- 2、ASP.NET Core MVC
  - 基于视图的MVC开发框架
  - 在MVC开发模式下，后端开发人员也仍然要编写一部分前端的代码
- 3、ASP.NET Core Web API
  - 前后端分离：后端开发人员使用Web API开发服务接口，前端开发人员使用Vue等前端框架去完成
  - 多端开发
    - 多端：APP，Web网站，客户端等，都是对接的同一个Web APi。
- 4、 ASP.NET Core MVC其实包含Web API，不过……
  - MVC技术有点旧了
- 5、杨中科老师的这门课程侧重Web API
- 6、需要你有Html、JavaScript的基础，需要了解Http协议。

## ASP.NET Core MVC项目的搭建
- 创建MVC项目
  - ![MVC的项目创建](https://github.com/cool19980208/picx-images-hosting/raw/master/20240928/MVC的项目创建.3d4rgcarac.webp)
- 启动MVC项目
  - ![成功启动](https://github.com/cool19980208/picx-images-hosting/raw/master/20240928/成功启动.86tmcgvgdh.webp)
- .NET 6中ASP.NET Core项目结构和旧版不一样，默认Minimal API，没有Startup。仍然支持旧版写法。


---

## 编写第一个MVC程序

### ASP.NET Core MVC概念
- 模型（Model）、视图（View）和控制器（Controller）
  - 老师是控制器，成绩单是模型，你爸是视图。
  - ![MVC](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/MVC.54xqc5yifw.webp)

### 项目结构
- 1、控制器由Controller类实现，视图一般是扩展名为cshtml的文件，而模型则是只有属性的普通C#类。
  - ![MVC-控制器](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/MVC-控制器.7sn6mismdp.webp)
  - ![MVC2png](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/MVC2png.m1mvznt8.webp)
- 2、控制器类的名字一般以Controller结尾，并且被放到Controllers文件夹下。控制器的名字为控制器的类名去掉Controller。
- 3、视图一般被放到Views文件夹下的控制器名字的文件夹下。
  - ![Views](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/Views.2yybqe97z2.webp)
  - ![保持一致](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/保持一致.7ljyr37rmm.webp)
  - 像上图一样，需要两者保持一致(控制器名称和方法名称)

```C#
@model MVCTest.Models.Person
<div>姓名：@Model.Name</div>
<div>@(Model.IsVIP ? "VIP" : "普通会员")</div>
<div>注册时间：@Model.CreatedTime</div>
```
- 4、视图→浏览器端提交的请求→模型→控制器→处理→模型→视图。渲染：Render。
  - 控制器负责来准备数据
  - 视图负责来显示数据 


---



## .NET Core的新工具:热重载

- 1、困惑：修改了服务器端的代码，必须重新运行程序。
- 2、方法1：【启动（不调试）】
  - 1.先选择（不调试）
    - ![不调试1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/不调试1.86tmdfbwgk.webp)
  - 2.修改完内容后，点击【生成解决方案】，然后页面会自动刷新
    - 为什么会自动刷新呢？
      - 因为微软在网页注入了一个文件
      - 这个文件一直和我们后端的这个调试程序来通讯，一旦发现后端代码改变了，它会自动命令前端页面自动刷新
      - ![自动刷新](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/自动刷新.54xqc7ak9g.webp)
  - 缺点：无法设置断点
- 3、方法2：.NET 6开始的Hot Reload（热重载）
  - 1.正式运行(以调试的方式)
  - 2.修改完代码后，点击热重载
    - ![热重载1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/热重载1.5xalty0yp6.webp)
  - 不想手动的去点击，可以选择“文件保存时热重载”
    - 修改完代码，直接保存即可刷新页面
    - ![热重载2](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/热重载2.6f0nij58p4.webp)
  - 缺点：局限
    - 删除了方法或者修改了参数，热重载就可能无法正常执行
    - 截至到我学习的时候(2024-09-24)，我尝试了老师的操作，但是没有报错。不知道是不是后续微软去优化了这个问题~ 但这个现在不重要，就不去深究了
    - ![局限](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/局限.7egqvpegmx.webp)
  - 类似于金蝶二开的热重载一样
    - 不用IIS再次重启，提升了效率

- Hot Reload轶事
  - 热重载在正式版发布之前微软把这个功能删掉了，开源社区的大佬们和微软开始了博弈，最后还是恢复了
  - ![Zack](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/Zack.3d4rhakd4o.webp)
启示：开源对于微软和开发者意味着什么。





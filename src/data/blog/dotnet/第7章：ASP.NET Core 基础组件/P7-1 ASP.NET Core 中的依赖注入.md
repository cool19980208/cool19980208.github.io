---
title: P7-1 ASP.NET Core 中的依赖注入
description: .NET Core 学习笔记 - P7-1 ASP.NET Core 中的依赖注入
pubDatetime: 2024-10-02T16:01:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第7章：ASP.NET Core 基础组件
draft: false
---
---
## 对象注入的代码写到哪里
- 1、在ASP.NET Core项目中一般不需要自己创建ServiceCollection、IServiceProvider。
  - 在Program.cs的builder.Build()之前向builder.Services中注入。
- 2、在Controller中可以通过构造方法注入服务。
- 3、演示。

```C#
builder.Services.AddScoped<MyService1>();//Di注入

//控制器注入服务
private readonly MyService1 myService1;

public TestController(MyService1 myService1)
{
this.myService1 = myService1;//构造函数
}
```

![演示](https://github.com/cool19980208/picx-images-hosting/raw/master/20241002/演示.6m3vi96bnv.webp)

---

## 低使用频率服务的另类注入方式
- 1、把Action用到的服务通过Action的参数注入，在这个参数上标注[FromServices]。和Action的其他参数不冲突。
- 2、一般不需要，只有调用频率不高并且资源的创建比较消耗资源的服务才[FromServices]。
  - 比如：扫描电脑上的某目录的所有文件就比较消化资源
- 3、只有Action方法才能用[FromServices] ，普通的类默认不支持。
  - Action参数来注入，只有使用频率不高而且比较消化资源的服务才用这种。因为不使用，会拖慢其他方法的运行


---

## 案例：开发模块化的服务注册

- 一个软件通常由多个项目组成，这些项目都会直接或者间接被主ASP.NET Core项目引用，所以间接的增加了项目的耦合度。
  - 如果能让框架负责各自的服务注册，就能够减少项目之间的耦合度。为了解决这个问题，我们可以直接使用杨中科老师写的一个框架
- 框架的使用
  - 1、目的：在分层项目中，让各个项目负责各自的服务注册。
  - 2、先学会使用：
    - 1）Install-Package Zack.Commons
    - 2）每个项目中创建一个或者多个实现了IModuleInitializer接口的类。
    - 3）初始化DI容器
      - ![示例](https://github.com/cool19980208/picx-images-hosting/raw/master/20241002/示例.13lr2gr775.webp)
```C#
var assemblies = ReflectionHelper.GetAllReferencedAssemblies();
services.RunModuleInitializers(assemblies);
```
- 原理讲解
  - 项目地址：https://github.com/yangzhongke/NETBookMaterials/
  - 主要分析RunModuleInitializers方法和ReflectionHelper.cs











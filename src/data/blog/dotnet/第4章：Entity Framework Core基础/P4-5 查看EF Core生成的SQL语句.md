---
title: P4-5 查看EF Core生成的SQL语句
description: .NET Core 学习笔记 - P4-5 查看EF Core生成的SQL语句
pubDatetime: 2024-09-18T15:39:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第4章：Entity Framework Core基础
draft: false
---
---
## 使用简单日志查看SQL语句

### EF Core底层原理
- EF Core：就是把C#代码转换为SQL语句的框架。
- ![运行过程1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240918/运行过程1.2rv3fagiqe.webp)
- ![过程2](https://github.com/cool19980208/picx-images-hosting/raw/master/20240918/过程2.sywoyb0es.webp)
- ![运行过程3](https://github.com/cool19980208/picx-images-hosting/raw/master/20240918/运行过程3.32hx8h84lv.webp)
  - EF Core把C#代码编译成SQL语句，然后给AST，然后给到对应数据库的Provider去执行
  - 因为每个数据库的语法，都不一样，所以需要使用对用的PRovider

### SQL Server Profiler查看SQL语句
- 1、SQL Server Profiler查看SQLServer数据库当前执行的SQL语句。
  - ![SQL语句查看](https://github.com/cool19980208/picx-images-hosting/raw/master/20240914/SQL语句查看.54xpqpnhii.webp)
- 2、var books = ctx.Books.Where(b => b.Price > 10 || b.Title.Contains("张"));
  - ![执行显示](https://github.com/cool19980208/picx-images-hosting/raw/master/20240918/执行显示.1024ketk5d.webp)
  - ![执行显示2](https://github.com/cool19980208/picx-images-hosting/raw/master/20240918/执行显示2.1024ketk5d.webp)
- 3、缺点
  - SQL Server Profiler只适用于SQL Server数据库
  - 默认是看到这些服务器上所有的活动，如果是公司开发都在用，那你也不好找
    - 可以加过滤器去达到目的，但是这样配置太麻烦了，不如用**代码去查看SQL语句**

### 通过代码来查看SQL语句

#### 方法1：标准日志
- 缺点
  - 需要引用Log日志的框架
```C#
public static readonly ILoggerFactory MyLoggerFactory
	= LoggerFactory.Create(builder => { builder.AddConsole(); });

optionsBuilder.UseLoggerFactory(MyLoggerFactory);
```

- Install-Package Microsoft.Extensions.Logging.Console -Version 5.0.0
  - 输出到Console


#### 方法2：简单日志
- 好处：不用单独引用框架，而且还可以看到更多EF Core运行的信息
```C#
//可以看到整个EF Core的工作流程
optionsBuilder.LogTo(msg => { Console.WriteLine(msg); });//简单日志

//如果是只需要查看SQL语句，可以写代码过滤一下
optionsBuilder.LogTo(msg => {
    if (!msg.Contains("CommandExecuting"))return;//过滤
    Console.WriteLine(msg); });//简单日志
```

#### 方法3：ToQueryString
- 1、上面两种方式无法直接得到一个操作的SQL语句，而且在操作很多的情况下，容易混乱。
- 2、EF Core的Where方法返回的是IQueryable类型，DbSet也实现了IQueryable接口。 IQueryable有扩展方法ToQueryString()可以获得SQL。
- 3、不需要真的执行查询才获取SQL语句；
  - **只能获取查询操作的**

```C#
IQueryable<TPerson> presons = ctx.TPersons.Where(b => b.Name.ToLower() == "Zane" && b.BithDay == DateTime.Now);
string sql = presons.ToQueryString();//using Microsoft.EntityFrameworkCore;
Console.WriteLine("这就是我想要的:"+sql);
```

### EF Core有哪些做不到的事情
- C#千变万化，但SQL功能简单
  - 所以会存在**合法的C#语句运行过程中无法被翻译为SQL语句**的情况
  - 报错：The LINQ expression 'DbSet<TPerson>().Where(t => Program.IsOK(t.Name))' could not be translated. 

### 总结
- 1.写测试性代码，用简单日志；
- 2.开发阶段，从繁杂的查询操作中立即看到SQL，用ToQueryString()。
- 3.正式需要记录SQL给审核人员或者排查故障，用标准日志；



## 深究EF Core生成SQL语句的不同 

### 不同数据库方言不同
- 同样的C#语句在不同数据库中被EF Core翻译成不同的SQL语句。
```C#
//SQLServer  
select top(3) * from t;
//MySQL
select * from t LIMIT 3;
//Oracle
select * from t where ROWNUM<=3;
```


### EF Core迁移脚本和数据库相关
- 因此迁移脚本不能跨数据库。通过给Add-Migration命令添加“-OutputDir”参数的形式来在同一个项目中为不同的数据库生成不同的迁移脚本。
  - 不能说用SQL Server的脚本在My SQl上面执行


### SQLServer项目中测试

```C#
var books = ctx.Books.Where(b=>b.PubTime.Year>2010).Take(3);
foreach(var b in books)
{
	Console.WriteLine(b.Title);
}
```

### MySQL项目中测试
- 1、EF Provider的选择：
  - 如下图所示，MySQl的最好选择是这个开源的
  - ![对比](https://github.com/cool19980208/picx-images-hosting/raw/master/20240918/对比.3d4r1x7462.webp)
- 2、Install-Package Pomelo.EntityFrameworkCore.MySql
  - Install-Package Pomelo.EntityFrameworkCore.MySql -Version 5.0.0
  - 一般不指定版本，new get会自动给你匹配最适合你项目的版本
- 3、optionsBuilder.UseMySql("server=localhost;user=root;password=root;database=ef",
	new MySqlServerVersion(new Version(5, 6, 0)));

### PostgreSQL项目中测试
- 安装PostgreSQL的EF Provider
  - 这个是有EF Core的核心人员写的开源项目，准官方
  - Install-Package Npgsql.EntityFrameworkCore.PostgreSQL

- optionsBuilder.UseNpgsql("Host=127.0.0.1;Database=ef;Username=postgres;Password=123456");

### 注意
- 三者数据库的连接信息都写在这个里面
  - 根据不同数据库选择不同的EF Provider去使用即可
  - 如果需要一个项目同时使用两种不一样的数据库时看上面`EF Core迁移脚本和数据库相关`的内容即可
    - 也就是去微软官网上找使用办法
![数据库切换](https://github.com/cool19980208/picx-images-hosting/raw/master/20240918/数据库切换.64dt9zxgrk.webp)

## 总结
> 框架是帮着程序员简化工作，而不是把程序员变成傻子---杨中科

![杨中科的名言](https://github.com/cool19980208/picx-images-hosting/raw/master/20240918/杨中科的名言.7i0cdqukp7.webp)
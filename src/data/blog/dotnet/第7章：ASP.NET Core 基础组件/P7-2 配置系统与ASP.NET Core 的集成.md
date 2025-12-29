---
title: P7-2 配置系统与ASP.NET Core 的集成
description: .NET Core 学习笔记 - P7-2 配置系统与ASP.NET Core 的集成
pubDatetime: 2024-10-07T21:33:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第7章：ASP.NET Core 基础组件
draft: false
---
---
## 默认添加的配置提供者
为了简化开发，在ASP.NET Core项目中，WebApplication类的CreateBuilder方法会按照下面的顺序来提供默认的配置
- (1)加载现有的IConfiguration。
- (2)加载项目根目录下的appsettings.json。
  - ![2](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/2.7ljz2zd96o.webp)
- (3)加载项目根目录下的appsettings.{Environment}.json。
  - 其中{Environment}代表当前运行环境的名字
  - ![3](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/3.ic3nd7tmp.webp)
- (4)当程序运行在开发环境下，程序会加载“用户机密”配置。
  - ![4](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/4.eshpneqwy.webp)
- (5)加载环境变量中的配置。
- (6)加载命令行中的配置。
  - ![5](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/5.2veq4klmtf.webp)
- 杨中科老师推荐采用默认的配置加载顺序，因为它符合主流项目的配置规则
  - 当多个配置提供者存在的时候，.NET会按照“后面的提供者覆盖之前的提供者”的方式进行加载
> 既会用工具又会懂工具的原理，这样才能称得上一名合格的程序员；否则你就是一个会用工具的码农而已
---

## ASP.NET Core 的多环境设置
- 我们在进行项目开发的时候，会遇到开发环境、测试环境、生产环境需要进行不同配置的情况。
  - 比如：在开发、测试、生产环境下，程序分别连接开发、测试、生产数据库，这样就能够更好地保证数据的安全。
- 数据库字符串
  - 在这里配置一个连接数据库的字符串，在开发环境就用开发数据库的数据库字符串；
  - 部署到测试环境下，就把这个字符串改成测试环境的数据库字符串；
  - 到了生产环境下，就把这个字符串改成生产环境的数据库字符串
  - **这么做完全没问题，而且杨中科老师也是这样做的~**
    - 但是ASP.NET里面有一种叫做“多运行环境”的机制，如果后续公司需要用到，也可以直接使用，我们在这边就先做了解
  - ![配置字符串](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/配置字符串.ic3ndra30.webp)

### 多运行环境
- ASP.NET Core 会从环境变量中读取名字为ASPNETCORE_ENVIRONMENT的值。
  - ASPNETCORE_ENVIRONMENT的值可以设置为任意值，但是推荐采用如下3个值即可
    - Development（开发环境）
    - Staging（测试环境）
    - Production（生产环境）
  - 如果没有设置ASPNETCORE_ENVIRONMENT，则认为程序运行在生产环境
- 读取方法：app.Environment.EnvironmentName、app.Environment.IsDevelopment()……
  - ![正常读取](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/正常读取.8vmw9cb700.webp)
  - ![代码中读取](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/代码中读取.4jo31srvhr.webp)
- 在Windows和VS（推荐开发时用）中设置环境变量的方法。
  - ![5](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/5.2veq4klmtf.webp) 

---

## 用“用户机密”来避免机密信息的泄密
- 在进行项目开发的时候，有一些机密信息不方便被放到源代码中
  - 比如：数据库的连接字符串等
- 如果这个项目的源代码被泄露到外网的话，就可能被攻击者连接上数据库，从而造成安全问题
  - 比如：某工程师把包含云存储服务器的连接配置的配置文件上传到了GitHub，造成公司机密信息大量外泄的严重事故
  - 像上述的案例事故多年来层出不穷~

### 用户机密
- 为了避免上述问题的发生，.NET中提供了“用户机密”的机制来解决这个问题
  - ![4](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/4.eshpneqwy.webp) 
- 用户机密创建的secrets.json文件位于系统目录中的名字和UserSecretsId一致的文件夹下。
  - 所以很显然，这个文件没有放到项目的源代码文件夹下，因此更不容易被开发人员错误地上传到源代码管理系统中
  - ![文件位置](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/文件位置.8z6i72pecc.webp)
- 我们怎么读取这里面的内容呢？
  - ![读取](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/读取.8s3abnl0z5.webp)

#### 使用用户机密的注意事项
- 1、供开发人员使用的，不适合在生产环境中使用。
- 2、secrets.json文件仍然是明文存储，并没有加密。
  - 不想别人看到怎么办？
    - 如果想避免连接字符串等机密配置被别人看到，可以采用`Azure Key Vault`、`Zack.AnyDBConfigProvider`等配置服务器。
    - 但是无论什么配置服务器，都不能彻底杜绝机密信息被发现。所以加强安全防控更重要。
- 3、如果因为重装系统等原因导致secrets.json被删除，我们就需要对其重新配置。
  - 比如：新员工入职，也需要他配置项目的secrets.json。如果这个工作量太大的话，建议还是用集中式的配置服务器来存放开发环境下的配置信息。

---

## 案例：配置系统综合

### 功能需求
- 1、系统的主要配置（Redis、Smtp）放到配置专用的数据库中。Zack.AnyDBConfigProvider
  
- 2、连接配置数据库的连接字符串配置在“用户机密”中。
  - "Data Source=.;Initial Catalog=demo1;Integrated Security=SSPI;"
- 3、把Smtp的配置显示到界面上。
- 4、程序启动的时候就连接Redis，并且把Redis连接对象注册到依赖注入系统中。

### 实现步骤
- 第一步
  - 创建数据库表，添加数据
```Smtp：{"Server":"smtp.test.com","UserName":"Zane","Password":"123"} ; Redis:127.0.0.1```
  - ![第一步](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/第一步.8dwukz8y2u.webp)
  - ![添加数据](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/添加数据.6ik9sd1pum.webp)
- 第二步
  - 安装第三方包
    - 集中式的配置服务器：Install-Package Zack.AnyDBConfigProvider
    - Redis：Install-Package StackExchange.Redis
- 第三步
  - 配置数据库的连接字符串
  - ![1](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/1.8hggip488t.webp)
- 第四步
  - 连接并测试服务
  - ![连接数据库和Redis](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/连接数据库和Redis.3rb7kajeja.webp)
  - ![成功](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/成功.9kg5tl6us5.webp)
  - ![测试成功](https://github.com/cool19980208/picx-images-hosting/raw/master/20241007/测试成功.3rb7kakwbh.webp)







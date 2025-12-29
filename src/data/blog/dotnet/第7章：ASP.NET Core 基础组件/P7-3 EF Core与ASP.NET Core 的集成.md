---
title: P7-3 EF Core与ASP.NET Core 的集成
date: 2024-10-10 09:31:26
tags: .NET Core2022-学习
categories:
- .NET Core
- 第7章：ASP.NET Core 基础组件
---
# EF Core与ASP.NET Core 的集成
---
## 分层项目中EF Core的用法

### 分层项目的建立
- 1、为什么要项目分层？带来什么问题？
  - 对于现实中比较复杂的项目，我们通常是要对其进行分层的，也就是不同的类放到不同的文件夹中。
- 2、创建一个.NET类库项目BooksEFCore，放实体等类。NuGet：Microsoft.EntityFrameworkCore.Relational
  - 如果只是.NET6的内部项目就选.NET6.0，如果想让.net-framework项目引用就用2.0
    - ![选择](https://github.com/cool19980208/picx-images-hosting/raw/master/20241009/选择.2obibj5av3.webp)
    - 安装：Install-Package Microsoft.EntityFrameworkCore.Relational -Version 6.0.1
- 3、 BooksEFCore中增加实体类Book和配置类。

### 数据库的配置

1、上下文类MyDbContext
- 为什么正式项目中最好不要在MyDbContext写数据库配置（连接不同的DB甚至不同类型的DB）。
  - 尽量数据库配置的代码写到ASP.NET-Core项目中。
  - 不重写OnConfiguring方法，而是为MyDbContext类的构造方法增加DbContextOptions<MyDbContext>参数。
    - `public MyDbContext(DbContextOptions<MyDbContext> options):base(options){}`
  - 在ASP.NET-Core项目对DbContextOptions的配置。

2、创建ASP.NET-Core项目，添加对“BooksEFCore”项目的引用。
- NuGet安装Microsoft.EntityFrameworkCore.SqlServer
    - Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 6.0.1
    - ![引用](https://github.com/cool19980208/picx-images-hosting/raw/master/20241009/引用.86tms119fc.webp)

3、配置文件、配置代码等放到ASP.NET-Core项目中。
```C#
builder.Services.AddDbContext<MyDbContext>(opt => {
    string connStr = builder.Configuration.GetConnectionString("Default");
    opt.UseSqlServer(connStr); 
});
```
4、在Controller中注入MyDbContext，编写测试代码。
- 注入后，不需要再写`new MyDbContext`了
5、生成实体类的迁移脚本。多项目的环境下执行Add-Migration的时候可能会出现这个错误，原理是什么？
- 下面的这种报错，需要注意点的很多，杨中科老师也简单的讲了~
  - ![多环境报错](https://github.com/cool19980208/picx-images-hosting/raw/master/20241009/多环境报错.175da63530.webp)

6、不用研究多项目中Add-Migration的细节。
- 实用的方案：编写实现IDesignTimeDbContextFactory接口的类，把配置放到里面，反正是开发环境用而已。

7、可以把连接字符串配置到环境变量中，不过MyDesignTimeDbContextFactory中来读取配置系统，可以直接用Environment.GetEnvironmentVariable() 读取环境变量。

8、数据库迁移脚本要生成到BooksEFCore中，因此为这个项目安装Microsoft.EntityFrameworkCore.Tools、Microsoft.EntityFrameworkCore.SqlServer。然后把BooksEFCore设置为启动项目，并且在【程序包管理器控制台】中也选中BooksEFCore项目后，执行Add-Migration和Update-Database
- Install-Package Microsoft.EntityFrameworkCore.Tools -Version 6.0.1
- Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 6.0.1



#### 步骤汇总：
- 1、建类库项目，放实体类、DbContext、配置类等
DbContext中不配置数据库连接，而是为DbContext增加一个DbContextOptions类型的构造函数。
- 2、EFCore项目安装对应数据库的EFCore Provider
- 3、asp.net-core项目引用EFCore项目，并且通过AddDbContext来注入DbContext及对DbContext进行配置。
- 4、Controller中就可以注入DbContext类使用了。
- 5、让开发环境的Add-Migration知道连接哪个数据库
  - 在EFCore项目中创建一个实现了IDesignTimeDbContextFactory的类。并且在CreateDbContext返回一个连接开发数据库的DbContext。
```C#
public MyDbContext CreateDbContext(string[] args)
{
    DbContextOptionsBuilder<MyDbContext> builder = new DbContextOptionsBuilder<MyDbContext>();
    string connStr = "Data Source=.;Initial Catalog=demo666;Integrated Security=SSPI;";
    builder.UseSqlServer(connStr);
    MyDbContext ctx = new MyDbContext(builder.Options);
    return ctx;
}
```
  - 如果不在乎连接字符串被上传到Git，就可以把连接字符串直接写死到CreateDbContext；如果在乎，那么CreateDbContext里面很难读取到VS中通过简单的方法设置的环境变量，所以必须把连接字符串配置到Windows的正式的环境变量中，然后再 Environment.GetEnvironmentVariable读取。
6、正常执行Add-Migration、Update-Database迁移就行了。需要把EFCore项目设置为启动项目，并且在【程序包管理器控制台】中也要选中EFCore项目，并且安装Microsoft.EntityFrameworkCore.SqlServer、Microsoft.EntityFrameworkCore.Tools
- ![成功](https://github.com/cool19980208/picx-images-hosting/raw/master/20241009/成功.7ax5co8ndt.webp)



### 总结
- 在分层项目中，我们把实体类、上下文写到独立于ASP.NET-Core的项目中，把数据库连接的配置使用使用依赖注入的方式写到ASP.NET-Core项目中，这样就做到了项目职责的清晰划分

---

## 使用“上下文池”时要谨慎
- 为了避免性能损失，EF Core中提供了可以用来替代`AddDbContext`的`AddDbContextPool`来注入上下文

### 慎用AddDbContextPool
- 1、用AddDbContextPool代替AddDbContext可以实现“DbContext池”。
- 2、AddDbContextPool的问题：
  - 用AddDbContextPool注册的DbContext无法注入其他服务？
    - 是的，因为用了AddDbContextPool后，上下文实例会被复用，因此我们无法为上下文注入服务
    - 而AddDbContext可以。
  - 很多数据库的ADO.NET提供者都实现了数据库连接池机制，用了AddDbContextPool后，可能会有冲突，实用的时候需要自己调节，太麻烦。
    - 举个例子
      - ![连接池耗尽](https://github.com/cool19980208/picx-images-hosting/raw/master/20241009/连接池耗尽.4n7p2bl79p.webp)
- 3、实用性
  - 根据上面AddDbContextPool的缺点来看，对于我们来说它的意义不大，我们作为了解即可
  - 在进行项目开发时，推荐开发人员采用“小上下文”策略+启用数据库连接池
    - “小上下文”策略：不要把项目中所有的实体类都放到同一个上下文类中，而是只把关系紧密的实体类放到同一个上下文类中，把关系不紧密的实体类放到不同的上下文类中。

---



## 案例：批量注册上下文

- 1、项目采用“小上下文”策略，在项目中可能存在着多个上下文类，如果手动AddDbContext就太麻烦。
- 2、反射扫描程序集中所有的上下文类，然后逐个调用AddDbContext注册。AddAllDbContexts   
  - Install-Package Zack.Infrastructure
    - 安装到主程序集，比如BooksEFCore和ASP.NET Core集成EF Core，那就安装到ASP.NET Core集成EF Core即可
  - 插件地址：https://github.com/yangzhongke/NETBookMaterials
    - 采用反射的方法扫描程序集中所有的上下文类，然后为它们逐个调用AddDbContext注册
  - 这个插件适应于多个DbContext连接同一个数据库的情况
    - 如果是一半DbContext连接其中一个数据库，另外一半DbContext连接另外一个数据库，那这种情况可以根据杨中科老师的代码进行改造

### 注意点
- 多个dbContext做迁移的时候，会报错。
  - 比如：More than one DbContext was found. Specify which one to use. Use the '-Context' parameter for PowerShell commands and the '--context' parameter for dotnet commands.
    - ![迁移报错](https://github.com/cool19980208/picx-images-hosting/raw/master/20241010/迁移报错.8ad8qtsufm.webp)
  - 解决方法：Add-Migration AddPerson -Context PersonDbContext(哪个dbContext集)
    - 更新：Update-Database  -Context PersonDbContext

- 测试成功
  - ![成功](https://github.com/cool19980208/picx-images-hosting/raw/master/20241010/成功.8z6iauku2e.webp)


- 注册DbContext

```C#
//var asms = new Assembly[] { Assembly.Load("BooksEFCore") };//扫描哪些程序集的DbContext
var asms = ReflectionHelper.GetAllReferencedAssemblies();//遍历所有程序集，和上面的用法，二者取其一即可~
builder.Services.AddAllDbContexts(opt =>
{
    string connStr = builder.Configuration.GetSection("ConnStr").Value;
    opt.UseSqlServer(connStr);
}, asms);
```
- ![代替](https://github.com/cool19980208/picx-images-hosting/raw/master/20241010/代替.7ax5do9mit.webp)



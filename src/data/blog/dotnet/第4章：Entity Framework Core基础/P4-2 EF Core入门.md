---
title: P4-2 EF Core入门
date: 2024-09-14 08:54:26
tags: .NET Core2022-学习
categories:
- .NET Core
- 第4章：Entity Framework Core基础
---
# EF Core入门
---
## 该选择什么数据库
- 1、EF Core是对于底层ADO.NET Core的封装，因此ADO.NET Core支持的数据库不一定被EF Core支持。
- 2、EF Core支持所有主流的数据库，包括MYSQL Server、Oracle、MySQL、PostgreSQL、SQLite等。
  - 也可以自己实现Provider支持其他数据库。国产数据库支持问题。
- 3、对于SQLServer支持最完美， MySQL、PostgreSQL也不错（有能解决的小坑）。
  - 这三者是.NET圈中用的最多的三个。
  - 本课程主要用SQLServer讲，如果用其他数据库只要改一行代码+绕一些小坑即可，大部分代码用法不变。EF Core能尽量屏蔽底层数据库差异。


---

## EF Core 环境搭建
- 1、经典步骤：
  - 建实体类
  - 建Config
    - 杨中科老师用的是T_Books,其是因为杨中科老师第一家公司是Kingdee，Kingdee的数据库命名格式是：`T_XXXS`
  - 建DbContext
  - 生成数据库
    - 提交修改记录：Add-Migration XXX
    - 生成数据库：Update-Database
  - 编写调用EF Core的业务代码
- 第三方包支持
  - .NET 5只能安装这个版本
    - Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 5.0.4
    - Install-Package Microsoft.EntityFrameworkCore.Tools -Version 5.0.4

### 步骤分解
- 1.建实体类
```C#
public class Book
{
    public long Id { get; set; }//主键
    public string Title { get; set; }//标题
    public DateTime PubTime { get; set; }//发布日期
    public double Price { get; set; }//单价
    public string AuthorName { get; set; }//作者名字
}
```
![步骤1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240913/步骤1.1lbrzuws50.webp)

- 2.建Config

```C#
//创建实现了IEntityTypeConfiguration接口的实体配置类，配置实体类和数据库表的对应关系
class BookEntityConfig : IEntityTypeConfiguration<Book>
{
	public void Configure(EntityTypeBuilder<Book> builder)
	{
		builder.ToTable("T_Books");
	}
}
```
![步骤2](https://github.com/cool19980208/picx-images-hosting/raw/master/20240913/步骤2.175c8zoh9y.webp)

- 3.建DbContext
  - 创建继承自DbContext的类

![步骤3](https://github.com/cool19980208/picx-images-hosting/raw/master/20240913/步骤3.67xf0jvbsn.webp)

- 4.生成数据库
  - 先安装Migration：生成数据库的工具
    - Install-Package Microsoft.EntityFrameworkCore.Tools -Version 5.0.4
    - 不安装的话，执行Add-Migration等命令会报错
  - 在“程序包管理器控制台”中执行如下命令:`Add-Migration InitialCreate`
    - 自动在项目的Migrations文件夹中中生成操作数据库的C#代码。那InitialCreate是什么？是这一项修改的提交备注，类似Git的提交一样
    - ![步骤4](https://github.com/cool19980208/picx-images-hosting/raw/master/20240913/步骤4.6t72mups3c.webp)
  - “程序包管理器控制台”中执行`Update-database`
    - 代码需要执行后才会应用对数据库的操作。
    - 类似于Git的推送到Github的操作
    - ![步骤4](https://github.com/cool19980208/picx-images-hosting/raw/master/20240913/步骤4.1.1e8k4fampj.webp)
  - 查看一下数据库，表建好了
    - 一般我们不经常看


#### 概念：Migration数据库迁移
- 面向对象的ORM开发中，数据库不是程序员手动创建的，而是由Migration工具生成的。
  - 关系数据库只是盛放模型数据的一个媒介而已，理想状态下，程序员不用关心数据库的操作。
  - 重点“理想状态下”
- 根据对象的定义变化，自动更新数据库中的表以及表结构的操作，叫做Migration（迁移）。
- 迁移可以分为多步（项目进化），也可以回滚。

#### 修改表结构
- 1、项目开发中，根据需要，可能会在已有实体中修改、新增、删除表、列等。
- 2、想要限制Title的最大长度为50，Title字段设置为“不可为空”
  - 想增加一个不可为空且最大长度为20的AuthorName（作者名字）属性。
  - 首先在Book实体类中增加一个AuthorName属性
- 3、修改BookEntityConfig 
```C#
builder.ToTable("T_Books");
builder.Property(e => e.Title).HasMaxLength(50).IsRequired();
builder.Property(e => e.AuthorName).HasMaxLength(20).IsRequired();
```
- 4、执行Add-Migration AddAuthorName_ModifyTitle。取名字要有意义
- 5、Update-Database

---

## 插入数据
- 1、只要操作Books属性，就可以向数据库中增加数据，但是通过C#代码修改Books中的数据只是修改了内存中的数据。对Books做修改后，需要调用DbContext的异步方法SaveChangesAsync()把修改保存到数据库。也有同步的保存方法SaveChanges()，但是用EF Core都推荐用异步方法。
- 2、EF Core默认会跟踪(Track)实体类对象以及DbSet的改变。
- 3、演示数据插入。

```C#
static async Task Main(string[] args)
{
    using(MyDbContext ctx =new MyDbContext())
    {
        Dog d = new Dog();
        d.Name = "Mimi";
        ctx.Dog.Add(d);//把d对象加入Dog这个逻辑上的表里面
        await ctx.SaveChangesAsync();//把上述的对数据的操作更新到 数据库中
    }
}
```


---

## 查询数据
- 1、DbSet实现了`IEnumerable<T>`接口，因此可以对DbSet实施Linq操作来进行数据查询。
  - EF Core会把Linq操作转换为SQL语句。面向对象，而不是面向数据库(SQL)。
- 2、可以使用OrderBy操作进行数据的排序
  - GroupBy也可以
- 3、大部分Linq操作都能作用于EF Core。


```C#
//查询价钱大于80的
var books =ctx.Books.Where(b => b.Price > 80);
foreach (var book in books)
{
    Console.WriteLine(book.Title);
}

var book1 = ctx.Books.Single(b => b.Title == "零基础趣学C语言");
Console.WriteLine(book1.Price);

//排序
var books = ctx.Books.OrderByDescending(b => b.Price);
foreach (var book in books)
{
    Console.WriteLine($"Id={book.Id},Title ={book.Title},Price={book.Price}");
}

//链式查询
var groups = ctx.Books.GroupBy(b => b.AuthorName)
	.Select(g => new { AuthorName = g.Key, BooksCount = g.Count(), MaxPrice = g.Max(b => b.Price) });
foreach(var g in groups)
{
	Console.WriteLine($"作者名:{g.AuthorName},著作数量:{g.BooksCount},最贵的价格:{g.MaxPrice}");
}
```

---

## 修改和删除数据
- 1、要对数据进行修改，首先需要把要修改的数据查询出来，然后再对查询出来的对象进行修改，然后再执行SaveChangesAsync()保存修改。

- 2、删除也是先把要修改的数据查询出来，然后再调用DbSet或者DbContext的Remove方法把对象删除，然后再执行SaveChangesAsync()保存修改。


```C#
//修改
var b = ctx.Books.Single(b => b.Title == "数学之美");
b.AuthorName = "Jun Wu";
await ctx.SaveChangesAsync();

//删除
var b = ctx.Books.Single(b => b.Title == "数学之美");
ctx.Remove(b);//也可以写成ctx.Books.Remove(b);
await ctx.SaveChangesAsync();
                
```

### 批量修改、删除
- 1、目前批量修改、删除多条数据的方法。
局限性：性能低：查出来，再一条条Update、Delete，而不能执行Update ... where；delete ... where；
- 2、官方目前还没有支持高效的批量Update、Delete，有在后续版本中增加，但是目前只是前期意见征询阶段。
- 3、我实现了一个开源的高效批量修改、删除的开源项目。(2021-03-27杨老师录的课)
  - 那时候才EF Core-5
  - Zack.EFCore.Batch https://github.com/yangzhongke/Zack.EFCore.Batch
- 4、SQL Server有自带可以检测SQL语句运行的工具
  - ![SQL语句查看](https://github.com/cool19980208/picx-images-hosting/raw/master/20240914/SQL语句查看.54xpqpnhii.webp)
- 5、**截止到2024-09-14，批量修改、删除 在EF Core7里面已经有了**
  - ![EFCore7](https://github.com/cool19980208/picx-images-hosting/raw/master/20240914/EFCore7.0.969p53rku2.webp)
  - https://learn.microsoft.com/zh-cn/ef/core/what-is-new/ef-core-7.0/whatsnew#executeupdate-and-executedelete-bulk-updates




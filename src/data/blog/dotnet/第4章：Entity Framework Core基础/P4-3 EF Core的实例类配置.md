---
title: P4-3 EF Core的实例类配置
description: .NET Core 学习笔记 - P4-3 EF Core的实例类配置
pubDatetime: 2024-09-14T15:10:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第4章：Entity Framework Core基础
draft: false
---
---
## 约定大于配置
主要规则：
- 1：数据库表名采用DbContext中的对应的DbSet的属性名
- 2：数据表列的名字采用实体类属性的名字，列的数据类型采用和实体类属性类型最兼容的类型
  - 比如在SQL Server中，string类型对应nvarchar，long类型对应bigint
- 3：数据表列的可空性取决于对应实体类属性的可空性
  - .EF Core6中支持C#中的可空引用类型
- 4：名字为Id的属性为主键，
  - 如果主键为short, int 或者 long类型，则默认采用自增字段
  - 如果主键为Guid类型，则默认采用默认的Guid生成机制生成主键值

### 两种配置方式的对比
- 1、Data Annotation
把配置以特性（Annotation）的形式标注在实体类中。
  - 优点：简单
  - 缺点：耦合

- 2、**Fluent API(推荐这种)**
把配置写到单独的配置类中。
  - 缺点：复杂
  - 优点：解耦

- 3、两者大部分功能重叠。
  - 因为在开源社区中有两种实体类的配置方案
    - 1.混合方案：以Data Annotation为主，Fluent API为辅助
    - 2.单一方案：只用Fluent API
  - **基于分层的设计原则，我们推荐单一方案的使用**


---

## Data Annotaion(数据注释)
- 把配置以特性（Annotation）的形式标注在实体类中。

```C#
[Table("T_Cats")]
public class Cat
{
    public long Id { get; set; }//主键

    [Required]//不可为空
    [MaxLength(22)]//最大长度为20
    public string Name { get; set; }
}
```

---

## Fluent API
- 把配置写到单独的配置类中。
  - 属于官方的推荐用法

### Fluent API基本配置
```C#
//1、视图与实体类映射：
modelBuilder.Entity<Blog>().ToView("blogsView");

//2、排除属性映射：
modelBuilder.Entity<Blog>().Ignore(b => b. Name2);

//3、配置数据库列名：
modelBuilder.Entity<Blog>().Property(b =>b.BlogId).HasColumnName("blog_id");

//4、配置列数据类型：
builder.Property(e => e.Title) .HasColumnType("varchar(200)")

//5、配置主键
//默认把名字为Id或者“实体类型+Id“的属性作为主键，可以用HasKey()来配置其他属性作为主键。
//支持复合主键，但是不建议使用。
modelBuilder.Entity<Student>().HasKey(c => c.Number);

//6、索引
modelBuilder.Entity<Blog>().HasIndex(b => b.Url);

//复合索引
modelBuilder.Entity<Person>().HasIndex(p => new { p.FirstName, p.LastName });

唯一索引：IsUnique()；聚集索引：IsClustered()

//7、重载的方法
//比如HasIndex的重载，
builder.HasIndex("Number");
builder.HasIndex(b => b.Number);
//重载方法我们建议都使用builder.HasIndex(b => b.Number); 因为这样如果属性写错了，C#会报错

//8、用EF Core太多高级特性的时候要谨慎，尽量不要和业务逻辑混合在一起，以免“不能自拔”。
//比如Ignore、Shadow、Table Splitting等……

```

### Fluent API究竟流畅在哪里
- 相同返回值类型的方法可以用链式调用，这样使用可以简化代码的编写
- 为什么流程？ 因为相同返回值类型的方法 你可以用`.`去连接,可以一直点下去
  -  builder.Property(e => e.AuthorName).HasMaxLength(20).IsRequired();


### 杨老师的经验之谈
- A、B两个技术，让你选择你怎么选？
  - A比B 适度且合理的复杂，但B简单易上手。
  - 潜意识中你会选B，因为简单上手快。但杨中科老师的经验是选A，因为A虽然适合且合理的复杂，但对于后期会非常好用
    - 比如：WinForm 和 MVC；Data Annotaion和 Fluent API ；EF的`DB First`、`Model First`、`Code First`三者的对比~
    - 都是难一点的技术到后期的效果好一点。前期越简单的技术，后面越麻烦。

---

## 主键类型的选择并不简单

- EF Core支持多种主键生成策略：自动增长；Guid；Hi/Lo算法等。
### 自动增长。
- 分析
  - 优点：简单；
  - 缺点：数据库迁移以及分布式系统中比较麻烦；并发性能差。
  - long、int等类型主键，默认是自增。
- 自增字段的代码中不能为Id赋值，必须保持默认值0，否则运行的时候就会报错。


### Guid算法
- 基于网卡的mac地址，时间戳等信息来生成一个全球唯一的ID，因此不需要锁机制
- 分析
  - 适合于分布式系统，在进行多数据库数据合并的时候很简单
  - 优点：简单，高并发，全局唯一
  - 缺点：磁盘空间占用大
- Guid值不连续。
  - 使用Guid类型做主键的时候，不能把主键设置为聚集索引。因为聚集索引是按照顺序保存主键的，因此用Guid做主键性能差。
  - 比如MySQL的InnoDB引擎中主键是强制使用聚集索引的。
  - 有的数据库支持部分的连续Guid，比如SQLServer中的NewSequentialId()，但也不能解决问题。
  - 在SQLServer等中，不要把Guid主键设置为聚集索引；在MySQL中，插入频繁的表不要用Guid做主键。
- 3、演示Guid用法：既可以让EF Core给赋值，也可以手动赋值（推荐）

```C#
//Guid算法
Author a2 = new Author { Name = "Zack Yang" };
a2.Id = Guid.NewGuid();
Console.WriteLine($"保存前，Id={a2.Id}");
ctx.Authors.Add(a2);
await ctx.SaveChangesAsync();
Console.WriteLine($"保存后，Id={a2.Id}");
```

#### 自增+Guid算法
- 混合自增和Guid（非复合主键）
  - 用自增列做物理的主键，而用Guid列做逻辑上的主键。
  - 把自增列设置为表的主键，而在业务上查询数据时候把Guid当主键用。在和其他表关联以及和外部系统通讯的时候（比如前端显示数据的标识的时候）都是使用Guid列。
  - 不仅保证了性能，而且利用了Guid的优点，而且减轻了主键自增性导致主键值可被预测带来的安全性问题。

#### Hi/Lo算法
- Hi/Lo算法：EF Core支持Hi/Lo算法来优化自增列。
- 主键值由两部分组成：高位（Hi）和低位（Lo），高位由数据库生成，两个高位之间间隔若干个值，由程序在本地生成低位，低位的值在本地自增生成。不同进程或者集群中不同服务器获取的Hi值不会重复，而本地进程计算的Lo则可以保证可以在本地高效率的生成主键值。但是HiLo算法不是EF Core的标准。

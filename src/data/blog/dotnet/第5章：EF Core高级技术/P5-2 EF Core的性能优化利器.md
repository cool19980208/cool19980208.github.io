---
title: P5-2 EF Core的性能优化利器
date: 2024-09-26 17:26:26
tags: .NET Core2022-学习
categories:
- .NET Core
- 第5章：EF Core高级技术
---
# EF Core的性能优化利器
---
## EF Core的优化之AsNoTracking
- 1、如果通过DbContext查询出来的对象只是用来展示，不会发生状态改变，则可以使用AsNoTracking()来 “禁用跟踪”。
- 2、分别加AsNoTracking()和不加，分别查看一个对象修改后的EntityEntry 信息。
- 3、如果查询出来的对象不会被修改、删除等，那么查询时可以AsNoTracking()，就能降低内存占用。
  - 如果查询加了AsNoTracking()，后续去执行修改语句，是不生效的。
    - 因为EF Core是用“快照来更改跟踪”
![忽略](https://github.com/cool19980208/picx-images-hosting/raw/master/20240925/忽略.wiiwshl3i.webp)

---

## 实体类状态跟踪的妙用

### 概述
- 1、开发人员一般不需要关注实体状态的跟踪，让它在背后帮助我们工作即可。
- 2、有人利用状态跟踪的特点做一些小动作，
  - 杨中科老师不推荐，但是要介绍了解一下，以防止其他程序员用这种写法。

### 更新
- 常规更新需要先查询、再更新，两条SQL。

```C#
//一般用法，先查询出来，然后修改，进行保存
var a = ctx.Articles.Where(a => a.Id == 6).Single();
a.Price = 188;
await ctx.SaveChangesAsync();

//另外一种写法:跳过查询，直接修改，保存。一条SQL搞定
//查看生成的SQL，只更新Title列。
Article b1 = new Article { Id = 10 };//跟踪通过Id定位
    b1.Title = "yz";
    var entry1 = ctx.Entry(b1);
    entry1.Property("Title").IsModified = true;
    Console.WriteLine(entry1.DebugView.LongView);
    ctx.SaveChanges();
```

### 删除

- 常规删除需要先查询、再删除，两条SQL。

```C#
//一般用法，先查询出来，然后删除，进行保存
var a = ctx.Articles.Where(a => a.Id == 6).Single();
ctx.Remove(a);
await ctx.SaveChangesAsync();

//另外一种写法:跳过查询，直接删除-->保存。一条SQL搞定
Article b1 = new Article { Id = 10 };//跟踪通过Id定位
ctx.Entry(b1).State = EntityState.Deleted;
ctx.SaveChanges();
```

### 总结
- 上面的技巧代码可读性、可维护性不强，而且使用不当有可能造成不容易发现的Bug。
  - 带来的性能提升也是微乎其微的，**因此不推荐使用，知道即可**

---

## Find和FindAsync方法
- Find和FindAsync方法：在上下文查找这个对象是否已经被跟踪
  - 如果对象已经被跟踪，就直接返回被跟踪的对象
  - 只有在本地没有找到这个对象时，EF Core才会免去这次数据库查询
- 对比Single方法：执行一次数据库查询


- 优点：有可能因为用Find方法会减少一次数据库查询，性能更好。
- 缺点：但是如果在对象被跟踪之后，数据库中对应的数据已经被其他程序修改了，那么Find方法可能会返回旧数据

---

## EF Core中高效地删除、更新数据

### 概述
- EF Core中不支持高效的插入数据，都是逐条操作。AddRange、DeleteRange等。(2024-09-25)
  - 在.NET 5和6中是没有批量修改、删除操作的，在EF Core7里面才有了
  - 微软地址：https://learn.microsoft.com/zh-cn/ef/core/what-is-new/ef-core-7.0/whatsnew#executeupdate-and-executedelete-bulk-updates
- 在.NET 5和6中是没有批量修改、删除操作的，那怎么办呢？
  - 可以用杨中科老师的开源项目Zack.EFCore.Batch 
    - 高效批量修改、删除、插入的开源项目，具体使用看文档
  - 开源项目地址：https://github.com/yangzhongke/Zack.EFCore.Batch
  - 文档：https://github.com/yangzhongke/Zack.EFCore.Batch/blob/main/README_CN.md

### 为啥不用SQL实现
- 1、原生SQL语句需要把表名、列名等硬编码到SQL语句中，不符合模型驱动、分层隔离等思想，程序员直接面对数据库表，无法利用EF Core强类型的特性，如果模型发生改变，必须手动变更SQL语句。
- 2、无法利用EF Core强大的SQL翻译机制来屏蔽不同底层数据库的差异。


```C#
//杨中科老师的开源项目Zack.EFCore.Batch
//批量删除
await ctx.DeleteRangeAsync<Article>(b => b.Id > 131080 || b.Content == "zack yang");

//批量更新
await ctx.BatchUpdate<Article>()
.Set(b => b.Price, b => b.Price + 3)
.Set(b => b.Title, b => b.Title+DateTime.Now.Second)
.Where(b => b.Id> 131070)
.ExecuteAsync();

//批量插入
List<Article> Articles = new List<Article>();
for (int i = 0; i < 100; i++)
{
    Articles.Add(
        new Article
        {
            Title = "abc" + i,
            Price = new Random().NextDouble(),
            Content = Guid.NewGuid().ToString(),
        }
    );
}
using (MyDbContext ctx = new MyDbContext())
{
    ctx.BulkInsert(Articles);
}
```
![批量](https://github.com/cool19980208/picx-images-hosting/raw/master/20240925/批量.6t7343res7.webp)

---

## 全局查询筛选器

### 概述
- 1、全局查询筛选器：EF Core 会自动将这个查询筛选器应用于涉及这个实体类型的所有 LINQ 查询。
- 2、场景：软删除、多租户。
- 3、什么是软删除？
  - 逻辑删除，不是真从数据库删除。
  - 比如:像银行等会被审计的系统去使用

### 用法
- 1、builder.HasQueryFilter(b=>b.IsDeleted==false);
  - ![全局筛选器](https://github.com/cool19980208/picx-images-hosting/raw/master/20240925/全局筛选器.8vmvs5pd2x.webp)
- 2、测试一下如下的代码，查看生成的SQL：
  - ctx.Articles.Take(3)
- 3、忽略：IgnoreQueryFilters()

```C#
ctx.Articles.Take(3)//全局软删除

ctx.Articles.IgnoreQueryFilters().Take(3)//忽略全局软删除
```

### 注意：全局筛选器的性能陷阱
- 如果启用了软删除，查询操作可能会导致全表扫描，从而影响查询性能。
  - 如果为软删除列创建索引的话，又会增加索引的磁盘占用
- 所以，如果使用了全局查询筛选器，我们就需要根据项目的需要进一步优化数据库了

---


## 悲观并发控制

### 概述
- 1、并发控制：避免多个用户同时操作资源造成的并发冲突问题。举例：统计点击量。
2、最好的解决方案：非数据库解决方案。
3、数据库层面的两种策略：悲观、乐观。


1、悲观并发控制一般采用行锁、表锁等排他锁对资源进行锁定，确保同时只有一个使用者操作被锁定的资源。
2、EF Core没有封装悲观并发控制的使用，需要开发人员编写原生SQL语句来使用悲观并发控制。不同数据库的语法不一样。


### 实现

- 1.创建实体类

```C#
class House
{
	public long Id { get; set; }
	public string Name { get; set; }
	public string Owner { get; set; }
}

```

- 2.MySQL行锁： select * from T_Houses where Id=1 for update
  - 如果有其他的查询操作也使用for update来查询Id=1的这条数据的话，那些查询就会被挂起，一直到针对这条数据的更新操作完成从而释放这个行锁，代码才会继续执行。
  - SQL Server行锁：SELECT * FROM T_Houses WITH (ROWLOCK) WHERE Id = 1

### 实现测试
- 1、锁是和事务相关的，因此通过BeginTransactionAsync()创建一个事务，并且在所有操作完成后调用CommitAsync()提交事务。
- 2、var h1 = await ctx.Houses.FromSqlInterpolated($"select * from T_Houses where Id=1 for update").SingleAsync();
- 3、定位到编译完成的exe目录下，运行两个exe程序的实例，分别输入姓名tom和jim。
  - 报错
  - ![死锁](https://github.com/cool19980208/picx-images-hosting/raw/master/20240926/死锁.45nge9nb0.webp)
  - 最后让GPT调整了一下代码就可以了 

### 需要注意的问题
- 1、悲观并发控制的使用比较简单；
- 2、锁是独占、排他的，如果系统并发量很大的话，会严重影响性能，如果使用不当的话，甚至会导致死锁。
- 3、不同数据库的语法不一样。

---

## 乐观并发控制

### 乐观并发控制的原理
- EF Core内置了使用并发令牌列实现的乐观并发控制
```C#
Update T_Houses set Owner=新值
where Id=1 and Owner=旧值
```
- 举例子。当Update的时候，如果数据库中的Owner值已经被其他操作者更新为其他值了，那么where语句的值就会为false，
- 因此这个Update语句影响的行数就是0，EF Core就知道“发生并发冲突”了，因此SaveChanges()方法就会抛出DbUpdateConcurrencyException异常
  - ![乐观并发](https://github.com/cool19980208/picx-images-hosting/raw/master/20240926/乐观并发.8hgg2bx262.webp)


#### 实现：EF Core中配置
1、把被并发修改的属性使用IsConcurrencyToken()设置为并发令牌。
`builder.Property(h => h.Owner).IsConcurrencyToken();`
2、用catch接住异常

```C#
try
{
    await ctx.SaveChangesAsync();
    Console.WriteLine("恭喜你，抢到了");
}
catch (DbUpdateConcurrencyException ex)
{
    var entry = ex.Entries.First();
    var dbValues = await entry.GetDatabaseValuesAsync();
    string newOwner = dbValues.GetValue<string>(nameof(House.Owner));
    Console.WriteLine($"并发冲突，被{newOwner}提前抢走了");
}
```

#### 运行观察
- 1、首先把数据库中Id=1这一行数据中的Owner列的值清空，然后仍然像上一节一样运行两个exe程序的实例，分别输入姓名tom和jim。
- 2、查看EF Core运行的SQL语句。
  - 抢先一步成功就直接update成功了，
  - 失败的，就先update发现影响行数为0，那么就再次执行一下查询，然后提示报错

```C#
//成功
SET NOCOUNT ON;
      UPDATE [T_Houses] SET [Owner] = @p0
      WHERE [Id] = @p1 AND [Owner] = @p2;
      SELECT @@ROWCOUNT;

//并发冲突，失败的
SET NOCOUNT ON;
      UPDATE [T_Houses] SET [Owner] = @p0
      WHERE [Id] = @p1 AND [Owner] = @p2;
      SELECT @@ROWCOUNT;

SELECT TOP(1) [t].[Id], [t].[Name], [t].[Owner]
      FROM [T_Houses] AS [t]
      WHERE [t].[Id] = @__p_0
```

### 乐观并发控制：RowVersion
- SQLServer的RowVersion
- 1、SQLServer数据库可以用一个byte[]类型的属性做并发令牌属性，然后使用IsRowVersion()把这个属性设置为RowVersion类型，这样这个属性对应的数据库列就会被设置为ROWVERSION类型。
  - 对于ROWVERSION类型的列，在每次插入或更新行时，数据库会自动为这一行的ROWVERSION类型的列其生成新值。
- 2、在SQLServer中，timestamp和rowversion是同一种类型的不同别名而已。

#### 实体类及配置

```C#
class House
{
	public long Id { get; set; }
	public string Name { get; set; }
	public string Owner { get; set; }
	public byte[] RowVer { get; set; }
}

builder.Property(h => h.RowVer).IsRowVersion();
```

#### 概念
- 1、在MySQL等数据库中虽然也有类似的timestamp类型，但是由于timestamp类型的精度不够，并不适合在高并发的系统
  - 低版本好像有这个问题，高版本不确定修复了没
- 2、非SQLServer中，可以将并发令牌列的值更新为Guid的值


#### 总结

- 1、乐观并发控制能够避免悲观锁带来的性能、死锁等问题，因此推荐使用**乐观并发控制**而不是悲观锁
- 2、如果有一个确定的字段要被进行并发控制，那么使用IsConcurrencyToken()把这个字段设置为并发令牌即可
- 3、如果无法确定一个唯一的并发令牌列，那么就可以引入一个额外的属性设置为并发令牌，并且在每次更新数据的时候，手动更新这一列的值
  - 如果用的是SQLServer数据库，那么也可以采用RowVersion列，这样就不用开发者手动来在每次更新数据的时候，手动更新并发令牌的值了
  - 如果用的是MySQl就只能在修改其他属性值的同时，使用h1.RowVer = Guid.NewGuid()手动更新并发令牌属性的值



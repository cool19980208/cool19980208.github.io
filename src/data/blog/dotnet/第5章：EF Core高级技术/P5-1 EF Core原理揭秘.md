---
title: P5-1 EF Core原理揭秘
date: 2024-09-25 10:50:26
tags: .NET Core2022-学习
categories:
- .NET Core
- 第5章：EF Core高级技术
---
# EF Core原理揭秘
---
## EF Core有哪些做不到的事情
- C#千变万化，但SQL功能简单
  - 所以会存在**合法的C#语句运行过程中无法被翻译为SQL语句**的情况
  - 报错：The LINQ expression 'DbSet<TPerson>().Where(t => Program.IsOK(t.Name))' could not be translated. 

---

## 既生IEnumerable，何生IQueryable
- 1、不同的Where方法
  - 普通集合的调用
  - EF Core的DbSet的调用
- 2、IEnumerable和IQueryable的区别
  - IEnumerable都是供普通集合去使用，
    - 比如Where等方法都是"客户端评估"
    - "客户端评估"：把数据首先加载到应用程序的内存中，然后在内存中进行数据筛选的过程
  - IQueryable版本则是把查询操作翻译成SQL语句
    - 算是"服务器端评估"
    - "服务器端评估"：把Where条件转换成SQL语句，然后在数据库服务器上完成数据筛选的过程
- 在使用EF Core的时候，尽量都使用IQueryable版本的方法。尽量避免"客户端评估"
- `Every disadvantage has its advantage`
  - 每个缺点都有它的优点

```C#
//IQueryable "服务器端评估"
SELECT [t].[Id], [t].[ArticleId], [t].[Message]
      FROM [T_Comments] AS [t]
      WHERE [t].[Message] LIKE N'%了%'


//IEnumerable "客户端评估"
SELECT [t].[Id], [t].[ArticleId], [t].[Message]
      FROM [T_Comments] AS [t]
```

### 在某些场景下"客户端评估"也是可以的
- 服务器端---数据运算非常非常复杂，复杂到影响性能了
- 可以用服务器端评估和客户端评估做一下性能对比
  - 如果客户端评估性能更好，可以用它。但一般情况下很少用到

```C#
//IQueryable
SELECT [t].[Id], COALESCE(SUBSTRING([t].[Message], 0 + 1, 2), N'') + N'...' AS [Pre]
    FROM [T_Comments] AS [t]

//IEnumerable
SELECT [t].[Id], [t].[ArticleId], [t].[Message]
    FROM [T_Comments] AS [t]
```
---

## IQueryable的延迟执行
- IQueryable不仅可以带来“服务器端评估”的功能，而且提供了延迟执行的能力

### 延迟执行
- 1、测试一下：只查询，但是不遍历IQueryable，查看是否有执行SQL语句。
  - 没有执行SQL语句
- 2、在查询之后、foreach前后分别加上输出语句，查看输出内容的顺序。
  - ![SQL运行顺序](https://github.com/cool19980208/picx-images-hosting/raw/master/20240923/SQL运行顺序.7ax4pp2ar6.webp)
  - 在遍历触发的时候，SQL语句才会开始执行
- 3、总结发现：只有遍历IQueryable的时候才会执行。
  - 因为这是立即执行方法


### 所谓IQueryable
- 1、IQueryable只是代表一个“可以放到数据库服务器去执行的查询”，它没有立即执行，只是“可以被执行”而已。
- 2、对于IQueryable接口调用`非立即执行`的时候不会执行查询，而调用`立即执行`方法的时候则会立即执行查询。
  - `非立即执行方法`：GroupBy()、OrderBy()、Include()、Skip()、Take()等。
  - `立即执行方法`：遍历、ToArray()、ToList()、Min()、Max()、Count()等；
- 3、判断一个方法是否为立即执行方法的简单判断
  - 一个方法的返回值类型如果是IQueryable类型，那么这个方法一般就是`非立即执行方法`，否则就是`立即执行方法`

### 为什么要实现"延迟执行"这种复杂的机制呢
- 1、可以在实际执行之前，分步构建IQueryable。
  - 我们可以利用这个机制，使用IQueryable来拼接出复杂的查询条件，再去执行查询

```C#
//分步构建IQueryable
IQueryable<Article> arts = ctx.Articles.Where(a => a.Id > 1);
IQueryable<Article> arts2 = arts.Skip(2);
IQueryable<Article> arts3 = arts2.Take(3);
IQueryable<Article> arts4 = arts3.Where(a=>a.Title.Contains("了"));
//立即执行方法触发执行SQL
arts4.ToArray();
```

- 2、比如：定义一个方法根据给定的关键字searchWords来查询匹配的书；如果searchAll参数是true，则书名或者作者名中含有给定的searchWords都匹配，否则只匹配书名；如果orderByPrice参数为true，则按照价格排序，否则就自然排序；upperPrice参数代表价格上限。
  - ![方法](https://github.com/cool19980208/picx-images-hosting/raw/master/20240923/方法.m1eo9g23.webp) 
- 3、试着传递不同参数，查看生成的SQL的不同。
  - 根据不同的条件，拼接出不同的查询条件，然后去执行
```C#
//QueryArticles("了", true, true, 80);
SELECT [t].[Id], [t].[Content], [t].[Price], [t].[Title]
    FROM [T_Articles] AS [t]
    WHERE ([t].[Price] <= @__upperPrice_0) AND (((@__searchWords_1 LIKE N'') OR (CHARINDEX(@__searchWords_1, [t].[Title]) > 0)) OR ((@__searchWords_1 LIKE N'') OR (CHARINDEX(@__searchWords_1, [t].[Content]) > 0)))
    ORDER BY [t].[Price]

//QueryArticles("了", false, false, 80);
SELECT [t].[Id], [t].[Content], [t].[Price], [t].[Title]
    FROM [T_Articles] AS [t]
    WHERE ([t].[Price] <= @__upperPrice_0) AND ((@__searchWords_1 LIKE N'') OR (CHARINDEX(@__searchWords_1, [t].[Title]) > 0))

```

#### 结论
- 1、IQueryable代表一个对数据库中数据进行查询的一个逻辑，这个查询是一个延迟查询。
  - 我们可以调用非立即执行方法向IQueryable中添加查询逻辑
  - 当执行立即执行方法的时候才真正生成SQL语句来执行查询
- 2、EF Core把“动态拼接生产查询逻辑”变的非常简单
  - 以前要是靠SQL拼接来实现的动态查询逻辑

---

## IQueryable的复用
- IQueryable是一个待查询的逻辑，因此它是可以被重复使用的。
  - 对于不同的立即执行操作，各自执行响应的查询逻辑

```C#
IQueryable<Book> books = ctx.Books.Where(b => b.Price > 8);
Console.WriteLine(books.Count());
Console.WriteLine(books.Max(b=>b.Price));
foreach (Book b in books.Where(b=>b.PubTime.Year>2000))
{
    Console.WriteLine(b.Title);
}

//books.Count()
SELECT COUNT(*)
      FROM [T_Books] AS [t]
      WHERE [t].[Price] > 8.0E0

//books.Max(b=>b.Price)
 SELECT MAX([t].[Price])
      FROM [T_Books] AS [t]
      WHERE [t].[Price] > 8.0E0

//books.Where(b=>b.PubTime.Year>2000)
SELECT [t].[Id], [t].[AuthorName], [t].[Price], [t].[PubTime], [t].[Title]
      FROM [T_Books] AS [t]
      WHERE ([t].[Price] > 8.0E0) AND (DATEPART(year, [t].[PubTime]) > 2000)
```
---

## EF Core分页查询

### 场景
- Web网站常用的分页
  - 一页多少条数据
  - 总页数
  - 切换某一页
- 手机APP划，然后下滑触发分页
  - 同理
![分页](https://github.com/cool19980208/picx-images-hosting/raw/master/20240923/分页.6m3v5v1ld5.webp)

### 分页的实现
- 1、Skip(3).Take(8) 
  - 使用分页查询有一个问题需要注意：那就是尽量显式指定排序规则
    - 因为如果不指定排序规则，那么数据库的查询计划对于数据的排序可能是不确定的
- 2、需要知道满足条件的数据的总条数：可以使用IQueryable的复用
- 3、页数：long pageCount = (long)Math.Ceiling(count * 1.0 / pageSize);

![总页数](https://github.com/cool19980208/picx-images-hosting/raw/master/20240924/总页数.1hs6hjedou.webp)

---

## IQueryable的底层运行

### 对比
- 1、DataReader：分批从数据库服务器读取数据。内存占用小、 DB连接占用时间长；
  - 在遍历执行的过程中，我们突然关闭SQL Server去测试一下
    
- 2、DataTable：把所有数据都一次性从数据库服务器都加载到客户端内存中。内存占用大，节省DB连接。

```C#
//先查询后然后全部插入。指数级的制造数据，只适用于测试
INSERT INTO dbo.T_Articles(Title,Content)
SELECT Title,Content FROM dbo.T_Articles
```
![制造数据](https://github.com/cool19980208/picx-images-hosting/raw/master/20240924/制造数据.6ik99hvses.webp)

### 验证IQueryable用什么方式
- 1、用insert into select多插入一些数据，然后加上Delay/Sleep的遍历IQueryable。
  - 在遍历执行的过程中，停止SQLServer服务器。
    - IQueryable内部就是在调用DataReader。
  - 测试
  - 报错：A transport-level error has occurred when receiving results from the server. (provider: Session Provider, error: 19 - Physical connection is not usable)”
  - ![报错](https://github.com/cool19980208/picx-images-hosting/raw/master/20240924/报错.6bh1e2ja2i.webp)
- 2、优点：节省客户端内存。
缺点：如果处理的慢，会长时间占用连接。


#### 一次性加载数据到内存
- 1、一次性加载数据到内存：用IQueryable的ToArray()、ToArrayAsync()、ToList()、ToListAsync()等方法。
- 2、等ToArray()执行完毕，再断服务器试一下。
  - 测试
    - 加了ToList()之后，关闭SQL Server也不妨碍读取数据
    - ![加载到内存](https://github.com/cool19980208/picx-images-hosting/raw/master/20240924/加载到内存.b8v9c9oe3.webp)


### 何时需要一次性加载
- 1、场景1：遍历IQueryable并且进行数据处理的过程很耗时。
- 2、场景2：如果方法需要返回查询结果，并且在方法里销毁DbContext的话，是不能返回IQueryable的。必须一次性加载返回。
- 3、场景3：多个IQueryable的遍历嵌套。很多数据库的ADO.NET Core Provider是不支持多个DataReader同时执行的。把连接字符串中的MultipleActiveResultSets=true删掉，其他数据库不支持这个。
- **一般情况下默认的IQueryable就行，特殊情况可以加载到内存去执行，但量别大，要不然会影响并发**

---

## EF Core中的异步方法
- 异步编程通常能够提升系统的吞吐量，所以我们一般优先使用异步方法

- 异步方法大部分是定义在Microsoft.EntityFrameworkCore这个命名空间下
  - EntityFrameworkQueryableExtensions等类中的扩展方法，记得using。

- IQueryable的这些异步的扩展方法都是“立即执行”方法，
- 而GroupBy、OrderBy、Join、Where等“非立即执行”方法则没有对应的异步方法。
### 为什么？
- 因为“非立即执行”方法并没有实际执行SQL语句，并不是消耗IO的操作。

### 如何异步遍历IQueryable
- 方式1、ToListAsync()、ToArrayAsync()。结果集不要太大。
- 方式2、await foreach (Book b in ctx.Books.AsAsyncEnumerable())

- 不过，一般没必要这么做
  - 初级阶段只做了解就好了，当遇到特殊需求或者遍历有性能瓶颈时，可以用上面两种方法去进行优化

---

## 如何执行原生SQL语句

### 为啥要写原生SQL语句
- 1、尽管EF Core已经非常强大，但是仍然存在着无法被写成标准EF Core调用方法的SQL语句，少数情况下仍然需要写原生SQL。
  - 比如：报表
- 2、可能无法跨数据库。
  - 因为我们用EF Core是自动忽视底层差异去转换对应的SQL语句去执行
- 3、三种情况：非查询语句、实体查询、任意SQL查询。

### 执行SQL非查询语句
- 使用dbCtx.Database. ExecuteSqlInterpolated () 
  - dbCtx.Database. ExecuteSqlInterpolatedAsync()方法来执行原生的非查询SQL语句。

```C#
await ctx.Database.ExecuteSqlInterpolatedAsync(@$"INSERT INTO T_Articles (Title,Content,Price)
                SELECT Title, {name}, Price FROM T_Articles WHERE Price = {age}");
```
#### 这种拼接式的SQL语句有SQL注入漏洞吗？
- 1、字符串内插的方式会不会有SQL注入攻击漏洞吗？
  - 查看一下执行的SQL语句吧。

```C#
//这是使用ExecuteSqlInterpolatedAsync后生成的参数化SQL
INSERT INTO T_Articles (Title,Content,Price)
SELECT Title, @p0, Price FROM T_Articles WHERE Price = @p1

//这是一般的内插值SQL语句
INSERT INTO T_Articles (Title,Content,Price)
SELECT Title, Zane, Price FROM T_Articles WHERE Price = 2

```
                    
- 2、字符串内插如果赋值给string变量，就是字符串拼接；字符串内插如果赋值给FormattableString变量，编译器就会构造FormattableString 对象。
  - 打印FormattableString的成员试试看。

```C#
//Format
Format:INSERT INTO T_Articles (Title,Content,Price)
SELECT Title, {0}, Price FROM T_Articles WHERE Price = {1}
//ArgumentCount
ArgumentCount:2
```

- 3、ExecuteSqlInterpolatedAsync()的参数是FormattableString类型。
  - 因此ExecuteSqlInterpolatedAsync会进行参数化SQL的处理。

#### 其他
- 除了ExecuteSqlInterpolated ()、ExecuteSqlInterpolatedAsync() ，
  - 还有ExecuteSqlRaw()、ExecuteSqlRawAsync() 也可以执行原生SQL语句，但需要开发人员自己处理查询参数等了，**因此不推荐使用**

### 执行实体类SQL查询语句

#### 实体相关SQL
- 1、如果要执行的原生SQL是一个查询语句，并且查询的结果也能对应一个实体，就可以调用对应实体的DbSet的FromSqlInterpolated()方法来执行一个查询SQL语句，同样可以使用字符串内插来传递参数。
  - 嵌套的SQL语句不能用Order By，但是可以后续用LINQ的OrderBy来达到目的
  - ![子查询](https://github.com/cool19980208/picx-images-hosting/raw/master/20240925/子查询.231u57y0oy.webp) 
  - ![改这种方式](https://github.com/cool19980208/picx-images-hosting/raw/master/20240925/改这种方式.73twwsb3l8.webp)

#### 好用的IQueryable
- 1、FromSqlInterpolated()方法的返回值是IQueryable类型的，因此我们可以在实际执行IQueryable之前，可以对IQueryable进行进一步的处理。
```C#
var querryable= ctx.Articles.FromSqlInterpolated($"SELECT * FROM T_Articles WHERE Title LIKE {titlePattern} ");//ORDER BY NEWID()
foreach (var a in querryable.OrderBy(a=>Guid.NewGuid()).Skip(1).Take(2))
{
    Console.WriteLine(a.Id+","+a.Title);
}
```
- 2、把只能用原生SQL语句写的逻辑用FromSqlInterpolated()去执行，然后把分页、分组、二次过滤、排序、Include等其他逻辑尽可能仍然使用EF Core的标准操作去实现。

#### 局限性

- SQL 查询必须返回实体类型对应数据库表的所有列；
  - 只能*去查询，需要指定列的话，有可能会报错
- 结果集中的列名必须与属性映射到的列名称匹配。
- 只能单表查询，不能使用Join语句进行关联查询。但是可以在查询后面使用Include()来进行关联数据的获取。
  - 所以不太适合比较复杂的报表语句

### 执行任意SQL查询语句

#### 啥时候要用ADO.NET

- 1、FromSqlInterpolated()只能执行单表查询，但是在实现报表查询等的时候，SQL语句通常是非常复杂的，不仅要多表Join，而且返回的查询结果一般也都不会和一个实体类完整对应。因此需要一种执行任意SQL查询语句的方法
- 2、EF Core中允许把一个视图或一个存储过程映射为实体，因此可以把复杂的查询语句写成视图或存储过程，然后再声明对应的实体类，并且在DbContext中配置对应的DbSet。
  - 目前大部分公司都不推荐编写存储过程，而推荐创建视图
    - 但是项目的报表等复杂查询通常很多，因此对应的视图也会很多，就需要在上下文类中配置很多不是实体类的“实体类”，这样会造成项目中“实体类”的膨胀，不利用项目管理
- 3、**杨中科老师强烈不推荐使用视图或存储过程**
  - 因为后期的映射，膨胀等不利于项目管理
  - 项目复杂查询很多，导致：视图太多；非实体的DbSet；DbSet膨胀。
  - 如果有上述这种情况，直接使用**执行任意SQL查询语句的方法**

### 执行任意SQL查询语句

#### ADO.NET
dbCxt.Database.GetDbConnection()获得ADO.NET Core的数据库连接对象。这里不讲解ADO.NET基础知识。

```C#
//ADO.NET 原生方法
DbConnection conn = ctx.Database.GetDbConnection(); //拿到Context对应的底层Connection
if (conn.State != ConnectionState.Open)
{
    await conn.OpenAsync();
}
using (var cmd = conn.CreateCommand())
{
    cmd.CommandText = "SELECT Price,COUNT(*) FROM T_Articles GROUP BY Price";
    using (var reader = await cmd.ExecuteReaderAsync())
    {
        while (await reader.ReadAsync())
        {
            double price = reader.GetDouble(0);
            int count = reader.GetInt32(1);
            Console.WriteLine($"{price}:{count}");
        }
    }
}
```


#### Dapper

- using 引用 `Install-Package Dapper `
  - ![Dapper](https://github.com/cool19980208/picx-images-hosting/raw/master/20240925/Dapper.9nzr9gwrjy.webp)
```C#
var items = ctx.Database.GetDbConnection().Query<GroupArticleByPrice>(
    "SELECT Price,COUNT(*) PCount FROM T_Articles GROUP BY Price"
);
foreach (var item in items)
{
Console.WriteLine(item.Price + ":" + item.PCount);
}
```



#### 总结
一般Linq操作就够了，尽量不用写原生SQL；
- 1、非查询SQL用ExecuteSqlInterpolated () ；
- 2、针对实体的SQL查询用FromSqlInterpolated()。
- 3、复杂SQL查询用ADO.NET的方式或者Dapper等。
  - 推荐用Dapper等框架执行原生复杂查询SQL。
- 4、EF Core和Dapper是可以共存的~


---

## 怎么知道实体类变化了

### 实体类没有实现属性值改变的通知机制，EF Core是如何检测到变化的呢？
- EF Core默认采用“快照更改跟踪”实现实体类改变的检测
  - 快照更改跟踪：首次跟踪一个实体的时候，EF Core 会创建这个实体的快照。执行SaveChanges()等方法时，EF Core将会把存储的快照中的值与实体的当前值进行比较。

- 实体的状态
  - 已添加(Added)：DbContext正在跟踪此实体，但数据库中尚不存在该实体。
  - 未改变(Unchanged)：DbContext正在跟踪此实体，该实体存在于数据库中，其属性值和从数据库中读取到的值一致，未发生改变。
  - 已修改(Modified)：DbContext正在跟踪此实体，并存在于数据库中，并且其部分或全部属性值已修改。
  - 已删除(Deleted)：DbContext正在跟踪此实体，并存在于数据库中，但在下次调用 SaveChanges 时要从数据库中删除对应数据。
  - 已分离(Detached)：DbContext未跟踪该实体。

### SaveChanges()的操作
- “已分离”和“未改变”的实体，SaveChanges()忽略；
- “已添加”的实体，SaveChanges() 插入数据库；
- “已修改”的实体，SaveChanges() 更新到数据库；
- “已删除”的实体，SaveChanges() 从数据库删除；

### 查看实体类的状态和实体类的变化信息
- 1、使用DbContext的Entry()方法来获得实体在EF Core中的跟踪信息对象EntityEntry
  - EntityEntry类的State属性代表实体的状态
  - 通过DebugView.LongView属性可以看到实体的变化信息
- 2、测试：从数据库中查出3条记录，修改一条、删除一条、一条不动；再new两个对象，其中一个Add，另外一个不动。然后查看它们的EntityEntry。
  - ![状态变化](https://github.com/cool19980208/picx-images-hosting/raw/master/20240925/状态变化.7egqq135pr.webp)

### 总结
- DbContext会根据跟踪的实体的状态，在SaveChanges()的时候
  - 根据实体状态的不同，生成Update、Delete、Insert等SQL语句，来把内存中实体的变化更新到数据库中

---
title: P2-3 LINQ
description: .NET Core 学习笔记 - P2-3 LINQ
pubDatetime: 2024-09-05T17:45:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第2章：.NET Core 重难点知识
draft: false
---
---
## 为什么要学LINQ？
- 让数据处理变得简单
  - 有可能运行效率不是最好的，但开发效率是很快的
  - 非常的好用

## Lambda表达式的学习路线

> 委托-->Lambda表达式-->LINQ
> 看第一种怎么变成第二种
- 1、

```C#
isOK(int i)
{
    return i>3&&<10;
}
items.Where(isOK);
```
- 2、

```C#
items.Where(i=> i>3&&<10);
```

### 委托
- 1、委托是可以指向方法的类型，调用委托变量时执行的就是变量指向的方法
  - 例子：
```C#
class Program
{
    static void Main(string[] args)
    {
        D1 d = F1;//指向方法F1
        d();//运行方法

    }
    static void F1()
    {
        Console.WriteLine("我是F1");
    }
}
delegate void D1();//委托和类一级
```
- 2、.NET中定义了泛型委托Action(无返回值)和Func(有返回值),所以一般不同自定义委托类型

```C#
static void Main(string[] args)
{
    D1 d = F1;//指向方法F1
    d();//运行方法
    Func<int,int,int> x = F2;//有返回值的
    Console.WriteLine(x(6,8));
    Action d1 = F1;//没返回值的
    d1();
}
static void F1()
{
    Console.WriteLine("我是F1");
}
static int F2(int i,int j)
{
    return i + j;
}
```
---

### Lambda是怎么来的？
- 2.委托变量不仅可以指向普通方法，还可以指向匿名方法
  - 匿名方法可以写成Lambda表达式
    - 进化1
      - 可以省略参数数据类型，因为编译能根据委托类型推断出参数的类型，用=>引出来方法体 
      - => : goes to ；Lambda表达式的运算符
    - 进化2
      - 1.Action：如果委托没有返回值，且方法体只有一行代码，可省略{}
      - 2.Func：如果=>之后的方法体中只有一行代码，且方法有返回值，那么可以省略方法体的{}以及return
    - 进化3
      - 如果只有一个参数，参数的()可以省略
- 第一阶段
```C#
//第一阶段(完整写法)
Action f1 = delegate ()//没有参数和返回值的匿名方法
{
Console.WriteLine("cool真帅");
};

Action<string, int> f2 = delegate (string i, int j)//没返回值的匿名方法
{
    Console.WriteLine($"n={i},j={j}");
};
Func<int, int, int> f3 = delegate (int i, int j)//有返回值的匿名方法
{
    return i + j;
};
f1();
f2("cool", 18);
Console.WriteLine(f3(3, 5));

```
- 第二阶段
```C#
//第二阶段：把delegate替换成=> ；然后参数类型都可以去掉，因为编译器能根据委托类型推断出参数的类型
Action f1 =  () =>{ Console.WriteLine("cool真帅");}; 

Action<string, int> f2 =  ( i,  j) => { Console.WriteLine($"n={i},j={j}");};

Func<int, int, int> f3 =  ( i,  j) => { return i + j;};
```
- 第三阶段
```C#
//第三阶段
Action f1 = () => Console.WriteLine("cool真帅"); //省略{}

Action<string, int> f2 = ( i,  j) => Console.WriteLine($"n={i},j={j}"); //省略{}

Func<int, int, int> f3 = (i, j) =>  i + j; //省略方法体的{}以及return
```
- 第四阶段
```C#
//第四阶段
Func<int, bool> f5 = i => i > 5;//反推1

Func<int, bool> f6 = delegate (int i)
    {
        return i > 5;
    };
Console.WriteLine(f5(6));
Console.WriteLine(f6(6));

---------------------------------------------------------

Action<string> f7 = s => Console.WriteLine(s);//反推2
Action<string> f8 = delegate (string s)
{
    Console.WriteLine(s);
};
f7("帅");
f8("努力");
```

### 揭秘LINQ方法的背后
- LINQ中提供了很多集合的扩展方法，配合Lambda能简化数据处理

```C#
int[] arrays = { 60, 25, 55, 80, 40, 30, 50, 90, 70, 77, 76, 66, 88 };
//IEnumerable<int> result = arrays.Where(a => a > 40);//Where方法是扩展方法，using System.Linq
var result = arrays.Where(a => a > 40);//var简化
```
- 可以使用var让编译器的“类型推断”来简化类型的声明。在LINQ中常用
  - C#的var和JavaScript的var不一样，在C#上它是强类型的
  - 在JavaScript中是弱类型的，C#中的弱类型是dynamic(*)，用到了解一下即可



#### 优化上面的代码
1、编写自己的扩展方法MyWhere来模拟Where的实现。

```C#
static IEnumerable<int> MyWhere(IEnumerable<int> items,Func<int,bool> f)
    {
        List<int> result = new List<int>();
        foreach(int i in items)
        {
            if (f(i)==true)
            {
                result.Add(i);
            }
        }
        return result;
    }
```


2、通过yield return来让MyWhere“流水线”处理。

```C#
static IEnumerable<int> MyWhere2(IEnumerable<int> items, Func<int, bool> f)
    {
        foreach (int i in items)
        {
            if (f(i) == true)
            {
                yield return i;
            }
        }
    }
```


---

## 常用集合类的扩展方法

- LINQ关键的功能是提供了集合类的扩展方法。所有实现了IEnumerable<T>接口的类都可以使用这些方法。
  - 比如：数组、List、Set等 
  - LINQ中提供了大量类似Where的扩展方法，用来简化数据处理。大部分都在System.Linq命名空间中

```C#
//准备初始数据
class Employee
{
    public long Id { get; set; }
    public string Name { get; set; }//姓名
    public int Age { get; set; }//年龄
    public bool Gender { get; set; }//性别
    public int Salary { get; set; }//月薪
    public override string ToString()
    {
        return $"Id={Id},Name={Name},Age={Age},Gender={Gender},Salary={Salary}";
    }

}


List<Employee> list = new List<Employee>();
list.Add(new Employee { Id = 1, Name = "jerry", Age = 28, Gender = true, Salary = 5000 });
list.Add(new Employee { Id = 2, Name = "jim", Age = 33, Gender = true, Salary = 3000 });
list.Add(new Employee { Id = 3, Name = "lily", Age = 35, Gender = false, Salary = 9000 });
list.Add(new Employee { Id = 4, Name = "lucy", Age = 16, Gender = false, Salary = 2000 });
list.Add(new Employee { Id = 5, Name = "kimi", Age = 25, Gender = true, Salary = 1000 });
list.Add(new Employee { Id = 6, Name = "nancy", Age = 35, Gender = false, Salary = 8000 });
list.Add(new Employee { Id = 7, Name = "zack", Age = 35, Gender = true, Salary = 8500 });
list.Add(new Employee { Id = 8, Name = "jack", Age = 33, Gender = true, Salary = 8000 });
```
### Where方法：数据过滤

- `Where`方法：根据条件对数据进行过滤，类似SQL语句的where那个意思


```C#
var items = list.Where(e=>e.Age>25);
foreach(var i in items)
{
    Console.WriteLine(i);
}
```

### Count方法：获取数据条数
- `Count`方法：获取数据条数


```C#
list.Count(e => e.Age > 30&&e.Salary>5000);//直接计算数据条数
list.Where(e => e.Age > 30 && e.Salary > 5000).Count();//先过滤，后计算
```

### Any方法：判断是否至少有一条满足条件的数据
- `Any`方法：判断集合中是否至少有一条满足条件的数据
  - Any比Count实现效率更高


```C#
list.Any();
list.Any(e => e.Age > 30 && e.Salary > 30000);
list.Where(e => e.Age > 30 && e.Salary > 30000).Any();
```



### 获取一条数据
- LINQ中有4组获取一条数据的方法，选择合适的方法，进行“防御性编程”。
- 合理使用这些可以提高程序的正确性
> 一个健壮的程序，不应该隐藏异常，而是有了异常要及早暴露出来，以避免引起更大的问题
> ---《ASP.NET Core 技术内幕与项目实战》
#### Single方法
使用`Single`方法时，应确认集合中有且仅有一条满足条件的数据。
- 如果没有数据或多于一条数据满足条件，`Single`将抛出异常。


```C#
Employee e1 = list.Single(e => e.Name == "jim");
Employee e2 = list.Where(e => e.Name == "jim").Single();
```

#### SingleOrDefault方法
使用`SingleOrDefault`方法时，应确认集合中最多只有一条满足要求的数据。
  - 如果没有满足条件的数据，`SingleOrDefault`就会返回类型的默认值
  - 如果满足条件的数据多于一条，`SingleOrDefault`就会抛出异常


```C#
Employee e1 = list.SingleOrDefault(e => e.Name == "jim");
Employee e2 = list.Where(e => e.Age == 33).SingleOrDefault();
```

#### First方法
使用`First`方法时，如果集合中满足条件的数据有一条或者多条，`First`就会返回第一条数据
如果没有满足条件的数据，`First`就会抛出异常



```C#
Employee e1 = list.First(e => e.Name == "jim");
Employee e2 = list.Where(e => e.Age == 35).First();
```

#### FirstOrDefault方法
使用`FirstOrDefault`方法时，如果集合中满足条件的数据有一条或者多条，`FirstOrDefault`就会返回第一条数据
如果没有满足条件的数据，`FirstOrDefault`就会返回类型的默认值



```C#
Employee e3 = list.FirstOrDefault(e => e.Name == "jim");
Employee e4 = list.Where(e => e.Age == 33).FirstOrDefault();
```

### 排序

- 使用`OrderBy`方法时，对数据进行正向排序
- 使用`OrderByDescending`方法时，对数据进行逆向排序
- 常规我们都是用某个`属性`去排序
- 对于简单类型排序，也许不用lambda表达式。
  - 特殊案例：按照最后一个字符排序；用Guid或者随机数进行随机排序

```C#
var e1 = list.OrderBy(e => e.Age);//正向排序
var e2 = list.OrderByDescending(e => e.Age);//逆向排序
foreach ( var e in e2)
{
    Console.WriteLine(e);
}

------------------------------------------------
//简单类型排序
int[] nums = new int[] { 3, 6, 9, 111, 56, 2, 7, 3, 10 };
var nums2 = nums.OrderBy(i => i);
foreach (var e in nums2)
{
    Console.WriteLine(e);
}


------------------------------------------------

var e1 = list.OrderBy(e => e.Name[e.Name.Length-1]);//取名字最后一个字母进行排序
var e2 = list.OrderBy(e => Guid.NewGuid());//Guid 随机数算法

Random rand = new Random();
var e3 = list.OrderBy(e => rand.Next()); //随机数

foreach (var e in e3)
{
    Console.WriteLine(e);
}

```

####  多规则排序
- 可以在`OrderBy`、`OrderByDescending`后面继续写`ThenBy`、`ThenByDescending`用来二次筛选
- 案例：优先按照Age排序，如果Age相同再按照Salary排序

```C#
var e1 = list.OrderBy(e => e.Age).ThenBy(e=>e.Salary);//正序
var e2 = list.OrderByDescending(e => e.Age).ThenByDescending(e => e.Salary);//倒序
```

### 限制结果集，获取部分数据
- 使用`Skip(n)`方法:跳过n条数据
- 使用`Take(n)`方法：获取n条数据
- 两者可以组合使用，也可以单独使用
  - 案例：获取从第2条开始获取3条数据



```C#
var e1 = list.Skip(1).Take(3);//跳过一条，取3条
foreach (var e in e1)
{
    Console.WriteLine(e);
}
```


### 聚合函数

- `Max()`、`Min ()` 、`Average () `、`Sum ()` 、`Count ()`。
- LINQ中所有的扩展方法几乎都是针对IEnumerable接口的，而几乎所有能返回集合的都返回IEnumerable，所以是可以把几乎所有方法用来“链式使用”的。
- 可以和Where、Skip、Take等方法一起使用

```C#
int e1=list.Where(e => e.Age > 30).Max(e => e.Salary);//Max

int e1=list.Where(e => e.Age > 30).Min(e => e.Salary);//Min

double e1=list.Where(e => e.Age > 30).Average(e => e.Salary);//Average

double e1=list.Where(e => e.Age > 30).Sum(e => e.Salary);//Sum

int e1=list.Where(e => e.Age > 30).Count();//Count
```

### 分组
- 使用`GroupBy`方法:类似于SQL中group by实现的分组操作

- GroupBy()方法参数是分组条件表达式，返回值为IGrouping<TKey, TSource>类型的泛型IEnumerable，也就是每一组以一个IGrouping对象的形式返回。-
- IGrouping是一个继承自IEnumerable的接口，IGrouping中Key属性表示这一组的分组数据的值。
- 例子：根据年龄分组，获取每组人数、最高工资、平均工资。用var简化编程。

```C#
IEnumerable<IGrouping<int, Employee>> items = list.GroupBy(e => e.Age);//Groupby分组，分完后每一个都是IGrouping类型的组
foreach (IGrouping<int, Employee> item in items)
{
    Console.WriteLine(item.Key);
    Console.WriteLine("最大工资："+item.Max(e=>e.Salary));
    foreach (Employee e in item)
    {
        Console.WriteLine(e);
    }
    Console.WriteLine("*************************");
}

//可以用var去让编译器自动推断变量类型，来简化代码
var items = list.GroupBy(e => e.Age);//Groupby分组，分完后每一个都是IGrouping类型的组
foreach (var item in items)
{
    Console.WriteLine(item.Key);
    Console.WriteLine("最大工资：" + item.Max(e => e.Salary));
    foreach (Employee e in item)
    {
        Console.WriteLine(e);
    }
    Console.WriteLine("*************************");
}
```

```C#
//例子：根据年龄分组，获取每组人数、最高工资、平均工资。用var简化编程。

var items = list.GroupBy(e => e.Age);
foreach (var e in items)
{
    Console.WriteLine("人数为："+e.Count());
    Console.WriteLine("最高工资为：" + e.Max(e=>e.Salary));
    Console.WriteLine("平均工资为：" + e.Average(e => e.Salary));
    foreach (var item in e)
    {
        Console.WriteLine(item);
    }
}
```


### 投影
- 使用`Select`方法:类似于SQL中Select的投影查询
  - 把集合中的每一项逐个转换为另外一种类型

```C#

//类似于SQL中的Select操作，都是把对应的数据取出来 投影出来
IEnumerable<int> ltems1 =  list.Select(e => e.Age);
foreach (int e in ltems1)
{
    Console.WriteLine(e);
}

IEnumerable<string> items2 = list.Select(e => e.Gender ? "男" : "女");//把bool转换成string取出来
    foreach (string e in items2)
    {
        Console.WriteLine(e);
    }

var item3 = list.Select(e => new Dog { NickName = e.Name, Age = e.Age });
foreach (var item in item3)
{
    Console.WriteLine(item.NickName+","+item.Age);
}

```

#### 投影与匿名类型

- 匿名类型
  - 可以通过反编译看匿名类型原理
    - 编译器自动创建一个类，里面有Name和Age的属性
  - var搭配匿名类型无敌~(匿名类型因为没有名字，所以object类型也管不到，只能使用var)

```C#
var e = new { Name = "Cool", Age = 18 };
```
![匿名类型](https://github.com/cool19980208/picx-images-hosting/raw/master/20240902/匿名类型.2h88znx6xa.webp)


- 投影和匿名类型结合

```C#
var items = list.Select(e => new { NewName = e.Name, NewAge = e.Age, XingBie = e.Gender ? "男" : "女", Money=e.Salary});
foreach (var item in items)
{
    Console.WriteLine(item.NewName);
    Console.WriteLine(item.NewAge);
    Console.WriteLine(item.XingBie);
    Console.WriteLine(item.Money);
    Console.WriteLine("********************");
}

//例子：根据年龄分组，获取每组人数、平均工资。
var items = list.GroupBy(e => e.Age).Select(g => new { Gender = g.Key, Count = g.Count(), Av = g.Average(e=>e.Salary),MaxAge=g.Max(e=>e.Age),MinAge=g.Min(e=>e.Age) });
foreach (var item in items)
{
    Console.WriteLine($"年龄：{item.Gender}+每组人数:{item.Count}+平均工资：{item.Av}");
}
```

### 集合转换
- 有一些地方需要数组类型或者List类型的变量，我们可以用ToArray()方法和ToList()分别把IEnumerable<T>转换为数组类型和List<T>类型

```C#
Employee[] items1 = list.Where(e => e.Salary > 3000).ToArray();
List<Employee> items2 = list.Where(e => e.Salary > 3000).ToList();
```
#### 链式调用
- Where、Select、OrderBy、GroupBy、Take、Skip等返回值都是IEnumerable<T>类型，所以可以链式调用。
- 例子：“获取Id>2的数据，然后按照Age分组，并且把分组按照Age排序，然后取出前3条，最后再投影取得年龄、人数、平均工资”

```C#
var items = list.Where(e => e.Id > 2).GroupBy(e => e.Age).OrderBy(g => g.Key).Take(3)
.Select(g => new { NewAge = g.Key, Count = g.Count(), Av = g.Average(e => e.Salary) });
//g=IGrouping<int,Employee> ;  e=Employee
foreach (var item in items)
{
Console.WriteLine($"年龄：{item.NewAge};人数:{item.Count};平均工资：{item.Av}");
}
```

---

## LINQ的另一种写法

- 在上面学习的时候使用Where、OrderBy、Select等 扩展方法进行数据查询的写法叫做“LINQ的方法语法”。
- 除此之外，LINQ还有另外一种叫做“查询语法”的写法
  - 查询语法
    - **“查询语法”看起来更酷，但是“方法语法”更实用，因此.NET开发者大部分还是用的“方法语法”**
```C#
//LINQ方法语法
var items = list.Where(e => e.Salary > 3000).OrderBy(e => e.Age)
    .Select(e => new { MZ = e.Name, NL = e.Age, XB = e.Gender ? "男" : "女" });

//查询语法
var items = from e in list
            where e.Salary > 5000
            orderby e.Age
            select new { e.Name, e.Age, Gender = e.Gender ? "男" : "女" };
```
- 两者的区别
  - 运行时没有区别，编译后都是一样的。
    - 可以从反编译中看到编译后都变成了查询语法的样子


![反编译](https://github.com/cool19980208/picx-images-hosting/raw/master/20240904/反编译.6t729o0yas.webp)

## LINQ解决面试问题
- 性能与面试
  - LINQ大部分时间不会影响性能(项目开发中，基本不影响)
    - 不过杨中科老师遇到过一个场景用LINQ影响了性能
      - 做抠图软件过程中，需要把绿幕扣掉，换上新背景
      - 这就需要对每一个像素点操作，取出一个点的rgb值，然后取出它的最大值。用到了LINQ会发现很卡
      - 换了三元运算符后就好了
  - 面试的时候算法题一般尽量避免使用正则表达式、LINQ等这些高级的类库。
    - 例子：大饭店面试大厨的故事
      - 不会让你做山珍海味，就让你做蛋炒饭去考验你的技术
      - 好比代码，你会用LINQ，不代表你厉害，因为这是框架的力量
        - 你能用最简单的代码达到同样的效果，这才是你自己的技术

```C#
//LINQ方法
int i = 5;
int j = 8;
int k = 6;
int[] nums = new int[] { i, j, k }; 
int max = nums.Max();
Console.WriteLine(max);

//常规方法或者三元运算符
int i = 5;
int j = 8;
int k = 6;
int max = Math.Max(i, Math.Max(j, k));
Console.WriteLine(max);
```

- 案例1
  - 有一个用逗号分隔的表示成绩的字符串，如"61,90,100,99,18,22,38,66,80,93,55,50,89"，计算这些成绩的平均值。

```C#
//案例1
//有一个用逗号分隔的表示成绩的字符串，如"61,90,100,99,18,22,38,66,80,93,55,50,89"，计算这些成绩的平均值。

//自己写的，没用LINQ
string s = "61,90,100,99,18,22,38,66,80,93,55,50,89";
double sum = 0;
  String[] items = s.Split(",");

  for (int i = 0; i < items.Length; i++)
  {
      sum = sum + double.Parse(items[i]);
      if (i == items.Length-1)
      {
          double CJ = sum / items.Length;
          Console.WriteLine(CJ);
      }
  }
//展开写
String[] items = s.Split(",");
IEnumerable<int> nums = items.Select(e => Convert.ToInt32(e));
double avg = nums.Average();
Console.WriteLine(avg);
//最简洁的写法
double avg = s.Split(',').Select(e => Convert.ToInt32(e)).Average();
Console.WriteLine(avg);

```

- 案例2
  - 统计一个字符串中每个字母出现的频率（忽略大小写），然后按照从高到低的顺序输出出现频率高于2次的单词和其出现的频率。


```C#
//案例2
//统计一个字符串中每个字母出现的频率（忽略大小写），然后按照从高到低的顺序输出出现频率高于2次的单词和其出现的频率。
string s1 = "a,b,c,w,g,t,k,l,i,u,t,q,a,z,v,A,FG,JF,AD,TRDH,SDFDS,EAREW,SDFFSA,AFDS,N";
var strs = s1.Where(c => char.IsLetter(c)).Select(c => char.ToLower(c)).GroupBy(c => c)
    .Select(g=>new { g.Key,Count=g.Count()}).OrderByDescending(g=>g.Count).Where(g=>g.Count>2);
foreach (var item in strs)
{
    Console.WriteLine(item);
}
```


---


## 总结
- 本章介绍了用简单的几个声明就可以完成复杂数据处理任务的LINQ技术
  -  委托-->Lambda表达式-->LINQ
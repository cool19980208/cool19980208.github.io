---
title: P3-10 Java中基本的数据结构
date: 2024-08-11 19:16:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part3
---
# Java中基本的数据结构
---

## 数据结构
- 《数据结构》是研究数据在计算机中存储的学科。数组就是一种基础的可以**顺序存储****固定数量**数据的数据结构。
- Java中还有很多其他数据结构的类/接口
  - 比如Set、Map、List等，他们还有很多子类
    - 比如：LinkedList、ArrayList....
- 这次，介绍最常用的两个：LinkedList、LinkedHashMap。先讲非泛型写法，在介绍泛型。


### LinkedList
- 数组的长度在声明的时候就确定了，无法在运行时改变数组对象的长度。
- 需要一种能在运行时动态添加内容的数据结构，这就是LinkedList。

```java
LinkedList l1 = new LinkedList();
l1.add("3");//添加元素
l1.add(6);
l1.add(8);
System.out.println(l1.size());//获取数据个数
System.out.println(l1.get(2));//获取指定序号的元素
```

### LinkedHashMap
- 1、编程中，有时候需要一种类似“字典”的数据结构：也就是保存“一对数据”。
  - 比如实现英汉词典的时候，就是一堆由“英文-中文解释”组成的“键值对”
    - 英文是“健”（key），中文是“值”(Value)
    - 键不能重复，但值可以重复

```java
LinkedHashMap map = new LinkedHashMap();
map.put("Hello","你好");//放入键值对，如果已经存在则覆盖
System.out.println(map.get("Hello"));//根据键获取值，如果不存在，则返回null
```

- 演示：做一个简单的英汉词典，如果查询不存在则提示“查不到”

```java
LinkedHashMap map = new LinkedHashMap();
map.put("Hello","你好");//放入键值对，如果已经存在则覆盖
//System.out.println(map.get("Hello"));//根据键获取值，如果不存在，则返回null
map.put("dog","狗");
map.put("cat","猫");
String s ="dat";
Object ojt = map.get(s);//只能用Object类型去接收值
if (ojt==null)
{
    System.out.println("查不到");
}
else
{
    System.out.println(ojt);
}
```



## 泛型入门
- 1、LinkedList、LinkedHashMap中的数据可以放入任意类型，不仅容易造成数据混乱，在取出来数据的时候还需要做类型转换。这时候就可以用泛型
- 2、使用泛型的数据结构，就可以限制放入数据的类型，这样取出来的数据类型也就确定了。
  
```java
LinkedList<String> list =new LinkedList<String>();//new后面的String类型可以省略
list.add("你好");
String s = list.getLast();//返回值类型也变成了String
System.out.println(s);



LinkedHashMap<String,String> map =new LinkedHashMap<>();//LinkedHashMap 需要两个类型，第一个是key的，第二个是value的
map.put("cat","猫");
String s =map.get("cat");
System.out.println(s);
```

### 注意
- 1、关于int等类型的问题：对于基本数据类型，不能直接用在声明泛型类型中，必须用对应的包装类

```java
LinkedList <int> p1 =new LinkedList<int>();  //这种声明是错误的

LinkedList<Integer> p1 =new LinkedList<>();//这种声明才是正确的，用了int的包装类
```

![int泛型报错](https://github.com/cool19980208/picx-images-hosting/raw/master/20240811/int泛型报错.1vyki32ln5.webp)

- 2、演示：使用泛型保存学生的“姓名-成绩”，然后提供成绩查询功能

```java
LinkedHashMap <String,Integer> map =new LinkedHashMap<>(); //key 是String类型，value是Integer类型(int的包装类型)
map.put("张三",80);
map.put("李四",60);
map.put("王麻子",95);
map.put("夏天",99);
Integer s =map.get("夏");//也可以用int去接收数据，但是最好使用Integer，因为它可以接受null
if (s==null)
{
    System.out.println("此人查不到");
}
else
{
    System.out.println("成绩为："+s);
}
```
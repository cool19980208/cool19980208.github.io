---
title: P3-9 Integer和Int
date: 2024-08-11 16:09:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part3
---
# Integer和Int
---

## Int不能为空
- 1、复习：null表示一个变量没有指向任何对象。int、double、boolean等基础数据类型不可以为null。
- 2、null和0，null和""都不是一个意思。编程的时候，有时需要表示“整数变量没有值”的情况，所以用0有时是不行的。
- 3、而且Java中所谓“一切皆对象”，但是int等不是对象，因此诞生了Integer等“包装类”
  - Integer就是你可以认为这是一种可以为null的整数

### Integer的使用
- i4不能直接等于i2，除非是在不等于null的时候，要不然会报错：“NullPointerException”
  - 因为i2是Integer是可以为null的，int不行

```java
Integer i1=3;
Integer i2=null;
int i3=i1;//(int)i1  老语法的写法
if (i2!=null)
{
    int i4=i2;
}
else
{
    System.out.println("i2是null");
}

```


### Integer原理其实很简单
- 探究原理可以用java反编译看看：jd-gui.exe
- 自己也可以写，比如下面的这个样子


```java
public class MyInteger {
private  int value;

public int getValue() {
    return value;
}

public MyInteger setValue(int value) {
    this.value = value;
    return this;
}
}


//用法
MyInteger i1 =new MyInteger();
i1.setValue(3);
System.out.println(i1.getValue());
```


### 其他类
- int-->Integer
- long-->Long
- boolean-->Boolean
- .....这些其他的类都是为了解决基础数据类型不能为null的问题


### 小彩蛋
- null和空有什么区别？
  - 白话解释：null就是我手里什么都没有；空就是 我手里有一个数量为0的羊肉串

```java
String s=null;//null是没有字符串对象
String s1="";//长度为零的字符串
System.out.println(s);
System.out.println(s1);
System.out.println(s1.length());
System.out.println(s.length());
```



---
title: P3-7 JavaBean
date: 2024-08-10 10:13:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part3
---
# JavaBean
---
## 为什么需要用到Javabean
- 1、Java中没有C#、Kotlin等语言中的属性的语法，为了规范Java中“属性”的语法，Java制定了JavaBean规范，按照JavaBean规范来编写，能够更简单的和其他框架一起使用
- 2、JavaBean的规范细节非常多，这里只讲最重要的几点。其他以后自己研究

### JavaBean主要规则
- 1、必须是public类
- 2、成员变量用private，通过public的setter、getter方法访问
- 3、也可以只提供getter方法，这样的属性叫只读属性；
  - 也可以只提供setter方法，这样的属性叫只写属性；
  - 如果getter/setter都有，就叫可读可写属性


```java
private int age;
private String name;
public void setAge(int value)//可读可写
{
    this.age=value;
}
public int getAge()
{
    return this.age;
}
public  void  setName(String value)
{
    this.name=value;
}
public String getName()
{
    return this.name;
}
```


```java
private int age;
private String name;
public void setAge(int value)//可写
{
    this.age=value;
}

public  void  setName(String value)
{
    this.name=value;
}

```



```java
private int age;
private String name;

public int getAge()//可读
{
    return this.age;
}

public String getName()
{
    return this.name;
}
```

---

### Chain Setter-链式编程
- 链式编程：可以简化代码,用起来更简单
  - 需要把类的方法void改成类名Cat
  - 达到类似C#的写法：test(new Cat{Name="Cool",age=18})
- 但链式编程这个方式并不符合JavaBean规范，因为规范要求setter方法返回值必须是void。因此部分“死板”的框架不支持这种写法

![链式编程](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/链式编程.6t719xiqts.webp)

```java
public class Cat {
private int age;
private String name;
public Cat setAge(int value)//把void改成类名Cat
{
    this.age=value;
    return this;
}
public int getAge()
{
    return this.age;
}
public  Cat  setName(String value)//把void改成类名Cat
{
    this.name=value;
    return this;
}
public String getName()
{
    return this.name;
}
}

```

```java

Cat c =new Cat();
    c.setAge(1);
    c.setName("岁岁");
    //System.out.println("猫猫的名字叫："+c.getName()+","+c.getAge()+"岁了。");

Cat c =new Cat().setAge(1).setName("岁岁");//链式编程将上面三句合成了一句

    //分解上面这一句的过程
    Cat c=new Cat();
    Cat c1 =c.setAge(1);
    Cat c2 =c1.setName("岁岁");
```



### JavaBean代码生成
- 简化getter/setter代码编写的方法，只要写private成员变量。其他帮你生成
- 步骤：
  - 1、IDEA中生成代码：右键[Generate]-->[Getter/Setter]
    - SetterTemplate中可以选择风格：JavaBean和链式编程


![代码生成1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/代码生成1.5fki5wuq8f.webp)

![get和set](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/get和set.4cksv0ywcv.webp)

![规范](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/规范.8ojm2ki7v4.webp)

![生成代码后1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/生成代码后1.4n7mo6e4ib.webp)

![链式编程代码生成](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/链式编程代码生成.92q1tfqiq9.webp)

![链式代码生成2](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/链式代码生成2.4g4esqrz2q.webp)
  - 2、Lombok(*):加上一个@Data，然后会在编译生成的代码中自动增加getter/setter等其他方法
    - 缺点：依赖于这个插件
    - 所以爱者很爱，烦着很烦
    - 我学习的时候，IDEA不能直接添加@Data到classpath了，只能引用然后添加插件才能使用

![插件1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/插件1.8ojm2l48ar.webp)


![插件效果](https://github.com/cool19980208/picx-images-hosting/raw/master/20240810/插件效果.7sn4n4ujus.webp)





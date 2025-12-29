---
title: P4-1 EF Core概述
date: 2024-09-13 11:13:26
tags: .NET Core2022-学习
categories:
- .NET Core
- 第4章：Entity Framework Core基础
---
# EF Core概述
---
## 什么是ORM
- 1、说明：本课程需要你有数据库、SQL等基础知识。
- 2、ORM：Object Relational Mapping。让开发者用对象操作的形式操作关系数据库。
  - 关系型数据库
    - MySQL、SQLServer、Oracle等
  - 对象数据库
    - mongodb：只是用起来和对象数据库差不多，但坑很多
- 3、有哪些ORM：EF core、Dapper、SqlSugar、FreeSql等。
  - 推荐EF core和Dapper

## EF Core与其他ORM比较
- 1、Entity Framework Core(EF Core)是微软官方的ORM框架。
  - 优点：**功能强大、官方支持、生产效率高、力求屏蔽底层数据库差异**；
  - 缺点：复杂、上手门槛高、不熟悉EFCore的话可能会进坑。
- 2、Dapper
  - 优点：**简单，N分钟即可上手，行为可预期性强**(直接使用SQl语句)
  - 缺点：生产效率低，需要处理底层数据库差异
  - 背景：stackoverflow开发的，大公司~
  - 可以看作为增强版的SqlHelper
- 3、两者差别：**没有优劣，只有比较**
  - EF Core是模型驱动(Model-Driven)的开发思想，
  - Dapper是数据库驱动(DataBase-Driven)的开发思想的。
- 4、性能： Dapper≠性能高；EF Core≠性能差。
- 5、EF Core是官方推荐、推进的框架，尽量屏蔽底层数据库差异
  - .NET开发者必须熟悉，根据的项目情况再决定用哪个

## 选择
- 1、杨中科老师的个人建议(仅供参考)：
  - 对于后台系统、信息系统等和数据库相关开发工作量大的系统，且团队比较稳定，用EF Core
    - 系统对于数据库量大，而且需要有一个有经验的程序员非常了解EF Core.
  - 对于互联网系统等数据库相关工作量不大的系统，或者团队不稳定，用Dapper
    - 数据库量不大，团队流动性也大
- 2、在项目中可以混用，只要注意EF Core的缓存、Tracking等问题即可


## EF Core与EF比较
- 1、比较
  - EF有`DB First`、`Model First`、`Code First`
    - DB First与Model First 前期用着很爽，但到了后期会很麻烦~
  - EF Core不支持模型优先，推荐使用代码优先(Code First)
  - 遗留系统可以使用Scaffold-DbContext来生成代码实现类似DBFirst的效果，但是推荐用Code First 。
- 2、EF会对实体上的标注做校验；EF Core追求轻量化，不校验。
- 3、熟悉EF的话，掌握EFCore会很容易，很多用法都移植过来了。EF Core又增加了很多新东西。
- 4、EF中的一些类的命名空间以及一些方法的名字在EF Core中稍有不同。
- 5、EF不再做新特性增加。

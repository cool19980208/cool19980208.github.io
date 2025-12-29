---
title: P6-4 ASP.NET Core Web API各种技术及选择
date: 2024-09-30 12:21:26
tags: .NET Core2022-学习
categories:
- .NET Core
- 第6章：ASP.NET Core Web API基础
---
# ASP.NET Core Web API各种技术及选择
---
## 控制器父类用哪个
- MVC和Web API之前有对比过了
  - 控制器类可以不显式地继承自任何类。
- 因此，一般情况下，我们编写的Web API 控制器类集成自ControllerBase即可

---

## 操作方法的异步、返回值、状态码

### Action方法的异步
- 1、Action方法既可以同步也可以异步。
- 2、异步Action方法的名字一般不需要以Async结尾。
- 3、Web API中Action方法的返回值如果是普通数据类型，那么返回值就会默认被序列化为Json格式。
- 4、Web API中的Action方法的返回值同样支持IActionResult类型，不包含类型信息，因此Swagger等无法推断出类型，所以推荐用ActionResult<T>，它支持类型转换，从而用起来更简单。
```C#
public ActionResult<Person> GetPerson(int id)
{
    if (id <= 0)
    {
        return BadRequest("id必须是正数");
    }
    else if (id == 1)
    {
        return new Person(1, "Zane", 18);
    }
    else if (id == 2)
    {
        return new Person(2, "Cool", 8);
    }
    else
    {
        return NotFound("人员不存在");//自定义消息很重要
    }
}
```
### 注意点
- 在项目开发中，对于处理失败的请求，我们一般要统一相应报文体的格式，以便于在客户端更方便地进行处理
  - 具体实现可以看书里面记录的~

---

## 操作方法的参数从哪里来

### 捕捉URL占位符(重点)
- 1、在[HttpGet]、[HttpPost]等中使用占位符，比如{schoolName}，捕捉路径中的内容，从而供Action方法的参数使用。
```C#
/Students/GetAll/school/MIT/class/A001
[HttpGet("school/{schoolName}/class/{classNo}")]
```
- 2、捕捉的值会被自动赋值给Action中同名的参数；如果名字不一致，可以用[FromRoute(Name="名字")]
- 3、演示混用。

### 捕捉QueryString的值
- 1、使用[FromQuery]来获取QueryString中的值。如果名字一致，只要为参数添加[FromQuery]即可；而如果名字不一致，[FromQuery(Name = 名字)]。
2、QueryString和Route可以混用。演示。
- 3、了解即可，很少用


### Json报文体(重点)
- 1、Web API的开发模式下，Json格式的请求体是主流。
- 2、只要声明一个模型类和Json请求的格式一致即可。
- 3、也是可以把从URL获取参数、从请求报文体获取数据等这些混合使用。
```C#
[HttpPost("classId/{classId}")]
public ActionResult<long> AddNew(long classId, StudentModel s)
```
- 4、一定要设定请求头中的Content-Type为application/json，而且数据必须是合法的json格式。


### 其他方式
- Web API中很少用的方式：
  - 1、从Content-Type为multipart/form-data的请求中获取数据的[FromForm]
  - 2、从请求报文头中获取值的[FromHeader]。









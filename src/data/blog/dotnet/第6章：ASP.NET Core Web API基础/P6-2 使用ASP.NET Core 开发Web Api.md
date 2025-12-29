---
title: P6-2 使用ASP.NET Core 开发Web API
description: .NET Core 学习笔记 - P6-2 使用ASP.NET Core 开发Web API
pubDatetime: 2024-09-29T16:14:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第6章：ASP.NET Core Web API基础
draft: false
---
---

## 简单介绍
- ASP.NET Core MVC是ASP.NET Core中进行网站开发的技术，一般应用于浏览器。但随着技术发展，现在访问服务不止是浏览器了，还有手机App、微信小程序、智能家电等都有和服务器端进行数据交互的需求
- 浏览器和服务器端之间传递的主要是HTML，而手机App等客户端和服务器端之间主要传递的是Json等结构化的数据
- 我们把提供结构化数据服务的接口叫做`Web API`

## Web API项目的搭建
- 搭建步骤如下图所示：
  - ![搭建](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/搭建.26lg8sbao5.webp)


### Web API和MVC的对比

#### 项目结构
- ASP.NET Core Web API 项目的结构和ASP.NET Core MVC 项目的结构是非常类似的
  - 不同的是Web API项目没有Views文件夹
    - 因为Web API 直接返回的是结构化的数据，不需要提供展示数据的视图
  - ![对比](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/对比.2a526ih7hp.webp)

#### 控制器
- Web API的控制器继承自`ControllerBase`，而MVC继承自`Controller`。
  - `Controller`是`ControllerBase`的子类
  - Controller类中包含View等和MVC中视图等相关的代码，所以Web API不需要
```C#
WeatherForecastController : ControllerBase //Web API
TestController : Controller//MVC
```
![MVC](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/MVC.m1n17fpb.webp)
![Web-API](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/Web-API.32hxo98rwg.webp)


### 运行项目，解读代码结构
- 代码分析
  - ![控制器添加API](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/控制器添加API.58hcaaudbf.webp)
```C#
namespace MyFirstWebApplication.Controllers
{
    [ApiController]//Attribute---属性
    [Route("[controller]")]//设置路由规则，规则中[controller]代表控制器的名字，也就是WeatherForecast
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[] 
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetWeatherForecast")]//发送Get请求接口
        public IEnumerable<WeatherForecast> Get()//Get方法返回对象会被自动进行Json序列化返回给客户端
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateTime.Now.AddDays(index),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }
}
```
- ![示例](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/示例.8ad8b9ihp4.webp)


### swagger接口文档
- swagger页面就是我们创建项目的时候勾选的【启用OpenAPI支持】
- 这个页面无论对于接口的开发人员还是接口的使用者，使用起来都非常方便
  - 开发人员：他们不需要编写调用接口的代码就可以对接口进行在线测试
  - 调用者：他们可以通过页面上的接口信息，就能知道如何调用这个接口，不需要再去询问接口的开发人员

---

## Post、Put等操作方法

- 1、为控制器类增加一个标注了[HttpPost]的操作方法。
- 2、把用户提交的内容保存到文本文件中，方法的返回值为保存的文件名。
```C#
[HttpGet]
public Person GetPerson()
{
    return new Person("Zane", 18);
}
[HttpPost]
public string SaveNote(SaveNoteRequest req)
{
    string filename = $"{req.Title}.txt";
    System.IO.File.WriteAllText(filename, req.Content);
    return filename;
}
```
- 3、测试接口。
  - 网址模仿Get请求
  - ![模仿Get](https://github.com/cool19980208/picx-images-hosting/raw/master/20240929/模仿Get.92q3t5azo3.webp)



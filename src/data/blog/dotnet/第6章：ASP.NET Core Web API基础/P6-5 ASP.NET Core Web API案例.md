---
title: P6-5 ASP.NET Core Web API案例
date: 2024-09-30 16:09:26
tags: .NET Core2022-学习
categories:
- .NET Core
- 第6章：ASP.NET Core Web API基础
---
# ASP.NET Core Web API案例
---
## 开发Web API
- 开发一个处理用户登录的Web API项目

```C#
//控制器
[Route("[controller]/[action]")]
[ApiController]
public class LoginController : ControllerBase
{
    [HttpPost]
    public ActionResult<LoginResult> Login(LoginRequest loginReq)
    {
        if (loginReq.UserName=="admin"&&loginReq.Password=="123456")
        {
            var processes = Process.GetProcesses().Select(p => new ProcessInfo(p.Id, p.ProcessName, p.WorkingSet64)).ToArray();
            return new LoginResult(true, processes);
        }
        else
        {
            return new LoginResult(false, null);
        }
    }
}

//请求、相应模型的类
public record LoginRequest(string UserName,string Password);//请求的参数信息
public record LoginResult(bool IsOK,ProcessInfo[]? Processes);//检验用户账号和密码
public record ProcessInfo(int Id,string ProcessName,long WorkingSet64);//属性
```



---

## 什么是前后端分离
- 1、传统MVC开发模式：前后端的代码被放到同一个项目中，前端人员负责编写页面的模板，而后端开发人员负责编写控制器和模型的代码并且“套模板”。
  - 缺点：互相依赖；耦合性强；责任划分不清。
- 2、主流的“前后端分离” ：前端开发人员和后端开发人员分别负责前端和后端代码的开发，各自在自己的项目中进行开发；后端人员只写Web API接口，页面由前端人员负责。
  - 为什么“前后端分离” 更流行：
    - 需求变动越来越大、交付周期越来越短、多端支持。
  - 优点：独立开发，不互相依赖；耦合性低；责任划分清晰；前后端分别部署，可以针对性运维（扩容等）
  - 缺点：对团队的沟通能力要求更高，提前沟通好接口和通知接口变更；不利于SEO（可以用“服务器端渲染”SSR）；对运维要求更高。
- 3、只有大项目才需要前后端分离吗？
  - 不是，一个人也可以前后端分离去搞，后期会很爽
- 4、软件架构的一大主题就是“分离”-->“降低耦合”


---

## 搭建前端开发环境
- 1、Web API做后端开发，不绑定前端技术，也支持其他客户端。这一节用Vue演示，不讲解Vue基础。
- 2、Vue搭建步骤：
  - 1）安装Node.js
  - 2）设定国内镜像 npm config set registry https://registry.npm.taobao.org
  - 3）安装yarn：npm install -g yarn
  - 4）创建Vue项目：yarn create vite WebAPI1FrontEnd  项目名字
    - cd 到创建好的项目文件夹，运行`yarn`
  - 5）按照提示运行项目。
    - 运行`yarn dev`命令即可


---

## 如何实现前后端分离开发(等后面在补充前端知识再来详细看)
- 设置步骤看杨中科老师的视频/书，PPT上有代码
  - 需要注意的是 后端写前端的地址和前端写后端的地址别写错~
- 安装支持
  - yarn add vue-router
  - yarn add axios
![成功与失败](https://github.com/cool19980208/picx-images-hosting/raw/master/20240930/成功与失败.8hgg8dtdyz.webp)

 
### CORS
- 1、跨域通讯的问题。解决方案：JSONP、前端代理后端请求、CORS等。
- 2、CORS原理：在服务器的响应报文头中通过access-control-allow-origin告诉浏览器允许跨域访问的域名。
- 3、在Program.cs的“var app=builder.Build()”这句代码之前注册
```C#
string[] urls = new[] { "http://localhost:3000" };
builder.Services.AddCors(options =>
options.AddDefaultPolicy(builder => builder.WithOrigins(urls)
.AllowAnyMethod().AllowAnyHeader().AllowCredentials()));
```
- 4、在Program.cs的app.UseHttpsRedirection()这句代码之前增加一行app.UseCors()






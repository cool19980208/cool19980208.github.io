---
title: P8-4 SignalR 服务器端消息推送
description: .NET Core 学习笔记 - P8-4 SignalR 服务器端消息推送
pubDatetime: 2024-12-04T14:26:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第8章：ASP.NET Core 高级组件
draft: false
---

在传统的HTTP中，**只能客户端主动向服务器端发起请求，服务器端无法主动向客户端发送消息**
但在有些业务场景下，我们需要服务器端主动向客户端发送消息，比如
- Web聊天室(多人互相聊天的交互---腾讯/微信等)
- OA系统(发送请假审批，推送消息等)

传统方案：长轮询(Long Polling)
- 浏览器先向服务器端发送AJAX请求，但是服务器端不立即发送响应，而是一直挂着，直到服务器端有需要推送给客户端的信息时，服务器端把这些信息作为响应发送给浏览器端
- 就很想渣男对于若干小白兔，或者PUA女朋友的情况~  想理就理，不理我就挂着你  冷暴力你

缺点：
- 由于HTTP并不是为这种长轮询机制设计的，所以**长轮询对服务器端资源消耗非常大**
- 而且由于HTTP是文本传输协议，因此**数据传输效率低**

==WebSocket和HTTP的差别==

为了实现服务器端向客户端推送消息的这个需求，**在2008年诞生了WebSocket协议，并且该协议在2011年成为国际标准**。目前所有的主流浏览器都已经支持了WebSocket协议。
WebSocket比HTTP的性能和并发能力更强~

- WebSocket基于TCP协议，支持==二进制通信==，因此**通信效率非常高**，它可以让服务器处理大量的并发WebSocket连接
- WebSocket是==双工通信==，因此**服务器可以高效地向客户端推送消息**
  - 单工通信：传统的HTTP它是单通讯的。也就是说客户端向服务器发请求，服务器返回给你这样子
  - 双工通信：客户端可以向服务器端发请求，服务器端也可以向客户端发请求
- WebSocket独立于HTTP协议，不过我们一般仍然把WebSocket服务器端部署到Web服务器上，因为可以借助HTTP协议完成初始的握手（可选），并且==共享HTTP服务器的端口（主要）==
  - 就是说在这一台服务器上，你同时支持HTTP服务和Web Socket服务，他们都共享这个80端口。好处是什么？
  - 1、可以避免为了WebSocket单独另开新的服务器端口
  - 2、大家共用一个安全控制，然后安全策略、防火墙等这方面的处理起来会更加简单
- 怎么区分两者呢？
  - 内部实现原理：
    - ==Web Socket的报文和这个HTTP报文，它们俩的特点不一样==
    - 所以**Web服务器会根据请求报文的特点来区分并决定转给HTTP处理程序还是Web Socket处理程序。**
    - 所以说虽然说它们俩是独立的，但一般来讲的话，咱们还是要把这个服务和HTTP注入到一起。目的最主要的话是共享端口

**什么是SignalR？**

ASP.NET Core SignalR(简称：SignalR)是.NET Core 平台对于WebSocket的封装，从而让开发人员可以更简单地进行WebSocket开发。

- 因为WebSocket和HTTP共享一个端口，所以SignalR的服务器端一般运行在ASP.NET Core项目中。

---
## SignalR 基本使用

SignalR中一个重要的组件是集线器(hub)，它用于在WebSocket服务器端和所有客户端之间进行数据交换，所有连接到同一个集线器上的程序都可以互相通信
- 类似于数据交换中心

![集线器](https://github.com/cool19980208/picx-images-hosting/raw/master/20241204/集线器.m49kutd7.webp)


### 案例
开发一个简单的聊天室来了解SignalR的基本使用

需要分别编写服务器端Hub和前端代码。

第一步：创建Web API项目，创建一个继承自Hub类
- 所有的客户端和服务器端都通过这个集线器进行通信

![继承自Hub](https://github.com/cool19980208/picx-images-hosting/raw/master/20241206/继承自Hub.esk3et82g.webp)

第二步：编写Program.cs
- 在`builder.Build`之前调用`builder.Services.AddSignalR`注册所有SignalR的服务
- 在`app.MapControllers`之前调`app.MapHub<ChatRoomHub>(“/Hubs/ChatRoomHub”)`启用SignalR中间件

因为我们需要采用前后端分离的形式编写浏览器代码，而WebSocket的初始握手需要通过HTTP进行，所以我们需要启用CORS的支持

![CORS和SignalR](https://github.com/cool19980208/picx-images-hosting/raw/master/20241209/CORS和SignalR.5xaonrmlbo.webp)



第三步：编写一个静态HTML页面提供交互界面(编写前端页面)
 
- 安装SignalR的JavaScipt客户端SDK
	- npm install @microsoft/signalr


### 编写前端页面的步骤
- yarn create @vitejs/app SignalRClient1  //这个是杨老师录课程的时候写的命令，现在已经不行了
  - yarn create vite SignalRClient1  //用这个最新的来创建项目
  - npm install @microsoft/signalr  //安装SDK包
- cd SignalRClient1 //切换目录
- yarn 
- yarn dev //打开前端地址


编写前端代码

- `withUrl('https://localhost:7024/MyHub')`
	- //你连接的这个hub的一个路径，一定要写全路径。即使你的代码和服务器是在同一台服务器上，url也要写绝对路径，而并非是相对路径。域名和端口的全路径
- `withAutomaticReconnect().build()`  
	- //失败重连机制 (如果连接被断开，客户端就会尝试重连，因此使用起来更方便)


![前端代码](https://github.com/cool19980208/picx-images-hosting/raw/master/20241209/前端代码.1ovhdy4lwj.webp)


第四步：测试


![聊天室](https://github.com/cool19980208/picx-images-hosting/raw/master/20241206/聊天室.syzua1ixl.webp)


### 需要注意的点
- CORS的URL地址需要和前端地址/端口等保持一致

![CORS地址](https://github.com/cool19980208/picx-images-hosting/raw/master/20241209/CORS地址.8dwx2p4l4e.webp)


---

## 协议协商

SignalR其实并不只是对Websocket的封装，它支持多种服务器推送的实现方式
1、SignalR支持多种服务器推送方式：Websocket、服务器发送事件(Server-Sent Events)、长轮询。
- SignalR的JavaScript客户端默认按顺序尝试。
  - 如果Websocket失败了，就尝试用Server-Sent Events去连接；如果还失败，就只能使用长轮询了
- 因此SignalR会自适应复杂的客户端、网络、服务器环境来支持服务器端推送的实现

查看协议协商的过程
- F12查看协商过程。

![协议协商](https://github.com/cool19980208/picx-images-hosting/raw/master/20241210/协议协商.32i0jb1wlx.webp)

- 204状态码的请求
  - 用于检查是否有任何潜在的安全问题。
  - 含义：这个状态码表示请求已成功处理，但响应体为空。通常用于不需要返回任何内容的操作，比如删除操作。
  - 在SignalR中的意义：当客户端发起一个预检请求（preflight request）时，如果服务器确认可以处理实际的连接请求，但不需要返回任何内容，它可能会返回204状态码。预检请求通常发生在客户端尝试建立WebSocket连接之前，用于检查是否有任何潜在的CORS（跨源资源共享）问题或其他安全限制。

- 200状态码的请求：浏览器首先向服务器发出了一个negotiate请求，用于询问服务器“你支持什么协议”
  - 用于获取建立WebSocket连接所需的详细信息
  - 单击这个请求，查看详细的协商响应报文体
  - 含义：这个状态码表示请求已成功处理，并且服务器返回了请求的内容。
  - 在SignalR中的意义：在SignalR的协议协商过程中，当客户端发起一个fetch请求时，如果服务器成功处理了这个请求，并且返回了协商结果（比如WebSocket连接的URL和所需的协议信息），它将返回200 OK状态码。fetch请求是在客户端确认预检请求没有问题后发起的，用于获取建立WebSocket连接所需的详细信息。


```C#
{
    "negotiateVersion": 1,
    "connectionId": "Lv0OYwLJyN_SY3_U1PwNmA",
    "connectionToken": "XTC-a6PDVcsHMNNzCW6niw",
    "availableTransports": [
        {
            "transport": "WebSockets",
            "transferFormats": [
                "Text",
                "Binary"
            ]
        },
        {
            "transport": "ServerSentEvents",
            "transferFormats": [
                "Text"
            ]
        },
        {
            "transport": "LongPolling",
            "transferFormats": [
                "Text",
                "Binary"
            ]
        }
    ]
}
```

### 协商响应报文体-解析

`connectionId`表示服务器端为连接分配的ID，这个ID与我们在服务器中通过`Context.ConnectionId`取到的值是一致的

`availableTransports`的代码块代表服务器端被支持的网络协议：Websocket、服务器发送事件(Server-Sent Events)、长轮询。
- 由于Chrome浏览器也支持Websocket，所以JavaScript客户端发出第二个请求(101状态码的那条)，如下图
- 我们查看请求中的详细信息发现
  - 浏览器发送的是以wss://开头的请求，这是Websocket协议请求
  - 请求报文头中的“upgrade:websocket”表示客户端向服务器发起建议“我们把通信请求切换为Websocket协议吧”
  - 服务器返回的响应报文头中的“upgrade:websocket”以及状态码101表示“切换Websocket通信”成功，后续SignalR客户端和服务器端之间通信就使用Websocket协议了

![协议协商2](https://github.com/cool19980208/picx-images-hosting/raw/master/20241210/协议协商2.77dlvfjaa0.webp)


![Websocket的请求详细信息](https://github.com/cool19980208/picx-images-hosting/raw/master/20241210/Websocket的请求详细信息.58hf53ljy8.webp)

### Websocket的通信过程怎么看？

我们在聊天界面中发送和接受Websocket消息的通信过程在【开发人员工具】的【网络】标签页中是看不到的。
- 我们单击选择`wss://`的那个请求，然后在请求的详情页中的【消息】标签页中，就能看到WebSocket通信过程。


![通信过程](https://github.com/cool19980208/picx-images-hosting/raw/master/20241210/通信过程.3k827xadby.webp)




### 粘性对话和禁用协商

像我们上述的这样的协商过程，被称为“握手”。建立连接后，服务器端会在协商请求和Websocket的请求之间保持状态。

在单台服务器下，这样运行处理没有问题；但是如果在多台服务器组成的集群中，这样处理就会带来问题。
- 集群中协议协商的问题：“协商”请求被服务器A处理，而接下来的WebSocket请求却被服务器B处理。

解决上述这个问题有两个方法：粘性对话和禁用协商

- “粘性会话”（Sticky Session）：把来自同一个客户端的请求都转发给同一台服务器上。缺点：因为共享公网IP等造成请求无法被平均的分配到服务器集群；扩容的自适应性不强。

- “禁用协商”：直接向服务器发出WebSocket请求。WebSocket连接一旦建立后，在客户端和服务器端直接就建立了持续的网络连接通道，在这个WebSocket连接中的后续往返WebSocket通信都是由同一台服务器来处理。
  - 缺点：无法降级到“服务器发送事件”或“长轮询”，不过这个不是什么大问题。
    - 因为现在主流浏览器都支持Websocket。老版本不支持的设备在市场也已经慢慢被淘汰了。
    - 如果网站需要兼容IE浏览器，那就不要使用`SignalR`，因为它不兼容IE浏览器

两种方法的选择：我们直接无脑选择“禁用协商”就行，缺点也不是大问题~


#### 禁用协商的使用

我们只要在SignalR的JavaScript客户端的withUrl函数中设置选项即可，代码如下 (看图2)

```C#
const options = { skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets  };//skipNegotiation: true 表示“跳过协商” ;  transport：表示强制采用的通信方式
connection = new signalR.HubConnectionBuilder()
	.withUrl('https://localhost:7047/Hubs/ChatRoomHub', options)
	.withAutomaticReconnect().build();
```


我们从图1可以看出来，204状态码和200状态码的协商过程请求已经消失了，直接被跳过了。  强制发出Websocket请求~

- 图1：
![禁用协商](https://github.com/cool19980208/picx-images-hosting/raw/master/20241210/禁用协商.32i0jdc5j7.webp)

- 图2：
![禁用协商使用](https://github.com/cool19980208/picx-images-hosting/raw/master/20241210/禁用协商使用.83a3axj01v.webp)


---

## SignalR 分布式部署

在`粘性对话和禁用协商`的模块中我们提到了，在多台服务器组成的分布式环境中，我们可以采用粘性对话或禁用协商的方式来保证来自同一个客户端的请求被同一台服务器处理
- 但是在分布式环境中，还有一些其他问题需要来解决

假设聊天室程序被部署在两台服务器上，客户端1、2连接服务器A；客户端3、4连接服务器B
- 客户端1往聊天室发消息，只有客户端2能看见，因为他们俩连接的是同一台服务器
- 同理客户端3、4也一样。


如下图所示：
![分布式](https://github.com/cool19980208/picx-images-hosting/raw/master/20241211/分布式.9kg8e280a5.webp)


### 解决方案

原因分析：因为这两台服务器之间的Hub没有通信

解决方案：我们可以让多台服务器上的集线器连接到一个消息队列中，通过这个消息队列完成跨服务器的消息传递
- 所有服务器连接到同一个消息中间件。使用粘性会话或者跳过协商（用websocket）

微软官方提供了用Redis服务器来解决SignalR部署在分布式环境中数据同步的方案-->`Redis backplane`

使用步骤如下

第一步：先通过NuGet安装依赖的包
- Install-Package Microsoft.AspNetCore.SignalR.StackExchangeRedis -Version 9.0.0

第二步：我们在Program.cs中的AddSignalR后添加`AddStackExchangeRedis`来指定要连接的Redis配置
- 设置一个唯一的前缀，避免它和连接到这台服务器的其他Redis使用程序冲突。 这个指定前缀不是必须的，但是建议大家指定前缀，否则数据就有可能会混乱了
- 前缀短一点，因为在redis里面这个key越长，它可能性能越低，所以尽可能短一点。但是一定要设置一个与众不同的前缀

```C#
//解决分布式环境的通信问题
builder.Services.AddSignalR().AddStackExchangeRedis("127.0.0.1", options => {
    options.Configuration.ChannelPrefix = "SignalR1_";//设置一个唯一的前缀，避免它和连接到这台服务器的其他Redis使用程序冲突。
});


//AddStackExchangeRedis方法的第一个参数为Redis服务器的连接字符串；
//如果有多个SignalR应用程序连接同一台Redis服务器，那么我们需要为每一个应用程序配置唯一的前缀
```

通过如上两步，我们就完成了Redis backplane的配置，就可以放心地在分布式环境中使用SignalR了

---

## SignalR 身份认证

我们前面编写的集线器允许容易客户端连接，在正常项目中肯定不能这样做，要不然会有安全问题，我们应该对连接进行验证，只有通过验证的用户才能连接集线器。
- SignalR支持验证和授权机制，我们同样可以用Cookie、JWT等方式进行身份信息的传递
- 由于JWT更符合项目的要求，因此这里我们学习SignalR与JWT验证方式的使用

### 使用步骤

第一步：先在配置系统中配置一个名字为JWT的节点，然后在JWT节点下创建SigningKey、ExpireSeconds两个配置项
- 在创建一个类JWTSettings,类中包含对应的SigningKey、ExpireSeconds两个属性

第二步：通过NuGet安装Microsoft.AspNetCore.Authentication.JwtBearer


第三步：编写代码对JWT进行配置

```C#
builder.Services.Configure<JWTSettings>(builder.Configuration.GetSection("JWT"));//JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(x =>
{
    var jwtOpt = builder.Configuration.GetSection("JWT").Get<JWTSettings>();
    byte[] keyBytes = Encoding.UTF8.GetBytes(jwtOpt.SigningKey);
    var secKey = new SymmetricSecurityKey(keyBytes);
    x.TokenValidationParameters = new()
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = secKey
    };
    x.Events = new JwtBearerEvents
    {
        //在我们学习JWT的时候，我们是把JWT放在名字为Authorization的报文头中，但是websocket不支持Authorization报文头,而且websocket也不支持自定义报文头
        //所以我们需要把JWT通过url中的QueryString传递
        //然后在服务器端的OnMessageReceived中，把QueryString中的JWT读出来，然后赋值给 context.Token
        //后续.NET Core就能自动识别、解析这个JWT了。
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;//取一下当前请求的路径
            if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/MyHub")))//accessToken不等于空并且请求的路径是"/MyHub"
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});
```

第四步：在Program.cs的`app.UseAuthorization`之前添加`app.UseAuthentication`


第五步：在控制器类DemoController中增加登录并且创建JWT令牌的操作方法Login。返回JWT。



第六步：在需要登录才能访问的集线器类上或者方法上添加`[Authorize]`。也支持角色等设置，可以设置到Hub或者方法上。



第七步：修改前端代码

- 需要注意的是：在前端代码里面添加了这句代码
  - `options.accessTokenFactory = () => state.accessToken;`
  - 通过options的accessTokenFactory回调函数把JWT传递到服务器端

![前端代码](https://github.com/cool19980208/picx-images-hosting/raw/master/20241212/前端代码.231x8zzlpi.webp)


![url拼接token](https://github.com/cool19980208/picx-images-hosting/raw/master/20241212/url拼接token.8z6kt6ivtx.webp)
 
---

## 针对部分客户端的消息推送

在上面学习的内容中我们都是利用`Clients.All.SendAsync`向连接到当前集线器的所有客户端推送消息，而在很多业务场景中，我们一般都是向部分客户端发送消息的

- 比如QQ里面的私聊、QA系统指定类型的单子推送给指定的审核人等场景

### 筛选客户端

1、客户端筛选的3个参数：ConnectionId、组和用户Id（它对应ClaimTypes.NameIdentifier的Claim）。
2、Hub的Groups属性为IGroupManager属性，可以对组成员进行管理。查看类型的成员。
- IGroupManager类的方法

![IGroupManager方法](https://github.com/cool19980208/picx-images-hosting/raw/master/20241214/IGroupManager方法.6m3yeuce96.webp)

3、Hub的Clients属性为IHubCallerClients类型，可以对连接到当前集线器的客户端进行筛选。查看类型的成员。
- IHubCallerClients类的成员

![IHubCallerClients类](https://github.com/cool19980208/picx-images-hosting/raw/master/20241214/IHubCallerClients类.1ovhkzymg6.webp)

4、IClientProxy类型。无法知道具体有哪些客户端调用SendAsync()方法向筛选的客户端发送消息。

### 实现聊天室私聊

第一步
- 现在Hub类中添加一个发送私聊消息的方法

```C#
public async Task SendPrivateMessage(string toUserName, string message)//发送私聊方法
{
    var user = await userManager.FindByNameAsync(toUserName);//过滤用户
    long UserId = user.Id;//拿到指定用户ID
    string srcUserName = this.Context.UserIdentifier;
    await this.Clients.User(UserId.ToString()).SendAsync("ReceivePrivateMessage",//给指定用户发送指定消息
        srcUserName,  message);
}
```

第二步
- 在前端页面增加私聊功能的界面和代码

![发送私聊消息](https://github.com/cool19980208/picx-images-hosting/raw/master/20241214/发送私聊消息.4xulhpefl8.webp)


第三步
- 网页端前厅服务器端发送`ReceivePrivateMessage`消息，把收到的私聊消息添加到聊天消息界面中

![监听消息](https://github.com/cool19980208/picx-images-hosting/raw/master/20241214/监听消息.sz05lh9il.webp)

第四步
- 测试效果

![测试效果](https://github.com/cool19980208/picx-images-hosting/raw/master/20241214/测试效果.1ovhl1qxyl.webp)


### 需要注意的点
SignalR 不会对消息进行持久化，因此即使目标用户当前不在线，代码调用也不会出错。
- 所以用户上线后也不会收到离线期间的消息。

如果想做成QQ那样的效果，即使离线了，只要上线，发送给自己的消息都能看到~

- 如果需要实现上述的这个需求，就需要在自行额外开发消息的持久化功能，比如服务器端在客户端发送消息的同时，也要把消息保存到数据库中；在用户上线时，程序要先到数据库中查询历史消息
- 所以QQ刚登录的时候，为啥在刷新。就是因为在加载离线消息

---


## 在外部向集线器推送消息

我们除了可以在集线器中向客户端推送消息，也可以在MVC控制器、托管服务等外部向客户端推送消息。在某一些场景下非常有用

- 1、场景：管理员通过加群请求之后广播“欢迎加入”。
  - 我们可以在Hub中写方法完成“加群”，从而自然实现消息广播。==但是Hub中最好只做消息的发布，不要做数据库等耗时操作。==
  - 所以，SignalR中客户端给服务器端消息传递的默认超时时间为30秒钟。虽然我们可以调整默认时间，但是强烈不建议这样做

### 实现场景需求

需求：后台新增一个用户的时候，通知聊天室所有的客户端“欢迎新人XXX加入”

第一步：在控制器类中通过构造方法注入一个`IHubContext`服务

![注入方法](https://github.com/cool19980208/picx-images-hosting/raw/master/20241216/注入方法.9rjggo8f6b.webp)

第二步：为控制器类增加一个用于新增客户的操作方法

![监听消息](https://github.com/cool19980208/picx-images-hosting/raw/master/20241216/监听消息.6bh4okys44.webp)

第三步：在前端中增加监听消息的代码，并且把消息添加到聊天记录中

### 注意点

IHubContext接口和Hub类有区别，因此在IHubContext中不能调用Caller、Others等成员，所以不能向“当前连接的客户端”、“除了当前连接之外的其他客户端”推送消息。

- 为什么？
  - 在控制器等集线器的外部调用的IHubContext服务，这些请求并不在一个SignalR连接中，因此也就没有了“当前SignalR连接”的概念。


---

## 案例：导入英汉词典到数据库

本小节中，我们将实现一个从开源的英汉词典中导入单词到数据库中的功能，因为数据量非常大，导入过程毕竟耗时，所以我们需要再网页中显示导入进度

准备内容：
ECDICT字典
- https://github.com/skywind3000/ECDICT/tree/master
  - stardict.7z

数据库对应的表
- T_WordItems：Id（主键）、Word（单词）、Phonetic（音标）、Definition（英文解释），Translation（中文翻译）

![准备](https://github.com/cool19980208/picx-images-hosting/raw/master/20241217/准备.9nzukh29ip.webp)
### 开始实现这个需求
第一步：
- 创建一个触发数据导入的Hub类ImportDictHub
- 再创建一个执行数据导入的类ImportExecutor
- 然后把这两个类都注册到Program.cs中



```C#
//我们不能把耗时的操作代码写入集线器中，因此这里把这些代码写入ImportExecutor类的ExecuteAsync方法中
//ExecuteAsync是一个异步方法，由于这个方法执行非常耗时，因此下面这一行代码没有使用await来调用ExecuteAsync方法
_ = executor.ExecuteAsync(this.Context.ConnectionId);//为了能在ImportExecutor类中把导入进度推送到客户端，这句代码把当前连接的ConnectionId传递给ExecuteAsync方法
```

![Hub类](https://github.com/cool19980208/picx-images-hosting/raw/master/20241217/Hub类.1ap1yjeunn.webp)

第二步：编写执行导入任务的ImportExecutor类

- 1、ImportExecutor中注入`IHubContext<ImportDictHub>`等服务
- 2、暂时用字符串Split解析CSV，或者用更专业的库。
- 3、用SqlBulkCopy 进行分批快速导入：
  - DoExecuteAsync方法是数据导入的主要方法，因为数据导入过程中可能出现未处理异常，为了能够记录未处理异常并且通知给客户端，我们需要把捕获的异常记录到日志，并且向客户端发送“Failed”消息



第三步：编写前端代码

![导入前端代码](https://github.com/cool19980208/picx-images-hosting/raw/master/20241217/导入前端代码.8adbgfr7hu.webp)

第四步：测试导入


![测试结果](https://github.com/cool19980208/picx-images-hosting/raw/master/20241217/测试结果.58hff7pvaq.webp)

---

## SignalR 实践指南

在SignalR中还有其他一些需要注意的问题，下面做一个简要说明

Hub类的生命周期是瞬态的，也就是每次调用集线器的时候都会创建一个新的Hub类实例，==因此我们不要在Hub类中通过属性、成员变量等方式保存状态==

如果服务器的压力比较大，杨老师建议==把ASP.NET Core程序和SignalR程序服务器端部署到不同的服务器上，以免它们互相干扰==

如果需要再客户端连接到集线器或者在集线器断开的时候执行代码，我们可以覆盖Hub类中的OnConnectedAsync和OnDisconnectedAsync方法

SignalR除了提供了供浏览器使用的JavaScript客户端，官方还提供了.NET、Java客户端，开源社区还提供了C++、Swift等语言的客户端，因此我们也可以编写WPF、Winfrom、Android、IOS等程序来连接服务器端

SignalR的JavaScript客户端不支持IE，==因此如果项目需要兼容IE，请不要使用SignalR。==


因为Windows10、Windows11等是桌面操作系统，==这些桌面操作系统上的IIS有10个并发连接的限制==，如果我们使用这些操作系统测试SignalR，就会发现SignalR的服务器端并发能力非常差，所以这些桌面操作系统只能作为开发机使用。
- 在生产环境中，==请使用WindowsServer系列操作系统或者使用Linux==















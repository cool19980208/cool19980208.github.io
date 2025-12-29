---
title: P8-1 Authentication与Authorization
description: .NET Core 学习笔记 - P8-1 Authentication与Authorization
pubDatetime: 2024-10-14T17:26:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第8章：ASP.NET Core 高级组件
draft: false
---
---
- 1、Authentication 简单来说就是“鉴权”或“验证”
  - 对访问者的用户身份进行验证，“用户是否登录成功”。
- 2、Authorization 简单来说就是“授权”
  - 验证访问者的用户身份是否有对资源访问的访问权限，“用户是否有权限访问这个地址”。
  - 我们可以用`r`去区分两者，因为role的意思就是“角色”

## 标识框架(Identity框架)
- 1、标识（Identity）框架：采用基于角色的访问控制（Role-Based Access Control，简称RBAC）策略，内置了对用户、角色等表的管理以及相关的接口，支持外部登录、2FA等。
- 2、标识框架使用EF Core对数据库进行操作，因此标识框架支持几乎所有数据库。

### Identity框架使用
- `IdentityUser<TKey>`、`IdentityRole<TKey>`，TKey代表主键的类型。
  - 我们一般编写继承自`IdentityUser<TKey>`、`IdentityRole<TKey>`等的自定义类，可以增加自定义属性。

#### 实现步骤
- 第1步：创建ASP.NET.Core Web API项目，然后安装Microsoft.AspNetCore.Identity.EntityFrameworkCore
  - Install-Package Microsoft.AspNetCore.Identity.EntityFrameworkCore -Version 6.0.1

- 第2步：创建用户实体类User和角色实体类Role
  - 继承自`IdentityUser<TKey>`、`IdentityRole<TKey>`
  - ![实体类](https://github.com/cool19980208/picx-images-hosting/raw/master/20241014/实体类.26lguk5f3h.webp)

- 第3步：创建继承自`IdentityDbContext`的类
  - ![第三步](https://github.com/cool19980208/picx-images-hosting/raw/master/20241014/第三步.1aozf3vqng.webp)

- 第4步：向依赖注入容器中注册于标识框架相关的服务，并对相关的选项进行配置
  - ![配置](https://github.com/cool19980208/picx-images-hosting/raw/master/20241014/配置.lvpv387n1.webp)

- 第5步：通过执行Add-Migration、Update-Database等命名执行EF Core的数据库迁移
  - 连接数据库/迁移脚本(安装包)
    - Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 6.0.1
    - Install-Package Microsoft.EntityFrameworkCore.Tools -Version 6.0.1
- 第6步：编写控制器的代码
  - ![[IMG-P8-1 Authentication与Authorization-20241030154923582.png]]
- 第7步：编写创建角色和用户的方法 
	- ![[IMG-P8-1 Authentication与Authorization-20241030155110065.png]]
- 第8步：编写处理登录请求的操作方法Login
	- ![[IMG-P8-1 Authentication与Authorization-20241030163230638.png]]
	- 设置登录失败次数和锁定时间
		- ![[IMG-P8-1 Authentication与Authorization-20241030163254055.png]]
	- 数据库的字段
		- ![[IMG-P8-1 Authentication与Authorization-20241030163324697.png]]
		- ![[IMG-P8-1 Authentication与Authorization-20241030163339453.png]]
	- 需要注意的点
		- BadRequest和NotFound 选一种进行状态码的统一~
			- 最好不要在开发环境和这个生产环境出现状态码不一致的情况
		- return NotFound($"用户名不存在{userName}");
			- 这种方式容易造成泄密，如果你提示XX用户名不存在，会有安全风险，一些恶意的用户就可以反复的尝试
			- 解决方法：判断是不是开发环境，是开发环境就可以用这种，好判断问题；不是开发环境就用“ return BadRequest();” 这种更安全
	- 数据库中用户的密码不是明文保存的，而是以哈希值的形式保存在PasswordHash列中，这样就降低了明文保存密码的安全风险
![[IMG-P8-1 Authentication与Authorization-20241120172301742.png]]

---

## 实现密码的重置

标识框架提供了多因素验证(短信验证、指纹验证登)、外部登录等功能
- 视频课程中展示是验证码的方式，书本上写的是邮箱重置链接

### 验证码与邮箱方式的区别

```C#

/*如果是把重置链接发到用户邮箱，那么就不用配置
PasswordResetTokenProvider = 
TokenOptions.DefaultEmailProvider;*/

//但是上面生成的验证码太长、太复杂。如果是需要用户输入的验证码，则要配置，这样就短了
options.Tokens.PasswordResetTokenProvider = 
TokenOptions.DefaultEmailProvider;//开启后，就是短的验证码；注释后，就是很长的邮箱链接模式

options.Tokens.EmailConfirmationTokenProvider = 
TokenOptions.DefaultEmailProvider;

```

- 验证码
![[IMG-P8-1 Authentication与Authorization-20241120172320308.png]]

- 邮箱
![[IMG-P8-1 Authentication与Authorization-20241120172345245.png]]


- 发送验证码和重置密码校验
![[IMG-P8-1 Authentication与Authorization-20241120172456693.png]]

---

## 代替Session(会话)的JWT

如果要实现“用户登录后才能访问某些资源”的功能，开发人员就要自己基于HTTP来模拟实现状态的保存，本身HTTP是无状态的。


### Session

实现用户登录功能的经典做法是用Session
- 在用户登录验证成功后，**服务器端生成唯一标识SessionId**，然后服务器端不仅会把SessionId返回给浏览器端，还会把SessionId和登录用户的信息对应关系保存到服务器的内存中
- 当浏览器再次向服务器端发送请求的时候，浏览器端就在HTTP请求中携带了SessionId，服务器端就可以根据SessionId从服务器端的内存中取到用户的信息，这样就实现了用户登录的功能

#### Session的存放方式
- 一般SessionId保存在Cookie中，而Session的数据默认是保持在服务器内存中的
-  在手机APP、小程序等保存Cookie虽然可以实现，但不太方便

#### 缺点
Session是Web开发中在**服务器端保存客户端相关状态的经典方案，** 但是在分布式环境下，特别是在==“前后端分离、多客户端”时代==，Session暴露出很多缺点。这些缺点包括但不局限于如下几点：
- 如果Session数据保存在内存中，==当登录用户量很大的时候，Session数据就会占用非常多的内存==，而且无法支持分布式集群环境
- 如果Session数据保存到Redis等状态服务器中，它可以支持分布式集群环境，但是每遇到一次客户端，请求都要向状态服务器获取一次Session数据，这会导致请求的响应速度变慢。特别是对于一些跨多数据中心的分布式环境，跨数据中心的状态传递更是一件棘手的事情。
	- 所以在**中心状态服务器有性能问题**

当然了ASP.NET Core 同样支持Session机制，而且我们也可以采用Redis、Memcached、关系数据库等作为状态服务器，以便支持分布式集群环境。
- ==在现在的项目开发中，我们倾向于采用JWT去代替Session实现登录。==


### JWT(Json Web Token)

1、JWT把登录信息(也称为令牌)保存在客户端。
- 用Json格式来保存
2、为了防止客户端的数据造假，保存在客户端的令牌经过了签名处理，而签名的秘钥只有服务器端才知道，每次服务器端收到客户端提交过来的令牌的时候都要检查一下签名。
- 如果发现数据被篡改，则拒绝接受客户端提交的令牌
3、基于JWT如果实现“登录”
- 具体可以查看书中252页的登录流程

#### JWT的结构
JWT的结构组成
- 头部中保存的是加密算法的说明
	- 比如hmac-sha256算法
- 负载中保存的用户的ID、用户名、角色等信息
- 签名是根据头部和负载一起算出来的值

![[IMG-P8-1 Authentication与Authorization-20241121114544885.png]]


#### JWT的优点 

在JWT这样的机制下的优点有哪些~
- 登录用户的信息保存在客户端，服务器端不需要保存数据。所以天然地适合分布式的集群环境
- 服务器端从客户端的请求中就可以获取当前的用户信息，不需要再去状态服务器中获取。所以程序的运行效率更高(纯内存的计算)。
- 签名保证了客户端无法数据造假。

---

## JWT的基本使用

先安装JWT读写的NuGet包：Install-Package System.IdentityModel.Tokens.Jwt

然后编写生成JWT的程序




### 生成的JWT
- 被句点分割成了3部分，分别是头部、负载、签名。
	- 头部：绿色
	- 负载：红色
	- 签名：蓝色
- JWT看起来很乱，像是加密过的。其实他们都是明文存储的，只不过进行了简单的编码而已
	- 我们通过解码JWT看到，其实都是明文存储的
		- ==负载的内容是明文形式保存的，因此一定不要把不能被客户端知道的信息放到负载中==
	- ![[IMG-P8-1 Authentication与Authorization-20241121155105738.png]]

![[IMG-P8-1 Authentication与Authorization-20241121154133010.png]]

#### 校验JWT的签名(JWT的安全机制)

由上面的内容的可以得出JWT其实是明文存储的，所以会有恶意攻击者来对用户ID等信息进行修改，冒充其他用户的身份去访问服务器上的资源。
- 因此服务器端需要对签名部分进行校验，从而检查JWT是否被篡改了

调用JwtSecurityTokenHandler对JWT解码
- 因为它会在对JWT解码前对签名进行校验

```C#
 string jwt = Console.ReadLine();
 string secKey = "8fjw92jf02&jfba02jf9d8b3fjw02b3j";
 JwtSecurityTokenHandler tokenHandler = new();
 TokenValidationParameters valParam = new();
 var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secKey));
 valParam.IssuerSigningKey = securityKey;
 valParam.ValidateIssuer = false;
 valParam.ValidateAudience = false;
 ClaimsPrincipal claimsPrincipal = tokenHandler.ValidateToken(jwt,
             valParam, out SecurityToken secToken);
 foreach (var claim in claimsPrincipal.Claims)
 {
     Console.WriteLine($"{claim.Type}={claim.Value}");
 }

```


1、校验成功
- ![[IMG-P8-1 Authentication与Authorization-20241121161151891.png]]
2、校验失败
- ![[IMG-P8-1 Authentication与Authorization-20241121161145343.png]]

---

## ASP.NET.Core 对于JWT的封装

前面的几节课讲了这个JWT的原理和基本使用，实现项目开发中，咱们不会直接去写那些代码。因为
ASP.NET.Core封装了对于JWT的操作，让我们在程序中使用JWT进行鉴权和授权更简单。

### 如何更简单地使用JWT


第一步：
- 配置JWT节点，节点下创建SigningKey、ExpireSeconds两个配置项，分别代表JWT的密钥和过期时间（单位：秒）。
- 再创建配置类JWTOptions，包含SigningKey、ExpireSeconds两个属性。
![[IMG-P8-1 Authentication与Authorization-20241125163004927.png]]

第二步：
- 安装JWT读写的NuGet包：Install-Package Microsoft.AspNetCore.Authentication.JwtBearer  -Version 6.0.1
  - 这个包封装了简化ASP.NET.Core 中使用JWT的操作

第三步：
- 编写代码对JWT进行配置，把内容添加到Program.cs的builder.Build()之前
![[IMG-P8-1 Authentication与Authorization-20241123172511106.png]]
第四步：
- 在Program.cs的app.UseAuthorization()这行代码之前添加app.UseAuthentication()
![[IMG-P8-1 Authentication与Authorization-20241125163028579.png]]

第五步：
- Controller类中增加登录并且创建JWT的操作方法
![[IMG-P8-1 Authentication与Authorization-20241125163211991.png]]

第六步：
- 在需要登录才能访问的控制器类上添加[Authorize]这个ASP.NET.Core内置的Attribute(检验登录的权限)
![[IMG-P8-1 Authentication与Authorization-20241125163130752.png]]
- RBAC角色控制
	- ` [Authorize(Roles ="admin")]//限定只有admin角色的用户才可以访问这个接口`
- 测试登录和访问。
  - 直接调用这个接口：服务器端返回的HTTP状态码是401，也就是“没有授权”
- 用PostMan或者ApiFox自定义报文头：
  - Authorization的值为“Bearer JWT”
  - Authorization的值中的“Bearer”和JWT令牌之间一定要通过空格分隔。前后不能多出来额外的空格、换行等。

![[IMG-P8-1 Authentication与Authorization-20241125163229599.png]]

- JWTToken在Web、App、小程序等中保存到哪里？
  - 对于客户端获得的JWT，在前端项目中，我们可以把令牌保存到Cookie、LocalStorage等位置，从而在后续请求中重复使用
  - 对于移动App、PC客户端、我们可以把令牌保存到配置文件中或者本地文件数据库中。

- 用户如何退出登录呢
  - 当执行“退出登录”操作的时候，我们只要在客户端本地把JWT删除即可


---


## [Authorize]的注意事项

1、ASP.NET Core中身份验证和授权验证的功能由Authentication、Authorization中间件提供：- 
- app.UseAuthentication()、app.UseAuthorization() 。

2、控制器类上标注`Authorize`，则**所有操作方法都会被进行身份验证和授权验证**；
- 对于标注了`Authorize`的控制器中，**如果其中某个操作方法不想被验证，可以在操作方法上添加`AllowAnonymous`。**
- 如果没有在控制器类上标注`Authorize`，那么**这个控制器中的所有操作方法都允许被自由地访问**；
- 对于没有标注`Authorize`的控制器中，**如果其中某个操作方法需要被验证，我们也可以在操作方法上添加`Authorize`。**

3、ASP.NET Core会按照HTTP协议的规范，从Authorization取出来令牌，并且进行校验、解析，然后把解析结果填充到User属性中，这一切都是ASP.NET Core完成的，不需要开发人员自己编写代码。但是一旦出现401状态码，没有详细的报错信息，很难排查，这是初学者遇到的难题。
- 遇到这种情况，就只能按照步骤仔细检查，看是否有设置错误的地方



---

## 让Swagger中调试带验证的请求更简单
- 在Program.cs添加设置自定义HTTP请求报文头的代码，然后可以在下述图片中的按钮中来添加设置JWT来进行简单的测试~
- 如果界面关闭或重启了，我们就必须重新输入报文头的值

```C#
builder.Services.AddSwaggerGen(c =>//添加设置自定义HTTP请求报文头的方式
{
	var scheme = new OpenApiSecurityScheme()
	{
		Description = "Authorization header. \r\nExample: 'Bearer 12345abcdef'",
		Reference = new OpenApiReference
		{
			Type = ReferenceType.SecurityScheme,
			Id = "Authorization"
		},
		Scheme = "oauth2",
		Name = "Authorization",
		In = ParameterLocation.Header,
		Type = SecuritySchemeType.ApiKey,
	};
	c.AddSecurityDefinition("Authorization", scheme);
	var requirement = new OpenApiSecurityRequirement();
	requirement[scheme] = new List<string>();
	c.AddSecurityRequirement(requirement);
});

```

![[IMG-P8-1 Authentication与Authorization-20241125171423905.png]]


---

## 解决JWT无法提前撤回的难题

JWT最开始设计就是为了给与一次性的令牌而已

JWT的缺点
- 一旦JWT被发放给客户端，在有效期内这个令牌就一直有效，令牌是无法被提前撤回的。

哪些场景会需要再JWT过期之间提前撤回令牌？
- 用户被删除了、禁用了；令牌被盗用了；单设备登录。

### 杨中科老师的解决思路

在用户表中增加一个整数类型的列JWTVersion，代表最后一次发放出去的令牌的版本号；

每次登录、发放令牌的时候，都让JWTVersion的值自增，同时将JWTVersion的值也放到JWT令牌的负载中；

当执行禁用用户、撤回用户的令牌等操作的时候，把这个用户对应的JWTVersion列的值自增；

当服务器端收到客户端提交的JWT令牌后，先把JWT令牌中的JWTVersion值和数据库中JWTVersion的值做一下比较，如果JWT令牌中JWTVersion的值小于数据库中JWTVersion的值，就说明这个JWT令牌过期了。

### 实现步骤

1、为用户实体User类增加一个long类型的属性JWTVersion。
2、修改登录并发放令牌的代码，把用户的JWTVersion属性的值自增，并且把JWTVersion的值写入JWT令牌。
3、编写一个操作筛选器，统一实现对所有的控制器的操作方法中JWT令牌的检查操作。把JWTValidationFilter注册到Program.cs中MVC的全局筛选器中。

具体步骤可以查看书上261-265的内容







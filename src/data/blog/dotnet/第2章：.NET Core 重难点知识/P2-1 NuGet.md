---
title: P2-1 NuGet
description: .NET Core 学习笔记 - P2-1 NuGet
pubDatetime: 2024-08-23T11:32:26+08:00
tags:
  - .NET Core2022-学习
  - .NET Core
  - 第2章：.NET Core 重难点知识
draft: false
---
---

## 下载DLL的方式
- 以前传统的手工下载dll
  - 缺点：不好找;版本不匹配;依赖复杂
  - 所以后面就出现了应用商店(360软件管家等)自动根据你的系统和配置下载合适的软件
- 软件包
  - 之前都是自己引用dll或者第三方包去使用
    - 下载-->安装-->匹配
    - .NET Core用的是：NuGet
    - VS里面也有应用商城，但是功能不是非常的完善
  - 比如其他软件都有类似的操作
    - Linux：apt、yum
    - Javascript：npm
    - Java：Maven、Gradle
    - Python：pip


## NuGet的搜索
官网：https://www.nuget.org/
> 这个网址大多数都是欧美地区人再用，所以都是英语
- 功能
  - 精确搜索(Zack.EFCore.Batch)
    - 知道自己需要用哪个包，可以直接使用精确搜索
    - ![精确搜索](https://github.com/cool19980208/picx-images-hosting/raw/master/20240822/精确搜索.6t71rk7yxt.webp)
  - 模糊搜索
    - 建议使用英文去搜索，下面是例子
      - subtitle parser---解析器
      - ftp---文件传输
      - hotkey---热键
    - 中文一般搜索不到
  - 详细页讲解
    - Dependencies ---查看支持什么程序
      - ![查看支持程序](https://github.com/cool19980208/picx-images-hosting/raw/master/20240822/查看支持程序.5tqyee57ry.webp)
      - 如果是This package has no dependencies 没有依赖
        - 默认都是.NETFramework
        - ![无依赖](https://github.com/cool19980208/picx-images-hosting/raw/master/20240822/无依赖.pf9p45ajp.webp)
    - Used By---查看这个包被哪些库类引用
      - 如果被引用的多，就说明这个包非常的流行，经过很多人的验证
      - 很多人用这个包，就说明这个包比较靠谱；如果没人用，相对来讲可能就不靠谱一点
      - ![被引用](https://github.com/cool19980208/picx-images-hosting/raw/master/20240822/被引用.1ovd2a81p9.webp)
    - Versions---更新的频次越多，更新的时间越近，说明这个项目非常的活跃，一直在更新，有了新的bug，新的功能，这个作者一直在往里面加
      - 那么这个项目就属于一个比较靠谱的项目
      - ![版本迭代](https://github.com/cool19980208/picx-images-hosting/raw/master/20240822/版本迭代.7zqd05wviv.webp)
    - downloads---下载量
      - ![下载量](https://github.com/cool19980208/picx-images-hosting/raw/master/20240822/下载量.2dommavkpy.webp)
    - Project website ---官网
      - 有的是直接指向了GitHub上面
    - MIT license---协议
    - Package Manager(一般都使用这个)
      - 安装命令
  - 因为NuGet上面的包不都是微软提供的
    - 有少数是微软提供的，但大部分的包都是像杨中科老师这样的第三方开发者或者说有一些公司来提供的
    - 这只是微软构建的一个第三方开发包的一个应用商城而已，里面的软件包的质量有好有坏，参差不齐.
    - 有的只发布了一个版本，放上去就没人在管了，里边一大堆bug；也有一些比较优秀的人做的项目一直在更新。所以说你要自己去甄别
### 挑选包的原则
- 1、先查看这个包支不支持你的.NET的版本
- 2、被别人类库引用的多不多
- 3、下载量大不大
- 4、更新的频次是不是频繁
- 5、官网看看是否收费
- 包的介绍
  - ![包的介绍](https://github.com/cool19980208/picx-images-hosting/raw/master/20240822/包的介绍.1zi6vfn9ui.webp)

- 有一些项目下载少，引用少，不代表说他一定不靠谱，可能这个功能很简单，就发布了一个版本就没啥可维护的。毕竟有些比较冷门的功能
- 还可以打开官网看看
  - 有些官网里面会显示 price---价格或者purchase，那就说明这个包它不是免费的，不是开源的
    - ![收费](https://github.com/cool19980208/picx-images-hosting/raw/master/20240822/收费.6bh02z6lcz.webp)
  - NuGet上面不是所有的包都是免费的，也有一部分是收费的
    - 有一部分属于商业使用，需要收费
    - 或者说是试用版
    - 收费的慎用，因为是需要花钱的

---

## NuGet使用方式
- NuGet CLI
- VS图形界面
  - ![图形化界面](https://github.com/cool19980208/picx-images-hosting/raw/master/20240823/图形化界面.5tqyfextu6.webp)
- VS命令行【程序包管理器控制台】(推荐)
  - 安装
    - ![安装](https://github.com/cool19980208/picx-images-hosting/raw/master/20240823/安装.67xe6agpow.webp)
  - 卸载
    - 常规
      - ![卸载](https://github.com/cool19980208/picx-images-hosting/raw/master/20240823/卸载.4uav297b2p.webp)
    - 非常规
      - 直接在配置文件中把那一行是删除保存即可。
      - ![非常规](https://github.com/cool19980208/picx-images-hosting/raw/master/20240823/非常规.4xugzza4wl.webp)
  - 更新
    - Update-Package XXX 跟上包名即可
  - 注意
    - 注意：【默认项目】为目标项目。
    - 1）安装：Install-Package XXX。-Version 指定版本。
      - 可以看到把依赖组件都下载了。
      - 版本检测：尝试 把项目改为.NET core 1.0，然后再安装Zack.EFCore.Batch试试。
    - 2）卸载：Uninstall-Package XXX
    - 3）更新到最新版：Update-Package XXX


### 其他方面
- 1、NuGet你也可以贡献，就三步。
  - 能力的锻炼，增加社区的影响力
- 2、和.NET Framework不同，.NET core绝大部分官方程序集也要到NuGet下载。模块化！
  - .NET Framework的一些部分功能都是默认集成了，到了.NET Core就把这些功能都剥离出来放在NuGet上面了，变成模块化~ 需要就装，不需要就不用安装
- 3、少部分是收费的，如搜索“word file”。
- 4、参差不齐，如何分辨质量。
- 5、内部部署NuGet服务器。
  - 通用的包，不方便放在NuGet上面。方便团队使用，可以内部去搭建NuGet服务器，如果需要微软的包，也可以映射过来。



### 小技巧
-  项目中的包太多了，想更新版本，如果使用VS命令行，需要一个一个更新太麻烦了
   -  可以使用VS图形界面去更新(选需要更新的包即可)
   -  ![更新](https://github.com/cool19980208/picx-images-hosting/raw/master/20240823/更新.ic1upbr65.webp)
---
title: P2-3  Maven的使用
description: Java 学习笔记 - P2-3  Maven的使用
pubDatetime: 2024-08-03T17:05:26+08:00
tags:
  - Java学习
  - Java
  - 零基础玩Java-Part2
draft: false
---
---
## YZK18-COMMONS库
- 由杨中科封装的库，让初学者更好的学习

![commons库-yzk封装的](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/commons库-yzk封装的.1022r19jom.webp)


### 通过Maven引用库

- 1、Maven默认从国外的服务器下载库，可能速度慢。国内最好配置镜像服务器，可以用阿里云的，也可以用其他的。
- 2、pom.xml上右键Maven→Create settings.xml
  - 一台电脑配置一次即可
  - 把阿里云镜像的配置文件写进去

![配置](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/配置.7p3ifs6odm.webp)

![settings](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/settings.41xys9k05s.webp)

```
<mirrors>
<mirror>	
	<id>nexus-aliyun</id>	
	<mirrorOf>*</mirrorOf>	
	<name>Nexus aliyun</name>	
	<url>https://maven.aliyun.com/nexus/content/groups/public</url>
</mirror>
</mirrors>

```

![Maven引用库](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/Maven引用库.2venjnlzag.webp)

### 添加库
- 1、在https://mvnrepository.com自己搜索，或者直接用别人提供的maven配置。
  - 里面最好选新版本，除非有特殊要求
  - 多看看描述和文档.还能看到这个第三方的依赖库
  - 然后在浏览器中看看这个的用法，和易用性

![描述](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/描述.7zqc8y0vcp.webp)

![配置1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/配置1.esf4qu27u.webp)

- 2、在pom.xml中建一个dependencies节点(如果已经有了就不能重复建了)，然后把dependency粘贴上去即可。 dependencies中可以放多个dependency

![YZK18](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/YZK18.9dcvcywyjt.webp)

- 3、修改了pom.xml后要点一下m图标才会下载
  
- 4、偶尔会下载失败，jar包展开没东西，就右键【pom.xml】，然后选择【Maven】→【Reload Project】就会自动重试下载。有时候要试好几次，或者重启IDEA

![重新下载](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/重新下载.syuvn05w5.webp)

![下载情况](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/下载情况.8s37qpi1ms.webp)

### 添加yzk18-commons库

- 从https://mvnrepository.com 搜最新版yzk18-commons，放到pom.xml中。或者用：

```
<dependency>
    <groupId>com.yzk18</groupId>
    <artifactId>yzk18-commons</artifactId>
    <version>1.5</version>
</dependency>
```
- 2、开源地址： https://github.com/yangzhongke/yzk18/
- 3、调用IOHelpers. readAllText()方法读取然后打印文本文件

![成功](https://github.com/cool19980208/picx-images-hosting/raw/master/20240803/成功.6f0l9i9iok.webp)
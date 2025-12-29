---
title: P4-12 案例：从数组数据创建Excel图表
description: Java 学习笔记 - P4-12 案例：从数组数据创建Excel图表
pubDatetime: 2024-08-19T15:00:26+08:00
tags:
  - Java学习
  - Java
  - 零基础玩Java-Part4
draft: false
---
---
## 主要概念
- XSSFChart是代表Excel中的图表对象。
- ChartBuilder是用于向XSSFChart中填充数据的构建器，有很多子类：
  - ChartFromArrayBuilder用于从一个固定的数组来创建数据；
  - ChartFromCellRangeBuilder用于从一个Excel表指定范围来创建数据；

### 创建Chart

```java
XSSFChart chart = ExcelHelpers.createChart(sheet, 0, 5, 7, 26);//在sheet上创建一个图表对象，显示到左上角坐标为(coll，row)、右下角坐标为(col2，row2)这个位置
chart.setTitleText("销售榜");
chart.getOrAddLegend().setPosition(LegendPosition.LEFT);
```


### Builder
- ChartFromArrayBuilder<Double> chartBuilder = new ChartFromArrayBuilder<>(ChartTypes.LINE);
- 泛型的类型为数据的类型， ChartTypes为图表的类型：LINE 折线图； LINE3D立体 折线图；BAR条形图；BAR3D 立体条形图；PIE 饼状图；PIE3D立体饼状图；RADAR 雷达图；SCATTER散点图等。



### 填充数据

```java
String[] monthNames = new String[]{"语文","数学","英语"};
Double[] sales1 ={99.0,99.8,66.6};
Double[] sales2 ={99.8,99.9,88.8};
chartBuilder.setCategoryNames(monthNames);//横坐标用哪个数组
chartBuilder.putValues("张三",sales1);
chartBuilder.putValues("李四",sales2);
chartBuilder.setCategoryAxisTitle("科目");//分类的标题
chartBuilder.setValueAxisTitle("姓名");//数据的标题
chartBuilder.build(chart);
```


### 步骤
- 1、创建Chart，准备数据，使用Builder构建数据，然后build到chart上。
- 2、演示：创建一个excel表，填充数据，保存到excel中。

![效果](https://github.com/cool19980208/picx-images-hosting/raw/master/20240819/效果.8z6g8vukeo.webp)

```java
XSSFWorkbook workbook =ExcelHelpers.createXLSX();//创建xlsx
XSSFSheet sheet = workbook.createSheet();//创建页签
XSSFChart chart = ExcelHelpers.createChart(sheet, 0, 5, 7, 26);//在sheet上创建一个图表对象，显示到左上角坐标为(coll，row)、右下角坐标为(col2，row2)这个位置
chart.setTitleText("销售榜");
chart.getOrAddLegend().setPosition(LegendPosition.LEFT);

ChartFromArrayBuilder<Double> chartBuilder = new ChartFromArrayBuilder<>(ChartTypes.LINE);//设置显示的图像:折线图  3D图等
String[] monthNames = new String[]{"语文","数学","英语"};
Double[] sales1 ={99.0,99.8,66.6};
Double[] sales2 ={99.8,99.9,88.8};
chartBuilder.setCategoryNames(monthNames);//横坐标用哪个数组
chartBuilder.putValues("张三",sales1);
chartBuilder.putValues("李四",sales2);
chartBuilder.setCategoryAxisTitle("科目");//分类的标题
chartBuilder.setValueAxisTitle("姓名");//数据的标题
chartBuilder.build(chart);

ExcelHelpers.saveToFile(workbook,"D:/JavaTest1/1.xlsx");//保存文件
ExcelHelpers.close(workbook);//关闭文件
DesktopHelpers.openFile("D:/JavaTest1/1.xlsx");//用默认方式去打开文件
```
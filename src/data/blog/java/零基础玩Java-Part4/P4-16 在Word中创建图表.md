---
title: P4-16 在Word中创建图表
date: 2024-08-20 17:44:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# 在Word中创建图表
---
## 用法
Word中创建图表的方式是一样的

XWPFChart和XSSFChart 一样都是继承自XDDFChart的,因此同样可以用chartBuilder构建数据,然后填充.
ChartFromArrayBuilder等都可以用

案例:把Excel中的那两个案例再用Word实现一遍


1.疫情统计

```java
String[] lines = IOHelpers.readAllLines("D:/JavaTest1/疫情/疫情.txt");
String[] countries=new String[lines.length];//用来存放国家的数组
Double[] 确诊数量 = new Double[lines.length];//用来存放确诊数量的数组
Double[] 死亡数量 =new Double[lines.length];//用来存放死亡数量的数组
for (int i =0;i< lines.length;i++)
{
    String line =lines[i];
    String[] datas = line.split("\\s");//\\s 是正则表达式,代表了空格和Tab, 只要是空,就算
    //System.out.println(Arrays.toString(datas));//先输出一下看看正确不
    String 国家 =datas[0];
    Double 确诊 = Double.parseDouble(datas[1]);
    Double 死亡 = Double.parseDouble(datas[2]);
    countries[i]=国家;
    确诊数量[i]=确诊;
    死亡数量[i]=死亡;
}
XWPFDocument doc = WordHelpers.createDocxDocument();
XWPFChart chart = WordHelpers.createChart(doc, 400, 400);
ChartFromArrayBuilder<Double> chartBuilder = new ChartFromArrayBuilder<>(ChartTypes.BAR);
chart.setTitleText("疫情统计");//图表标题
chart.getOrAddLegend().setPosition(LegendPosition.LEFT);
chartBuilder.setCategoryNames(countries);
chartBuilder.putValues("确诊数量",确诊数量);
chartBuilder.putValues("死亡数量",死亡数量);
chartBuilder.build(chart);
WordHelpers.saveToFile(doc,"D:/JavaTest1/疫情/疫情.docx");
WordHelpers.close(doc);
```


2.收入统计

```java
Workbook wb = ExcelHelpers.openFile("D:/JavaTest1/公司账目2021年.xlsx");
int sheetCount = wb.getNumberOfSheets();
String[] monthNames = new String[sheetCount];//用来给波动图的指标
Double[] sales = new Double[sheetCount];//用来给波动图的数据
for(int sheetIndex = 0;sheetIndex<sheetCount;sheetIndex++)
{
    Sheet sheet = wb.getSheetAt(sheetIndex);
    String month = sheet.getSheetName();
    monthNames[sheetIndex]=month;
    double 学费总额=0;
    for(int rowIndex =1;rowIndex<=sheet.getLastRowNum();rowIndex++)
    {
        String 收支类别 = ExcelHelpers.getCellStringValue(sheet,rowIndex,2);
        //System.out.println(收支类别);
        if(收支类别.equals("学费收入"))
        {
            double 金额= ExcelHelpers.getCellDoubleValue(sheet,rowIndex,3);
            学费总额+=金额;
        }
    }
    sales[sheetIndex] = 学费总额;
    System.out.println(month+":"+学费总额);
}

XWPFDocument doc = WordHelpers.createDocxDocument();
XWPFChart chart = WordHelpers.createChart(doc, 400, 400);
ChartFromArrayBuilder<Double> chartBuilder = new ChartFromArrayBuilder<>(ChartTypes.LINE);
chartBuilder.setCategoryNames(monthNames);
chartBuilder.putValues("学费收入",sales);
chartBuilder.build(chart);

WordHelpers.saveToFile(doc,"D:/JavaTest1/学费收入/1.docx");
WordHelpers.close(doc);

ExcelHelpers.close(wb);
```
---
title: P4-13 从表格数据创建Excel图表
date: 2024-08-12 17:35:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# 从表格中获取数据并创建Excel图表
---
## 需求说明
![需求说明1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240819/需求说明1.esfrj6ule.webp)


```java
String fileName ="D:/JavaTest1/1.xlsx";
Workbook workbook = ExcelHelpers.openFile(fileName);//打开xlsx文件
Sheet sheet = workbook.getSheetAt(0);
ChartFromCellRangeBuilder chartBuilder =new ChartFromCellRangeBuilder(ChartTypes.LINE,(XSSFSheet)sheet);//创建图表，sheet转换类型
XSSFChart chart = ExcelHelpers.createChart(sheet, 5, 1, 17, 17);//在sheet上创建一个图表对象，显示到左上角坐标为(coll，row)、右下角坐标为(col2，row2)这个位置
int rowNum = sheet.getLastRowNum();//有效的行数
chartBuilder.setCategoriesCellRange(new CellRangeAddress(1,rowNum,0,0));//1是跳过表头
chartBuilder.putCellRanges("血压",new CellRangeAddress(1,rowNum,1,1));
chartBuilder.putCellRanges("体重",new CellRangeAddress(1,rowNum,2,2));
chartBuilder.setCategoryAxisTitle("日期");
chartBuilder.build(chart);
ExcelHelpers.saveToFile(workbook,fileName);
ExcelHelpers.close(workbook);
DesktopHelpers.openFile(fileName);//用默认方式打开文件
```





## 应用场景
- 1、从数据库中读取数据，然后生成图表
- 2、根据已有Excel表，创建图表
- 3、对已有Excel表进行加工，创建新的Excel表，创建图表
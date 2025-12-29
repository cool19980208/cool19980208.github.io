---
title: P4-9 案例：根据Excel工资表生成工资条
description: Java 学习笔记 - P4-9 案例：根据Excel工资表生成工资条
pubDatetime: 2024-08-16T17:07:26+08:00
tags:
  - Java学习
  - Java
  - 零基础玩Java-Part4
draft: false
---
---

## 需求
- 1、一个Excel工资文件，每个Sheet是一个部门，每个部门都有员工的姓名、编号、基本工资、考勤扣款、奖金，然后生成每个员工一个工资条word文件，文件名为【部门名+姓名+员工编号】
- 2、允许用户选择文字文件以及保存文件夹


```java
//自己第一次没看杨中科大佬写之前，自己琢磨的
Workbook workbook = ExcelHelpers.openFile("D:/JavaTest1/WordTest2/2024年8月工资表.xlsx");//获取对应文件
    for (int sheetIndex=0;sheetIndex<workbook.getNumberOfSheets();sheetIndex++) //循环读取页签中的内容 sheet
    {
        Sheet sheet = workbook.getSheetAt(sheetIndex);//获取第x页签
        for (int rowIndex = sheet.getFirstRowNum();rowIndex<=sheet.getLastRowNum();rowIndex++)//循环读取有效的第一行到有效的最后一行
        {
            Row row = sheet.getRow(rowIndex+1);//获取第2行，忽略姓名，工号。基本工资。奖金。考勤
            if (row==null)
            {
                continue;
            }
            LinkedList<String> Lists =new LinkedList<>();
            for (int cellIndex = row.getFirstCellNum(); cellIndex<=row.getLastCellNum();cellIndex++)
            {
                Cell cell = row.getCell(cellIndex);//获取第x格
                if (cell==null)
                {
                    continue;
                }
                String value= ExcelHelpers.getCellStringValue(cell);//推荐用这个，封装的这个傻瓜化，自带类型转换
                if (value==null)
                {
                    continue;
                }
                Lists.add(value);
            }
                LocalDate d1=LocalDate.now();//获取当前日期 年/月/日
                String yFile="D:/JavaTest1/WordTest2/工资条模板.docx";
                HashMap<String,Object> data =new HashMap<>();
                String 员工姓名=Lists.get(0);
                String 工号=Lists.get(1);
                double 基本工资=Double.parseDouble(Lists.get(2));
                double 奖金=Double.parseDouble(Lists.get(3));
                double 考勤罚款=Double.parseDouble(Lists.get(4));
                double 实发工资=基本工资+奖金+考勤罚款;


                /*System.out.println(员工姓名);
                System.out.println(工号);
                System.out.println(基本工资);
                System.out.println(奖金);
                System.out.println(考勤罚款);
                System.out.println(实发工资);
                System.out.println("一个员工完成");*/

                data.put("{员工姓名}",员工姓名);
                data.put("{工号}",工号);
                data.put("{基本工资}",基本工资);
                data.put("{奖金}",奖金);
                data.put("{考勤罚款}",考勤罚款);
                data.put("{实发工资}",实发工资);
                data.put("{部门}",sheet.getSheetName());
                data.put("{日期}",d1.toString());
                WordTemplateRenderer.render(yFile, data,"D:/JavaTest1/WordTest2/"+sheet.getSheetName()+员工姓名+工号+".docx");
        }

    }
    ExcelHelpers.close(workbook);
```

分析不足
- 1、多写了一层cell循环，可以用ExcelHelpers.getCellStringValue()这个方法直接取对应的值
- 2、int cellIndex = row.getFirstCellNum()  for循环中的条件，最好在外面用变量命名后在使用，要不然浪费性能
- 3、LinkedList<String> Lists =new LinkedList<>(); 这个可以去掉
- 4、rowIndex+1  可以在for循环的条件中是限制  比如：int i =1；

### 完善后

```java
String yFile="D:/JavaTest1/WordTest2/工资条模板.docx";
Workbook workbook = ExcelHelpers.openFile("D:/JavaTest1/WordTest2/2024年8月工资表.xlsx");//获取对应文件
int sheetmax = workbook.getNumberOfSheets();
for (int sheetIndex=0;sheetIndex<sheetmax;sheetIndex++) //循环读取页签中的内容 sheet
{
    Sheet sheet = workbook.getSheetAt(sheetIndex);//获取第x页签
    String 部门=sheet.getSheetName();
    int rowNumber=sheet.getLastRowNum();
    for (int rowIndex = 1;rowIndex<=rowNumber;rowIndex++)//跳过表头
    {
        String 员工姓名=ExcelHelpers.getCellStringValue(sheet,rowIndex,0);
        String 工号=ExcelHelpers.getCellStringValue(sheet,rowIndex,1);
        double 基本工资=ExcelHelpers.getCellDoubleValue(sheet,rowIndex,2);
        double 奖金=ExcelHelpers.getCellDoubleValue(sheet,rowIndex,3);
        double 考勤罚款=ExcelHelpers.getCellDoubleValue(sheet,rowIndex,4);
        double 实发工资=基本工资+奖金+考勤罚款;

        HashMap<String,Object> data =new HashMap<>();
        data.put("{员工姓名}",员工姓名);
        data.put("{工号}",工号);
        data.put("{基本工资}",基本工资);
        data.put("{奖金}",奖金);
        data.put("{考勤罚款}",考勤罚款);
        data.put("{实发工资}",实发工资);
        data.put("{部门}",部门);
        data.put("{日期}",LocalDate.now());//获取当前日期 年/月/日
        String newFile="D:/JavaTest1/WordTest2/"+部门+"-"+员工姓名+"-"+工号+".docx";
        WordTemplateRenderer.render(yFile, data,newFile);
    }
}
ExcelHelpers.close(workbook);
```

---

### 在此基础上增加功能
- 允许用户选择文字文件以及保存文件夹
  - 添加了两个窗口，让用户自己选择，但是模板是我内置的。
```java
String yFile="D:/JavaTest1/WordTest2/工资条模板.docx";
String xlsxFile =GUI.fileOpenBox("请选择工资表","xlsx");//选择xlsx文件
String fileName = GUI.dirOpenBox("请选择要保存到的文件夹").replace("\\","/");//获取文件夹路径,然后把\\都换成/ 来兼容其他系统
Workbook workbook = ExcelHelpers.openFile(xlsxFile);//获取对应文件
int sheetmax = workbook.getNumberOfSheets();
for (int sheetIndex=0;sheetIndex<sheetmax;sheetIndex++) //循环读取页签中的内容 sheet
{
    Sheet sheet = workbook.getSheetAt(sheetIndex);//获取第x页签
    String 部门=sheet.getSheetName();
    int rowNumber=sheet.getLastRowNum();
    for (int rowIndex = 1;rowIndex<=rowNumber;rowIndex++)//跳过表头
    {
        String 员工姓名=ExcelHelpers.getCellStringValue(sheet,rowIndex,0);
        String 工号=ExcelHelpers.getCellStringValue(sheet,rowIndex,1);
        double 基本工资=ExcelHelpers.getCellDoubleValue(sheet,rowIndex,2);
        double 奖金=ExcelHelpers.getCellDoubleValue(sheet,rowIndex,3);
        double 考勤罚款=ExcelHelpers.getCellDoubleValue(sheet,rowIndex,4);
        double 实发工资=基本工资+奖金+考勤罚款;

        HashMap<String,Object> data =new HashMap<>();
        data.put("{员工姓名}",员工姓名);
        data.put("{工号}",工号);
        data.put("{基本工资}",基本工资);
        data.put("{奖金}",奖金);
        data.put("{考勤罚款}",考勤罚款);
        data.put("{实发工资}",实发工资);
        data.put("{部门}",部门);
        data.put("{日期}",LocalDate.now());//获取当前日期 年/月/日
        //System.out.println(fileName);
        String newFile=fileName+"/"+部门+"-"+员工姓名+"-"+工号+".docx";
        WordTemplateRenderer.render(yFile, data,newFile);
    }
}
ExcelHelpers.close(workbook);
```
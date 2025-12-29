---
title: P4-10 案例：Excel文件合并
date: 2024-08-18 21:03:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# 案例：Excel文件合并
---

## 需求说明
- 有多个部门的人员信息表，每个部门一个Excel文件，要求合并成一个Excel文件。
- ![需求说明1](https://github.com/cool19980208/picx-images-hosting/raw/master/20240818/需求说明1.2veo5dh1zc.webp)

思路
> 读取这个文件下所有xlsx的表
> 然后一个表一个表的复制粘贴到一个新表
> 然后保存


分析自己写的时候不足的地方
- 1、变量名最好都转成英文，这样更加规范
- 2、写这块的code的时候，没想象到新建一个xlsx文件，需要默认新建一个row内容。
  - 一开始自己的想法是 直接在0,0之前插入部门。 为什么会卡在这呢？ 因为我没想到新建的文件还需要再创建 姓名/电话/性别。所以掉进了误区
- 3、新建的xlsx文件的保存动作和关闭动作，要在for循环都完成后再进行。需要想到for循环之外
- 4、**先把自己会的代码写出来，不会的再去查询搜索去进行定点突破，没必要非得想全面了，在去执行。**
  - 别提前设想结果。 **先落地，在优化**
  - 一有想法**立马具象化**
  - 这就是超级执行力~entj与intj

```java
XSSFWorkbook newworkbook =ExcelHelpers.createXLSX();//创建xlsx
    XSSFSheet newsheet = newworkbook.createSheet();//创建页签
    ExcelHelpers.setCellValue(newsheet,0,0,"部们");//第0列增加内容  没有这个格就会自动创建
    ExcelHelpers.setCellValue(newsheet,0,1,"姓名");
    ExcelHelpers.setCellValue(newsheet,0,2,"电话");
    ExcelHelpers.setCellValue(newsheet,0,3,"性别");
    int newrow =1;
    String[] yFile = IOHelpers.getFilesRecursively("D:/JavaTest/10", "xlsx");//先找出xlsx文件
    for (String file :yFile)
    {
        Workbook workbook = ExcelHelpers.openFile(file);//读取xlsx文件
        int sheetIndex =0;//避免魔法值
        Sheet sheet = workbook.getSheetAt(sheetIndex);
        String fileName = IOHelpers.getFileNameWithoutExtension(file);//获得xlsx名称，去除后缀名
        int rowNumber=sheet.getLastRowNum();
        for (int rowIndex = 1;rowIndex<=rowNumber;rowIndex++)//跳过表头
        {
            //获取对应的数据
            String 姓名 =ExcelHelpers.getCellStringValue(sheet,rowIndex,0);
            String 电话=ExcelHelpers.getCellStringValue(sheet,rowIndex,1);
            String 性别=ExcelHelpers.getCellStringValue(sheet,rowIndex,2);

            //然后插入到新的一列去添加
            ExcelHelpers.setCellValue(newsheet,newrow,0,fileName);
            ExcelHelpers.setCellValue(newsheet,newrow,1,姓名);
            ExcelHelpers.setCellValue(newsheet,newrow,2,电话);
            ExcelHelpers.setCellValue(newsheet,newrow,3,性别);
            newrow++;//自增，防止在同一行重复覆盖数据
        }

        ExcelHelpers.close(workbook);

    }
    /**
     * 这两句为什么要写到下面呢？
     * 因为只有等这个for循环都写完了才能保存，并且关闭
     */
    ExcelHelpers.saveToFile(newworkbook,"D:/JavaTest1/Excel Test1/1.xlsx");//保存到新文件
    ExcelHelpers.close(newworkbook);//关闭xlsx
```
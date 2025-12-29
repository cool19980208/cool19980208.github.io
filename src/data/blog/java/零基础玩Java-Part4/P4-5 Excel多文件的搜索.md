---
title: P4-5 Excel多文件的搜索
date: 2024-08-15 16:47:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# 在多个Excel文件中进行搜索
---

## 需求说明

公司里有N多个历年的客户缴费数据Excel表格，现在要做一个从“姓名、电话、备注”字段中查找包含特定内容的Excel表的一个功能，输出文件的名字以及找到的内容所在的表格中的位置（哪个Sheet、哪个单元格）

思路
- 先从人的基本操作来分析： 打开一个Excel表格，然后从第一个页签里面的表格开始遍历，遍历到格。 然后在继续下一个Excel表格，找到符合要求的就输出文件名字 和所在表格的位置
- 1.找到文件夹下所有的xls、xlsx的文件
- 2.打开文件，开始遍历，遍历到符合要求的就输出
- 3.直到所有文件都过了一遍


```java
String[] xlsxFiles = IOHelpers.getFilesRecursively("D:/JavaTest1/ExcelTest2", "xlsx");
String name ="任宗鑫";
for (String xlsxfile:xlsxFiles)
{
    Workbook workbook = ExcelHelpers.openFile(xlsxfile);//获取对应文件
    String fileName = IOHelpers.getFileName(xlsxfile);
    for (int sheetIndex=0;sheetIndex<workbook.getNumberOfSheets();sheetIndex++) //循环读取页签中的内容 sheet
    {
        Sheet sheet = workbook.getSheetAt(sheetIndex);//获取第x页签
        for (int rowIndex = sheet.getFirstRowNum();rowIndex<=sheet.getLastRowNum();rowIndex++)//循环读取有效的第一行到有效的最后一行
        {
            Row row = sheet.getRow(rowIndex);//获取第x行
            if (row==null)
            {
                continue;
            }
            for (int cellIndex = row.getFirstCellNum(); cellIndex<=row.getLastCellNum();cellIndex++)
            {
                /*if (cellIndex==-1)
                {
                    continue;
                }*/
                Cell cell = row.getCell(cellIndex);//获取第x格
                //cell.getStringCellValue() 这个不带类型转换
                if (cell==null)
                {
                    continue;
                }
                String value= ExcelHelpers.getCellStringValue(cell);//推荐用这个，封装的这个傻瓜化，自带类型转换
                if (value==null)
                {
                    continue;
                }
                if (value.contains(name))//模糊搜索
                {
                    //System.out.println("文件名称为:"+fileName+";搜索的内容所在位置为："+sheet+"页签"+row+"行"+cell+"格");
                    CellReference cellRef = new CellReference(row.getRowNum(), cell.getColumnIndex());
                    System.out.println("文件名称为: " + fileName + "; 搜索的内容所在位置为：" +
                            " 页签: " + sheet.getSheetName() + " 行: "+ (rowIndex + 1)  + " 格:" + cellRef.formatAsString());
                }
            }
        }

    }
    ExcelHelpers.close(workbook);
}
```
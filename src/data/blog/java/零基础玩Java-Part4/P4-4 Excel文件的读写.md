---
title: P4-4 Excel文件的读写
date: 2024-08-15 12:19:26
tags: Java学习
categories:
- Java
- 零基础玩Java-Part4
---
# Excel文件的读写
---

## Excel格式说明
- 1、Excel有xls、xlsx两种格式。推荐使用xlsx
  - xls好像是只能存65535行，是之前的老格式了
  - 现在默认保存都是xlsx格式，因为没有行数限制，对于编程来说，也能更好的去进行读写
- 2、整个Excel文件是一个Workbook
  - 每个Workbkk由多个Sheet组成，一个Sheet有多Row，一个Row有多个Cell。
  - Sheet：页签；Row：行 ；Cell：格

## ExcelHelpers使用
- 1、看文档研究ExcelHelpers。它是对poi库的简单封装，更多功能看poi的文档
- 2、注意的的问题，如果表格中有使用公式的话，编程语言运行期间改变了数据，并且想得到计算后的单元格的值，需要手动调用evaluateAllFormulas();
- 3、演示：使用代码读取遍历一个Excel文件
- 4、演示：使用代码创建一个Excel文件，填充一些数据，然后保存


### 3.演示：使用代码读取遍历一个Excel文件
- 获取格的内容，最好用ExcelHelpers.getCellStringValue(cell) 这个方法，因为封装的自带类型转换
  -  cell.getStringCellValue() 这个不带类型转换

```java
Workbook workbook = ExcelHelpers.openFile("D:/JavaTest1/Excel Test1/test.xlsx");
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
            Cell cell = row.getCell(cellIndex);//获取第x格
            //cell.getStringCellValue() 这个不带类型转换
            if (cell==null)
            {
                continue;
            }
            String value= ExcelHelpers.getCellStringValue(cell);//推荐用这个，封装的这个傻瓜化，自带类型转换
            System.out.println(value);
        }
    }

}
ExcelHelpers.close(workbook);
```

---

### 4.使用代码创建一个Excel文件，填充一些数据，然后保存

- 调试错误
  - ![报错调试](https://github.com/cool19980208/picx-images-hosting/raw/master/20240815/报错调试.8dwsgms7yr.webp)
- 查看值
  - ![调试过程中去看对应的值](https://github.com/cool19980208/picx-images-hosting/raw/master/20240815/调试过程中去看对应的值.9nzpmya79w.webp)
- 重命名
  - ![重命名](https://github.com/cool19980208/picx-images-hosting/raw/master/20240815/重命名.3rb5fzq96r.webp)

```java
XSSFWorkbook workbok =ExcelHelpers.createXLSX();//创建xlsx
XSSFSheet sheet = workbok.createSheet();//创建页签
ExcelHelpers.setCellValue(sheet,0,0,"姓名");//第0列增加内容 没有这个格就会自动创建
ExcelHelpers.setCellValue(sheet,0,1,"年龄");
ExcelHelpers.setCellValue(sheet,0,2,"手机号");

ExcelHelpers.setCellValue(sheet,1,0,"cool");
ExcelHelpers.setCellValue(sheet,1,1,18);
ExcelHelpers.setCellValue(sheet,1,2,"155999999999");


ExcelHelpers.setCellValue(sheet,2,0,"张三");
ExcelHelpers.setCellValue(sheet,2,1,50);
ExcelHelpers.setCellValue(sheet,2,2,"1666666666666");

ExcelHelpers.setCellValue(sheet,3,0,"李四");
ExcelHelpers.setCellValue(sheet,3,1,65);
ExcelHelpers.setCellValue(sheet,3,2,"18888888888888");
ExcelHelpers.saveToFile(workbok,"D:/JavaTest1/Excel Test1/1.xlsx");//保存到新文件
ExcelHelpers.close(workbok);//关闭xlsx

```
# React导出表头合并的表格

需求场景：将下图的包含表头合并的表格导出为excel保存到本地

使用 [fe-export-excel](https://github.com/evantre/exportexcel#readme)，功能简单，满足现有的需求并且包的体积也不大。

![](https://static01.imgkr.com/temp/57ba6a66edd24dc09e46a9aefd1577ef.png)

## 一、安装并引入
安装依赖并在需要使用的文件里引入
```js
npm i fe-export-excel

import { exportexcel } from 'fe-export-excel';
```

## 二、基本用法

首先是定义一个工作表`worksheet`。

```js
// 表头样式
const headerStyle = {
  // 更多样式配置可参考 https://github.com/exceljs/exceljs/blob/HEAD/README_zh.md#样式
  // 定义对齐方式
  alignment: { vertical: 'middle', horizontal: 'center' },
};

// 定义工作表
const worksheet = {
  // 工作表名
  sheetName: 'Sheet1',
  // 行内容(不区分表头行和数据行)
  // 可选，start 当前单元格起始列，从 0 开始；如 start 位置和数组索引位置一致可以省略
  // 可选，rowspan 当前单元格跨多少行 用于合并单元格
  // 可选，colspan 当前单元格跨多少列 用于合并单元格
  // 可选，style 为当前单元格的样式
  rows: [
    // 表头
    [
      { start: 0, rowspan: 2, colspan: 1, value: '表头行合并', style: headerStyle },
      { start: 1, rowspan: 2, colspan: 1, value: '表头行合并', style: headerStyle },
      { start: 2, rowspan: 1, colspan: 4, value: '表头列合并', style: headerStyle },
      { start: 6, rowspan: 1, colspan: 4, value: '表头列合并', style: headerStyle },
    ],
    [
      { start: 2, rowspan: 1, colspan: 1, value: '表头', style: headerStyle },
      { start: 3, rowspan: 1, colspan: 1, value: '表头', style: headerStyle },
      { start: 4, rowspan: 1, colspan: 1, value: '表头', style: headerStyle },
      { start: 5, rowspan: 1, colspan: 1, value: '表头', style: headerStyle },
      { start: 6, rowspan: 1, colspan: 1, value: '表头', style: headerStyle },
      { start: 7, rowspan: 1, colspan: 1, value: '表头', style: headerStyle },
      { start: 8, rowspan: 1, colspan: 1, value: '表头', style: headerStyle },
      { start: 9, rowspan: 1, colspan: 1, value: '表头', style: headerStyle },
    ],
    // 填充数据
    /*
      dataSource是表格的数据
      dataSource = [
        {
          id: 0,
          name: '测试1',
          num: 100,
        }
        ...
      ]
    */
    ...dataSource.map(item => [
      item.name,
      item.num,
      item.num,
      item.num,
      item.num,
      item.num,
      item.num,
      item.num,
      item.num,
      item.num,
    ]),
  ],
  // 单元格样式
  cellStyle: {
    alignment: { vertical: 'middle', horizontal: 'left' },
  },
};
```

工作表定义好后调用引入的方法。
```js
// 第一个参数为文件名
exportexcel('测试', worksheet);
```

## 三、导出表格效果图

![](https://static01.imgkr.com/temp/97a658655a354f6d8db19abfb41866c2.png)

至此，导出表格数据的功能就实现了，对这个插件感兴趣的可以自行查看更多的用法。




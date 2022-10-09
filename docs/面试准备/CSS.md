# CSS

## 盒模型

- 盒模型分为两种：标准盒模型和怪异盒模型（IE）
- 一个盒模型是由以下四个部分组成的：`content`、`padding`、`border`、`margin`
- 设置 `width` 和 `height` 时，标准盒模型只包含 `content；而怪异盒模型包括` `content`、`padding` 和 `border`
- 可以通过 `box-sizing` 设置：`content-box`（标准盒模型）和 `border-box`（怪异盒模型）

## 块级元素、行内元素和行内块元素区别

- 块级元素单独占一行，同一行内不能有其他元素；行内元素和行内块元素只有排满了才会换行。
- 行内元素不能设置宽高;块级元素和行内块元素可以
- 行内元素设置 margin 不会有垂直方向的边距

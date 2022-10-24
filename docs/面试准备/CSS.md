# CSS

## 盒模型

- 盒模型分为两种：标准盒模型和怪异盒模型（IE）
- 一个盒模型是由以下四个部分组成的：`content`、`padding`、`border`、`margin`
- 设置 `width` 和 `height` 时，标准盒模型只包含 `content`；而怪异盒模型包括`content`、`padding` 和 `border`
- 可以通过 `box-sizing` 设置：`content-box`（标准盒模型）和 `border-box`（怪异盒模型）

## 块级元素、行内元素和行内块元素区别

- 块级元素单独占一行，同一行内不能有其他元素；行内元素和行内块元素只有排满了才会换行。
- 行内元素不能设置宽高;块级元素和行内块元素可以
- 行内元素设置 margin 不会有垂直方向的边距

## BFC

BFC(Block Format Context)就是**块级格式化上下文**，可以理解为是一个完全独立的空间（布局环境），让空间里的元素不会影响到空间外的布局。

### 触发 BFC 的 CSS 属性

- `overflow: hidden`
- `display: flex`
- `display: inline-block`
- `position: fixed`
- `position: absolute`

### BFC 解决什么问题

- 防止容器内元素脱离文档流导致容器高度塌陷
- 防止元素外边距重叠

参考资料：

- [块格式化上下文\_MDN](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context)

## 移动端适配

### 像素单位

#### 设备像素（device pixels）

设备像素也叫物理像素，指的是显示器上的真实像素，每个像素大小是显示器固有的属性，显示器出厂后就不会再改变了。

#### 设备独立像素（Device Independent Pixels）

设备独立像素也叫逻辑像素，是操作系统定义的一种像素单位，应用程序将逻辑像素告诉操作系统，操作系统再将逻辑像素转化为物理像素，从而控制屏幕上真实的物理像素点。

#### CSS 像素

在 `CSS` 中使用的 `px` 就是 `CSS` 像素，当我们缩放页面时，元素的 `CSS` 像素数量是不会变化的，变的是每个 `CSS` 像素的大小。

参考资料：

- [2022 年移动端适配方案指南 — 全网最新最全](https://juejin.cn/post/7046169975706353701)

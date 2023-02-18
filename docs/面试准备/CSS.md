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

## 水平垂直居中

- 利用**绝对定位**将元素左上角通过`top:50%`和`left:50%`定位到页面中心，然后通过**负外边距**调整
- 利用**绝对定位**将元素左上角通过`top:50%`和`left:50%`定位到页面中心，然后通过**translate**调整
- 设置**绝对定位**，四个方向的值都为 0，并将`margin`设置为`auto`
- 利用`flex`布局的`justify-content`和`align-items`

## BFC

BFC(Block Format Context)就是**块级格式化上下文**，可以理解为是一个完全独立的空间（布局环境），让空间里的元素不会影响到空间外的布局。

### 触发 BFC 的 CSS 属性

- `overflow: hidden`
- `display: flex`
- `display: inline-block`
- `position: fixed`
- `position: absolute`

### BFC 解决什么问题

- 防止容器内元素设置浮动后脱离文档流导致容器**高度塌陷**
- 防止元素`margin`**重叠**
- 创建**左侧宽度固定，右侧宽度自适应**的两栏布局

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

## requestAnimationFrame

顾名思义就是**请求动画帧**的意思，该方法用于告诉浏览器在下次重绘之前执行指定的回调函数更新动画。

### 语法

`window.requestAnimationFrame(callback)`。

其中`callback`是下一次重绘之前更新动画所调用的函数，该函数会被传入`DOMHighResTimeStamp`参数，它是一个时间戳，表示`requestAnimationFrame`开始执行回调函数的时刻。

### 优势

- **CPU 节能**：使用`SetTinterval`实现的动画，当页面被隐藏或最小化时，`SetTinterval`仍然在后台执行动画任务，由于此时页面处于不可见或不可用状态，刷新动画是没有意义的，完全是浪费 CPU 资源。而`RequestAnimationFrame`则完全不同，当页面处理未激活的状态下，该页面的屏幕刷新任务也会被系统暂停，因此跟着系统走的`RequestAnimationFrame`也会停止渲染，当页面被激活时，动画就从上次停留的地方继续执行，有效节省了 CPU 开销。
- **减少 DOM 操作**：`requestAnimationFrame` 会把每一帧中的所有 DOM 操作集中起来，在一次重绘或回流中就完成，并且重绘或回流的时间间隔是跟随浏览器的刷新频率，这样可以保证回调函数在屏幕每一次的绘制间隔中只被执行一次，这样就不会引起丢帧现象，也不会导致动画出现卡顿的问题。

参考资料：

- [对 requestAnimationframe 的理解](https://www.yuque.com/cuggz/interview/evfmq3#fff7d3edb04e987bbcf0f48d392efc65)

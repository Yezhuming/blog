# 步骤条 steps 的样式调整

记录下对 antd 的步骤条 steps 的样式调整，主要是箭头效果的实现，实际上这个步骤条不需要有导航效果，所以自己用写一个更简单一点 😂😂

# 1 样式效果

![](https://static01.imgkr.com/temp/40bc7512a5b3441a9d32f566b23cb63e.png)

# 2 实现思路

我们先引入组件看一下 DOM 结构：

![](https://static01.imgkr.com/temp/ff5089db51984e8fb355b525deaf98a0.png)

很简单的结构，只是不同状态的 div 排列。

`ant-steps-item-process`和`ant-steps-item-wait`是 steps 的组件不同状态所具有的 class，深色的就是 process，浅色的是 wait，这个是通过组件的 status 控制的。

接下来只要在这两种状态下分别用 after 伪元素去实现一个向右的箭头即可。

# 3 实现步骤

### 3.1 引入组件

![](https://imgkr2.cn-bj.ufileos.com/3ae7d2db-f2df-4eb2-8136-a47f97da3ffe.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=hbijSNq%252FdnZFiSAIW%252F7erPMu0CQ%253D&Expires=1612773642)

直接从 antd 里引入 Steps 组件

```html
<Steps type="navigation" className="{styles.topSteps}">
  <Step title="Step1" status="process" />
  <Step title="Step2" status="process" />
  <Step title="Step3" status="wait" />
  <Step title="Step4" status="wait" />
  <Step title="Step5" status="wait" />
</Steps>
```

### 3.2 去除不必要的样式和添加背景色

![](https://static01.imgkr.com/temp/1cef4be981d145779a63a7a129c11793.png)

去掉图标，添加背景色和隐藏

```css
.ant-steps-item {
  padding-left: 0;
  position: relative;
  float: left;
  .ant-steps-item-container {
    margin-left: 0;
    padding-bottom: 0;
    width: 100%;
    .ant-steps-item-icon {
      display: none;
    }
    .ant-steps-item-content {
      width: 100%;
      .ant-steps-item-title {
        height: 40px;
        line-height: 40px;
        width: 100%;
        padding-left: 24px;
      }
    }
  }
}
.ant-steps-item-process {
  .ant-steps-item-title {
    background-color: #c4c4c4; // 添加背景色后底部蓝色和右侧箭头都被覆盖了
  }
}
.ant-steps-item-wait {
  .ant-steps-item-title {
    background-color: #f0f0f0; // 添加背景色后底部蓝色和右侧箭头都被覆盖了
  }
}
```

### 3.3 添加右箭头

利用`after`伪元素给每一步后面都添加一个背景色一样的正方形，然后再顺时针旋转 45°，再利用白色阴影实现箭头效果。

![](https://static01.imgkr.com/temp/05153de839ef4aca8802f811ee1dfb19.png)

<br>

```css
.ant-steps-item-process:after {
  content: '';
  position: absolute;
  top: 5px;
  right: 10px;
  left: unset;
  width: 30px;
  height: 30px;
  transform: rotate(45deg);
  z-index: 10;
  border-radius: 4px 5px 4px 0;
  box-shadow: 3px -3px 0 1px rgb(255 255 255); // 白色阴影实现箭头效果
  margin-top: 0;
  border: none;
  background-color: #c4c4c4;
}
.ant-steps-item-wait:after {
  ... // 其他属性与process状态一致，这里不再贴出来
  background-color: #f0f0f0;
}
```

### 3.4 调整箭头上下两个三角形背景色

利用`before`伪元素在每一步前都添加一个宽度与箭头一致的元素，该元素要求层级比背景高但是比前一步的`after`伪元素要低。

![](https://static01.imgkr.com/temp/e0a17c6c56db4727bcca1a6e83eb2084.gif)

再将该元素的背景色设置成与当前步骤一致，再将第一步的`before`伪元素隐藏掉就得到我们想要的效果了。

![](https://static01.imgkr.com/temp/40bc7512a5b3441a9d32f566b23cb63e.png)

```css
.ant-steps-item-process {
  &:first-child:before {
  display: none;
}
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -20px;
    width: 22px;
    height: 40px;
    z-index: 9;
    background: #f0f0f0;
  }
}
.ant-steps-item-wait {
  ...
  &:before {
    ...
    background: #f0f0f0;
  }
}
```

# 4 总结

这次的样式调整主要是利用了`before`和`after`伪元素来实现箭头效果，其实自己写会更容易一点，不用考虑 antd 自带的样式。

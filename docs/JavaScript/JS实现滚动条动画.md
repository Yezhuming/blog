## JS 实现滚动条滚动到指定位置 <!-- {docsify-ignore} -->

```js
/**
 * 滚动到指定位置
 * @param {Number} top 滚动条距离顶部位置
 * @param {Number} time 滚动花费时间
 */
scrollTo = (top, time) => {
  if (!time) {
    this.listRef.current.scrollTop = top;
    return;
  }
  const spacingTime = 20; // 设置循环的间隔时间
  let spacingIndex = time / spacingTime; // 计算循环次数
  let nowTop = this.listRef.current.scrollTop; // 获取滚动条目前的位置
  const everTop = (top - nowTop) / spacingIndex; // 计算滚动条每次移动的距离
  const scrollTimer = setInterval(() => {
    if (spacingIndex > 0) {
      spacingIndex -= 1;
      this.scrollTo((nowTop += everTop));
    } else {
      clearInterval(scrollTimer);
    }
  }, spacingTime);
};
```

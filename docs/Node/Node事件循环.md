# Node事件循环

Node的事件循环可以分为六个阶段，以下是在官网找到的一张简化图：

![Untitled](Node%E4%BA%8B%E4%BB%B6%E5%BE%AA%E7%8E%AF%20f9fa635708364d1898510ff4bbc92938/Untitled.png)

- 每个阶段都有一个执行回调函数的`FIFO（先进先出）`队列
- 当事件循环到达特定阶段时，先执行该阶段的所有操作，然后执行该阶段队列中的回调
- 当阶段队列为空或回调达到限制时，事件循环将移动到下一个阶段

## 阶段概述

- timers（定时器阶段）：该阶段执行由`setTimeout`和`setInterval` 产生的回调
- pending callbacks（待定回调阶段）：该阶段执行延迟到下一个循环迭代的 I/O 回调
- idle, prepare（限制阶段）：仅在系统内部使用
- poll（轮询阶段）：检索新的 I/O 事件、执行与 I/O 相关的回调（除`timers`阶段、`check`阶段和`close callbacks`阶段的回调以外），其余情况事件循环将在适当的时候在此堵塞等待事件
- check（检测阶段）：该阶段执行由`setImmediate` 产生的回调
- close callbacks（关闭回调阶段）：该阶段执行关闭的回调函数，例如`socket.on('close', ...)`

## 阶段详情

### timers

timers阶段会执行由`setTimeout`和`setInterval` 产生的回调函数，拿`setTimeout` 作为例子，执行`setTimeout` 的回调函数的开始时间取决于poll阶段，而不是等待指定的时间后立即开始执行。

```jsx
const fs = require('fs');

const now = new Date().getTime();
console.log(now); // 1641305677083

setTimeout(() => {
  const delay = new Date().getTime() - now;

  console.log(`${delay}ms后执行`); // 26ms后执行
}, 10);

// 读取文件花费大约6ms
fs.readFile('./event_loop.js', () => {
  const startCallback = new Date().getTime();

  // 堵塞20ms
  while (Date.now() - startCallback < 20) {
    console.log(startCallback) // 1641305677089
  }
})
```

上面例子中读取文件花费了6ms，执行回调函数花费了20ms，虽然`setTimeout`指定的`delay`时间为10ms，但是由于`poll`阶段仍在执行回调，所以只能等待`poll`阶段结束事件才移动到`timers`阶段执行其相应的回调。

### poll

`poll`阶段主要做的事有两个：

1. 计算应该阻塞和轮询 I/O 的时间
2. 执行队列中的回调函数

当事件进入`poll`阶段后，将会以下两种情况：

- 当队列不为空时，同步执行队列中的回调函数，直到队列为空或达到与系统相关的限制；若队列为空则进入另一种情况；若达到限制，则事件循环进入下一个阶段（如果`timers`阶段队列为空则进入`check`阶段，否则进入`timers` 阶段）
- 当队列为空时：
    - 如果`check`阶段队列存在回调，则进入到`check`阶段
    - 如果`check`阶段队列为空，事件循环将检查`timers`阶段队列是否为空：
        - 如果`timers`阶段队列为空，事件循环将在`poll`阶段等待回调进入队列，并立即执行
        - 如果不为空，则判断是否满足`delay`时间，若满足则回到`timers`阶段执行相应的回调

### check

该阶段执行由`setImmediate` 产生的回调函数，如果check阶段队列不为空，并且poll阶段和timers阶段队列均为空时，事件循环将结束poll阶段的等待状态并进入到检查状态执行相应的队列。

```jsx
const fs = require('fs');

const now = new Date().getTime();
console.log(now);

setTimeout(() => {
  const delay = new Date().getTime() - now;

  console.log(`${delay}ms后执行timers阶段回调`);
}, 10);

// 读取文件花费大约6ms
fs.readFile('./event_loop.js', () => {
  console.log('执行poll阶段队列回调')
  const startCallback = new Date().getTime();
  // 堵塞20ms
  while (Date.now() - startCallback < 20) {
    console.log(startCallback)
  }
  setImmediate(() => {
    const delay = new Date().getTime() - now;
  
    console.log(`${delay}ms后执行第二次check阶段队列回调`);
  })
})

setImmediate(() => {
  const delay = new Date().getTime() - now;

  console.log(`${delay}ms后执行第一次check阶段队列回调`);
})

// 1641308487621
// 6ms后执行第一次check阶段队列回调（第一次事件循环将各任务非分发到对应阶段队列后结束轮询进入check阶段）
// 执行poll阶段队列回调（此时timers未满足delay时间）
// 1641308487628
// ...
// 1641308487628（poll阶段结束，判断check阶段队列是否为空）
// 27ms后执行第二次check阶段队列回调（不为空，执行回调）
// 27ms后执行timers阶段回调
```
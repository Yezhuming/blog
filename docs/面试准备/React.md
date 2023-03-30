# React 面试题

## 类组件和函数组件有什么异同

相同点:

都是 React 可复用的最小代码片段，都会返回在页面中渲染的 React 元素。

不同点：

- 类组件是基于面向对象编程的，主打的是继承和生命周期；函数组件是函数式编程，更符合 React 的设计理念（UI = render(data)）

**组合优于继承**

参考资料：

- [类组件和函数组件有什么异同](https://www.yuque.com/cuggz/interview/pgw8v4#aba725aa4adad32ea7793ed66887d3d2)

## 事件机制

### React16

#### 合成事件

绑定的事件`onClick`并不是原生事件，而是由原生事件合成的`React`事件，例如 `click` 合成为 `onClick`，`blur`、`change`、`input`、`keydown`、`keyup` 合成为 `onChange`。

#### 事件注册

构建初始化`React`合成事件和原生事件的对应关系，合成事件和对应的事件处理插件关系

#### 事件绑定

根据合成事件类型找到原生事件，然后进行真正的事件绑定

#### 事件触发

1. 如果事件中有改变`state`，则通过统一的事件处理函数`dispatchEvent`,进行批量更新`batchUpdate`。
2. 生成合成事件源对象（保存了整个事件的信息）
3. 声明事件执行队列，按照冒泡和捕获的逻辑，从目标元素往上收集事件，将对应事件放到队列的头部和尾部
4. 执行事件队列，如果发现阻止冒泡，那么`break`跳出循环，最后重置事件源，放回到事件池中

**事件池**

```js
handerClick = (e) => {
  console.log(e.target); // button
  setTimeout(() => {
    console.log(e.target); // null
  }, 0);
};
```

事件池其实就是存放事件源对象的地方，每次我们用的事件源对象，在事件函数执行之后都会被释放到事件池中，这样的好处是不用每次都创建事件源对象，可以从事件池中直接取出事件源对象直接进行复用，在事件处理函数执行完毕后，会释放事件源到事件池中，因此在 `setTimeout` 中打印出来的是 `null`。

#### 总结：

- 事件并没有绑定到目标元素上，而是统一绑定到`document`，目标元素的事件被置为空函数
- 绑定的合成事件在`document`上由多个原生事件组成
- 按需绑定
- 原生事件（阻止冒泡）会阻止合成事件的执行，合成事件（阻止冒泡）不会阻止原生事件的执行

### React17

- 事件从绑定到`document`改为绑定到根元素上（有利于微前端）
- 取消事件池（事件源对象复用）

参考资料

- [「react 进阶」一文吃透 react 事件系统原理](https://juejin.cn/post/6955636911214067720)

## 高阶组件

高阶组件是**参数为组件，返回值为新组件**的函数。

### 设计初衷

- **复用逻辑**：批量对原有组件进行加工、包装处理，根据业务需求定制化 HOC，解决复用逻辑。
- **强化 props**：劫持上一层传过来的`props`，然后混入新的`props`，增强组件的功能。代表作`react-router`中的`withRouter`。
- **赋能组件**：提供一些额外的拓展功能，例如额外的生命周期、额外的事件。
- **控制渲染**：对原来的组件渲染实现条件控制、懒加载等功能。

### 组合方式

#### 正向属性代理

用代理组件包裹源组件，在代理组件上对源组件进行代理操作，可以理解为**父子组件关系**。

```js
function HOC(WrapComponent) {
  return class NewComponent extends React.Component {
    state = {
      name: "alien",
    };
    render() {
      return <WrapComponent {...this.props} {...this.state} />;
    }
  };
}
```

##### 优点

- 和业务组件低耦合，零耦合，对于`控制渲染`和强化`props`，只负责控制业务组件渲染和传递额外的 `props` 即可，无需知道业务组件的实际内容。
- 适用于 `class` 组件和函数组件
- 可以嵌套使用

##### 缺点

- 无法直接获取业务组件的状态，只能通过`ref`获取组件实例
- 无法直接继承静态属性

#### 反向组件继承

直接继承业务组件本身，返回的新组件就是继承后，加强型的业务组件。

```js
class Index extends React.Component {
  render() {
    return <div> hello,world </div>;
  }
}
function HOC(Component) {
  return class wrapComponent extends Component {
    /* 直接继承需要包装的组件 */
  };
}
export default HOC(Index);
```

**优点**

- 方便获取业务组件内部状态，比如 `state`、`props` 和绑定的事件函数等。
- es6 继承可以直接继承静态属性。

**缺点**

- 不适用于无状态组件。
- 与业务组件强耦合，需要知道业务组件具体的用处。
- 不利于嵌套使用，多层嵌套会导致当前状态覆盖上一个状态。

参考资料

- [「react 进阶」一文吃透 React 高阶组件(HOC)](https://juejin.cn/post/6940422320427106335)

## ref(TODO)

## setState 是异步还是同步

`setState` 并不是单纯的同步或异步，它的表现会因调用场景不同而不同，在生命周期或者合成事件中表现为异步(批量合并更新)，而在 `setTimeout`、`setInterval` 等函数中，包括在 DOM 原生事件中，它都表现为同步。

**React18** 开始`setState`不论在什么场景调用都为异步，但可以用`ReactDOM.flushSync`跳出批处理。

参考资料：

- [11 | setState 到底是同步的，还是异步的？](https://kaiwu.lagou.com/course/courseInfo.htm?courseId=510#/detail/pc?id=4860)

## Hooks

Hooks 是一套能够使函数组件更强大、更灵活的“钩子”。

### 为什么需要 Hook

1. 告别难以理解的类组件：`this` 和生命周期

2. 解决业务逻辑难以拆分的问题

3. 使状态逻辑复用变得简单可行：自定义`hook`

4. 函数组件从设计思想上来看更契合 `React` 的理念：`UI = render(data)`

### Hook 调用链路

**首次渲染**

初始化 `hook` 时将所有 `hook` 的相关信息收集在一个对象中，对象之间以**单向链表**的形式相互串联。

**非首次渲染**

按顺序去遍历之前构建好的链表，取出对应的数据信息进行渲染。

参考资料

- [08 | 深入 React-Hooks 工作机制：“原则”的背后，是“原理”](https://kaiwu.lagou.com/course/courseInfo.htm?courseId=510#/detail/pc?id=4857)

## 路由

### react-router-dom、react-router 和 history 三者的关系

- `history`是`react-router`的核心，集成了`pushState`、`popState`等底层路由方法。
- `react-router`是`react-router-dom`的核心，封装了`Router`、`Switch`和`Route`等组件，实现监听路由更新组件的核心功能。
- `react-router-dom`在`react-router`的基础上，封装了`Link`、`BrowserRouter`和`HashRouter`等组件。

### history 库

单页面应用路由实现的原理：切换 `url`，监听 `url` 的变化，渲染与 `url` 匹配的组件。

#### history 模式

**切换 url**

- `history.pushState(state,title,path)`
- `history.replaceState(state,title,path)`

**监听 url**

- `onpopstate`

```js
window.addEventListener("popstate", function (e) {
  // e 中有pushState或者replaceState传入的对象
  /* 监听改变 */
});
```

注意：`history.pushState`和`history.replaceState`不会触发`popState`事件，`popState`事件只会在浏览器某些行为下触发，例如点击后退前进按钮，或者调用`history.back`、`history.go`方法也会触发。即**同一文档的不同历史记录之间导航会触发该事件**。

#### hash 模式

**切换 url**

- `window.location.hash`

**监听 url**

`onhashchange`

```js
window.addEventListener("hashchange", function (e) {
  /* 监听改变 */
});
```

#### 整体流程

![history库整体流程](../image/history%E5%BA%93%E6%B5%81%E7%A8%8B.jpg)

### react-router 库

#### Router

创建路由上下文，把`history`、`location`等路由信息传递到子组件。

#### Switch

通过`pathname`和组件的`path`进行匹配，找到符合的`Route`组件。

**Router6 移除了 Switch 组件，新增 Routes 组件**

#### Route

作为路由组件的容器，将页面组件渲染出来，并将路由上下文中路由信息`location`、`match`等作为`prop`传递给页面组件。

### 总结

当`url`改变时，触发了`popstate`事件，调用`handlePopState`回调函数，产生新的`location`对象，通知`Router`组件更新`location`并通过上下文传递到子组件，`Switch`组件根据传递的路由信息匹配出对应的`Route`组件，`Route`组件从上下文中取出路由信息作为`prop`传递给页面组件，页面组件更新渲染。

![history库整体流程](../image/%E8%B7%AF%E7%94%B1%E6%B5%81%E7%A8%8B%E5%88%86%E6%9E%90.png)

参考资料

- [「源码解析 」这一次彻底弄懂 react-router 路由原理](https://juejin.cn/post/6886290490640039943)

## React.Children 和 props.children 区别

**返回值不同**

- `React.Children`返回一个对象，包含 5 种方法`count`、`map`、`forEach`、`only`、`toArray`。
- `props.children`返回值有 4 种情况：
  - 没有子元素时返回`undefined`
  - 有唯一子元素且为字符串时直接返回子元素
  - 有唯一子元素且为`react-element`时返回对象
  - 有多个子元素时返回数组

## React 和 Vue 有什么异同

### 共同点

- 都使用虚拟 DOM 高效更新视图
- 提倡组件化开发
- 独立的路由系统和全局状态管理来自于第三方库

### 不同点

#### 核心思想

**Vue**

`Vue` 的思想是拥抱经典的 `html+css+javascript` 的形式，使用 `template` 模板结合内置的指令开发，同时实现数据的双向绑定，响应式的更新渲染，并且对数据的监听更细致，实现组件级别的更新。

**React**

`React` 整体上是函数式的思想，`all in js`， 将 `html` 和 `CSS` 都融入 `JavaScript` 中，当在组件内部手动改变 `state` 时组件以及子组件才会更新渲染。

#### diff 算法

**Vue**

使用双向链表，边对比，边更新`DOM`，整个过程是同步进行，不可中断的。

**React**

使用单向链表保存需要更新的`DOM`，统一批量更新`DOM`，`React16` 后引入了`Fiber`架构，使整个过程是异步，可中断恢复的。

#### 事件机制

**Vue**

Vue 使用原生事件。

**React**

将原生事件封装成合成事件，不需要单独处理跨浏览器兼容问题（IE 的事件对象和事件监听不不同），所有事件绑定到根节点（React 17）。

#### 数据驱动视图

**Vue**

`Vue` 的数据驱动是通过 `MVVM` 框架实现的，在实例化的过程中，会遍历传给实例化对象的 `data` 选项，遍历其所有属性并使用 `Object.defineProperty` 把这些属性转为 `getter` 和 `setter`

同时每一个实例对象都有一个 `watcher` 实例对象，在模板编译过程中用 `getter` 访问 `data` 的属性，会把用到的 `data` 属性记为依赖，建立视图与数据之间的联系。

当视图中数据的 `setter` `被调用时，watcher` 会对比前后数值是否发生变化，然后通知视图重新渲染。

**React**

`React` 通过 `setState` 实现数据驱动视图，通过 `setState` 改变数据引发组件更新从而实现页面的重新渲染。

- `setState` 后将新的 `state` 放进组件的状态队列
- 判断当前是否处于批量更新状态
  - 是的话将需要更新的组件添加到待更新队列（`dirtyComponents`）
  - 否则立即更新并清空待更新队列

参考资料

- [当面试官让我回答 React 和 Vue 框架的区别......](https://juejin.cn/post/7144648542472044558)

## 虚拟 DOM

### 虚拟 DOM 是什么

`React.createElement` 生成的对象，包含标签类型 `type`、属性 `props` 和子元素 `children` 等。

### 虚拟 DOM 有什么优势（解决了什么问题）

1. **高效的对比更新**

原生 `DOM` 节点属性较多，对比效率慢，虚拟 `DOM` 更聚焦于对比会发生改变的属性，例如`props`、`state`。

2. **兼容性更好**

虚拟 `DOM` 虽然模仿原生 `DOM` 的行为，但是在事件方面，`React` 暴露给我们的是合成事件，在底层关联多个原生事件，这种做法抹平了不同浏览器之间的 `api` 差异，具备更好的兼容性。

3. **渲染优化**

虚拟 `DOM` 的提前对比结合 `React` 的异步渲染，极大的提高了渲染性能。

4. **跨平台能力**

加入虚拟 `DOM` 是为了将 `DOM` 的更新抽离成一个公共层，除了 Web 端页面同时还支持 `React Native` 做原生 app。

**总结**

最重要的功能是**减少频繁对原生 DOM 的操作，提高渲染性能**。

### 虚拟 DOM 的性能比操作原生 DOM 要快吗

不一定，如果我们要改变 `p` 标签的内容，原生 DOM 就是利用 `innerHTML` 属性，对于 React 而言要先生成虚拟 DOM，再 `diff` 对比找出变化的部分，最后再修改原生 DOM，单论这个例子来说原生 DOM 要比虚拟 DOM 快。

但是虚拟 DOM 最重要的作用就是提供一个更高效的研发模式，通过模拟原生 DOM 的大部分特性，让研发从繁琐的 DOM 操作中释放出来，专注于业务和数据的处理，同时保持一个还不错的性能。

参考资料

- [什么是虚拟 dom？虚拟 dom 比操作原生 dom 要快吗？虚拟 dom 是如何转变成真实 dom 并渲染到页面的?](https://juejin.cn/post/7120141908730445854)

## Fiber

### Fiber 是什么

#### 一个执行单元

`Fiber` 可以理解为一个大任务划分为一个个小任务，一个小任务的执行必须一次完成，中途不可暂停，每一个小任务执行完后可以移交控制权给浏览器去响应用户，处理其他事情，不用一直等待整个大任务完成后再去响应用户。

`React Fiber` 与浏览器的交互流程如下：

![React Fiber 与浏览器的交互](../image/React%20Fiber%E4%B8%8E%E6%B5%8F%E8%A7%88%E5%99%A8%E4%BA%A4%E4%BA%92%E6%B5%81%E7%A8%8B.jpg)

#### 一种数据结构

`Fiber` 可以理解为是一种数据结构，每个虚拟 `DOM` 节点都可以表示为一个 `fiber`，如下图所示，一个 `fiber` 节点包括了 `child`（第一个子节点）、`sibling`（兄弟节点）和 `return`（父节点）等属性。

![fiber数据结构](../image/fiber%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.png)

### 为什么需要 Fiber

在 `React16` 之前，每当触发一次组件的更新，`React` 都会构建一颗新的`虚拟DOM`树，与上一次的`虚拟DOM`树对比，实现对 `DOM` 的定向更新，这个同步渲染的过程是递归进行的，一旦开始就不可中断，并且会持续占用着浏览器的主线程，使得浏览器无法处理渲染之外的任何事情，导致**页面卡顿**。

为了解决**长时间占用浏览器主线程的痛点**，引入了 `Fiber` 来改变这个不可控的过程，把渲染(更新)任务拆分为许多小任务，每当执行完一个小任务都会把主线程释放，让其处理优先级更高的工作，避免同步渲染带来的卡顿。

### Fiber 执行原理

从根节点开始渲染和调度的过程可以分为两个阶段：`render` 阶段和 `commit` 阶段。

- `render` 阶段：找出所有节点的变更，此阶段可中断。
- `commit` 阶段：执行所有变更操作，此阶段不可中断。

**render 阶段**

此阶段会构建一棵 `Fiber` 树，以 `虚拟DOM` 节点为维度拆分任务，即一个 `虚拟DOM` 节点对应一个任务，在遍历 `Fiber` 树的过程（可中断）中收集节点的变更，得到一个副作用单链表，其中包含所有需要变更的节点。

**commit 阶段**

根据 `render` 阶段计算得出的副作用链表，将所有更新一次性更新到 `DOM` 树上。

参考资料

- [走进 React Fiber 的世界](https://juejin.cn/post/6943896410987659277)
- [React Fiber 很难？六个问题助你理解 React Fiber](https://juejin.cn/post/6984949525928476703)

## diff 算法

diff 算法探讨的是虚拟 DOM 树发生变化后，生成 DOM 树更新补丁的方式。它通过对比新旧两棵虚拟 DOM 树的变更差异，将更新补丁作用于真实 DOM 上，以最小成本完成视图更新。

当初次渲染生成 `fiber` 后，再次渲染会根据最新的状态数据生成新的虚拟 DOM，然后根据新的虚拟 DOM 去生成新的 `fiber`，这时候就要和之前的 `fiber` 做对比，决定如何生成新的 `fiber`，这个对比生成就是使用 `diff` 算法。

### 三个策略

#### 策略一：基于树的对比

该策略对树进行**分层比较**，即两棵树只对同一层级的节点进行比较，如果发现节点不存在，则该节点和其子节点会被完全删除，不会进一步的比较，提升了比对效率

#### 策略二：基于组件的对比

该策略根据组件的 type 去判断其树结构是否相似，如果是相似的树结构则进入树比对，否则直接替换放入补丁中。

#### 策略三：基于节点的对比

节点对比发生在同层级比较中，通过**标记节点操作**生成补丁。节点操作包含插入、移动、删除等，其中节点重新排序同时涉及插入、移动和删除三个操作，可以通过添加 key 的方式，直接移动节点，减少消耗。

### 整体流程

diff 算法采用的是**深度优先遍历**，有子节点就遍历子节点，没有子节点就遍历兄弟节点，没有兄弟节点就遍历叔叔节点（父节点的兄弟节点）。

整体流程大致如下：

1. 第一轮，对比虚拟 DOM 和老的 `fiber` 查找能复用的节点，如果可以复用则继续下一个节点，否则就结束遍历。
2. 如果第一轮结束所有的新节点都对比复用完毕，则删除没复用的旧 `fiber` 节点。
3. 如果第一轮结束还有没对比的新节点，则开始第二轮，将所有旧的 `fiber` 节点存到 Map 中，然后再将剩余的新节点去 `Map` 里查找能复用的节点（`key`）。
4. 第二轮结束，删除剩余的旧 `fiber` 节点，剩余的新节点则创建新的 `fiber` 节点。

参考资料

- [图解 React 的 diff 算法：核心就两个字 —— 复用](https://juejin.cn/post/7131741751152214030)
- [为什么 React 的 Diff 算法不采用 Vue 的双端对比算法？](https://juejin.cn/post/7116141318853623839)
- [React diff 算法的原理是什么](https://www.yuque.com/cuggz/interview/pgw8v4#5ae797bad8de984fcbd54bd94fc4b91b)

## React18 新特性

### Render API

React18 引入了一个新的 API：`createRoot()`

### setState 自动批处理

在 React18 之前，只在 React 事件函数中进行批处理更新，在 `promise`、`setTimeout` 和原生处理事件函数中都不是批处理更新（同步更新）。

如果想退出批处理更新，可以使用`flushSync`。

## SSR

服务端渲染是指在服务器中生成 HTML 片段，然后交给浏览器为其绑定状态和事件，成为可交互页面的过程。

#### 优点

- 更快的首屏加载速度：首屏渲染并不依赖于 js 文件，无需等待 js 文件的下载和执行，缩短白屏时间
- 有利于 SEO：不同于客户端渲染返回地 HTML 文档中的节点是空的，服务器返回的是内容完整的 HTML 文档，能更好地被爬虫分析和索引

#### 缺点

- 服务端压力大

## dvajs

`dvajs` 是一个基于 `redux` 和 `redux-saga` 的二次封装的状态管理库。

### 核心概念

- State： 一个对象，保存整个应用的状态
- Action：一个对象，描述事件行为
- Reducer：Action 处理器，处理同步行为，用于计算生成最新的 state
- Effect：Action 处理器，处理异步行为

### 数据流向

数据的改变发生通常是通过用户交互行为或者浏览器行为（如路由跳转等）触发的，当此类行为会改变数据的时候可以通过 `dispatch` 发起一个 `action`，如果是同步行为会直接通过 `Reducer` 改变 `State` ，如果是异步行为（副作用）会先触发 `Effect` 然后流向 `Reducer` 最终改变 `State`

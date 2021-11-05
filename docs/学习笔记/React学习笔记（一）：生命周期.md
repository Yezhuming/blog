# React学习笔记（一）：生命周期

本文从以下几个方面展开：
 - React15生命周期流程
 - React16打算废弃的生命周期方法
 
## 一、React15有哪些生命周期
React15生命周期方法和流程。

![](https://static01.imgkr.com/temp/b8a5eea8b0c74593a8a18ec64a157d92.png)

 - `constructor()`
 - `componentWillReceiveProps()`
 - `shouldComponentUpdate()`
 - `componentWillMount()`
 - `componentWillUpdate()`
 - `componentDidUpdate()`
 - `componentDidMount()`
 - `render()`
 - `componentWillUnmount()`
 
---

## 二、React16生命周期有何变化

![](https://static01.imgkr.com/temp/94103d2f475341a39505a2b801e9abb6.png)

对比一下React16的生命周期流程图，有以下几点变化：
 - 废弃挂载阶段生命周期方法`componentWillMount`
 - 挂载阶段用`getDerivedStateFromProps`替换`componentWillReceiveProps`
 - 更新阶段用`getSnapshotBeforeUpdate`替换`componentWillUpdate`
 
### 为何用getDerivedStateFromProps替换componentWillReceiveProps

首先了解`componentWillReceiveProps`方法，该方法是在父组件导致组件重新渲染时触发的，用于更新`state`以响应`props`的改变。

注意：如果父组件导致组件重新渲染，即使 props 没有更改，也会调用此方法。如果只想处理更改，请确保进行当前值与变更值的比较。

```js
// 父组件
class HomePage extends React.Component {
  state = {
    ownText: '父组件自身的文本',
    text: '传给子组件的文本',
  };

  /** 修改父组件自身的文本 */
  changeOwnText = () => {
    console.log('触发changeOwnText方法');
    this.setState({
      ownText: '修改后的父组件文本',
    });
  };

  render() {
    const { ownText, text } = this.state;
    return (
      <div className="fatherContainer">
        <button type="button" onClick={this.changeOwnText}>
          修改父组件文本内容
        </button>
        <div>
          父组件内容：
          {ownText}
        </div>
        <App text={text} />
      </div>
    );
  }
}

// 子组件
class App extends React.Component {
  /** 父组件导致组件更新时触发 */
  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps方法执行');
    console.log(nextProps, this.props);
  }

  render() {
    const { text } = this.props;
    return (
      <div>
        子组件内容：
        {text}
      </div>
    );
  }
}
```

![](https://static01.imgkr.com/temp/35c7b8c6daba4a1c9c4c5764f7842222.png)

触发了`changOwnText`方法后，只有改变了父组件的`ownText`，子组件的props并没有发生变化，但是`componentWillReceiveProps`方法也被触发了。

再来了解getDerivedStateFromProps，它的用途为使用`props`来派生/更新`state`。

这个新的生命周期方法的调用规则如下：
```js
static getDerivedStateFromProps(props, state) {
  return {...}
}
```

这个方法接受两个参数：`props`和`state`，分别是来自父组件的`props`和自身的`state`。

调用该方法有三点需要注意，一是从`static`可以看出这个方法是一个静态方法，不依赖组件实例而存在，因此在方法内部是访问不到`this`的。

```js
static getDerivedStateFromProps(props, state) {
  console.log(this); // undefined
  return null;
}
```

二是该方法需要返回一个对象，用于更新组件自身的`state`，如果不需要通过`props`来更新`state`，最好不使用这个方法，或者返回一个`null`，否则会被警告。

![](https://static01.imgkr.com/temp/868d8a00b711450896d08a993ea94a05.png)

三是该方法通过返回对象来更新`state`并非是覆盖性更新，而是定向更新。

```js
constructor(props) {
  super(props);
  this.state = {
    appText: '子组件自身的文本',
  };
}

static getDerivedStateFromProps(props, state) {
  return {
    derivedText: 'getDerivedStateFromProps方法更新的文本',
  };
}
```

把`state`打印出来会看到`state`中原本存在的`appText`并不会被覆盖，而是多出来一个`derivedText`属性。


![](https://static01.imgkr.com/temp/93f63a04445d4528871722534b040b55.png)

`getDerivedStateFromProps`这个API相对于`componentWillReceiveProps`来说，是一个功能更单一的方法，由于无法获取到组件实例而无法调用实例的各种方法，只能完成从`props`派生`state`这一操作，从根源上帮开发者避免不合理的编程方式，避免生命周期的滥用。

### 为何用getSnapshotBeforeUpdate替换componentWillUpdate

首先认识一下这个新的API，`getSnapshotBeforeUpdate`的调用规则如下：
```js
getSnapshotBeforeUpdate(prevProps, prevState) {
  return ...
}
```

该API需要返回一个值，该值可以是任何值，返回的值作为`componentDidUpdate`的第三个参数。

```js
/** 组件更新时调用 */
getSnapshotBeforeUpdate(prevProps, prevState) {
  console.log('getSnapshotBeforeUpdate方法执行');
  return 'getSnapshotBeforeUpdate返回值';
}

/** 组件更新后调用 */
componentDidUpdate(prevProps, prevState, valueFromSnapshot) {
  console.log('componentDidUpdate方法执行');
  console.log('从 getSnapshotBeforeUpdate 获取到的值是', valueFromSnapshot);
}
```

![](https://static01.imgkr.com/temp/e4d2ae6094fd4ca685a5f1222e539683.png)

生命周期方法替换的原因是为**Fiber架构**铺路。

### Fiber架构简析

**Fiber** 是React16对核心算法的一次重写，核心是 **Fiber** 会使原本同步的渲染过程变成异步。

在React16之前，每当触发一次组件的更新，React都会构建一棵新的虚拟DOM树，通过与旧的虚拟DOM树diff，实现对真实DOM的定向更新，整个过程漫长且不可打断，而 **Fiber** 会将一个大的任务拆分成多个小任务，每当渲染线程执行完一个小任务都会把主线程释放去执行优先级更高的任务，这样渲染过程变成了可打断的。

由于渲染过程变成了可打断，生命周期也因此划分为`render`阶段和`commit`阶段，而`commit`阶段又细分为`pre-commit`和`commit`。

![](https://static01.imgkr.com/temp/062ef0134f7041029d6cfef2e7bdb9b1.png)

从图中得知，`render`阶段是可以被打断的，而`commit`阶段是同步执行的。

再来看React16打算废弃的三个生命周期：
 - componentWillMount
 - componentWillUpdate
 - componentWillReceiveProps
 
这三个生命周期方法都是在`render`阶段触发的，由于`render`阶段会重复被打断、重启这一过程，当一个任务被打断重启时会重新执行一遍任务，在这种情况下，这几个API都有可能会重复执行多次而导致严重的Bug。
 
总结：React16生命周期的变化都是因为这几个方法不适用于新引入的Fiber架构。
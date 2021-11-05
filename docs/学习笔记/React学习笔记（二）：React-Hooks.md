# React学习笔记（二）：React-Hooks

`React-Hooks`的使用规则如下：
 - 只在 React 函数中调用`Hook`
 - 不要在循环、条件或嵌套函数中调用`Hook`

## 一、在循环、条件或嵌套函数中调用Hook会有什么问题？
```js
const App = () => {
  const [name, setName] = useState("汤姆");

  const [age] = useState(999);
  console.log("age", age);

  return (
    <div className="personalInfo">
      <p>姓名：{name}</p>
      <p>年龄：{age}</p>
      <button
        onClick={() => {
          setName("杰瑞");
        }}
      >
        修改姓名
      </button>
    </div>
  );
};
```

![](https://static01.imgkr.com/temp/3125bccc9b524b64a672ad5c94c0c415.png)

点击修改名字后。

![](https://static01.imgkr.com/temp/07d7d276c3bb415fa08cdb6fcf65ff68.png)

把`useState`放到条件函数中。

```js
let isMounted = false;

const App = () => {
  let name, setName;

  // 首次渲染
  if (!isMounted) {
    // eslint-disable-next-line
    [name, setName] = useState("汤姆");
    isMounted = true;
  }

  const [age] = useState(999);
  console.log("age", age);

  return (
    <div className="personalInfo">
      <p>姓名：{name}</p>
      <p>年龄：{age}</p>
      <button
        onClick={() => {
          setName("杰瑞");
        }}
      >
        修改姓名
      </button>
    </div>
  );
};
```

初次渲染一样，点击修改名字会报错：期望的`Hooks`变少了。

![](https://static01.imgkr.com/temp/5233a043114140e3a2813345bd99737d.png)

**注意**：`age`变成了通过`setName`设置的值。

## 二、为什么需要这条规则来限制Hooks的使用

首次渲染时`useState`的调用链路如下图：

![](https://static01.imgkr.com/temp/79b6aecc0f2a40358024ae3531ec910f.png)

```ts
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 将新的 hook 对象追加进链表尾部
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }
  // 保存传进来的initialState
  hook.memoizedState = hook.baseState = initialState;
  const queue = (hook.queue = {
    pending: null,
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  });
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ): any));
  // 返回目标数组，分别对应state和setState
  return [hook.memoizedState, dispatch];
}
```

`mountState`的作用是初始化`Hooks`，并返回目标数组，数组中的值分别是`state`和`setState`，初始化过程中有一个`mountWorkInProgressHook`方法

```ts
function mountWorkInProgressHook(): Hook {
  // 单个hook以对象形式存在
  const hook: Hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null,
  };

  if (workInProgressHook === null) {
    // 若链表为空，将 hook 作为链表的头节点处理
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 若链表不为空，则将 hook 追加到链表尾部
    workInProgressHook = workInProgressHook.next = hook;
  }
  // 多个workInProgressHook构建链表
  return workInProgressHook;
}
```

更新时`useState`的调用链路如下图：

![](https://static01.imgkr.com/temp/5e6ee83be41c4fbeb87d8149b717919a.png)

`updateReducer`的工作是**按顺序去遍历之前构建好的链表，取出对应的数据信息进行渲染**。

上面例子会报错是因为更新时读取的链表与首次渲染构建的链表长度不一样，所以会提示`hooks`比期望的少的错误。

回到上面的例子，首次渲染一共调用了两次`useState`。

![](https://static01.imgkr.com/temp/dadd738289f741418551c2bd4f9ce63a.png)

当点击修改名字后，发生第二次渲染，这时候只调用了一次`useState`。

![](https://static01.imgkr.com/temp/d514117686dc4e4380eaf70d4039df4c.png)

React不会根据声明的`name`和`age`去取对应的值，而是根据索引去取值，二次渲染时只有一个`hook`，`age`就会取链表第一个`hook`对象的值（name）。

总结：`Hooks`的本质是链表，这条规则是为了确保`Hooks`在每一次渲染中都按照同样的顺序被调用，这样取值时才不会发生错误。
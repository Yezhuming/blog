# JavaScript 手写题

## call、apply 和 bind

### 手写 call

```js
/**
 * 1. 判断传进来的上下文类型，如果是 undefined 或 null 的话指向window
 * 2. 改变this指向
 * 3. 执行函数并返回执行结果
 */
Function.prototype._call = function (context, ...args) {
  // 判断传进来的上下文类型，如果是undefined或者 null 指向window
  // 否则使用 Object() 将上下文包装成对象，否则context为基本类型时会报错
  const ctx = context == undefined ? window : Object(context);
  // 把函数foo的this 指向 ctx这个上下文
  // 把函数foo赋值给对象ctx的一个属性  用这个对象ctx去调用foo(ctx.foo())，foo中的this就指向了这个对象ctx
  // 给ctx新增一个独一无二的属性以免覆盖原有属性
  const fn = Symbol();
  ctx[fn] = this; // this即调用call的函数
  // 立即执行一次
  const result = ctx[fn](...args);
  // 删除这个属性
  delete ctx[fn];
  // 把函数的返回值赋值给_call的返回值
  return result;
};
```

### 手写 apply

```js
// 只需要把第二个参数改成数组形式就可以了。
Function.prototype._apply = function (context, array = []) {
  const ctx = context == undefined ? window : Object(context);
  const key = Symbol();
  ctx[key] = this;
  const result = ctx[key](...array);
  delete ctx[key];
  return result;
};
```

### 手写 bind

```js
Function.prototype.myBind = function (context, ...args) {
  const ctx = context == undefined ? window : Object(context);
  // 创造唯一的key值  作为我们构造的context内部方法名
  const fn = Symbol();
  // 这里this为调用bind的函数
  const _this = this;
  //  bind情况要复杂一点
  const newFn = function (...innerArgs) {
    // 第一种情况 :若是将 bind 绑定之后的函数当作构造函数
    // 通过 new 操作符使用，则不绑定传入的 this，而是将 this 指向实例化出来的对象
    // this.__proto__ === newFn.prototype
    if (this instanceof newFn) {
      // 此时this指向指向用newFn创建的实例  这时候不需要改变this指向
      this[fn] = _this;
      this[fn](...args, ...innerArgs);
      delete this[fn];
    } else {
      // 第二种情况：作为普通函数调用，直接改变this指向为传入的context
      // 相当于context.fn(),此时fn中的this指向context
      ctx[fn] = _this;
      ctx[fn](...args, ...innerArgs);
      delete ctx[fn];
    }
  };
  // 如果绑定的是构造函数 那么需要继承构造函数原型属性和方法
  newFn.prototype = Object.create(this.prototype);
  return newFn;
};

// 用法如下
// function Person(name, age) {
//   console.log(name); // '我是参数传进来的name'
//   console.log(age); // '我是参数传进来的age'
//   console.log(this); // 构造函数this指向实例对象
// }
// // 构造函数原型的方法
// Person.prototype.say = function() {
//   console.log(123);
// }
// let obj = {
//   objName: '我是obj传进来的name',
//   objAge: '我是obj传进来的age'
// }

// 作为构造函数调用
// let bindFun = Person.myBind(obj, '我是参数传进来的name')
// let a = new bindFun('我是参数传进来的age')
// a.say() //123
// let b = new bindFun('bbb');
// b.say();

// 普通函数
// function normalFun(name, age) {
//   console.log(name);   // '我是参数传进来的name'
//   console.log(age);   // '我是参数传进来的age'
//   console.log(this); // 普通函数this指向绑定bind的第一个参数 也就是例子中的obj
//   console.log(this.objName); // '我是obj传进来的name'
//   console.log(this.objAge); // '我是obj传进来的age'
// }
// let bindFun = normalFun.myBind(obj, '我是参数传进来的name')
// bindFun('我是参数传进来的age');
// bindFun('我是参数传进来的age111');
```

参考资料

- [【面试题解】你了解 call，apply，bind 吗？那你可以手写一个吗？](https://juejin.cn/post/7030759884542967821)

## 手写 new

```js
const _new = (fn, ...args) => {
  // 1.创建空对象并继承构造函数原型属性和方法
  // 相当于：
  // const obj = {};
  // obj._proto_ = fn.prototype;
  const obj = Object.create(fn.prototype);
  // 2.将构造函数的this指向生成的对象
  const res = fn.call(obj, ...args);
  // 3.判断res类型并返回
  // 六种基本类型：null undefined string number symbol boolean 返回生成的对象
  // {}, function(){}, new Date(), [], new Error(), /a/ 返回构造函数显式return的值
  if (res && (typeof res === "object" || typeof res === "function")) return res;

  return obj;
};
```

## 手写 Promise

- [手写 Promise](../JavaScript/手写Promise.md)

## 防抖

```js
/**
 * @param {Function} fn 回调函数
 * @param {*} delay 延迟事件
 * @param {*} leading 是否延迟开始前调用函数
 * @param {*} trailing 是否延迟开始后调用函数
 */
const debounce = (fn, delay = 1000, leading = false, trailing = true) => {
  let timer = null;
  let isInvoke = false;
  return function (...args) {
    if (timer) clearTimeout(timer);
    if (leading && !isInvoke) {
      fn.call(this, ...args);
      isInvoke = true;
    } else {
      timer = setTimeout(() => {
        if (trailing) fn.call(this, ...args);
        isInvoke = false;
      }, delay);
    }
  };
};
```

## 节流

#### 时间戳

```js
const throttle = (fn, delay) => {
  let start = Date.now();
  return function (...args) {
    let end = Date.now();
    if (end - start >= delay) {
      fn.call(this, ...args);
      // 执行一次后重新计算start
      start = Date.now();
    }
  };
};
```

#### 定时器

```js
const throttle = (fn, delay) => {
  let timer = null;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.call(this, ...args);
        timer = null;
      }, delay);
    }
  };
};
```

## 实现有并行限制的 Promise 调度器

```js
class Scheduler {
  constructor(limit) {
    // 初始化队列
    this.queue = [];
    // 最多同时运行的任务数量
    this.limit = limit;
    // 正在运行的任务数量
    this.runCount = 0;
  }
  // 新增任务
  add(time, order) {
    const promiseCreator = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(order);
          resolve();
        }, time);
      });
    };
    this.queue.push(promiseCreator);
  }
  // 根据并行数量限制开始执行任务
  taskStart() {
    for (let i = 0; i < this.maxCount; i++) {
      this.run();
    }
  }
  // 运行任务
  run() {
    if (!this.queue.length || this.runCount > this.limit) return;
    // 运行任务数量+1
    this.runCount++;
    // 取出队头任务并执行
    this.queue
      .shift()()
      .then(() => {
        this.runCount--;
        this.run();
      });
  }
}
```

## 深克隆

```js
const isObject = (val) => val && typeof val === "object";

const deepClone = (obj, hash = new WeakMap()) => {
  // 非对象直接返回值
  if (!isObject(obj)) return obj;
  // 解决循环引用  当obj为源对象，那么在第一次调用函数时就将obj,target设置到hash中，这里直接返回target即可
  if (hash.has(obj)) return hash.get(obj);
  // 区分数组和对象
  const target = Array.isArray(obj) ? [] : {};
  hash.set(obj, target);
  // Reflect.ownKeys 的返回值等同于Object.getOwnPropertyNames加上Object.getOwnPropertySymbols的结果
  Reflect.ownKeys(obj).forEach((item) => {
    if (isObject(obj[item])) {
      target[item] = deepClone(obj[item], hash);
    } else {
      target[item] = obj[item];
    }
  });

  return target;
};
```

## 虚拟 DOM 转真实 DOM（render）

```js
const _render = (vnode) => {
  if (typeof vnode === "number") {
    vnode = String(vnode);
  }

  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }
  // 创建html节点
  const node = document.createElement(vnode.tag);
  // 设置节点属性
  if (vnode.attrs) {
    Object.keys(vnode.attrs).forEach((attr) => {
      document.setAttribute(attr, vnode.attrs[attr]);
    });
  }
  // 子节点递归执行相同操作
  vnode.children.forEach((child) => dom.appendChild(_render(child)));
  // 返回根节点
  return node;
};
```

## 发布订阅模式

```js
class EventEmitter {
  constructor() {
    this.events = {};
  }
  // 订阅
  on(type, callback) {
    if (!this.events[type]) {
      this.events[type] = [];
    }
    this.events[type].push(callback);
  }
  // 取消订阅
  off(type, callback) {
    if (this.events[type]) {
      const index = this.events[type].indexOf(callback);
      if (index !== -1) {
        this.events[type].splice(index, 1);
      }
    }
  }
  // 订阅后只触发一次
  once(type, callback) {
    const fn = (...args) => {
      callback(...args);
      // 执行一次后取消订阅
      this.off(type, fn);
    };
    this.on(type, fn);
  }
  // 发布
  emit(type, ...args) {
    if (this.events[type]) {
      // 做一次浅拷贝，主要目的是为了避免通过 once 安装的监听器在移除的过程中出现顺序问题
      const handles = this.events[type].slice();
      handles.forEach((fn) => {
        fn(...args);
      });
    }
  }
}

// export default new EventEmitter();
```

## 手写 instanceof

```js
const _instanceof = (A, B) => {
  // A 为null或undefined，B不是函数时抛出错误
  if (A == null || typeof B !== "function") {
    throw Error("TypeError");
  }
  // A为基本类型时都返回false
  if (typeof A !== "object" && typeof A !== "function") {
    return false;
  }

  let proto = A.__proto__;
  while (true) {
    // 找到原型链终点
    if (proto === null) return false;

    if (proto === B.prototype) return true;
    // 原型链逐层查找
    proto = proto.__proto__;
  }
};
```

## 函数柯里化

```js
function creatCurry(fn) {
  // 获取fn函数的参数长度
  const fnArgsLength = fn.length;
  let args = [];

  return function calc(...innerArgs) {
    // 收集参数
    args = [...args, ...innerArgs];

    if (args.length < fnArgsLength) {
      // 参数未收集完，继续收集
      return calc;
    } else {
      // 参数收集完，执行函数返回结果
      return fn.apply(this, ...args);
    }
  };
}
```

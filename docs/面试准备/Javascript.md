# JavaScript

### 手写 call

```js
/**
 * 1.如果传入的是值类型 会返回对应类型的构造函数创建的实例
 * 2.如果传入的是对象 返回对象本身
 * 3.如果传入 undefined 或者 null 会返回空对象
 */
Function.prototype._call = function (ctx, ...args) {
  // 判断上下文类型 如果是undefined或者 null 指向window
  // 否则使用 Object() 将上下文包装成对象
  const o = ctx == undefined ? window : Object(ctx);
  // 把函数foo的this 指向 ctx这个上下文
  // 把函数foo赋值给对象o的一个属性  用这个对象o去调用foo(o.foo())  this就指向了这个对象o
  // 下面的this就是调用_call的函数(foo)  我们把this给对象o的属性fn 就是把函数foo赋值给了o.fn
  // 给context新增一个独一无二的属性以免覆盖原有属性
  const fn = Symbol();
  o[fn] = this; // this即调用call的函数
  // 立即执行一次
  const result = o[fn](...args);
  // 删除这个属性
  delete o[fn];
  // 把函数的返回值赋值给_call的返回值
  return result;
};
```

### 手写 apply

```js
// 只需要把第二个参数改成数组形式就可以了。
Function.prototype._apply = function (ctx, array = []) {
  const o = ctx == undefined ? window : Object(ctx);
  const key = Symbol();
  o[key] = this;
  const result = o[key](...array);
  delete o[key];
  return result;
};
```

### 手写 bind

```js
Function.prototype.myBind = function (context, ...args) {
  if (!context || context === null) {
    context = window;
  }
  // 创造唯一的key值  作为我们构造的context内部方法名
  const fn = Symbol();
  const _this = this;
  //  bind情况要复杂一点
  const newFn = function (...innerArgs) {
    // 第一种情况 :若是将 bind 绑定之后的函数当作构造函数
    // 通过 new 操作符使用，则不绑定传入的 this，而是将 this 指向实例化出来的对象
    // this.__proto__ === newFn.prototype
    if (this instanceof newFn === true) {
      // 此时this指向指向用newFn创建的实例  这时候不需要改变this指向
      this[fn] = _this;
      this[fn](...[...args, ...innerArgs]); //这里使用es6的方法让bind支持参数合并
      delete this[fn];
    } else {
      // 如果只是作为普通函数调用  那就很简单了 直接改变this指向为传入的context
      // 相当于context.fn(),此时fn中的this指向context
      context[fn] = _this;
      context[fn](...[...args, ...innerArgs]);
      delete context[fn];
    }
  };
  // 如果绑定的是构造函数 那么需要继承构造函数原型属性和方法
  newFn.prototype = Object.create(this.prototype);
  return newFn;
};

//用法如下
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

### 手写 new

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

### 手写 Promise

- [手写 Promise](JavaScript/手写Promise.md)

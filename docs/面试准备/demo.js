Function.prototype.myBind = function (context, ...args) {
  context = context == undefined ? window : Object(context);
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
      context[fn] = _this;
      context[fn](...args, ...innerArgs);
      delete context[fn];
    }
  };
  // 如果绑定的是构造函数 那么需要继承构造函数原型属性和方法
  newFn.prototype = Object.create(this.prototype);
  return newFn;
};

// 用法如下
// let obj = {
//   objName: '我是obj传进来的name',
//   objAge: '我是obj传进来的age'
// }

// 普通函数
function normalFun(name, age) {
  console.log(name);   // '我是参数传进来的name'
  console.log(age);   // '我是参数传进来的age'
  console.log(this); // 普通函数this指向绑定bind的第一个参数 也就是例子中的obj
  console.log(this.objName); // '我是obj传进来的name'
  console.log(this.objAge); // '我是obj传进来的age'
}
let bindFun = normalFun.myBind(11, '我是参数传进来的name')
bindFun('我是参数传进来的age');
bindFun('我是参数传进来的age111');
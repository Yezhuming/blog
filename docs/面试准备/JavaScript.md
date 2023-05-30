# JavaScript

## 原型与原型链

当一个对象查找方法和属性时会先从**自身**查找，如果找不到就会通过`__proto__`访问**被实例化的构造函数**的`prototype`，这个就是**原型对象**。除了最顶层的 `Object` 原型对象的`__proto__`为 null，其余对象都有`__proto__`指向上层原型对象，而**原型链**就是通过`__proto__`连接形成的。

![原型链](../image/js%E5%8E%9F%E5%9E%8B%E9%93%BE.png)

```js
Array.a = 1;
Array.prototype.a = 2;
Function.prototype.a = 3;
Object.prototype.a = 4;
var arr = [];
console.log(arr.a); // 2
console.log(arr.length.a); // 4 arr.length为Number，往上查找到Object的prototype
console.log(arr.forEach.a); // 3 arr.forEach为Function
console.log(Function.a); // 3 Function.__proto__ === Function.prototype
console.log(Object.a); // 3 Object.__proto__ === Function.prototype
```

## 箭头函数与普通函数有什么区别

- 箭头函数没有自己的 `this`，在声明时继承上层作用域的 `this`，并且无法使用 `call`、`apply`、`bind` 改变 `this` 指向
- 箭头函数没有 `prototype`
- 箭头函数不能作为构造函数使用
- 箭头函数没有 `arguments`

## 判断数据类型的方式

### typeof

```js
console.log(typeof 1); // number
console.log(typeof "1"); // string
console.log(typeof true); // boolean
console.log(typeof undefined); // undefined
console.log(typeof Symbol(1)); // symbol
console.log(typeof []); // object
console.log(typeof null); // object
console.log(typeof function fn() {}); // function
```

总结：

- `typeof` 可以准确判断除 `null` 之外的基本数据类型

### instanceof

`instanceof` 用于检测构造函数的 `prototype` 属性是否存在某个实例对象的原型链上

```js
console.log(123 instanceof Number); // false
console.log("123" instanceof String); // false
console.log(true instanceof Boolean); // false
console.log(Symbol(123) instanceof Symbol); // false
console.log([] instanceof Array); // true
console.log({} instanceof Object); // true
console.log(function () {} instanceof Function); // true
console.log(undefined instanceof undefined); // TypeError: Right-hand side of 'instanceof' is not an object
console.log(null instanceof null); // TypeError: Right-hand side of 'instanceof' is not an object
console.log(new Date() instanceof Date); // true
console.log(/\d/g instanceof RegExp); // true
console.log(new Error() instanceof Error); // true
```

总结：

- 不能检测基本数据类型，因为基本数据类型并不是构造函数的实例，没有原型链
- 因为原型链的终点都是 `Object.prototype`，所以 `instanceof Object` 始终为 `true`
- 原型链可以被修改，结果不一定准确

### constructor

用于判断操作值是否是指定构造函数的实例

```js
console.log((123).constructor); // Number
console.log("123".constructor); // String
console.log(true.constructor); // Boolean
console.log(Symbol(123).constructor); // Symbol
console.log([].constructor); // Array
console.log({}.constructor); // Object
console.log(function () {}.constructor); // Function
console.log(undefined.constructor); // TypeError: Cannot read properties of undefined (reading 'constructor')
console.log(null.constructor); // TypeError: Cannot read properties of null (reading 'constructor')
console.log(new Date().constructor); // Date
console.log(/\d/g.constructor); // RegExp
console.log(new Error().constructor); // Error
```

总结：

- 可以判断除 `null` 和 `undefined` 之外的所有数据类型
- 基本数据类型在获取 `constructor` 时会自动将其转为包装对象实例，并在使用后立即销毁
- `constructor` 可以被修改，结果不一定准确

### Object.prototype.toString

返回对象的类型字符串

```js
console.log(Object.prototype.toString.call(123)); // '[object Number]'
console.log(Object.prototype.toString.call("123")); // '[object String]'
console.log(Object.prototype.toString.call(true)); // '[object Boolean]'
console.log(Object.prototype.toString.call(Symbol(123))); // '[object Symbol]'
console.log(Object.prototype.toString.call([])); // '[object Array]'
console.log(Object.prototype.toString.call({})); // '[object Object]'
console.log(Object.prototype.toString.call(function () {})); // '[object Function]'
console.log(Object.prototype.toString.call(undefined)); // '[object Undefined]'
console.log(Object.prototype.toString.call(null)); // '[object Null]'
console.log(Object.prototype.toString.call(new Date())); // '[object Date]'
console.log(Object.prototype.toString.call(/\d/g)); // '[object RegExp]'
console.log(Object.prototype.toString.call(new Error())); // '[object Error]'
```

总结：可以准确判断所有数据类型

## 为什么 0.1+0.2!==0.3

因为在 JavaScript 中，浮点数会转化为二进制数进行存储，由于存储的长度有限，就会有数据的舍入而导致精度丢失，所以在浮点数的计算中都会有精度丢失。

浮点数值的最高精度是 17 位小数，在有限的精度内无法准确取到 0.1 和 0.2 的二进制数，因此两个有误差的数相加不等于 0.3

解决方法

1. 将小数转换成整数

```js
function add(num1, num2) {
  // 转换成字符串，得到小数部分的长度
  const Decimal1 = (num1.toString().split(".")[1] || "").length;
  const Decimal2 = (num2.toString().split(".")[1] || "").length;
  // 取两个数字的最大值
  const baseNum = Math.pow(10, Math.max(Decimal1, Decimal2));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
// add(0.1, 0.2) === 0.3
// 相当于
(0.1 * 10 + 0.2 * 10) / 10 === 0.3; // true
```

## 设计模式

- 单一功能原则：函数内只实现单一的功能
- 开放封闭原则：对**拓展**开放，对**修改**封闭

### 工厂模式（简单工厂）

将创建对象的过程单独封装。

```js
function User(name , age, career, work) {
  this.name = name
  this.age = age
  this.career = career
  this.work = work
}

function Factory(name, age, career) {
  let work
  switch(career) {
    case 'coder':
      work =  ['写代码','写系分', '修Bug']
      break
    case 'product manager':
      work = ['订会议室', '写PRD', '催更']
      break
    case 'boss':
      work = ['喝茶', '看报', '见客户']
    case 'xxx':
      // 其它工种的职责分配
      ...

  return new User(name, age, career, work)
}
```

### 工厂模式（抽象工厂）

围绕一个超级工厂创建其他工厂。

四个关键角色：

- 抽象工厂：抽象类，不能被用于生成具体实例
- 具体工厂：继承自抽象工厂，实现抽象工厂里的实例方法，用于生成具体产品的类
- 抽象产品：抽象类，不能被用于生成具体实例
- 具体产品：继承自抽象产品

### 单例模式

保证一个类仅有**一个实例**，并提供一个全局访问点。

使用场景：

- Redux：一个全局的 Store 用于存储应用的所有状态
- Storage：基于 localStorage 的实例
- Modal：全局的模态框

### 原型模式

在原型模式下，当我们要创建一个对象时，会先找到一个对象作为原型，然后通过克隆原型的方式来创建出一个与原型一样（共享一套数据/方法）的对象。`Object.create` 方法就是原型模式的天然实现

### 装饰器模式

在不改变源对象的基础上，通过对其进行包装拓展，使原有对象能满足更复杂的需求。

用法：

1. 给一个类添加装饰器

```js
function classDecorator(target) {
  target.hasDecorator = true;
  return target;
}

// 将装饰器“安装”到Button类上
@classDecorator
class Button {
  // Button类的相关逻辑
}
```

2. 给方法添加装饰器

```js
/**
 * target 类的原型对象，在此处为Button.prototype
 * name 修饰的目标属性属性名
 * descriptor 属性描述对象，专门用来描述对象的属性，它由各种各样的属性描述符组成，这些描述符又分为数据描述符（value、writable、enumerable和configurable）和存取描述符（get、set）
 **/

function funcDecorator(target, name, descriptor) {
  let originalMethod = descriptor.value;
  descriptor.value = function () {
    console.log("我是Func的装饰器逻辑");
    return originalMethod.apply(this, arguments);
  };
  return descriptor;
}

class Button {
  @funcDecorator
  onClick() {
    console.log("我是Func的原有逻辑");
  }
}
```

使用场景：

- HOC：拓展组件功能
- Redux：connect 方法

### 观察者模式

定义了一种**一对多**的依赖关系，让多个观察者同时监听同一个目标对象，当这个目标对象的状态发生变化时，会通知所有观察者对象，使它们能够自动更新。

**与发布-订阅模式的区别**

发布-订阅模式下**发布者不直接触及到订阅者**、而是由统一的**第三方**来完成实际通信的操作；而观察者模式下，被观察者需要维护一套观察者的集合，并实现统一的方法供观察者调用。

## 闭包

闭包是指**有权访问另一个函数作用域中变量的函数**。

内部函数总是可以访问外部函数的变量，当通过调用一个外部函数返回一个内部函数后，即使外部函数已经执行结束，但是内部函数引用外部函数的变量始终保存在内存中。

## 继承

- extend(ES6)
- 原型链：将父类创建的实例赋值给子类构造函数的`prototype`，实现重写原型对象
- 借用构造函数：在子类的构造函数中通过`call`调用父类构造函数
- 组合继承：同时使用原型链和借用构造函数两种方法，通过原型链继承原型属性和方法，通过构造函数继承实例属性
- 原型式继承：`Object.create(新对象原型，为新对象定义额外属性的对象)`

## 内存机制

在 `Javascript` 的执行过程中，主要有三种内存空间，分别是代码空间、栈空间和堆空间。

- 代码空间：用来存放可执行代码。
- 栈空间：一块连续的内存区域，容量较小，读取速度快。
- 堆空间：不连续的内存区域，容量较大，用于储存大数据，读取速度慢。

### 栈空间

栈空间其实就是 `Javascript` 中的调用栈，用来储存执行上下文，以及储存执行上下文中的一些基本类型中的小数据，如下图所示：

![栈空间](../image/%E6%A0%88%E7%A9%BA%E9%97%B4.png)

- 变量环境：存放 `var` 声明与函数声明的变量空间，编译时就能确定，不受块级作用域影响。
- 词法环境：存放 `let` 与 `const` 声明的变量空间，编译时不能完全确定，受块级作用域影响。

### 堆空间

用来储存大数据如引用类型，然后把它们的引用地址保存到栈空间的变量中，由于多了这一道中转，`Javascript` 对堆空间的读取自然会比栈空间数据要慢，两者关系如下图所示：

![堆空间](../image/%E5%A0%86%E7%A9%BA%E9%97%B4.png)

### 堆栈存放的数据类型

**少部分原始类型的数据存放在栈中，引用类型的数据存放在堆中**。

栈空间中的基本类型储存位置如下：

类型 | 储存位置

| 类型      | 储存位置                                                    |
| --------- | ----------------------------------------------------------- |
| Number    | smi(-2³¹ 到 2³¹-1 的整数) 储存在栈中，heapNumber 储存在堆中 |
| String    | 堆                                                          |
| Boolean   | 堆                                                          |
| Null      | 堆                                                          |
| Undefined | 堆                                                          |
| BigInit   | 堆                                                          |
| Symbol    | 堆                                                          |

## 垃圾回收

### 垃圾回收策略

#### 标记清除算法（大多数浏览器在使用）

标记清除算法分为**标记**和**清除**两个阶段，标记阶段即为所有非活动对象做上标记，清除阶段则把带标记的值（即非活动对象）销毁。

引擎在执行标记清除算法时，需要从出发点去遍历内存中所有对象去打标记，而这个出发点有很多，称之为**根对象**，其实就是浏览器环境中的**全局 Window 对象**、**文档 DOM 对象**等。

**优点**

实现简单，一位二进制位即可标记

**缺点**

- 内存碎片化：清除之后剩余对象的内存位置是不变的，导致空闲内存空间不连续。
- 分配速度慢

**优化**

采用**标记整理算法**，在标记后将活动对象移至内存的一端，再清除非活动对象，这样空闲内存就是连续的。

#### 引用计数法

该策略是跟踪记录每个变量值被引用的次数，当这个值的引用次数为 0 时，说明这个值没有被引用，立即回收对应的内存空间。

**优点**

垃圾产生的时候会立刻回收，不需要像标记清除每隔一段时间进行一次。

**缺点**

- 计数器：计数器需要的内存无法估计，因为不知道被引用数量的上限。
- 循环引用：循环引用的变量值无法回收。

### 栈空间回收

调用栈中有一个记录当前执行状态的指针，随着函数的执行，函数执行上下文会被压入调用栈中，执行上下文中的数据会被分配到堆栈中，指针指向最后压入栈的执行上下文。

当函数执行结束后，指针下移，这个指针下移的操作就是销毁上一个函数执行上下文的过程，该函数执行上下文所占用的区域会变成无效区域，下一个函数执行上下文压入栈的时候会直接覆盖其内存空间。

简而言之，**只要函数调用结束，该栈内存就会自动回收，如果出现闭包的情况，闭包的数据会组成一个对象存在堆空间中**。

### 堆空间回收

堆空间垃圾回收策略主要基于**分代式垃圾回收机制**，V8 将堆内存分为**新生代**和**老生代**两个区域，采用不同的垃圾回收策略。

**新生代**

新生代的对象为存活时间较短的对象，通常只支持 `1~8M` 的容量。

新生代垃圾回收策略通过将堆内存一分为二，一个是处于使用状态的空间称为**活动区**，一个是处于闲置状态的空间称为**空闲区**。

新加入的对象都会加入活动区，当活动区快写满时就要执行一次垃圾回收，垃圾回收流程大致如下：

1. 新生代垃圾回收器会对活动区的**活动对象**做标记
2. 将标记对象复制到空闲区进行排序整理
3. 清除活动区所有对象占用的空间
4. 角色互换，将原来的活动区变成空闲区，原来的空闲区变成活动区

注意：当一个对象经过**多次复制**后仍然存活，它将会被认为是生命周期较长的对象，随后会被移至老生代的空间中，采用老生代的垃圾回收策略管理。

**老生代**

老生代的对象为存活时间较长或常驻内存的对象，简单来说就是经历过新生代垃圾回收后还存活的对象，容量通常比较大。

老生代垃圾回收器采用的策略就是**标记清除**，流程如下：

1. 首先是标记阶段，从一组根元素开始，递归遍历这组根元素，遍历过程中给能到达的元素（活动对象）打上标记，无法到达的元素就是非活动对象。
2. 然后是清除阶段，直接销毁非活动对象，回收对应空间并标记整理内存。

参考资料：

- [「硬核 JS」你真的了解垃圾回收机制吗](https://juejin.cn/post/6981588276356317214)

## 二维数组纵向遍历快还是横向遍历快

**横向遍历快**。

因为二维数组在计算机中是按行存储的，横向遍历的 CPU cache 命中率高

## ES6

### for...in 和 for...of 的区别

`for...in`：

- 主要为遍历对象设计的，不适合遍历数组
- 遍历对象返回 `key` 值
- 遍历数组返回 index

`for...of`：

- 仅可遍历具备 `Iterator` 接口的数据结构（Array,Map,Set,String）
- 遍历对象会报错
- 遍历数组返回值
- 遍历 `Set` 返回值
- 遍历 `Map` 返回数组（`[key, value]`）

```js
const obj = {
  id: "a",
  name: "b",
  age: 32,
};

const arr = ["a", "b", "c"];

for (const key in obj) {
  console.log(key); // id name age
}
for (const key in arr) {
  console.log(key); // 0 1 2
}
for (const iterator of obj) {
  console.log(iterator); // Uncaught TypeError: obj is not iterable
}
for (const iterator of arr) {
  console.log(iterator); // a b c
}

var engines = new Set(["Gecko", "Trident", "Webkit", "Webkit"]);
for (var e of engines) {
  console.log(e); // Gecko Trident Webkit
}

var es6 = new Map();
es6.set("edition", 6);
es6.set("committee", "TC39");
es6.set("standard", "ECMA-262");
for (var [name, value] of es6) {
  console.log(name + ": " + value);
}
// edition: 6
// committee: TC39
// standard: ECMA-262
```

### Set 和 Map

##### Set

- Set 类似于数组，但是成员值是唯一的
- 两个属性：constructor,size
- 四个操作方法：add,delete,has,clear
- 四个遍历方法：keys,values,entries,forEach

##### WeakSet

- 成员只能是对象
- `WeakSet` 中的对象都是弱引用，即垃圾回收机制不考虑 `WeakSet` 对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于`WeakSet`中
- 不可遍历，因为成员都是弱引用，随时可能消失

##### Map

- 类似于对象，也是键值对的集合，但是键值不限于字符串
- 存储的数据是有序的，而平常使用的对象是无序的
- 对同一个键多次赋值，后面的值会覆盖前面的值
- Map 的键跟内存地址绑定的，只要内存地址不一样就视为两个键
- size,set,get,has,delete,clear

##### WeakMap

与 `Map` 区别有两点：

- `WeakMap` 只接受对象为键名（`null` 除外）
- `WeakMap` 的键名所指向的对象，不计入垃圾回收机制

### var、let、const 的区别

- `var` 存在变量提升，可以在声明之前使用；`let`、`const` 因为暂时性死区不能在声明前使用
- `var` 在全局作用域下声明变量会挂载在 `window` 上，其他两个不会
- `const` 用于声明常量，不可再次赋值
- 函数提升优于变量提升，函数提升会把整个函数挪到作用域顶部，变量提升只会把声明挪到作用域顶部

### ES Module 和 CommonJS 模块有什么区别

- 前者是值的引入，后者是值的拷贝
- 前者是编译时加载，后者是运行时加载
- 前者是异步加载，后者是同步加载

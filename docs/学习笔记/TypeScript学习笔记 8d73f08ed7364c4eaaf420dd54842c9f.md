# TypeScript学习笔记

TypeScript学习笔记，主要是记录与JavaScript不同的地方

# 一、基础类型

TypeScript除了包含JavaScript 原始类型：`number`、`string`、`boolean`、`null`、`undefined`、`symbol`，还包含了`Number`、`String`、`Boolean`、`Symbol` 等类型（注意区分大小写），它们和小写对应的类型并不等价。

例如：

```tsx
let str: String = 'a';
let str2: string = 'b';
str2 = str; // Error：不能将类型“String”分配给类型“string”。“string”是基元，但“String”是包装器对象。如可能首选使用“string”。ts(2322)
str.length // 1
```

**基元**是非对象且没有方法的数据，因此`string`类型的`str2`是不存在任何属性和方法的，但是`str2.length`却可以拿到`str2`字符串的长度，是因为除null和undefined所有原始值都有环绕它们的对象等效项，即**包装对象**。

当我们在原始值上调用`length`、`indexOf`等属性或方法时，JavaScript会将其隐式转换为对象，并调用`String`对象的属性或方法。所以我们可以直接用字面量去定义字符串，而不需要显式调用`new String()`构造函数去创建`String`对象。

### 1、数组

使用数组泛型，`Array<元素类型>`：

`const arr: Array<number> = [1, 2, 3]`;

如果给这个数组添加其他类型的元素的话VSCode会报错提示，但不影响编译。

### 2、元组 Tuple

元组类型跟数组一样，但要求已知元素数量和类型，而且各元素类型可以不相同。

声明一个已知元素数量为2，类型为数字、字符串的元组：

`const arr: [string, number] = [1, '2'];`

元组不能直接用声明长度以外的索引去改变元组里的元素，但是用`push`是可以向元组添加元素的。

```tsx
const arr: [string, number] = ['1', 2, 3];
arr[2] = 5; // 无效操作
arr.push(4);
console.log(arr); // ["1", 2, 3, 4]
console.log(arr.length); // 4
console.log(arr[3]); // 4
```

### 3、枚举

`TypeScript`实现了枚举类型（`Enums`），是`TypeScript`特有的语法。

```tsx
enum Day {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
}
```

转译为`JavaScript`后如下：

```tsx
var Day;
(function (Day) {
    Day[Day["SUNDAY"] = 0] = "SUNDAY";
    Day[Day["MONDAY"] = 1] = "MONDAY";
    Day[Day["TUESDAY"] = 2] = "TUESDAY";
    Day[Day["WEDNESDAY"] = 3] = "WEDNESDAY";
    Day[Day["THURSDAY"] = 4] = "THURSDAY";
    Day[Day["FRIDAY"] = 5] = "FRIDAY";
    Day[Day["SATURDAY"] = 6] = "SATURDAY";
})(Day || (Day = {}));
```

`JavaScript`中其实并没有与枚举类型对应的原始实现，而`TypeScript`转译器会把枚举类型转译为一个属性为常量、命名值从 0 开始递增数字映射的对象，在功能层面达到与枚举一致的效果。

通过“枚举名字.常量命名”的格式获取枚举集合里的成员。

```tsx
function work(d: Day) {
  switch (d) {
    case Day.SUNDAY:
    case Day.SATURDAY:
      return 'take a rest';
    case Day.MONDAY:
    case Day.TUESDAY:
    case Day.WEDNESDAY:
    case Day.THURSDAY:
    case Day.FRIDAY:
      return 'work hard';
  }
}

// 等价于
function work(d: Day) {
	switch (d) {
	  case 0:
	  case 1:
	    return 'take a rest';
	  case 2:
	  case 3:
	  case 4:
	  case 5:
	  case 6:
	    return 'work hard';
	}
}
```

调用work函数时，可传入枚举成员或数值。

```tsx
work(Day.SUNDAY); // ok
work(0); // ok
```

### 4、Any

给变量指定`Any`类型，可以让它直接通过编译阶段的检查

```tsx
let a: any = 4;
a = 'string'; // 不会报错
console.log(a); // string
```

当只知道一部分数据的类型时，可以将用any声明数组：

```tsx
const arr: any[] = [1, '2'];
arr[1] = 2; // 不会报错
```

### 5、Never

`never`类型表示的是那些永不存在的值的类型，`never`类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型。

例如定义一个抛出错误的函数，该函数永远不会有返回值，所以它的返回值类型为`never`。

```tsx
function ThrowError(msg: string): never {
  throw Error(msg);
}
```

never 是**所有类型的子类型**，它可以给所有类型赋值，但是反过来除了`never`自身以外，其他类型都不能为`never`类型赋值。

```tsx
let Unreachable: never = 1; // 不能将类型“1”分配给类型“never”。ts(2322)
const num: number = Unreachable; // ok
const str: string = Unreachable; // ok
const bool: boolean = Unreachable; // ok
const test: any = 1;
Unreachable = test; // 不能将类型“any”分配给类型“never”。ts(2322)
```

在恒为`false`的类型守卫条件判断下，变量的类型将会被缩小为`never`，因此在条件判断中调用变量的方法会报错(理解为一种基于静态类型检测的`Dead Code`检测机制)。

```tsx
const str: string = 'string';
if (typeof str === 'number') {
  // 此时 hover str 显示为never类型
  str.toLowerCase(); // 类型“never”上不存在属性“toLowerCase”。ts(2339)
}
```

还可以使用`never`作为接口类型下的属性类型，用来禁止写接口下特定的属性（等同于用`readonly`声明属性）。

```tsx
const props: {
  id: number,
  name?: never
} = {
  id: 1,
}
props.name = null; // 不能将类型“null”分配给类型“undefined”。ts(2322)
props.name = 'str'; // 不能将类型“"str"”分配给类型“undefined”。ts(2322)
props.name = 1; // 不能将类型“1”分配给类型“undefined”。ts(2322)
props.id = 10; // ok
```

### 6、unknown

`unknown`是TypeScript 3.0 中添加的一个类型，它主要用来描述类型并不确定的变量。

比如在多个`if else`条件分支场景下，它可以用来接收不同条件下类型各异的返回值的临时变量。

```tsx
let result: unknown;
if (x) {
  result = x();
} else if (y) {
  result = y();
}
```

与`any`不同的是，`unknown`类型的值只能赋值给`unknown`或`any`。

```tsx
let result: unknown;
let num: number = result; // 不能将类型“unknown”分配给类型“number”。ts(2322)
let anything: any = result; // 不会提示错误
```

使用`unknown`后，`TypeScript`会对它做类型检测。但是如果不缩小类型的话，对它执行任何操作都会提示错误。

```tsx
let result: unknown;
result.toFixed(); // 对象的类型为 "unknown"。ts(2571)
```

缩小类型是指在某段代码块中规定该`unknown`类型变量为哪种类型，例如：

```tsx
if (typeof result === 'number') {
  result.toFixed();; // 此处 hover result 提示类型是 number，而number类型具有toFixed这个方法，因此不会提示错误
}
```

### 7、类型断言

通过类型断言这种方式可以告诉编译器按照我们的方式进行类型检查。

```tsx
const arrayNumber: number[] = [1, 2, 3, 4];
const greaterThan2: number = arrayNumber.find(num => num > 2); // 不能将类型“number | undefined”分配给类型“number”。ts(2322)
const greaterThan2: number = arrayNumber.find(num => num > 2) as number // ok;
```

在`TypeScript`看来，`greaterThan2`的类型既可能是`number`，也可能是`undefined`，因此会报错，这时候就要使用类型断言了。

类型断言有两种形式，其一是“尖括号”语法：

```tsx
let someValue: any = 'string';
let strLength: number = (<string>someValue).length;
```

另一种是`as`语法：

```tsx
let someValue: any = 'string';
let strLength: number = (someValue as number).length;
```

在TypeScript里使用JSX时，只有`as`语法断言是被允许的。

非空断言，用来排除值为`null`、`undefined`的情况。

```tsx
let mayNullOrUndefinedOrString: null | undefined | string;
mayNullOrUndefinedOrString!.toString(); // ok
mayNullOrUndefinedOrString.toString(); // 对象可能为 "null" 或“未定义”。ts(2533)
```

但是不推荐使用非空断言，因为无法保证变量一定不为`null`或`undefined`，建议使用类型守卫来代替。

### 8、字面量类型拓宽

**字面量类型拓宽**是指缺省显式类型注解的可变更的变量的类型转换成**赋值字面量类型的父类型。**

所有通过`let`或`var`定义的**变量**、**函数的形参**、**对象的非只读属性**，如果满足了指定了初始值且**未显式添加类型注解**的条件，那么它们推断出来的类型就是**指定的初始值字面量类型拓宽后的类型**。

```tsx
let str = 'this is string'; // str: string
let strFun = (str = 'this is string') => str; // strFun: (str?: string) => string;
const specifiedStr = 'this is string'; // specifiedStr: 'this is string' 常量不可变更，类型没有拓宽
let str2 = specifiedStr; // str2: 'string'
let strFun2 = (str = specifiedStr) => str; // strFun2: (str?: string) => string;
```

### 9、类型拓宽

通过`let`、`var`定义的变量如果满足**未显示声明类型注解**且被赋予`null`或`undefined`值，则推断出`any`类型。

```tsx
let x = null; // x: any
let y = undefined; // y: any

const z = null; // z: null
// 以下列子基于strictNullChecks=true
let anyFun = (param = null) => param; // param: null
let z2 = z; // z2: null
let x2 = x; // x2: null
let y2 = y; // y2: undefined
```

### 10、类型缩小

通过**类型守卫**或字面量类型等值判断（`===`）、其他控制流语句（包括但不限于`if`、**三目运算符**、`switch`**分支**）将变量的类型由一个较为宽泛的类型缩小到相对明确的类型。

```tsx
// 类型守卫
let func = (anything: any) => {
  if (typeof anything === 'string') return anything; // anything: string
  else if (typeof anything === 'number') return anything; // anything: number
  return null;
}

// ===
type Goods = 'pen' | 'pencil' |'ruler';
const func = (item: Goods) =>  {
  if (item === 'pen') {
    item; // item: "pen"
  } else {
    item; // item: "pencil" | "ruler"
  }
}
```

# 二、接口

### 1、作用

TypeScript的核心原则之一是对值所具有的结构进行类型检查，接口的作用就是为这些类型命名和为你的代码或第三方代码定义约束。

简单示例：用接口来描述：必须包含一个`label`属性且类型为`string`：

```tsx
interface LabelObj {
  label: string
}

const printLabel = (Obj: LabelObj) => {
  console.log(Obj.label);
};

const myObj = { size: 10, label: 'Hello TypeScript' };
printLabel(myObj); // Hello TypeScript
```

假如传进去的对象中没有`string`类型的`label`属性或该属性为其他类型都会有错误提示。

![https://static01.imgkr.com/temp/d5f3757d6cf74ccd8bd549fe739f27ea.png](https://static01.imgkr.com/temp/d5f3757d6cf74ccd8bd549fe739f27ea.png)

注意：类型检查器不会去检查属性的顺序，只要相应的属性存在并且类型也是对的就可以。

### 2、可选属性

可选属性表明该属性在接口里不是必需的，只需在属性名后加个`?`即可：

```tsx
interface SquareConfig {
  color?: string;
  width?: number;
}
function createSquare(config: SquareConfig) {
  ...
}
const mySquare = createSquare({}); // 即使传空对象也不会有错误提示
```

使用可选属性有两个好处： - 可以对可能存在的属性进行预定义 - 可以捕获引用了不存在的属性时的错误

![https://static01.imgkr.com/temp/72746dbe65cb44239aa1d10afc405637.png](https://static01.imgkr.com/temp/72746dbe65cb44239aa1d10afc405637.png)

### 3、只读属性

属性名前用`readonly`来指定只读属性，使该对象属性只能在创建的时候赋值，赋值后不能被改变，再次赋值会有错误提示。

```tsx
interface Point {
	readonly x: number;
	readonly y: number;
}
let p1: Point = { x: 10, y: 20 };
p1.x = 5; // 无法分配到 "x" ，因为它是只读属性。
```

### 4、额外属性检查

对象字面量赋值给变量或作为参数传递的时候会经过额外属性检查：如果一个对象字面量存在任何目标类型不存在的属性时会有错误提示。

![https://static01.imgkr.com/temp/5196d1f4f75a4831a6a1fa68618e3cde.png](https://static01.imgkr.com/temp/5196d1f4f75a4831a6a1fa68618e3cde.png)

例如上图的代码，目标类型中并没有`colour`属性，TypeScript会认为这段代码可能存在bug，因此有错误提示。

绕开额外属性检查的方法：

1. 使用类型断言(最简便)：

```tsx
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

1. 使用索引签名(最佳):

```tsx
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: any; // 表示SquareConfig可以有任意数量的属性，并且只要不是color和width，类型不受限制
}
```

1. 重新赋值：

```tsx
const squareOptions = { width: 100, opacity: 0.5 }; // 将该对象字面量赋值给一个变量
let mySquare = createSquare(squareOptions); // squareOptions不会经过额外属性检查
```

### 5、函数类型

接口也可以用来描述函数类型：

```tsx
interface Func {
  // 参数列表 : 返回值类型
  (str: string, length: number) : boolean;
}
const test:Func = (str, length) => {
  return true;
}
test(1, '1'); // Error,类型“number”的参数不能赋给类型“string”的参数
```

函数的参数会逐个进行检查，要求对应位置上的参数类型是兼容的。当参数和返回值类型不对应的时候会有错误提示。

### 6、可索引的类型

我们可以描述那些能够“通过索引得到”的类型，可索引类型具有一个索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。

```tsx
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = ["Bob", "Fred"];

const myStr: string = myArray[0];
console.log(myStr[0]) // Bob
```

上面例子里，我们定义了`StringArray`接口，它具有索引签名。 这个索引签名表示了当用 `number`去索引`StringArray`时会得到`string`类型的返回值。

TypeScript支持两种索引签名：字符串和数字。可以同时使用两种类型的索引，但是数字索引的返回值必须是字符串索引返回值类型的子类型。 这是因为当使用 number来索引时，JavaScript会将它转换成string然后再去索引对象。 也就是说用 100（一个number）去索引等同于使用“100”（一个string）去索引，因此两者需要保持一致。

### 7、继承接口

接口和类一样可以相互继承，一个接口可以继承多个接口，创建出多个接口的合成接口。

```tsx
interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

interface Square extends Shape, PenStroke {
  sideLength: number;
}

const square: Square = {
  color: 'red',
  penWidth: 10,
  sideLength: 5,
};
```

# 三、函数

### 1、可选参数

在参数前面使用`?`实现可选参数的功能：

```tsx
function name (firstName: string, lastName?: string) {
  return  `${firstName} ${lastName}`;
}
console.log(name('Tom')); // Tom undefined
```

可选参数必须位于必须参数后面，否则会有错误提示。

```tsx
function name (firstName?: string, lastName: string) { // Error,必选参数不能位于可选参数后
  return  `${firstName} ${lastName}`;
}
```

### 2、默认参数

我们可以为参数提供一个默认值当用户没有传递这个参数或传递的值是`undefined`：

```tsx
function name (firstName = 'Tom', lastName: string) {
  return `${firstName} & ${lastName}`;
}
console.log(name(undefined, 'Jerry')); // Tom & Jerry
```

带默认值的参数不需要放在必须参数的后面，如果带默认值的参数放在必选参数的前面，要取得默认值就必须传入`undefined`。

### 3、剩余参数

当有部分参数不确定数量时可以在参数名前用`...`将剩余的参数都收集到一个变量里：

```tsx
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}
let employeeName = buildName("Joseph", "Samuel", "Lucas", "MacKinzie");
console.log(employeeName); // Joseph Samuel Lucas MacKinzie
```

# 四、泛型

### 1、什么是泛型

泛型指的是类型参数化，即将原来某种具体的类型进行参数化。和定义函数参数一样，可以给泛型定义若干个类型参数，并在调用时给泛型传入明确的类型参数。

### 2、泛型类型参数

通过尖括号<>语法给函数定义泛型参数T，并指定参数的类型为T。

```tsx
function reflect<P>(param: P):P {
  return param;
}
const reflectStr = reflect<string>('string'); // 类型是 string
```

泛型不仅可以约束函数参数的类型，还可以约束参数属性、成员的类型。

```tsx
// 约束了 param 的类型是数组，数组的元素类型是泛型入参
function reflectArray<P>(param: P[]) {
  return param;
}
const reflectArr = reflectArray([1, '1']); // 类型是 (string | number)[]
```

### 3、泛型类

```tsx
class Memory<S> {
  store: S;
  constructor(store: S) {
    this.store = store;
  }
  set(store: S) {
    this.store = store;
  }
  get() {
    return this.store;
  }
}
const numMemory = new Memory<number>(1); // <number> 可缺省
const getNumMemory = numMemory.get(); // 类型是 number
numMemory.set(2); // 只能写入 number 类型
const strMemory = new Memory(''); // 缺省 <string>
const getStrMemory = strMemory.get(); // 类型是 string
strMemory.set('string'); // 只能写入 string 类型
```

### 4、泛型类型

类型本身可以被定义为拥有不明确的类型参数的泛型，并且可以接收明确类型作为入参，从而衍生出更具体的类型。

```tsx
// 显式添加泛型类型注解
const reflectFn: <P>(param: P) => P = reflect; // ok
```

把类型注解提取为一个能被复用的类型别名或者接口。

```tsx
type ReflectFuncton = <P>(param: P) => P;
interface IReflectFuncton {
  <P>(param: P): P
}
const reflectFn2: ReflectFuncton = reflect;
const reflectFn3: IReflectFuncton = reflect;
```

将类型入参的定义移动到类型别名或接口名称后，此时定义的一个接收具体类型入参后返回一个新类型的类型（`ReflectFuncton`和`IReflectFuncton`）就是泛型类型。

可以使用一些类型操作符进行运算表达，使得泛型可以根据入参的类型衍生出各异的类型。

```tsx
// 如果入参是 number | string 就会生成一个数组类型，否则就生成入参类型
type StringOrNumberArray<E> = E extends string | number ? E[] : E;
type StringArray = StringOrNumberArray<string>; // 类型是 string[]
type NumberArray = StringOrNumberArray<number>; // 类型是 number[]
type NeverGot = StringOrNumberArray<boolean>; // 类型是 boolean
```

**分配条件类型**

在条件类型判断的情况下，如果入参是联合类型，则会被拆解成一个个独立的类型进行类型运算。

```tsx
type BooleanOrString = string | boolean;
type WhatIsThis = StringOrNumberArray<BooleanOrString>; boolean | string[]
type BooleanOrStringGot = BooleanOrString extends string | number ? BooleanOrString[] : BooleanOrString; string | boolean
```

### 5、泛型约束

通过使用“泛型入参名 extends 类型”语法来约束接收参数的类型。

```tsx
// 限定泛型入参只能是 number | string | boolean 的子集
function reflectSpecified<P extends number | string | boolean>(param: P):P {
  return param;
}
reflectSpecified('string'); // ok
reflectSpecified(1); // ok
reflectSpecified(true); // ok
reflectSpecified(null); // ts(2345) 'null' 不能赋予类型 'number | string | boolean'
```

# 五、枚举

定义一些带名字的常量，可以清晰地表达意图或创建一组有区别的用例。

### 1、数字枚举

```tsx
enum Word {
  A = 1,
  B, // 2
  C, // 3
}

const a = Word.B; // 2
```

数字枚举中，第一位成员如果没有初始化则默认为0，剩余成员会从该初始值自动+1。

另外，如果第一位成员初始值是需要计算的，那么剩余成员则需要明确的赋予初始值。

```tsx
enum E {
    A = getSomeValue(),
    B, // error! 'A' is not constant-initialized, so 'B' needs an initializer
}
```

### 2、字符串枚举

字符串枚举的每个成员都必须用字符串字面量或另外一个成员去初始化。

```tsx
enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}
```

### 3、反向映射

数字枚举成员可以从枚举值找到其枚举名字

```tsx
enum Enum {
    A
}
let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

### 4、常量枚举

常量枚举通过在枚举上使用`const`修饰符来定义，不允许包含计算成员。

```tsx
// 显式枚举值只能是文字值（字符串，数字，布尔值等）
const enum Enum {
    A = 1,
    B = A * 2,
    C = 1 + 2, //Error, Explicit enum value must only be a literal value (string, number, boolean, etc)
}
```

# 六、类型推论

在有些没有明确指出类型的地方，类型推论会帮助提供类型，这种推断发生在初始化变量和成员，设置默认参数值和决定函数返回值时。

### 1、最佳通用类型

当需要从几个表达式中推断类型时候，会使用这些表达式的类型来推断出一个最合适的通用类型。例如，

```tsx
let x = [0, 1, null];
```

计算通用类型算法会考虑所有的候选类型，并给出一个兼容所有候选类型的类型，这个例子的候选类型有number和null，都无法兼容所有类型，所以只能给出联合数组类型`(number | null)[]`

### 2、上下文类型

TypeScript类型推论也可能按照相反的方向进行，即“上下文归类”，上下文归类会在很多情况下使用到。 通常包含函数的参数，赋值表达式的右边，类型断言，对象成员和数组字面量和返回值语句。

如果上下文类型表达式没有明确的类型信息，上下文类型也会做为最佳通用类型的候选类型。

# 七、类型兼容性

### 1、比较原始类型和对象类型

TS的类型兼容性是基于结构类型系统,如果`x`要兼容`y`，那`y`至少具有与`x`相同的属性。

```tsx
interface Named {
    name: string;
}

let x: Named;
// y's inferred type is { name: string; location: string; }
let y = { name: 'Alice', location: 'Seattle' };
x = y;
```

`y`赋值给`x`，即`x`需要兼容`y`，编译器需要检查`y`中有没有对应`x`的属性，如果没有，则报错。上述例子中`y`包含名字是`name`的`string`类型属性，因此赋值成功。

### 2、函数兼容

判断两个函数是否兼容，首先需要比较参数列表。如果`x`需要赋值给`y`，则`x`的每个参数都需要能在`y`中找到对应类型的参数，由于允许忽略参数，所以不需要`y`的每个参数都在`x`中找到。

```tsx
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x; // OK a和b都是number类型
x = y; // Error x中没有string类型

let y = (b: number, s?: string) => 0;

x = y; // OK 可选参数可不匹配
```

不仅要找到对应的类型，类型顺序也要保持一致。

```tsx
let x = (a: number) => 0;
let y = (b: string, s: number) => 0;

y = x; // Error 不能将类型“string”分配给类型“number”
```

还要比较返回值类型。

```tsx
let x = () => ('1');
let y = () => (1);

x = y; // Error 不能将类型“() => number”分配给类型“() => string”
```

类型系统强制源函数的返回值类型必须是目标函数返回值类型的子类型。

```tsx
let x = () => ({name: 'Alice'});
let y = () => ({name: 'Alice', location: 'Seattle'});

y = x; // Error 类型 "{ name: string; }" 中缺少属性 "location"，但类型 "{ name: string; location: string; }" 中需要该属性。
```

### 3、类兼容

只会比较实例成员、私有成员和受保护成员，不比较静态成员和构造函数。

```tsx
// 比较实例成员
class Animal {
  feet: number = 1;
}

class Size {
  feet: string = '1';
}

let a: Animal;let s: Size;

a = s;  // Error 属性“feet”的类型不兼容
s = a;  // Error 属性“feet”的类型不兼容

// 比较私有成员
class Animal {
  private feet: number = 1;
}

class Size {
  private feet: string = '1';
}

let a: Animal;let s: Size;

a = s;  // Error 属性“feet”的类型不兼容
s = a;  // Error 属性“feet”的类型不兼容

// 比较保护成员
class Animal {
  protected feet: number = 1;
}

class Size {
  protected feet: string = '1';
}

let a: Animal;let s: Size;

a = s;  // Error 属性“feet”的类型不兼容
s = a;  // Error 属性“feet”的类型不兼容

// 静态成员和构造函数不比较
class Animal {
  static feet: number = 1;
	constructo_r(name: string, numFeet: number) { };
}

class Size {
  protected feet: string = '1';
	constructo_r(numFeet: number) { };
}

let a: Animal;let s: Size;

a = s;  // OK
s = a;  // OK
```

### 4、泛型兼容

```tsx
interface TEST<T> { }

let x: TEST<number>;
let y: TEST<string>;

x = y; // OK
```

当泛型接口中存在成员，赋值会报错。

```tsx
interface TEST<T> {
    data: T
  }

let x: TEST<number>;
let y: TEST<string>;

x = y; // Error 不能将类型“string”分配给类型“number”
```

# 八、高级类型

### 1、联合类型

**联合类型**（Unions）用来表示变量、参数的类型不是单一原子类型，而可能是多种不同类型的组合。

通过“`|`”操作符分隔类型的语法来表示联合类型。

```tsx
function formatPX(size: number | string) {
  // ...
}
formatPX(13); // ok
formatPX('13px'); // ok
formatPX(true); // ts(2345) 'true' 类型不能赋予 'number | string' 类型
formatPX(null); // ts(2345) 'null' 类型不能赋予 'number | string' 类型
```

也可以声明一个字符串字面类型组成的联合类型。

```tsx
function formatUnit(size: number | string, unit: 'px' | 'em' | 'rem' | '%' = 'px') {
  // ...
}
formatUnit(1, 'em'); // ok
formatUnit('1px', 'rem'); // ok
formatUnit('1px', 'bem'); // ts(2345)
```

### 2、交叉类型

把多个类型合并成一个类型，合并后的类型将拥有所有成员类型的特性，通过“`&`”操作符来声明交叉类型。

但不能把原始类型、字面量类型、函数类型等原子类型合并组合成交叉类型，因为任何类型都无法满足同时属于多种原子类型，比如既是`string`类型又是`number`类型。

```tsx
type Useless = number & string; // type Useless = never
```

### 3、合并接口类型

交叉类型的用处是将多个接口类型合并成一个类型，从而实现等同接口继承的效果，即**合并接口类型。**

```tsx
type IntersectionType = { id: number; name: string; } & { age: number };
const mixed: IntersectionType = {
  id: 1,
  name: 'name',
  age: 18
}
```

上述例子通过合并接口类型，使得`IntersectionType`同时具有`id`、`name`和`age`属性。

如果合并的多个接口类型有同名属性的话，根据同名属性的类型是否兼容分两种情况。

- 同名属性类型不兼容

```tsx
type IntersectionType = { id: number; name: string; } & { age: number, name: number };
const mixed: IntersectionType = {
  id: 1,
  name: 'name', // ts(2322) 错误，'number' 类型不能赋给 'never' 类型
  age: 18
}
```

上述例子中同名属性`name`的类型分别是`string`和`number`，合并后的类型为`never`。因此赋予`name`属性任意类型的值都会报错，而不赋值也会报错，导致合并出来的`IntersectionType`类型是一个无用类型。

- 同名属性类型兼容

```tsx
type IntersectionTypeConfict = { id: number; name: 2; } & { age: number; name: number; };
let mixedConflict: IntersectionTypeConfict = {
  id: 1,
  name: 2, // ok
  age: 2
};
mixedConflict = {
  id: 1,
  name: 22, // '22' 类型不能赋给 '2' 类型
  age: 2
};
```

上述例子中同名属性`name`的类型分别是`number`和`number`的子类型数字字面量类型，合并后`name`的类型为两者中的子类型，因此`name`不能赋予任何除2以外的值。

### 4、合并联合类型

合并联合类型为一个交叉类型，相当于提取所有联合类型的相同类型成员，可以理解为求交集。

```tsx
type UnionA = 'px' | 'em' | 'rem' | '%';
type UnionB = 'vh' | 'em' | 'rem' | 'pt';
type IntersectionUnion = UnionA & UnionB; // 相当于type IntersectionUnion = "em" | "rem"
const intersectionA: IntersectionUnion = 'em'; // ok
const intersectionB: IntersectionUnion = 'rem'; // ok
const intersectionC: IntersectionUnion = 'px'; // ts(2322) 不能将类型“"px"”分配给类型“"em" | "rem"”
const intersectionD: IntersectionUnion = 'pt'; // ts(2322) 不能将类型“"pt"”分配给类型“"em" | "rem"”
```

如果多个联合类型中没有相同的类型成员，合并出来的类型为`never`。

```jsx
type UnionC = 'em' | 'rem';
type UnionD = 'px' | 'pt';
type IntersectionUnionE = UnionC & UnionD; // 相当于type IntersectionUnionE = never
```

### 5、类型缩减

当将原始类型和其子类型（字面量类型）组合成联合类型时，类型将发生缩减，只保留原始类型。

```tsx
type URStr = 'string' | string; // 类型是 string
type URNum = 2 | number; // 类型是 number
type URBoolen = true | boolean; // 类型是 boolean
enum EnumUR {
  ONE,
  TWO
}
type URE = EnumUR.ONE | EnumUR; // 类型是 EnumUR
```

但是这个缩减同时也削弱了VS Code的自动提示能力，可以给父类型添加“& {}”即可。

![TypeScript%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%208d73f08ed7364c4eaaf420dd54842c9f/Untitled.png](TypeScript%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%208d73f08ed7364c4eaaf420dd54842c9f/Untitled.png)

# 九、官方工具类型

### 1、操作接口类型

### Partial

`Partial`工具类型可以将一个类型的所有属性变为可选的，且该工具类型返回的类型是给定类型的所有子集。

```tsx
interface Person {
  name: string;
  age?: number;
  weight?: number;
}
type Partial<T> = {
  [P in keyof T]?: T[P];
};
type PartialPerson = Partial<Person>;
// 相当于
interface PartialPerson {
  name?: string;
  age?: number;
  weight?: number;
}
```

### Required

`Required`工具类型可以将给定类型的所有属性变为必填的。

```tsx
type Required<T> = {
  [P in keyof T]-?: T[P]; // - 与 ? 组合起来表示去除类型的可选属性
};
type RequiredPerson = Required<Person>;
// 相当于
interface RequiredPerson {
  name: string;
  age: number;
  weight: number;
}
```

### Readonly

`Readonly`工具类型可以将给定类型的所有属性设为只读。

```tsx
type Readonly<T> = {
	readonly [P in keyof T]: T[P];
}
type ReadonlyPerson = Readonly<Person>;
// 相当于
interface ReadonlyPerson {
  readonly name: string;
  readonly age?: number;
  readonly weight?: number;
}
```

### Pick

`Pick`工具类型可以从给定的类型中选取出指定的键值，然后组成一个新的类型。

```tsx
// Pick工具类型接收了两个泛型参数
// 第一个 T 为给定的参数类型
// 第二个参数为需要提取的键值 key
type Pick<T, K extends keyof T> = {
	[P in K]: T[P];
}
type NewPerson = Pick<Person, 'name' | 'age'>
// 相当于
interface NewPerson {
  name: string;
  age?: number;
}
```

### Omit

`Omit`工具类型的功能是返回去除指定的键值之后返回的新类型。

```tsx
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type NewPerson = Omit<Person, 'weight'>;
// 相当于
interface NewPerson {
  name: string;
  age?: number;
}
```

### 2、联合类型

### Exclude

`Exclude`的作用就是从联合类型中去除指定的类型。

```tsx
// 如果类型 T 可被分配给类型 U ，则不返回类型 T，否则返回此类型 T
type Exclude<T, U> = T extends U ? never : T;
type T = Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
```

### Extract

`Extract`主要用来从联合类型中提取指定的类型。

```tsx
type Extract<T, U> = T extends U ? T : never;
type T = Extract<'a' | 'b' | 'c', 'a'>; // => 'a'
```

### NonNullable

`NonNullable`的作用是从联合类型中去除 null 或者 undefined 的类型。

```tsx
type NonNullable<T> = T extends null | undefined ? never : T;
// 等同于使用 Exclude
type NonNullable<T> = Exclude<T, null | undefined>;
type T = NonNullable<string | number | undefined | null>; // => string | number
```

### Record

`Record`的作用是生成接口类型，然后我们使用传入的泛型参数分别作为接口类型的属性和值。

```tsx
type Record<K extends keyof any, T> = {
	[P in K]: T;
}
type MenuKey = 'home' | 'about' | 'more';
interface Menu {
	label: string;
	hidden?: boolean;
}
const menus: Record<MenuKey, Menu> = {
	home: { label: '主页' },
	about: { label: '关于' },
	more: { label: '更多', hidden: true },
}
```

**注意**：第一个泛型参数继承自`keyof any` 。

在`TypeScript`中，`keyof any`指代可以作为对象键的属性，如下例：

```tsx
// 目前，JavaScript 仅支持string、number、symbol作为对象的键值。
type T = keyof any; // string | number | symbol
```

### 3、函数类型

### ConstructorParameters

ConstructorParameters用来获取构造函数的构造参数。

```tsx
// 通过 infer 关键字匹配构造函数内的构造参数
type ConstructorParameters<T extends new (...args: any) => any> =
	T extends new (...args: infer P) => any ? P : never;
class Person {
	constructor(name: string, age?:number) {}
}
type T = ConstructorParameters<typeof Person>; // T = [string, (number | undefined)?]
```

### Parameters

用来获取函数的参数并返回序对。

```tsx
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type T0 = Parameters<() => void>; // T = []
type T1 = Parameters<(x: number, y?: string) => void>; // T = [number, (string | undefined)?]
```

### ReturnType

用来获取函数的返回类型。

```tsx
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer P ? P : never;
type T0 = ReturnType<() => void>; // T0 = void
type T1 = ReturnType<() => string>; // T1 = string
```

### ThisParameterType

用来获取函数的 this 参数类型。

```tsx
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
type T = ThisParameterType<(this: Number, x: number) => void>; // T = Number
```

### 4、字符串类型

### 模板字符串

4.1版本起，TypeScript 提供了`Uppercase`、`Lowercase`、`Capitalize`、`Uncapitalize`这 4 种内置的操作字符串的类型。

```tsx
// 转换字符串字面量到大写字母
type Uppercase<S extends string> = intrinsic;
// 转换字符串字面量到小写字母
type Lowercase<S extends string> = intrinsic;
// 转换字符串字面量的第一个字母为大写字母
type Capitalize<S extends string> = intrinsic;
// 转换字符串字面量的第一个字母为小写字母
type Uncapitalize<S extends string> = intrinsic;
type T0 = Uppercase<'Hello'>; // 'HELLO'
type T1 = Lowercase<T0>; // 'hello'
type T2 = Capitalize<T1>; // 'Hello'
type T3 = Uncapitalize<T2>; // 'hello'
```

### 5、自定义工具类型

### Merge

将类型入参`A`和`B`合并为一个类型的泛型 `Merge<A, B>`。

```tsx
type Merge<A, B> = {
  [key in keyof A | keyof B]: key extends keyof A
    ? key extends keyof B
      ? A[key] | B[key]
      : A[key]
    : key extends keyof B
    ? B[key]
    : never;
};
type Merged = Merge<{ id: number; name: string }, { id: string; age: number }>;
/*
type Merged = {
    id: string | number;
    name: string;
    age: number;
}
*/
```

### Equal

判断入参 S 和 T 是否是相同的类型。

```tsx
// 只有 any 和 1 交叉得到的类型（any）是 0 的父类型，如果入参是 any 则会返回 true，否则返回 false
type IsAny<T> = 0 extends (1 & T) ? true : false;
type EqualV3<S, T> = IsAny<S> extends true
  ? IsAny<T> extends true
    ? true
    : false
  : IsAny<T> extends true
  ? false
  : [S] extends [T]
  ? [T] extends [S]
    ? true
    : false
  : false;
type ExampleV31 = EqualV3<1 | number & {}, number>; // true but false got
type ExampleV32 = EqualV3<never, never>; // true
type ExampleV34 = EqualV3<any, any>; // true
type ExampleV33 = EqualV3<any, number>; // false
type ExampleV35 = EqualV3<never, any>; // false
```
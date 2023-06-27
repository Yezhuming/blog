# TypeScript

## interface 和 type 的区别

##### 相同点

- 都是用来定义对象或者函数的类型
- 都可以继承，方式不同，`interface`使用`extends`继承，`type`使用 &（即交叉类型），可以互相继承

##### 不同点

- `interface`可以重复声明（属性合并），`type`会报重复定义错误
- `type`可以定义类型别名，例如`type myString = string`
- `type`可以使用操作符，例如`typeof`、`keyof`
- `type`可以使用联合类型或者交叉类型

## 常见工具类型

- `Partial`：满足部分属性（一个也不满足也可以）即可
- `Required`：所有属性都要满足
- `Readonly`：包装后的属性只读
- `Pick`：选取部分属性
- `Omit`：去除部分属性
- `Extract`：交集
- `Exclude`：差集

## any 和 unknown 的区别

- 区别：`any` 不强制进行类型检查，可以存储任何类型的值也可以赋值给任何类型的变量；`unknown` 可以存储任何类型的值但是只能赋值给 `any` 和 `unknown` 类型的变量
- 使用场景：
  - unknown 一般用作函数参数，用来接收任意类型的变量实参

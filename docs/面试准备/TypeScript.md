# TypeScript

## interface 和 type 的区别

- `interface`可以重复声明（属性合并），`type`不可以
- 继承方式不同，`interface`使用`extends`继承，`type`使用 &（即交叉类型）

## 常见工具类型

- `Partial`：满足部分属性（一个也不满足也可以）即可
- `Required`：所有属性都要满足
- `Readonly`：包装后的属性只读
- `Pick`：选取部分属性
- `Omit`：去除部分属性
- `Extract`：交集
- `Exclude`：差集

## 泛型

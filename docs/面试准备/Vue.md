# Vue 面试题

## v-if 和 v-for 的优先级谁高？

当 `v-if` 和 `v-for` 同时存在于一个节点时，`v-if` 比 `v-for` 的优先级更高，这意味着 `v-if` 无法访问到 `v-for` 作用域内定义的变量别名，在外新包装一层 `<template>` 再在其上使用 `v-for` 可以解决这个问题

## watch 和 watchEffect 的区别

- 追踪响应式依赖的方式不同：`watch` 只追踪明确侦听的数据源，它不会追踪任何在回调函数中访问到的属性；`watchEffect` 会在同步执行过程中，自动追踪所有能访问到的响应式属性
- 创建侦听器自动执行：`watch` 默认是懒执行的，想要在创建侦听器时立即执行一遍回调需要传入`immediate:true`参数；`watchEffect` 在创建时会自动执行一次，不需要传递额外的参数

## watch 和 computed 的区别

- `computed` 计算属性：依赖其它属性值，并且计算出来的值有**缓存**，只有当依赖的属性值发生改变时，在下一次获取`computed`的值才会重新计算
- `watch` 侦听器：用于**监听数据**，当数据发生变化时触发回调函数，执行一些“副作用”，比如更改 DOM 或者根据异步操作的结果去修改其他数据状态

## v-if 和 v-show 的区别

- 编译条件：`v-if` 是惰性的，如果初始条件为 `false`，则不编译;`v-show` 则不论初始条件是什么都被编译
- 控制手段：`v-if`是动态的添加和移除 DOM 元素，`v-show` 是通过修改 `display` 属性控制
- 性能消耗：`v-if` 有较高的切换消耗，适用于条件改变少的场景，`v-show` 有更高的初始渲染消耗，适用于频繁切换的场景

## 组件通信

- `props/defineProps,$emits/on`
- `provide/inject`
- Vue2:`EventBus`,Vue3:`mitt`/`tiny-emitter`
- `vuex/pinia`

## nextTick 的原理

Vue 在更新 DOM 时是异步执行的，只要监听到数据变化就会开启一个队列，保存在同一事件循环中发生的所有数据变更操作，然后在下一次事件循环中执行队列中的操作并且刷新队列。

nextTick 接受一个回调函数，在 DOM 更新完成后立即执行。它内部做的事情就是利用 `Promise.then` 将传入的回调函数放到微任务队列中，等待 DOM 更新完成后再执行回调函数

## Vue 的原理

当一个 Vue 实例被创建时，Vue 会遍历所有数据将其转换为 `getter/setter`（Vue2 是利用 `Object.defineProperty`，Vue3 则是利用 `Proxy`），同时每个组件实例都有相应的 `watcher`，在组件渲染过程中将属性记录为依赖，当依赖项的 `setter` 被调用时通知 `watcher` 重新计算，并更新相应的组件

## Vue 双向数据绑定的原理

Vue 是采用**数据劫持**结合**发布订阅模式**实现双向数据绑定的，主要由 `Observer` 发布者、`Compile` 模板解析和 `Watcher` 订阅者三者协同实现

1. 首先 `Observer` 会对所有数据进行劫持，Vue2 利用 `Object.defineProperty`将其转换为 `getter/setter`，Vue3 则是利用 `Proxy`创建响应式对象，这样给某个数据赋值时会触发相应的 `setter`，发布消息通知订阅者
2. `Compile` 负责解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据变动的订阅者
3. `Watcher` 订阅者是 `Observer` 和 `Compile` 之间通信的桥梁，当数据发生变化时收到发布者发布的消息后，触发 `Compile` 绑定的回调函数，更新视图

## Vue 3.0 的更新

- **监测机制的改变**:Vue2 通过 `Object.defineProperty` 进行数据劫持来监测数据变化，Vue3 使用 `Proxy` 来创建响应式对象，仅将 `getter/setter` 用于 `ref`
- **数据和方法的定义**:Vue2 中**选项式 API** 在代码里分割了不同的属性：`data`,`computed`,`methods` 等；而 Vue3 中的**组合式 API**通过方法来分割，这样代码会更简洁易懂，更方便和 `TypeScript` 结合使用
- **Vue3 支持碎片(Fragment)**:Vue2 的 `template` 中只能有一个根节点，Vue3 没有这个限制
- **生命周期不同**:Vue3 的组合式 API 引入了 `setup` 钩子函数，移除了 `create` 相关的两个阶段
- **EventBus 通信模式的改变**：Vue3 移除了`$on`、`$off`、`$once`等实例方法，`EventBus`通信需要依赖第三方库`mitt`或者`tiny-emitter`

## Object.defineProperty 和 proxy 的区别

`Object.defineProperty` 的缺点：

- 无法监听对象新增、删除属性，需要通过`$set`、`$delete` 去修改
- 无法监听数组下标的变化，通过数组下标修改元素，无法实时响应，需要通过调用数组方法去修改数组

`Proxy`：

- 直接代理整个对象而不是对象的属性，只需要做一层代理就可以监听对象的所有属性变化，包括新增删除属性
- 全方位的监听数组变化，消除了 `Object.defineProperty` 的局限性
- 支持 `Map`,`Set`,`WeakMap` 和 `WeakSet`

## Composition API

组合式 API 是一系列 API 的集合，它涵盖了` ref()`,`reactive()`等响应式 API，`onMounted()`,`onUnmounted()`等生命周期钩子这些 API，配合`<script setup>`语法在单文件组件中使用

**为什么要有组合式 API？**

- 更好的逻辑复用
- 更灵活的代码组织
- 更好的类型推导
- 更小的生产包体积

参考资料：

- [组合式 API 常见问答](https://cn.vuejs.org/guide/extras/composition-api-faq.html)

## 做过什么优化

- v-if 和 v-show
- computed 缓存
- keep-alive
- 异步组件(defineAsyncComponent)
- 路由懒加载
- SSR:服务端渲染(Nuxt.js)

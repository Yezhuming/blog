# react-beautiful-dnd 快速上手

因为在使用`react-beautiful-dnd`的时候没有找到一篇看完能快速上手的中文教程，因此在这简单介绍下这个拖拽组件，其实就是对 github 的官方文档翻译一下，然后对 Demo 加点注释帮助理解，只能算是一篇学习笔记吧 😂

# 0、Demo

[Demo 地址](https://codesandbox.io/s/vertical-list-with-multiple-drop-targets-forked-rv6xf?file=/index.js)

# 1、安装

```js
# yarn
yarn add react-beautiful-dnd

# npm
npm install react-beautiful-dnd --save
```

# 2、基本用法

要实现两个列表之间的拖拽效果就要先了解三个主要的包裹组件

### DragDropContext

拖拽上下文，这个组件用来包裹我们想要拖拽的列表，`<Droppable />`和`<Draggable />`必须放在这个组件里面。

###### 用法

```html
<DragDropContext
  onDragStart={this.onDragStart} // 拖拽开始
  onDragUpdate={this.onDragUpdate} // 拖拽变化
  onDragEnd={this.onDragEnd} // 拖拽结束
>
  <Droppable />
</DragDropContext>
```

其中`OnDragEnd`是拖拽结束事件，是必须要传的参数。

```js
onDragEnd = (result) => {
  // result参数
  /*
  {
    draggableId: "item-1" 拖拽元素id
    source: {
        index: 1, // 拖拽元素在原列表的位置
        droppableId: "source" // 原列表Id
    }
    destination: {
        index: 1, // 拖拽元素在放置列表的位置
        droppableId: "destination" // 放置列表Id
    }
    ...
  }
  */
  // 根据result的source和destination来处理列表的数据，完成拖拽操作
};
```

### Droppable

可放置组件，这个组件用来包裹能够被拖动元素放置的列表。

###### 用法

```html
<Droppable droppableId="droppable">
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : 'grey' }}
      {...provided.droppableProps}
    >
      <Draggable />
    </div>
  )}
</Droppable>
```

组件内部只接收函数，其中有些必传的参数。

- `droppableId` 必传参数，用来标识唯一的放置组件 Id，在拖拽触发的事件中会用到。
- `provided` 提供内部标签所需的 props
  - `innerRef` 获取 ref，funtion 组件是 ref，class 组件是 innerRef
  - `droppableProps` 必传参数，提供能够放置的列表的参数，在内部根节点展开即可
- `snapshot` 快照
  - `isDraggingOver` 是否有拖拽组件经过
  - `draggingOverWith` 被拖拽经过的拖拽元素 Id

### Draggable

可拖拽组件，这个组件用来包裹需要被拖拽的元素。

###### 用法

```html
<Draggable draggableId="{id}" index="{index}">
  {(provided, snapshot) => (
  <div
    {...provided.dragHandleProps}
    {...provided.draggableProps}
    ref="{provided.innerRef}"
  >
    ...
  </div>
  )}
</Draggable>
```

组件内部只接收函数，其中有些必传的参数。

- `draggableId` 必传参数，用来标识唯一的拖拽元素 Id，在拖拽触发的事件中会用到。
- `index` 必传参数，拖拽元素下标，标识拖拽元素在列表中的位置
- `provided` 提供内部标签所需的 props
  - `innerRef` 获取 ref，funtion 组件是 ref，class 组件是 innerRef
  - `draggableProps` 必传参数，提供能够拖拽的元素的参数，在内部根节点展开即可
  - `dragHandleProps` 必传参数，绑定在能点击并进行拖拽的组件上
- `snapshot` 快照
  - `isDragging` 是否拖拽中
  - `draggingOver` 拖拽元素经过的放置组件 Id

再补充一个使用中额外使用的参数：`isDragDisabled`，当该值设置为`true`时，元素将不可拖动。

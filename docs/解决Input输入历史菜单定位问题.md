### 一、问题描述

antd的`Input`输入框点击后回出现输入历史的菜单，此时滚动页面回出现定位问题。

![](https://files.mdnice.com/user/10344/80468633-1730-4e2a-860f-a8bdc9a370c8.gif)

**注意**：当**滚动是在整个页面上进行时**浏览器会自动隐藏掉输入历史。

![](https://files.mdnice.com/user/10344/8f3c62de-8218-44b7-a535-991a7fc447fa.gif)

### 二、解决方法

解决方法有两种，如下：

**禁用输入历史**

利用`autoComplete`属性禁用输入历史菜单的弹出。
```jsx
<Form autoComplete="off">
```

**监听滚动事件**

由于调用`Input` 自带的`focus` 方法去聚焦输入框是不会弹出输入历史的菜单，因此可以在第一次用鼠标点击输入框时监听滚动条，触发滚动事件后先调用失焦方法`blur` ，再调用聚焦方法`focus` ，就可以实现隐藏输入历史菜单的效果。

代码如下：
```jsx
import React, { useRef } from 'react';
import { Input, Form, Button } from 'antd';
import { useDebounceFn } from 'ahooks';

const App = () => {
  const inputRef = useRef(null);

  const handleScroll = () => {
    const { activeElement } = document;
    // 判断输入框是否获得焦点
    if (inputRef.current?.input === activeElement) {
      inputRef.current.blur();
      inputRef.current.focus();
    }
  };

  // 使用ahooks的防抖hook
  const { run } = useDebounceFn(
    () => {
      handleScroll();
    },
    {
      // 停止触发事件等待时间
      // 时间设置尽量小于1s，否则快速连续点击输入框再滚动容易出现第二次触发事件时还在上一次的等待时间中导致回调函数不执行
      wait: 500, 
      // 下面两项设置是为了在触发事件立马执行
      trailing: false,
      leading: true,
    },
  );

  useEffect(() => {
    window.addEventListener('scroll', run, true);
    return () => {
      window.removeEventListener('scroll', run, true);
    };
  }, []);

  return (
    <div>
      <Form>
        <Form.Item name="modelName" label="模型名称">
          <Input
            placeholder="请输入"
            style={{ width: 400 }}
            ref={inputRef}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">提交</Button>
      </Form>
    </div>
  );
};
```

效果如下：

![](https://files.mdnice.com/user/10344/44aac163-fc38-40ae-b53d-4308c70e160c.gif)
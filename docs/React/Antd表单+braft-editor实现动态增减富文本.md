本文将介绍React项目基于Antd的Form去使用[Braft-editor](https://braft.margox.cn/)实现富文本的动态新增和删除。

## 一、需求背景

需求内容是点击配置后进入配置模式（如果已存在文本模块要转换为富文本编辑模式），在页面上可以动态新增删除富文本，然后点击保存按钮统一保存所有文本并展示。

交互流程图如下：

![](https://static01.imgkr.com/temp/9279ec8f1fb74e63806423d003296611.png)

## 二、最终效果

最终实现的效果图如下：

![效果图.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4a160255d90402abdaed82be6ac8e65~tplv-k3u1fbpfcp-watermark.image)


## 三、实现过程

### 富文本的基本使用

基于Antd的Form表单使用富文本可参考[官方Demo](https://braft.margox.cn/demos/antd-form)

### 动态新增删除富文本
 
因为富文本组件是放在`Form`组件里，因此动态新增删除富文本相当于动态增减表单项（[Form.List](https://ant.design/components/form-cn/#components-form-demo-dynamic-form-items)），实现代码如下：

```js
<Form
  onFinish={handleSubmit}
  layout="horizontal"
  autoComplete="off"
>
  <Form.List name="moduleExtras">
    {(fields, { add, remove }) => (
      <>
        {fields.map(field => {
          return (
            <div key={field.key} className={styles.formItem}>
              <div className={styles.formItemHeader}>
                <Form.Item
                  {...field}
                  label="标题"
                  name={[field.name, 'title']}
                  fieldKey={[field.fieldKey, 'title']}
                >
                  <Input placeholder="请输入标题" allowClear style={{ width: 300 }} />
                </Form.Item>
                <Button onClick={() => remove(field.name)} icon={<DeleteOutlined />} danger>
                  删除
                </Button>
              </div>
              <Form.Item
                {...field}
                name={[field.name, 'content']}
                fieldKey={[field.fieldKey, 'content']}
              >
                <BraftEditor
                  style={{ border: '1px solid #dedede', marginTop: 10 }}
                  controls={controls}
                  placeholder="请输入正文内容"
                />
              </Form.Item>
            </div>
          );
        })}
        <Form.Item>
          <Button
            type="default"
            onClick={() => add()}
            icon={<PlusOutlined />}
          >
            新增模块
          </Button>
        </Form.Item>
      </>
    )}
  </Form.List>
  <Form.Item style={{ marginTop: 10 }}>
    <Button type="primary" htmlType="submit">保存配置</Button>
  </Form.Item>
</Form>
```

![](https://static01.imgkr.com/temp/1b82e25c7ac84b4a8ab5ab2ff3baf773.png)

左下角的新增模块按钮和右上角的删除按钮分别调用`Form.List`提供的`add`和`remove`方法即可实现表单的新增和删除。

### 展示富文本编辑的内容

![](https://static01.imgkr.com/temp/6e530074dd7e449ea27f0b511c5e3d32.png)

当点击保存配置按钮时表单的`onFinish`会帮我们收集表单的数据并作为方法的第一个参数，打印出来可得到以下结果：

![](https://static01.imgkr.com/temp/271123fdcf784cbfbae72f7428c61f61.png)
 
`moduleExtras`是`Form.List`的`name`属性，它保存着表单当前收集的数据，`content`就是富文本实例，要想得到编辑的内容还需要调用`editorState.toHTML()`获取`html`。

```js
/** 绑定在Form的onFinish */
const handleSubmit = values => {
  params = values.moduleExtras.map(item => ({
    title: item.title,
    content: item.content.toHTML(),
  }));
  console.log(params) // [{title: "111", content: "<p>222</p>"}]
}
```

渲染文本模块就是根据`content`的`html`来渲染，我并没有采用官方文档上的方法，方法如下：

```js
// 给用于展示HTML内容的容器加上特定的className
<div className="braft-output-content" dangerouslySetInnerHTML={{__html: outputContent}}></div>
```

[dangerouslySetInnerHTML](https://zh-hans.reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)是Reac为浏览器DOM提供`innerHTML`的替换方案，类似`vue`的`v-html`。

这种方法有一个问题就是当`html`中存在多个空格时，渲染出来的只有一个空格或者为空。

`<p>    222    123</p>`

![](https://static01.imgkr.com/temp/72467c657a8f49bb97428897f0282a2a.png)

解决方法是给展示的标签添加`white-space: pre`CSS属性即可。

![](https://static01.imgkr.com/temp/dacfd23e6afb49fe863830c3f89b3000.png)

而我展示`html`的方法是利用官方提供的`readOnly`属性将富文本设置成**只读模式**，并且清空工具栏，也能实现上图效果。

```js
<BraftEditor
  value={BraftEditor.createEditorState(content)}
  readOnly
  controls={[]}
  contentStyle={{ height: 'auto', overflowY: 'hidden', paddingBottom: 0 }}
/>
```

### 给富文本添加上传图片功能

首先参考[官方上传图片Demo](https://braft.margox.cn/demos/antd-upload)的方法给富文本添加上传图片的控件。

```js
/** 自定义上传图片控件 */
const extendControls = field => [
  {
    key: 'antd-uploader',
    type: 'component',
    component: (
      <Upload {...uploadFiles}>
        {/* 这里的按钮最好加上type="button"，以避免在表单容器中触发表单提交，用Antd的Button组件则无需如此 */}
        <button
          type="button"
          className="control-item button upload-button"
          data-title="插入图片"
          onClick={() => setUploadField(field)}
        >
          插入图片
        </button>
      </Upload>
    ),
  },
];

// 文件上传
  const uploadFiles = {
    accept: 'image/*', // 只接受图片
    name: 'file',
    action: '/uploadUrl', // 这里是上传图片接口的url
    showUploadList: false,
    onChange: info => {
      if (info.file.status === 'done') { // 图片上传成功返回url
        const { moduleExtras } = form.getFieldsValue(); // 获取表单数据
        if (moduleExtras[uploadField.name]) { // uploadField是点击图片时保存的当前表单项的内容，name为索引
          moduleExtras[uploadField.name] = {
            // 用name去获取对应索引的表单项，新增删除表单项key会自增
            ...moduleExtras[uploadField.name], // 重新设置富文本外其他内容，否则会导致除富文本外其他内容被清空
            content: ContentUtils.insertMedias(moduleExtras[uploadField.name].content, [
              {
                type: 'IMAGE',
                url: info.file.response.data.originUrl // 图片url,
              },
            ]),
          };
          // 修改完表单内容后回填
          form.setFieldsValue({ moduleExtras });
          Message.success('上传成功');
        } else {
          Message.warning('上传失败');
        }
      } else if (info.file.status === 'error') {
        Message.error('上传失败');
      }
    },
  };
```

上传功能跟平常使用antd的`Upload`组件类似，需要注意的是将图片插入到富文本编辑器中需要调用`ContentUtils.insertMedias`方法，方法的第一个参数是富文本实例，所以在前面需要**通过表单获取上传图片对应的表单项下的富文本实例**来将图片插入到对应的富文本下。

### 添加校验功能

利用`isEmpty()`方法给富文本添加一个非空校验功能，实现代码如下：
```js
<Form.Item
  {...field}
  name={[field.name, 'content']}
  fieldKey={[field.fieldKey, 'content']}
  rules={[
    {
      required: true,
      validator: (_, value) =>
        value.isEmpty() // 调用isEmpty方法检测是否为空
          ? Promise.reject(new Error('正文不可为空'))
          : Promise.resolve(),
    },
  ]}
>
```

### 给表单设置初始值

最后就是当页面上已添加了几个文本模块时，点击配置按钮后要将文本模块给转换成富文本编辑的模式。

只要将文本模块的数据遍历生成表单初始值的数据，然后传给表单的`initialValues`即可，实现代码如下：

```jsx
/** 初始值 */
const initialValues = initialModule.map((item, index) => ({
  fieldKey: index,
  isListField: true,
  key: index,
  name: index,
  title: item.title,
  content: BraftEditor.createEditorState(item.content),
}));
<Form
  form={form}
  onFinish={handleSubmit}
  layout="horizontal"
  initialValues={{ moduleExtras: initialValues }}
  autoComplete="off"
>
```
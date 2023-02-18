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

const button = new Button();
button.onClick();
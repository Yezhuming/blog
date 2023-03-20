// 题目1：编写一个 People 类，使其的实例具有监听事件、触发事件、解除绑定功能。（实例可能监听多个不同的事件，也可以去除监听事件）
class People {
  constructor(name) {
    this.name = name;
    this.events = {}; // 空对象 储存事件类型和事件处理函数之间的映射
  }

  // TODO: 请在此处完善代码
  /** 监听事件 */
  on(type, handle) {
    if (!this.events[type]) {
      this.events[type] = [];
    }
    this.events[type].push(handle);
  }

  /** 解除绑定 */
  off(type, handle) {
    if (this.events[type]) {
      const index = this.events[type].indexOf(handle);
      if (index > -1) {
        this.events[type].splice(index, 1);
      }
    }
  }

  /** 触发事件 */
  emit(type, ...args) {
    if (this.events[type]) {
      this.events[type].forEach(fn => {
        fn(...args);
      });
    }
  }

  sayHi() {
    console.log(`Hi, I am ${this.name}`)
  }
}


/* 以下为测试代码 */
const say1 = (greeting) => {
  console.log(`${greeting}, nice meeting you.`)
}

const say2 = (greeting) => {
  console.log(`${greeting}, nice meeting you, too.`)
}

const jerry = new People('Jerry')
jerry.sayHi()
// => 输出：'Hi, I am Jerry'

jerry.on('greeting', say1)
jerry.on('greeting', say2)

jerry.emit('greeting', 'Hi')
// => 输出：'Hi, nice meeting you.' 和 'Hi, nice meeting you, too'

jerry.off('greeting', say1)
jerry.emit('greeting', 'Hi')
// => 只输出：'Hi, nice meeting you, too'

// 题目2：完成 sleep 函数，可以达到下面的效果：
const sleep = (duration) => {
  // TODO
  return new Promise(resolve => setTimeout(resolve, duration));
}

const anyFunc = async () => {
  console.log("123") // 输出 123
  await sleep(300) // 暂停 300 毫秒
  console.log("456") // 输出 456，但是距离上面输出的 123 时间上相隔了 300 毫秒
}

anyFunc();

// 完成 deepGet 函数，给它传入一个对象和字符串，字符串表示对象深层属性的获取路径，可以深层次获取对象内容：
const deepGet = (obj, prop) => {
  // TODO: 在此处完善代码
  const propArr = prop.split('.');
  let i = 0;
  let tempObj = {};
  tempObj = obj[propArr[i]];

  while(tempObj && ++i < propArr.length) {
    const item = propArr[i];
    const index = item.indexOf('[');
    // 如果是数组
    if (index > -1) {
      tempObj = tempObj[item.slice(0, index)][item.substr(index + 1, 1)];
    } else {
      tempObj = tempObj[item];
    }
  }
  console.log(tempObj);
  return tempObj;
}

/** 以下为测试代码 */
deepGet({
  school: {
    student: { name: 'Tomy' },
  },
}, 'school.student.name') // => 'Tomy'

deepGet({
  school: {
    students: [
      { name: 'Tomy' },
      { name: 'Lucy' },
    ],
  }
}, 'school.students[1].name') // => 'Lucy'

// 对于不存在的属性，返回 undefined
deepGet({ user: { name: 'Tomy' } }, 'user.age') // => undefined
deepGet({ user: { name: 'Tomy' } }, 'school.user.age') // => undefined

// 题目4：完成 combo 函数。它接受任意多个单参函数（只接受一个参数的函数）作为参数，并且返回一个函数。它的作为用：使得类似 f(g(h(a))) 这样的函数调用可以简写为 combo(f, g, h)(a)。
const combo = (...args) => {
  // TODO: 请在此处完善代码
  const fnArr = [...args].reverse();

  return function (innerArgs) {
    let result = innerArgs;
    fnArr.forEach(fn => {
      result = fn(result);
    });

    console.log(result);
    return result;
  }
}

/* 以下为测试代码 */
const addOne = (a) => a + 1
const multiTwo = (a) => a * 2
const divThree = (a) => a / 3
const toString = (a) => a + ''
const split = (a) => a.split('')

split(toString(addOne(multiTwo(divThree(666)))))
// => ["4", "4", "5"]

const testForCombo = combo(split, toString, addOne, multiTwo, divThree)
testForCombo(666)
// => ["4", "4", "5"]

/**
 * 题目5：有两个盘子分别放有 5 个和 7 个小球，两个朋友玩游戏：每个人轮流从两个盘子中拿小球，每人每次只能从其中一个盘子中拿，每次可以拿 1 个或者多个（不能一个都不拿），
 * 拿到最后一个小球的人算输。问开局先手和后手是否有必胜策略？如果有，请描述必胜策略。
 */

/**
 * 答：先手有必胜策略。
 * 5个小球盘子为p1，7个小球盘子p2
 * 先手先从 p2 拿2个小球，这时两个盘子小球数量相等，这时无论后手从哪个盘子，拿几个球，先手只要在其中一个盘子的小球数量为0或者1之前保持两个盘子小球的数量相等即可
 * 当其中一个盘子小球为1时，先手把另一个盘子小球全部拿完，这时剩下1个小球给后手，后手必输
 * 当其中一个盘子小球为0时，先手把另一个盘子小球拿剩1个，这时后手也必输
 */
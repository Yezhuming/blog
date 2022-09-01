# 手写 Promise

```js
class myPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(fn) {
    // 初始状态为pending
    this.PromiseState = myPromise.PENDING;
    // 初始值为null
    this.PromiseResult = null;
    // 用于保存成功回调
    this.onFulfilledCallbacks = [];
    // 用于保存失败回调
    this.onRejectedCallbacks = [];
    try {
      // call、apply会立即执行函数，bind会返回一个改变this指向的新函数
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(result) {
    // 只能由pedning状态 => fulfilled状态 (避免调用多次resolve reject)
    if (this.PromiseState === myPromise.PENDING) {
      /**
       * 为什么resolve和reject要加setTimeout?
       * 2.2.4规范 onFulfilled 和 onRejected 只允许在 execution context 栈仅包含平台代码时运行.
       * 注1 这里的平台代码指的是引擎、环境以及 promise 的实施代码。实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。
       * 这个事件队列可以采用“宏任务（macro-task）”机制，比如setTimeout 或者 setImmediate； 也可以采用“微任务（micro-task）”机制来实现， 比如 MutationObserver 或者process.nextTick。
       */
      setTimeout(() => {
        this.PromiseState = myPromise.FULFILLED;
        this.PromiseResult = result;
        /**
         * 在执行resolve或者reject的时候，遍历自身的callbacks数组，
         * 看看数组里面有没有then那边 保留 过来的 待执行函数，
         * 然后逐个执行数组里面的函数，执行的时候会传入相应的参数
         */
        this.onFulfilledCallbacks.forEach((callback) => {
          callback(result);
        });
      });
    }
  }

  reject(reason) {
    // 只能由pedning状态 => rejected状态 (避免调用多次resolve reject)
    if (this.PromiseState === myPromise.PENDING) {
      // 在事件循环末尾执行
      setTimeout(() => {
        this.PromiseState = myPromise.REJECTED;
        this.PromiseResult = reason;
        // reject 时遍历数组并依次执行
        this.onRejectedCallbacks.forEach((callback) => {
          callback(reason);
        });
      });
    }
  }

  /**
   * [注册fulfilled状态/rejected状态对应的回调函数]
   * @param {function} onFulfilled  fulfilled状态时 执行的函数
   * @param {function} onRejected  rejected状态时 执行的函数
   * @returns {myPromise} newPromsie  返回一个新的promise对象
   */
  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (error) => {
            throw error;
          };
    const promise2 = new myPromise((resolve, reject) => {
      // resolve/reject 在宏任务执行的话，then 执行时 resolve/reject 仍未调用，所以状态仍然是 pending
      switch (this.PromiseState) {
        case myPromise.PENDING:
          // 保存的回调也要处理异常和返回值x
          this.onFulfilledCallbacks.push(() => {
            try {
              const x = onFulfilled(this.PromiseResult);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
          this.onRejectedCallbacks.push(() => {
            try {
              const x = onRejected(this.PromiseResult);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
          break;
        case myPromise.FULFILLED:
          // resolve 改变状态后调用 then
          setTimeout(() => {
            try {
              const x = onFulfilled(this.PromiseResult);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
          break;
        case myPromise.REJECTED:
          // reject 改变状态后调用 then
          setTimeout(() => {
            try {
              const x = onRejected(this.PromiseResult);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
          break;
        default:
          break;
      }
    });
    // then 方法必须返回一个promise对象
    return promise2;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
   * @param {function} callBack 无论结果是fulfilled或者是rejected，都会执行的回调函数
   * @returns myPromise
   */
  finally(callBack) {
    return this.then(callBack, callBack);
  }

  // myPromise.resolve
  static resolve(value) {
    if (value instanceof myPromise) {
      // 如果这个值是一个 promise ，那么将返回这个 promise
      return value;
    } else if (value instanceof Object && "then" in value) {
      // 如果这个值是thenable（即带有`"then" `方法），返回的promise会“跟随”这个thenable的对象，采用它的最终状态；
      return new myPromise((resolve, reject) => {
        value.then(resolve, reject);
      });
    } else {
      // 否则返回的promise将以此值完成，即以此值执行`resolve()`方法 (状态为fulfilled)
      return new myPromise((resolve) => {
        resolve(value);
      });
    }
  }

  // myPromise.reject
  static reject(reason) {
    return new myPromise((_, reject) => {
      reject(reason);
    });
  }

  // myPromise.all
  static all(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        // 如果传入的参数是一个空的可迭代对象，则返回一个已完成（already resolved）状态的 Promise
        if (promises.length === 0) return resolve(promises);
        // 保存resolve的结果
        let result = [];
        // 记录已经resolve的数量
        let count = 0;

        promises.forEach((item, index) => {
          if (item instanceof myPromise) {
            item
              .then((value) => {
                count++;
                result[index] = value;
                if (count === promises.length) resolve(result);
              })
              .catch((e) => {
                reject(e);
              });
          } else {
            // 参数里中非Promise值，原样返回在数组里
            count++;
            result[index] = item;
            if (count === promises.length) resolve(result);
          }
        });
      } else {
        return reject(new TypeError("Argument is not iterable"));
      }
    });
  }

  // myPromise.allSettled
  static allSettled(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        // 如果传入的是一个空数组，那么就直接返回一个resolved的空数组promise对象
        if (promises.length === 0) return resolve(promises);

        let result = [];
        let count = 0;

        promises.forEach((item, index) => {
          myPromise
            .resolve(item)
            .then((value) => {
              count++;
              result[index] = {
                status: "fulfilled",
                value,
              };
              if (count === promises.length) resolve(result);
            })
            .catch((reason) => {
              count++;
              result[index] = {
                status: "rejected",
                reason,
              };
              if (count === promises.length) resolve(result);
            });
        });
      } else {
        return reject(new TypeError("Argument is not iterable"));
      }
    });
  }

  // myPromise.any
  static any(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        // 如果传入的是一个空数组，那么就直接返回一个resolved的空数组promise对象
        if (promises.length === 0)
          return reject(new AggregateError("All promises were rejected"));

        let result = [];
        let count = 0;

        promises.forEach((item, index) => {
          myPromise
            .resolve(item)
            .then((value) => {
              // 只要其中的一个 promise 成功，就返回那个已经成功的 promise
              resolve(value);
            })
            .catch((reason) => {
              /**
               * 如果可迭代对象中没有一个 promise 成功，就返回一个失败的 promise 和AggregateError类型的实例，
               * AggregateError是 Error 的一个子类，用于把单一的错误集合在一起。
               */
              count++;
              result.push(reason);
              if (count === promises.length) reject(new AggregateError(result));
            });
        });
      } else {
        return reject(new TypeError("Argument is not iterable"));
      }
    });
  }

  // myPromise.race
  static race(promises) {
    let called = false;
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        if (promises.length > 0) {
          promises.forEach((item) => {
            /**
             * 如果迭代包含一个或多个非承诺值和/或已解决/拒绝的承诺，
             * 则 Promise.race 将解析为迭代中找到的第一个值。
             * 执行第一个resolve或reject后忽略后续的值
             */
            myPromise.resolve(item).then(
              (value) => {
                if (!called) {
                  called = true;
                  resolve(value);
                }
              },
              (reason) => {
                if (!called) {
                  called = true;
                  reject(reason);
                }
              }
            );
          });
        }
      } else {
        return reject(new TypeError("Argument is not iterable"));
      }
    });
  }
}

/**
 * 对resolve()、reject() 进行改造增强 针对resolve()和reject()中不同值情况 进行处理
 * @param {*} promise2 promise1.then方法返回的新promise对象
 * @param {*} x promise1中onFulfilled或onRejected的返回值
 * @param {*} resolve promise2的resolve方法
 * @param {*} reject promise2的reject方法
 */
const resolvePromise = (promise2, x, resolve, reject) => {
  // 如果从onFulfilled或onRejected中返回的 x 就是promise2，会导致循环引用报错
  // 例如 const p1 = promise.then(() => {
  //   ...
  //   return p1;
  // })
  if (x === promise2) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }

  // 如果 x 为 Promise ，则使 promise2 接受 x 的状态
  if (x instanceof myPromise) {
    switch (x.PromiseState) {
      case myPromise.PENDING:
        /**
         * 2.3.2.1
         * 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
         * 注意"直至 x 被执行或拒绝"这句话，这句话的意思是：如果执行x的时候拿到一个y，还要继续解析y
         */
        x.then((y) => {
          resolvePromise(promise2, y, resolve, reject);
        }, reject);
        break;
      case myPromise.FULFILLED:
        // 2.3.2.2 如果 x 处于执行态，用相同的值执行 promise
        resolve(x.PromiseResult);
        break;
      case myPromise.REJECTED:
        // 2.3.2.3 如果 x 处于拒绝态，用相同的据因拒绝 promise
        reject(x.PromiseResult);
        break;
      default:
        break;
    }
  } else if (x && (typeof x === "object" || typeof x === "function")) {
    // 2.3.3 如果 x 为对象或函数（排除null）
    try {
      var then = x.then;
    } catch (e) {
      return reject(e);
    }

    /**
     * 2.3.3.3
     * 如果 then 是函数，将 x 作为函数的作用域 this 调用之。
     * 传递两个回调函数作为参数，
     * 第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`
     */
    if (typeof then === "function") {
      // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      let called = false; // 避免多次调用
      try {
        then.call(
          x,
          // 2.3.3.3.1 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          // 2.3.3.3.2 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } catch (e) {
        /**
         * 2.3.3.3.4 如果调用 then 方法抛出了异常 e
         * 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
         */
        if (called) return;
        called = true;
        /**
         * 2.3.3.3.4.2 否则以 e 为据因拒绝 promise
         */
        reject(e);
      }
    } else {
      // 2.3.3.4 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 2.3.4 如果 x 不为对象或者函数，以 x 为参数执行 promise
    // return resolve(x);
    resolve(x);
  }
};
```

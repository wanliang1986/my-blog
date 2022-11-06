---
title: redux源码详解
date: '2022-10-24'
sidebar: 'auto'
categories:
 - react 相关
tags:
 - redux
---

::: tip
redux是js应用的状态容器，提供可预测的状态管理。在react的开发体系中，redux占据了非常重要的位置。
官网链接：https://cn.redux.js.org/
:::

# redux的三大原则
1. 单一数据源：整个应用的 state 被储存在一颗 object tree 中，并且这个 object tree只存在于唯一一个 store 中。（一个项目中只能有一个store）
2. state 是只读的：唯一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象
3. 使用纯函数来执行修改：为了描述 action 如何改变 state tree，需要编写 reducers


# redux的核心
1. store 由redux中createStore方法创建出来的存储数据对象
2. dispatch 用于发起更新state的更新
3. reducer 用于处理state的更新
4. action 用于描述如何更新state,是store的唯一数据来源,reducer会通过action中的type判断如何处理state
5. Provider 全局注册，通常我们会在项目最外层运用，保证其中各个组件都能拿到state
6. connect 连接组件和store的关系

# redux在react中的运用

redux的安装请看官网。
首先，我们看看redux在react中是如何运用的。（借用官网的例子）
``` js
import { createStore } from 'redux'
/**
 * 这是一个 reducer 函数：接受当前 state 值和描述“发生了什么”的 action 对象，它返回一个新的 state 值。
 * reducer 函数签名是 : (state, action) => newState
 *
 * Redux state 应该只包含普通的 JS 对象、数组和原语。
 * 根状态值通常是一个对象。 重要的是，不应该改变 state 对象，而是在 state 发生变化时返回一个新对象。
 *
 * 你可以在 reducer 中使用任何条件逻辑。 在这个例子中，我们使用了 switch 语句，但这不是必需的。
 * 
 */
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

// 创建一个包含应用程序 state 的 Redux store。
// 它的 API 有 { subscribe, dispatch, getState }.
let store = createStore(counterReducer)

// 你可以使用 subscribe() 来更新 UI 以响应 state 的更改。
// 通常你会使用视图绑定库（例如 React Redux）而不是直接使用 subscribe()。
// 可能还有其他用例对 subscribe 也有帮助。

store.subscribe(() => console.log(store.getState()))

// 改变内部状态的唯一方法是 dispatch 一个 action。
// 这些 action 可以被序列化、记录或存储，然后再重放。
store.dispatch({ type: 'counter/incremented' })
// {value: 1}
store.dispatch({ type: 'counter/incremented' })
// {value: 2}
store.dispatch({ type: 'counter/decremented' })
// {value: 1}
```

可以很清楚的看出，通过createStore方法创建了一个store,而这个方法接收了一个函数reducer,reducer函数有两个参数，state和action，通过action的type，来操作state的值的改变，并将新的state返回，
这样store的数据就进行了更新。下面我们来看看redux源码是如何实现这些功能的。


# 源码分析

index.js文件
``` js
import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
import warning from './utils/warning'
import __DO_NOT_USE__ActionTypes from './utils/actionTypes'

function isCrushed() {}

if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {
  warning(
    'You are currently using minified code outside of NODE_ENV === "production". ' +
      'This means that you are running a slower development build of Redux. ' +
      'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
      'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' +
      'to ensure you have the correct code for your production build.'
  )
}

export {
  createStore,// 创建store
  combineReducers,//合并reducer 返回最新状态树
  bindActionCreators,//把一个 value 为不同 action creator 的对象，转成拥有同名 key 的对象
  applyMiddleware,//通过自定义中间件拓展dispatch功能
  compose, //是从右到左去组合中间件函数
  __DO_NOT_USE__ActionTypes,//默认的actionTypes
}
```
index.js文件比较简单，通过文件引用导出了6个方法。在这中间，最重要的方法就是createStore，它也是redux整个功能实现的方法

## createStore文件详细解析

``` js
export default function createStore(reducer, preloadedState, enhancer) {
  //createStore接收3个参数，
  //reducer函数，preloadedState（state的初始值），
  //enhancer：store的增强器，就是我们常说的中间件，比如（thunk）
  if (
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.'
    )
  }
  //判断preloadedState 和 enhancer 是否同时为 Function，如果是，抛出错误

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  //如果 preloadedState 为 Function 但是 enhancer 为 undefined,
  // 那么将 preloadedState 赋给 enhancer，并且 preloadedState 置为 undefined

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error(
        `Expected the enhancer to be a function. Instead, received: '${kindOf(
          enhancer
        )}'`
      )
    }
    return enhancer(createStore)(reducer, preloadedState)
  }

  //如果 enhancer 不为 undefined，那么 enhancer 必须为 Function，
  //如果是 Function 直接返回 enhancer(createStore)(reducer, preloadedState)

  if (typeof reducer !== 'function') {
    throw new Error(
      `Expected the root reducer to be a function. Instead, received: '${kindOf(
        reducer
      )}'`
    )
  }
  //判断 reducer是否是function，如果不是，抛出错误
```
这一部分比较简单，只是对传入的参数进行类型判断，不满足的情况下进行报错处理

声明内部变量
``` js 
  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = [] //当前监听的函数列表
  let nextListeners = currentListeners //新生成的监听函数列表
  let isDispatching = false
```

``` js
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
  //通过浅拷贝保证nextListeners的变化不会影响当前的currentListeners

  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }
  //在reducer执行过程中，不能使用store.getState()来获取state。
```

``` js
function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error(
        `Expected the listener to be a function. Instead, received: '${kindOf(
          listener
        )}'`
      )
    }
    //判断参数是否是function

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api/store#subscribelistener for more details.'
      )
    }
    //同样，在reducer执行过程中，不能再次进行订阅

    let isSubscribed = true
    //开始订阅
    ensureCanMutateNextListeners()
    nextListeners.push(listener)
    //添加新的监听函数到nextListeners

    //返回该订阅函数的取消订阅函数
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api/store#subscribelistener for more details.'
        )
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
      currentListeners = null
    }
  }

```

``` js
  function dispatch(action) {
    //判断action是否是一个简单对象（只有通过{}或new Object()出案件的对象才是简单对象）
    if (!isPlainObject(action)) {
      throw new Error(
        `Actions must be plain objects. Instead, the actual type was: '${kindOf(
          action
        )}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`
      )
    }
    //判断action中是否有type，不存在则报错
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.'
      )
    }
    //如果正在执行dispatch，那么同时进行的dispatch报错，也就是说dispatch只能是串行，不能并行
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }
    //修改dispatch状态，变化为true，然后执行currentReducer方法获取到最新的state
    //执行结束后修改diapatch状态为false
    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
    //当ruedcer执行完成以后，通知订阅的listeners 依次进行执行订阅此store的函数
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }
  
  //此函数也是直接暴露出来的store.replaceReducer函数，一般在实际开发中使用较少。 主要用于动态加载reducer。
   function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error(
        `Expected the nextReducer to be a function. Instead, received: '${kindOf(
          nextReducer
        )}`
      )
    }

    currentReducer = nextReducer

    dispatch({ type: ActionTypes.REPLACE })
  }
//observable 是通过私有属性被暴露出去的 ，只供内部使用。 该函数对外返回一个subscribe方法，该方法可以用来观察最小单位的state 状态的改变。 
// 这个方法的参数 observer 是一个具有next （类型为Function） 属性的对象。
// 如下源码所示： 函数首先将createStore 下的subscribe方法赋值给outerSubscribe，在起返回的方法中 首先定义函数observeState ,
// 然后将其传入outeSubscribe。实际上是封装了一个linster 引用subscribe来做订阅。当消息被分发时，就出发了这个 linster ，
// 然后next方法下调用observer.next(getState()) 就获取到了当前的state
  function observable() {
    const outerSubscribe = subscribe
    return {
      subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError(
            `Expected the observer to be an object. Instead, received: '${kindOf(
              observer
            )}'`
          )
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      },
    }
  }
```



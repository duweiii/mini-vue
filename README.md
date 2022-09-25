# mini-vue
 学习 Vue3 源码，实现简易版 Vue 模型

# 进度
核心流程现在都跑通了，后面再慢慢扩充。

# 功能
## reactivity
- [x] ref
  - [x] Ref
  - [x] isRef
  - [x] unRef

- [x] reactive
  - [x] Reactive
  - [x] isReactive

- [x] readonly
  - [x] isReadonly

- [x] shallowReadonly
- [x] isProxy
- [x] track
- [x] trigger
- [x] effect
  - [x] ReactiveEffect
  - [x] runner
  - [x] scheduler
  - [x] stop & onStop
  
- [x] watch


## runtime-core

- [x] createVNode
- [x] createElementVNode
- [x] createTextVNode
- [x] toDisplayString
- [x] proxyRefs
- [x] computed
- [x] proxy
- [x] shapeFlag
- [x] register event
- [x] props
  - [x] initProps
- [x] emit
- [x] slot
  - [x] initSlots
  - [x] renderSlots
- [x] Fragment
- [x] Text
- [x] getCurrentInstance
- [x] provide & inject
- [x] customRenderer
- [x] 初始化&更新逻辑
- [x] 双端对比算法
- [x] 异步渲染
- [x] nextTick

## runtime-dom

- [x] createApp

## compile-core

- [x] baseCompile

### parse

- [x] baseParse
  - [x] parseText
  - [x] parseInterpolation
  - [x] parseElement
  - [x] finite-machine

### transform

- [x] transform
- [x] plugins
  - [x] transformExpression
  - [x] transformElement
  - [x] transformText
  - [x] transformChildren

### generate

- [x] generate
  - [x] genText
  - [x] genElement
  - [x] genElementChildren
  - [x] genInterpolation
  - [x] genSimpleExpression
  - [x] genCompoundExpression



## template -> render function

- [x] compileToFunction
- [x] registerCompiler
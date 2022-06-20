import { h, inject, provide } from "../lib/guide-mini-vue.esm.js"


const one = {
  name: 'one',
  setup(){},
  render(){
    return h('div', {}, [h(two)])
  },
}

const two = {
  setup(){},
  render(){
    // return h('div', {}, '12312312')
    return h('div', {}, [ h(three) ])
  },
}

const three = {
  setup(){
    const info = inject('info');
    // const noneValue = inject("abaaba", '这是默认值')
    const noneValue = inject("abaaba", () => '这是默认值函数的执行结果')
    return {
      info,
      noneValue
    }
  },
  render(){
    // return h('div', {}, 'three组件中接收到的App组件的值: ______>>>: ' + this.info)
    // return h('div', {}, '测试一下默认值: ______ : ' + this.noneValue )
    return h('div', {}, '测试一下默认值函数: ______ : ' + this.noneValue )
  },
}

export const App = {
  name: 'App',
  setup(){
    provide('info', 'App组件中provide的数据')
  },
  render(){
    return h('div', {}, [ h(one) ])
  } 
}
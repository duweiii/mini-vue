import { h, ref } from '../../lib/guide-mini-vue.esm.js';

// 纯右侧添加
// const oldChildren = [ 
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
// ]
// const newChildren = [ 
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
//   h('div', { key: "new_D" }, "new_D"),
//   h('div', { key: "new_E" }, "new_E"),
// ]

// 纯左侧添加
// const oldChildren = [ 
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
// ]
// const newChildren = [ 
//   h('div', { key: "new_1" }, "new_1"),
//   h('div', { key: "new_2" }, "new_2"),
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
// ]

// 纯右侧删除
// const oldChildren = [ 
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
// ]
// const newChildren = [ 
//   h('div', { key: "A" }, "A"),
// ]

// 纯左侧删除
// const oldChildren = [ 
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
//   h('div', { key: "D" }, "D"),
// ]
// const newChildren = [ 
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
//   h('div', { key: "D" }, "D"),
// ]

// 下面就剩处理区间内的变化了 a,b,c,[d,e,f],g => abc[d,e,h]g
// 包括，delete&changeOrder&create
// 1. 删除
// const oldChildren = [ 
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
//   h('div', { key: "D" }, "D"),
//   h('div', { key: "E" }, "E"),
//   h('div', { key: "F" }, "F"),
// ]
// const newChildren = [ 
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "E" }, "E"),
//   h('div', { key: "C" }, "C"),
//   h('div', { key: "F" }, "F"),
// ]

// 改变顺序
// const oldChildren = [ 
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "C" }, "C"),
//   h('div', { key: "D" }, "D"),
//   h('div', { key: "E" }, "E"),
//   h('div', { key: "F" }, "F"),
//   h('div', { key: "G" }, "G"),
// ]
// const newChildren = [
//   h('div', { key: "A" }, "A"),
//   h('div', { key: "B" }, "B"),
//   h('div', { key: "E" }, "E"),
//   h('div', { key: "C" }, "C"),
//   h('div', { key: "D" }, "D"),
//   h('div', { key: "F" }, "F"),
//   h('div', { key: "G" }, "G"),
// ]

// 添加元素
const oldChildren = [ 
  h('div', { key: "A" }, "A"),
  h('div', { key: "B" }, "B"),
  h('div', { key: "C" }, "C"),
  h('div', { key: "D" }, "D"),
  h('div', { key: "E" }, "E"),
  h('div', { key: "F" }, "F"),
  h('div', { key: "G" }, "G"),
]
const newChildren = [
  h('div', { key: "A" }, "A"),
  h('div', { key: "B" }, "B"),
  h('div', { key: "E" }, "E"),
  h('div', { key: "H" }, "H"),
  h('div', { key: "C" }, "C"),
  h('div', { key: "D" }, "D"),
  h('div', { key: "F" }, "F"),
  h('div', { key: "G" }, "G"),
]


export const App = {
  setup(){
    const s = ref(true)
    window.s = s;
    return {
      s
    }
  },
  render(){
    return h("div", {}, this.s ? oldChildren : newChildren)
  },
}
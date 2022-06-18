import { h } from '../lib/guide-mini-vue.esm.js';

export const App = {
  render(){
    return h('div',
    {
      id: 'root',
      class: 'root-class'
    },
    [h('div',{class: 'red'}, 'hi'), h('p', {class: 'blue'}, 'nihao')]
    )
  },
  setup(){
    return {
      msg: 'hello world'
    }
  }
}
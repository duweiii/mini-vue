import { h, ref } from '../../lib/guide-mini-vue.esm.js';

// 子组件
const foo = { 
  setup(props){
    
  },
  render(){
    return h('div', {}, `child-component & props.count = ${this.$props.count}`)
  }
}

export const App = {
  setup(){
    const count = ref(1)
    window.count = count;
    return {
      count
    }
  },
  render(){
    return h(
      "div", 
      {}, 
      [
        h('div', {}, 'first-child'),
        h(foo, {count: this.count})
      ])
  },
}
import { h } from '../lib/guide-mini-vue.esm.js';
import Foo from './foo.js';
export const App = {
  render(){
    return h('div',
    {
      id: 'root',
      class: 'root-class',
      onClick(){
        console.log( 'trigger click')
      }
    },
    [
      h('div',{ class: 'red '}, 'hi'), 
      h('p', { class: 'blue' }, 'nihao: setup->msg ----> '+this.msg),
      h(Foo, { count: 1 } )
    ]
    )
  },
  setup(){
    return {
      msg: 'hello world'
    }
  }
}
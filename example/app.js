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
      h(
        Foo, 
        { 
          count: 1, 
          onAdd(a,b){
            console.log(a,b,"____Dad component")
          }
        },
        h('p',{id: 'slot-id-p'}, '这是slot功能')
      )
    ]
    )
  },
  setup(){
    return {
      msg: 'hello world'
    }
  }
}
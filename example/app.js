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
        {
          default: () => h('p',{id: 'slot-id-p-default'}, '这是slot的默认插槽'),
          header: () => h('p',{id: 'slot-id-p-header'}, '这是slot的具名插槽，且name为header'),
          footer: (info) => h('p',{id: 'slot-id-p-header'}, '这是slot的作用域插槽，且name为footer, 接受的参数为info: ' + info.name),
        }
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
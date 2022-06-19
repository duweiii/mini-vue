import { h } from "../lib/guide-mini-vue.esm.js"

export default {
  setup(props){
    console.log( props )
  },
  render(){
    return h('div', { id: 'foo-id'}, 'read props via this：' + this.count)
  }
}
import { h } from "../lib/guide-mini-vue.esm.js"

export default {
  setup(props, { emit }){
    const handleClick = (e) => {
      e.stopPropagation();
      emit("add", 'this is a', 'this is b')
    }
    return {
      handleClick
    }
  },
  render(){
    const btn = h(
      'button',
      {
        onClick: this.handleClick
      },
      'button'
    )
    const foo = h('div', {id:"button-brother"}, 'foooo-brother')
    // return h('div', { id: 'foo-id'}, 'read props via this：' + this.count)
    return h('div',{}, [btn, foo, this.$slots])
  }
}
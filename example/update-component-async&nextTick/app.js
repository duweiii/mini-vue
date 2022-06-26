import { getCurrentInstance, h, nextTick, ref } from '../../lib/guide-mini-vue.esm.js';

export const App = {
  setup(){
    const count = ref(1)
    const instance = getCurrentInstance();
    const handleClick = () => {
      new Array(100).fill(1).forEach(item => count.value++ )
      nextTick(()=>{
        console.log( instance )
      })
    }
    // 同步修改数据，forEach 了100次，执行了100次update
    // 采用异步更新的方式渲染页面
    return {
      count,
      handleClick
    }
  },
  render(){
    return h(
      "div", 
      {
        onClick: this.handleClick,
      }, 
      'value:____' + this.count
    )
  },
}
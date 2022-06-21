import { h, ref } from '../../lib/guide-mini-vue.esm.js';
export const App = {
  setup(){
    const count = ref(0);

    const addCount = () => {
      count.value++;
    }

    return {
      count,
      addCount
    }
  },
  render(){
    return h('div', {
      onClick: this.addCount,
    }, 'count:__' + this.count)
  },
}
import { h, ref } from '../../lib/guide-mini-vue.esm.js';
// const prevArray = [h('div', {}, '旧的children是array_1'), h('div', {}, '旧的children是array_2')];
// const prevText = '旧的children是string' 
// const newText = '新的children是string' 
// export const App = {
//   setup(){
//     let control = ref(true);
//     globalThis.control = control;
//     return {
//       control,
//     }
//   },
//   render(){
//     // return h('div', {}, this.control ? prevArray : newText)
//     return h('div', {}, this.control ? prevText : newText)
//   },
// }

const prevText = '旧的children是string' 
const newText = [h('div', {}, '新的children是array_1'), h('div', {}, '新的children是array_2')];
export const App = {
  setup(){
    let control = ref(true);
    globalThis.control = control;
    return {
      control,
    }
  },
  render(){
    return h('div', {}, this.control ? prevText : newText)
  },
}
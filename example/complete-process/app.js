import { ref } from '../../lib/guide-mini-vue.esm.js';
export const App = {
  template:'<div>{{message}}</div>',
  setup(){
    const message = ref('hi, mini-vue');
    window.s = message;
    return {
      message,
    }
  },
}
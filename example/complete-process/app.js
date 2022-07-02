import { ref } from '../../lib/guide-mini-vue.esm.js';
export const App = {
  template: '<div>hi,{{message}}<p>embed-element：{{message}}<article>开心</article></p></div>',
  setup(){
    const message = ref('mini-vue');
    window.s = message;
    return {
      message,
    }
  },
}
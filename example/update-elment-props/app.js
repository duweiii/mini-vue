import { h, ref } from '../../lib/guide-mini-vue.esm.js';

export const App = {
  setup(){
    const PROPS = ref({
      firstProp: "first-init-value",
      secondProp: 'second-init-value',
      thirdProp: 'third-init-value'
    });

    const setNewValueToPROPS = () => {
      PROPS.value.firstProp = 'first-update-value'
    }

    const setNullToPROPS = () => {
      PROPS.value.secondProp = undefined;
    }
    
    const deleteKeyInPROPS = () => {
      PROPS.value = {
        firstProp: "deleted third",
        secondProp: 'deleted third',
      }
    }

    return {
      PROPS,
      setNewValueToPROPS,
      setNullToPROPS,
      deleteKeyInPROPS
    }
  },
  render(){
    return h(
      'div',
      {
        id: 1,
        ...this.PROPS
      },
      [
        h(
          'button',
          {
           onClick: this.setNewValueToPROPS 
          },
          '给first设置新的值'
        ), 

        h(
          'button',
          {
           onClick: this.setNullToPROPS 
          },
          '把second设置为 undefined'
        ), 

        h(
          'button',
          {
           onClick: this.deleteKeyInPROPS 
          },
          '删除third属性'
        ) 

      ]
    )
  },
}
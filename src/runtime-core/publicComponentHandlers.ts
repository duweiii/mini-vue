import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: instance => instance.vnode.el,
}

export const publicComponentHandlers = {
  get({_: instance}, key){
    const { setupState, props } = instance;
    // 如果要去取的值在setupState上，直接返回
    // if( key in setupState){
    if( hasOwn(setupState, key) ){
      return setupState[key];
    } else if( hasOwn(props, key) ){
      return props[key]
    }
    
    // 但如果没再setupState中publicPropertiesMap
    const publicGetter = publicPropertiesMap[key];
    if( publicGetter ){
      return publicGetter(instance);
    }
    
  }
}
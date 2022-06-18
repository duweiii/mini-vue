const publicPropertiesMap = {
  $el: instance => instance.vnode.el,
}

export const publicComponentHandlers = {
  get({_: instance}, key){
    const { setupState } = instance;
    // 如果要去取的值在setupState上，直接返回
    if( key in setupState){
      return setupState[key];
    }
    
    // 但如果没再setupState中
    const publicGetter = publicPropertiesMap[key];
    if( publicGetter ){
      return publicGetter(instance);
    }
    
  }
}
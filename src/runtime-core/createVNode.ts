import { EShapeFlags } from "../shared/shapeFlags"

export function createVNode(type, props?, children?){

  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
  
  if( typeof children === 'string'){
    vnode.shapeFlag |= EShapeFlags.TEXT_CHILDREN;
  }else if (Array.isArray(children)){
    vnode.shapeFlag |= EShapeFlags.ARRAY_CHILDREN;
  }

  if ( vnode.shapeFlag & EShapeFlags.STATEFUL_COMPONENT ){
    if( typeof children === 'object' ){
      vnode.shapeFlag |= EShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

function getShapeFlag(type){
  return typeof type === 'string' ? EShapeFlags.ELEMENT : EShapeFlags.STATEFUL_COMPONENT;
}
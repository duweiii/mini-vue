import { EShapeFlags } from "../shared/shapeFlags"
export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")
export function createVNode(type, props?, children?){

  const vnode = {
    type,
    props,
    children,
    el: null,
    component: null,
    key: props && props.key,
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

export function createTextVNode(text: string){
  return createVNode(Text, {}, text)
}

function getShapeFlag(type){
  return typeof type === 'string' ? EShapeFlags.ELEMENT : EShapeFlags.STATEFUL_COMPONENT;
}
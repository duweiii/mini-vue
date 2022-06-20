import { createVNode, Fragment } from "../createVNode";

export function renderSlots(slots, name, data){
  const slot = slots[name];
  if( slot ){
    if( typeof slot === 'function'){
      return createVNode(Fragment, {}, slot(data));
    }
  }
}
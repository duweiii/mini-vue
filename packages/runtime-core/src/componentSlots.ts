import { EShapeFlags } from "@guide-mini-vue/shared";

export function initSlots(instance, children){
  // 并不是所有的组件实例都需要initSlots
  const { vnode } = instance;
  if( vnode.shapeFlag & EShapeFlags.SLOT_CHILDREN ){
    normalizeSlotObject(instance, children);
  }
}

function normalizeSlotObject(instance, children){
  const slots = {};
  for( let key in children ){
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue( value(props) );
  }
  instance.slots = slots;
}

function normalizeSlotValue(value){
  return Array.isArray(value) ? value : [value];
}
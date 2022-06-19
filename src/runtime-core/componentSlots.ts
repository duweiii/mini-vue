export function initSlots(instance, children){
  normalizeSlotObject(instance, children);
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
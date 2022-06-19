export function initSlots(instance, children){
  normalizeSlotObject(instance, children);
}

function normalizeSlotObject(instance, slots){
  instance.slots = slots;
}
import { reactiveHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export const enum ERactiveFlags {
  isReactive = '__v_isReactive',
  isReadonly = '__v_isReadonlu'
}

export function reactive(obj){
  return createActiveObject(obj, reactiveHandlers)
}

export function readOnly(obj){
  return createActiveObject(obj, readonlyHandlers)
}
export function shallowReadonly(obj){
  return createActiveObject(obj, shallowReadonlyHandlers)
}
export function isProxy(value){
  return isReactive(value) || isReadonly(value);
}
export function isReactive(obj){
  let res = obj[ERactiveFlags.isReactive];
  return !!res;
}
export function isReadonly(obj){
  let res = obj[ERactiveFlags.isReadonly];
  return !!res;
}

function createActiveObject(raw, handlers){
  return new Proxy(raw, handlers);
}

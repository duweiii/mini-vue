import {
  reactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

export const enum ERactiveFlags {
  isReactive = "__v_isReactive",
  isReadonly = "__v_isReadonlu",
}

export const reactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();
export const shallowReadonlyMap = new WeakMap();

export function reactive(obj) {
  return createActiveObject(obj, reactiveMap, reactiveHandlers);
}

export function readOnly(obj) {
  return createActiveObject(obj, readonlyMap, readonlyHandlers);
}
export function shallowReadonly(obj) {
  return createActiveObject(obj, shallowReadonlyMap, shallowReadonlyHandlers);
}
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
export function isReactive(obj) {
  let res = obj[ERactiveFlags.isReactive];
  return !!res;
}
export function isReadonly(obj) {
  let res = obj[ERactiveFlags.isReadonly];
  return !!res;
}

function createActiveObject(raw, proxyMap, handlers) {
  const existProxy = proxyMap.get(raw);

  if (existProxy) {
    return existProxy;
  }

  const proxy = new Proxy(raw, handlers);

  proxyMap.set(raw, proxy);

  return proxy;
}

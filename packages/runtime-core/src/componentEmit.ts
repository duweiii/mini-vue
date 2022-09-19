import { camelize, toHandleKey } from "@guide-mini-vue/shared";

export function emit(instance, event, ...args){
  const { props } = instance;
  const handlerName = toHandleKey( camelize(event) );
  const handler = props[handlerName];
  handler && handler(...args);
}
import { createRenderer } from "../index";

function createElement(type: string){
  return document.createElement(type);
}
function patchProp(el, key, prevValue, nextValue){
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if( isOn(key) ){
    let eventType = key.slice(2).toLowerCase();
    el.addEventListener(eventType, nextValue);
  } else {
    if( nextValue === undefined || nextValue === null ){
      el.removeAttribute(key)
    }else{
      el.setAttribute(key, nextValue)
    }
  }
}
function insert(el, parent){
  return parent.append(el)
}
function setElementText(el, text){
  el.textContent = text;
}
function remove(el){
  const parentNode = el.parentNode;
  if( parentNode ){
    parentNode.removeChild(el)
  }
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  setElementText,
  remove
})

export function createApp(...args){
  return renderer.createApp(...args)
}

export * from '../runtime-core/index';
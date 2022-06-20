import { isObject } from "../shared/index";
import { EShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./createVNode";

export function render(vnode, container, parent){
  patch(vnode, container, parent);
}

export function patch(vnode, container, parent){
  const { type } = vnode;
  switch( type ){
    case Fragment:
      processFragment(vnode, container, parent);
      break;
    case Text:
      processText(vnode, container)
      break;
    default:
      if(vnode.shapeFlag & EShapeFlags.ELEMENT){
        processElement(vnode, container, parent)
      }else if ( vnode.shapeFlag & EShapeFlags.STATEFUL_COMPONENT ){
        propcessComponent(vnode, container, parent)
      }
      break;
  }
}
function processFragment(vnode, container, parent){
  mountChildren(vnode.children, container, parent)
}
function processText(vnode, container){
  const { children } = vnode;
  const textNode = ( vnode.el = document.createTextNode( children ))
  container.append(textNode)
}
function processElement(vnode, container, parent){
  mountElement(vnode, container, parent)
}
function mountElement(vnode, container, parent){
  let el = ( vnode.el = document.createElement(vnode.type));

  const { props } = vnode;
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  for (const attr in props) {
    const value = props[attr];
    if( isOn(attr) ){
      let eventType = attr.slice(2).toLowerCase();
      el.addEventListener(eventType, value);
    } else {
      el.setAttribute(attr, value)
    }
  }

  const { children } = vnode;
  if( vnode.shapeFlag & EShapeFlags.TEXT_CHILDREN ){
    el.innerText = children;
  }else if ( vnode.shapeFlag & EShapeFlags.ARRAY_CHILDREN ){
    mountChildren(children, el, parent)
  }

  container.append(el)
}

function mountChildren(children, container, parent){
  children.forEach(child => patch(child, container, parent))
}

function propcessComponent(vnode, container, parent){
  mountComponent(vnode, container, parent);
}

function mountComponent(vnode, container, parent){
  const instance = createComponentInstance(vnode, parent);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container){
  const { proxy } = instance;
  window.self = proxy;
  const subTree = instance.render.call(proxy);
  patch(subTree, container, instance );
  instance.vnode.el = subTree.el;
}

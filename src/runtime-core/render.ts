import { isObject } from "../shared/index";
import { EShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container){
  patch(vnode, container);
}

export function patch(vnode, container){
  if(vnode.shapeFlag & EShapeFlags.ELEMENT){
    processElement(vnode, container)
  }else if ( vnode.shapeFlag & EShapeFlags.STATEFUL_COMPONENT ){
    propcessComponent(vnode, container)
  }
}

function processElement(vnode, container){
  mountElement(vnode, container)
}
function mountElement(vnode, container){
  let el = ( vnode.el = document.createElement(vnode.type));

  const { props } = vnode;

  for (const attr in props) {
    const value = props[attr];
    el.setAttribute(attr, value)
  }

  const { children } = vnode;
  if( vnode.shapeFlag & EShapeFlags.TEXT_CHILDREN ){
    el.innerText = children;
  }else if ( vnode.shapeFlag & EShapeFlags.ARRAY_CHILDREN ){
    mountChildren(children, el)
  }

  container.append(el)
}

function mountChildren(children, container){
  children.forEach(child => patch(child, container))
}

function propcessComponent(vnode, container){
  mountComponent(vnode, container);
}

function mountComponent(vnode, container){
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container){
  const { proxy } = instance;
  window.self = proxy;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  instance.vnode.el = subTree.el;
}
